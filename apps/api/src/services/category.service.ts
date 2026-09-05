import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { generateSlug } from '../utils/slug';

export class CategoryService {
  static async getCategories(includeInactive = false) {
    return prisma.category.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        name: { not: { contains: '178' } },
        slug: { not: { contains: '178' } },
      },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  static async createCategory(data: { name: string; description?: string; imageUrl?: string; parentId?: string | null }) {
    const slug = generateSlug(data.name);

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: data.name.trim() }, { slug }] },
    });

    if (existing) {
      throw AppError.conflict('Category with this name or slug already exists.');
    }

    return prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId || null,
        isActive: true,
      },
    });
  }

  static async updateCategory(id: string, data: any) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw AppError.notFound('Category not found.');
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  static async deactivateCategory(id: string) {
    // Safe deactivation to preserve product relational integrity
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw AppError.notFound('Category not found.');
    }

    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export class BrandService {
  static async getBrands(includeInactive = false) {
    return prisma.brand.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  static async createBrand(data: { name: string; description?: string; logoUrl?: string }) {
    const slug = generateSlug(data.name);

    const existing = await prisma.brand.findFirst({
      where: { OR: [{ name: data.name.trim() }, { slug }] },
    });

    if (existing) {
      throw AppError.conflict('Brand with this name already exists.');
    }

    return prisma.brand.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description,
        logoUrl: data.logoUrl,
        isActive: true,
      },
    });
  }

  static async updateBrand(id: string, data: any) {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw AppError.notFound('Brand not found.');
    }

    return prisma.brand.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  static async deactivateBrand(id: string) {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw AppError.notFound('Brand not found.');
    }

    return prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
