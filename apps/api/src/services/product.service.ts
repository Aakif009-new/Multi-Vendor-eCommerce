import { ProductStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { generateSlug } from '../utils/slug';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  categoryId?: string;
  vendor?: string;
  vendorId?: string;
  vendorSlug?: string;
  brand?: string;
  brandId?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'rating';
  page?: string;
  limit?: string;
}

export class ProductService {
  static async getProducts(params: ProductQueryParams) {
    const page = Math.max(1, parseInt(params.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(params.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const andConditions: Prisma.ProductWhereInput[] = [{ status: 'ACTIVE' }];

    // Full text search
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Category filter by ID or slug
    const categoryParam = params.categoryId || params.category;
    if (categoryParam && categoryParam.trim()) {
      const cat = categoryParam.trim();
      if (/^[0-9a-fA-F]{24}$/.test(cat)) {
        andConditions.push({ categoryId: cat });
      } else {
        andConditions.push({ category: { slug: cat } });
      }
    }

    // Vendor filter by ID, slug, or business name
    const vendorParam = params.vendorId || params.vendorSlug || params.vendor;
    if (vendorParam && vendorParam.trim()) {
      const vend = vendorParam.trim();
      if (/^[0-9a-fA-F]{24}$/.test(vend)) {
        andConditions.push({ vendorId: vend });
      } else {
        andConditions.push({
          OR: [
            { vendor: { slug: vend } },
            { vendor: { businessName: { equals: vend, mode: 'insensitive' } } },
          ],
        });
      }
    }

    // Brand filter by ID or slug
    const brandParam = params.brandId || params.brand;
    if (brandParam && brandParam.trim()) {
      const br = brandParam.trim();
      if (/^[0-9a-fA-F]{24}$/.test(br)) {
        andConditions.push({ brandId: br });
      } else {
        andConditions.push({
          OR: [
            { brand: { slug: br } },
            { brand: { name: { equals: br, mode: 'insensitive' } } },
          ],
        });
      }
    }

    // Price range filters
    if (params.minPrice || params.maxPrice) {
      const priceFilter: Prisma.FloatFilter = {};
      if (params.minPrice) priceFilter.gte = parseFloat(params.minPrice);
      if (params.maxPrice) priceFilter.lte = parseFloat(params.maxPrice);
      andConditions.push({ price: priceFilter });
    }

    // Rating filter
    if (params.rating) {
      andConditions.push({ rating: { gte: parseFloat(params.rating) } });
    }

    const where: Prisma.ProductWhereInput = { AND: andConditions };

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (params.sort === 'price-asc') orderBy = { price: 'asc' };
    else if (params.sort === 'price-desc') orderBy = { price: 'desc' };
    else if (params.sort === 'rating') orderBy = { rating: 'desc' };
    else if (params.sort === 'newest') orderBy = { createdAt: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
          vendor: { select: { id: true, businessName: true, slug: true, rating: true } },
        },
      }),
    ]);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductByIdOrSlug(idOrSlug: string) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        vendor: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            businessAddress: true,
            phone: true,
            rating: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    return product;
  }

  static async createProduct(vendorId: string, data: any) {
    // Validate category existence
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category || !category.isActive) {
      throw AppError.badRequest('Invalid or inactive category selected.');
    }

    const slug = generateSlug(data.name);

    const product = await prisma.product.create({
      data: {
        vendorId,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        name: data.name.trim(),
        slug,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice || null,
        stock: data.stock ?? 0,
        sku: data.sku || null,
        images: data.images || [],
        status: data.status || 'ACTIVE',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    return product;
  }

  static async updateProduct(vendorId: string, productId: string, data: any) {
    // Strict vendor ownership check
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    if (product.vendorId !== vendorId) {
      throw AppError.forbidden('Forbidden: You can only edit your own products.');
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.discountPrice !== undefined && { discountPrice: data.discountPrice }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.brandId !== undefined && { brandId: data.brandId }),
        ...(data.images && { images: data.images }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.status && { status: data.status }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    return updated;
  }

  static async deleteProduct(vendorId: string, productId: string) {
    // Strict vendor ownership check
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    if (product.vendorId !== vendorId) {
      throw AppError.forbidden('Forbidden: You can only delete your own products.');
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return { message: 'Product deleted successfully.' };
  }

  static async toggleProductStatus(vendorId: string, productId: string, status: ProductStatus) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    if (product.vendorId !== vendorId) {
      throw AppError.forbidden('Forbidden: You can only change the status of your own products.');
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    return updated;
  }
}
