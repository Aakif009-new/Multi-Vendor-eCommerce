import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Category name must be at least 2 characters')
      .max(60, 'Category name cannot exceed 60 characters')
      .refine(
        (val) => !/^(admin[ _-]?category|test[ _-]?category|temp[ _-]?category)/i.test(val) && !/\b\d{10,14}\b/.test(val),
        { message: 'Category name cannot be an internal test or placeholder name.' }
      ),
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
