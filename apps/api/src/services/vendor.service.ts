import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { generateSlug } from '../utils/slug';

export class VendorService {
  static async getApprovedVendors() {
    const vendors = await prisma.vendor.findMany({
      where: {
        status: 'APPROVED',
        accountStatus: 'ACTIVE',
        products: { some: { status: 'ACTIVE' } },
      },
      select: {
        id: true,
        businessName: true,
        slug: true,
        description: true,
        businessAddress: true,
        phone: true,
        logoUrl: true,
        bannerUrl: true,
        rating: true,
        createdAt: true,
        _count: {
          select: { products: { where: { status: 'ACTIVE' } } },
        },
      },
      orderBy: { businessName: 'asc' },
    });

    return vendors.map((v) => ({
      ...v,
      productCount: v._count.products,
    }));
  }

  static async getVendorBySlugOrId(idOrSlug: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const vendor = await prisma.vendor.findFirst({
      where: {
        ...(isObjectId ? { id: idOrSlug } : { slug: idOrSlug }),
        status: 'APPROVED',
        accountStatus: 'ACTIVE',
      },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            brand: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!vendor) {
      throw AppError.notFound('Vendor storefront not found.');
    }

    return vendor;
  }

  static async applyForVendor(
    userId: string,
    data: { businessName: string; businessAddress: string; phone: string; description?: string }
  ) {
    const existingApplication = await prisma.vendorApplication.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (existingApplication) {
      throw AppError.conflict('You already have a pending vendor application undergoing review.');
    }

    const application = await prisma.vendorApplication.create({
      data: {
        userId,
        businessName: data.businessName.trim(),
        businessAddress: data.businessAddress.trim(),
        phone: data.phone.trim(),
        description: data.description,
        status: 'PENDING',
      },
    });

    // Check if Vendor model exists or create
    const existingVendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!existingVendor) {
      const slug = generateSlug(data.businessName);
      await prisma.vendor.create({
        data: {
          userId,
          businessName: data.businessName.trim(),
          slug,
          businessAddress: data.businessAddress.trim(),
          phone: data.phone.trim(),
          description: data.description,
          status: 'PENDING',
          accountStatus: 'ACTIVE',
        },
      });
    }

    return application;
  }

  static async getVendorProfile(userId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!vendor) {
      throw AppError.notFound('Vendor profile not found.');
    }

    return vendor;
  }

  static async updateVendorProfile(userId: string, data: any) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      throw AppError.notFound('Vendor profile not found.');
    }

    return prisma.vendor.update({
      where: { userId },
      data: {
        ...(data.businessName && { businessName: data.businessName.trim() }),
        ...(data.businessAddress && { businessAddress: data.businessAddress.trim() }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
      },
    });
  }

  static async getVendorProducts(vendorId: string) {
    return prisma.product.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  static async getVendorStats(vendorId: string) {
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: {
        id: true,
        price: true,
        stock: true,
        status: true,
      },
    });

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
    const lowStockProducts = products.filter((p) => p.stock < 5).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalInventoryValue,
    };
  }
}
