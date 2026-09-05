import { AccountStatus, ProductStatus, VendorStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export class AdminService {
  static async getStats() {
    const [
      totalUsers,
      totalVendors,
      pendingApplications,
      totalProducts,
      activeProducts,
      totalCategories,
      totalBrands,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count({ where: { status: 'APPROVED' } }),
      prisma.vendorApplication.count({ where: { status: 'PENDING' } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.brand.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalVendors,
      pendingApplications,
      totalProducts,
      activeProducts,
      totalCategories,
      totalBrands,
    };
  }

  static async getUsers(params: { search?: string; role?: string; status?: string; page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(params.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(params.limit || '15', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          vendor: {
            select: { id: true, businessName: true, status: true },
          },
        },
      }),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUserStatus(userId: string, status: AccountStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found.');

    if (user.role === 'ADMIN') {
      throw AppError.badRequest('Cannot suspend Super Administrator accounts.');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
  }

  static async getVendorApplications() {
    return prisma.vendorApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async reviewVendorApplication(
    adminId: string,
    applicationId: string,
    data: { status: VendorStatus; rejectionReason?: string }
  ) {
    const app = await prisma.vendorApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw AppError.notFound('Vendor application not found.');

    const updatedApp = await prisma.vendorApplication.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        reviewedBy: adminId,
        rejectionReason: data.rejectionReason || null,
      },
    });

    if (data.status === 'APPROVED') {
      // 1. Promote user role to VENDOR
      await prisma.user.update({
        where: { id: app.userId },
        data: { role: 'VENDOR' },
      });

      // 2. Approve Vendor record with unique slug
      const baseSlug = app.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingSlug = await prisma.vendor.findUnique({ where: { slug: baseSlug } });
      const uniqueSlug = existingSlug ? `${baseSlug}-${app.id.slice(-6)}` : baseSlug;

      await prisma.vendor.upsert({
        where: { userId: app.userId },
        update: {
          status: 'APPROVED',
          accountStatus: 'ACTIVE',
        },
        create: {
          userId: app.userId,
          businessName: app.businessName,
          slug: uniqueSlug,
          businessAddress: app.businessAddress,
          phone: app.phone,
          status: 'APPROVED',
          accountStatus: 'ACTIVE',
        },
      });
    } else if (data.status === 'REJECTED') {
      await prisma.vendor.updateMany({
        where: { userId: app.userId },
        data: { status: 'REJECTED' },
      });
    }

    return updatedApp;
  }

  static async moderateProduct(productId: string, status: ProductStatus) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw AppError.notFound('Product not found.');

    return prisma.product.update({
      where: { id: productId },
      data: { status },
      include: {
        vendor: { select: { id: true, businessName: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }
}
