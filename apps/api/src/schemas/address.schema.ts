import { z } from 'zod';

export const createAddressSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Address label/title is required (e.g. Home, Office)'),
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(4, 'Postal code is required'),
    country: z.string().optional().default('India'),
    phone: z.string().min(8, 'Phone number is required'),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    street: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    postalCode: z.string().min(4).optional(),
    country: z.string().optional(),
    phone: z.string().min(8).optional(),
    isDefault: z.boolean().optional(),
  }),
});
