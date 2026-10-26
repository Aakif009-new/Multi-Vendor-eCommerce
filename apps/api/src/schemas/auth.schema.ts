import { z } from 'zod';
import { validateGstin, validatePanFormat } from '../utils/gstin';

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
    role: z
      .string()
      .optional()
      .default('CUSTOMER')
      .transform((val) => (typeof val === 'string' ? val.trim().toUpperCase() : val))
      .refine((val) => ['CUSTOMER', 'VENDOR', 'ADMIN'].includes(val), {
        message: "Invalid role. Role must be 'CUSTOMER' or 'VENDOR'.",
      }),
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
    legalStructure: z
      .enum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'OTHER'])
      .optional()
      .default('SOLE_PROPRIETORSHIP'),
    gstin: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val ? val.trim().toUpperCase() : undefined)),
    panNumber: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val ? val.trim().toUpperCase() : undefined)),
    panDocumentUrl: z.string().trim().optional(),
    panDocumentKey: z.string().trim().optional(),
  }).superRefine((data, ctx) => {
    // Only perform vendor-specific GSTIN / PAN validation when role is VENDOR
    if (data.role === 'VENDOR') {
      // 1. If legalStructure is registered corporate/firm (PARTNERSHIP or PRIVATE_LIMITED), GSTIN is required
      if (
        (data.legalStructure === 'PARTNERSHIP' || data.legalStructure === 'PRIVATE_LIMITED') &&
        (!data.gstin || data.gstin.trim().length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['gstin'],
          message: 'GSTIN is mandatory for registered partnerships, LLPs, and private limited entities.',
        });
      }

      // 2. If GSTIN is provided, validate length, structure, and Mod-36 checksum
      if (data.gstin && data.gstin.trim().length > 0) {
        const result = validateGstin(data.gstin);
        if (!result.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['gstin'],
            message: result.error || 'Invalid GSTIN format or checksum.',
          });
        }
      }

      // 3. If explicit PAN number is provided, validate PAN format
      if (data.panNumber && data.panNumber.trim().length > 0) {
        const panResult = validatePanFormat(data.panNumber);
        if (!panResult.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['panNumber'],
            message: panResult.error || 'Invalid PAN format.',
          });
        }
      }
    }
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

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string({ message: 'Name must be a string' })
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(70, 'Name cannot exceed 70 characters')
        .refine((val) => !/[\x00-\x1F\x7F]/.test(val), 'Name contains invalid control characters')
        .refine((val) => val.trim().length >= 2, 'Name cannot be empty or whitespace only')
        .optional(),
      role: z.any().optional(),
      status: z.any().optional(),
      isAdmin: z.any().optional(),
      isSuperAdmin: z.any().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['role'],
          message: 'Modifying user role via profile update is strictly prohibited.',
        });
      }
      if (data.status !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['status'],
          message: 'Modifying user account status via profile update is strictly prohibited.',
        });
      }
      if (data.isAdmin !== undefined || data.isSuperAdmin !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['isAdmin'],
          message: 'Modifying administrative attributes via profile update is strictly prohibited.',
        });
      }
    }),
});

