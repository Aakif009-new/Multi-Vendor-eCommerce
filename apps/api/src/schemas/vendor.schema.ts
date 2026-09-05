import { z } from 'zod';

export const vendorApplicationSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    businessAddress: z.string().min(5, 'Business address must be at least 5 characters'),
    phone: z.string().min(8, 'Phone number must be at least 8 digits'),
    description: z.string().optional(),
  }),
});

export const updateVendorProfileSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).optional(),
    businessAddress: z.string().min(5).optional(),
    phone: z.string().min(8).optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
  }),
});
