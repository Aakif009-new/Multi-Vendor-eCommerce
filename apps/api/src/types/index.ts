import { Request } from 'express';
import { Role, AccountStatus, VendorStatus } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
}

export interface AuthenticatedVendor {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  status: VendorStatus;
  accountStatus: AccountStatus;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  vendor?: AuthenticatedVendor;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
