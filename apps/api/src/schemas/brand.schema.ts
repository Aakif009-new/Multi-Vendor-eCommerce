import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Brand name must be at least 2 characters'),
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
