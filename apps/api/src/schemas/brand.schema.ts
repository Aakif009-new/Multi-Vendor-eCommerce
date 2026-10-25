import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Brand name must be at least 2 characters')
      .max(60, 'Brand name cannot exceed 60 characters')
      .refine(
        (val) => !/^(admin[ _-]?brand|test[ _-]?brand|temp[ _-]?brand)/i.test(val) && !/\b\d{10,14}\b/.test(val),
        { message: 'Brand name cannot be an internal test or placeholder name.' }
      ),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
