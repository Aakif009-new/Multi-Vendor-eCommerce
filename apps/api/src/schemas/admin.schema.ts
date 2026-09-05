import { z } from 'zod';

export const reviewVendorApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']),
  }),
});

export const moderateProductSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED']),
  }),
});
