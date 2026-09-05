import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    parentId: z.string().optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    parentId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});
