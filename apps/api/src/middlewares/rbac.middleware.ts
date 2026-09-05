import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from '../utils/appError';
import { prisma } from '../config/db';

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Please authenticate to access this route'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
}

export async function requireVendor(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Please sign in to access merchant portal');
    }

    if (req.user.role !== 'VENDOR') {
      throw AppError.forbidden('Forbidden: Access is restricted to registered Vendors');
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      select: {
        id: true,
        userId: true,
        businessName: true,
        slug: true,
        status: true,
        accountStatus: true,
      },
    });

    if (!vendor) {
      throw AppError.notFound('Vendor profile not found for this account.');
    }

    if (vendor.status === 'PENDING') {
      throw AppError.forbidden('Your vendor application is currently PENDING approval by an Administrator.');
    }

    if (vendor.status === 'REJECTED') {
      throw AppError.forbidden('Your vendor application has been REJECTED. Please contact administrator.');
    }

    if (vendor.accountStatus === 'SUSPENDED') {
      throw AppError.forbidden('Your vendor storefront has been suspended.');
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
}
