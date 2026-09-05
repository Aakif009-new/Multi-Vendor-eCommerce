import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be greater than 0'),
    discountPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
    categoryId: z.string().min(1, 'Category ID is required'),
    brandId: z.string().optional().nullable(),
    images: z.array(z.string()).optional().default([]),
    sku: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED']).optional().default('ACTIVE'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    discountPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().nonnegative().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional().nullable(),
    images: z.array(z.string()).optional(),
    sku: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED']).optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      category: z.string().optional(),
      categoryId: z.string().optional(),
      vendor: z.string().optional(),
      vendorId: z.string().optional(),
      vendorSlug: z.string().optional(),
      brand: z.string().optional(),
      brandId: z.string().optional(),
      minPrice: z.string().optional(),
      maxPrice: z.string().optional(),
      rating: z.string().optional(),
      sort: z.enum(['price-asc', 'price-desc', 'newest', 'rating']).optional().default('newest'),
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('12'),
    })
    .passthrough(),
});
