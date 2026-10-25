import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Full name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(70, 'Name cannot exceed 70 characters')
      .refine((val) => !/[\x00-\x1F\x7F]/.test(val), 'Name contains invalid control characters')
      .refine((val) => val.trim().length >= 2, 'Name cannot be empty or whitespace only'),
    email: z
      .string({ message: 'Email address is required' })
      .trim()
      .email('Please enter a valid email address')
      .max(254, 'Email address must not exceed 254 characters'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters'),
    role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']).optional().default('CUSTOMER'),
    businessName: z
      .string()
      .trim()
      .min(2, 'Business name must be at least 2 characters')
      .max(100, 'Business name cannot exceed 100 characters')
      .optional(),
    businessAddress: z
      .string()
      .trim()
      .min(5, 'Business address must be at least 5 characters')
      .max(200, 'Business address cannot exceed 200 characters')
      .optional(),
    phone: z
      .string()
      .trim()
      .min(8, 'Phone number must be at least 8 characters')
      .max(20, 'Phone number cannot exceed 20 characters')
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email address is required' })
      .trim()
      .email('Please enter a valid email address')
      .max(254, 'Email address must not exceed 254 characters'),
    password: z
      .string({ message: 'Password is required' })
      .min(1, 'Password is required')
      .max(128, 'Password cannot exceed 128 characters'),
  }),
});
