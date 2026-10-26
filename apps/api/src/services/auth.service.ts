import { Role, VendorStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { generateSlug } from '../utils/slug';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
  businessName?: string;
  businessAddress?: string;
  phone?: string;
  legalStructure?: string;
  gstin?: string;
  panNumber?: string;
  panDocumentUrl?: string;
  panDocumentKey?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const normalizedEmail = input.email.toLowerCase().trim();
    const trimmedName = input.name.trim();

    // Prevent public self-registration as ADMIN (including case variations, whitespace, and substrings)
    const rawRole = (input as any).role;
    const roleStr = typeof rawRole === 'string' ? rawRole.trim().toUpperCase() : '';
    if (
      roleStr === 'ADMIN' ||
      roleStr === 'SUPERADMIN' ||
      roleStr.includes('ADMIN') ||
      roleStr.includes('SUPER')
    ) {
      throw AppError.forbidden('Public registration as Administrator is not permitted.');
    }

    // Backend Singleton Guard: Ensure no additional ADMIN account can ever be registered
    const existingAdminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (existingAdminCount >= 1 && (roleStr === 'ADMIN' || input.role === 'ADMIN')) {
      throw AppError.forbidden('Super Administrator already exists. Only one Super Admin account is permitted.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw AppError.conflict('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(input.password);
    const assignedRole: Role = input.role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // If registering as VENDOR, initiate pending Vendor profile & application
    if (assignedRole === 'VENDOR') {
      const bName = (input.businessName && input.businessName.trim()) || `${trimmedName}'s Store`;
      const bAddress = (input.businessAddress && input.businessAddress.trim()) || 'Address Pending Update';
      const bPhone = (input.phone && input.phone.trim()) || 'Phone Pending';
      const vendorSlug = generateSlug(bName);

      const normalizedGstin = input.gstin ? input.gstin.trim().toUpperCase() : null;
      // Extract PAN from GSTIN (chars 3 to 12) if GSTIN is provided, or use provided PAN number
      const extractedPan = normalizedGstin ? normalizedGstin.slice(2, 12).toUpperCase() : null;
      const resolvedPan = input.panNumber ? input.panNumber.trim().toUpperCase() : extractedPan;
      const legalStructure = input.legalStructure || 'SOLE_PROPRIETORSHIP';

      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: bName,
          slug: vendorSlug,
          businessAddress: bAddress,
          phone: bPhone,
          legalStructure,
          gstin: normalizedGstin,
          panNumber: resolvedPan,
          panDocumentUrl: input.panDocumentUrl || null,
          panDocumentKey: input.panDocumentKey || null,
          status: 'PENDING',
          accountStatus: 'ACTIVE',
        },
      });

      await prisma.vendorApplication.create({
        data: {
          userId: user.id,
          vendorId: vendor.id,
          businessName: bName,
          businessAddress: bAddress,
          phone: bPhone,
          legalStructure,
          gstin: normalizedGstin,
          panNumber: resolvedPan,
          panDocumentUrl: input.panDocumentUrl || null,
          panDocumentKey: input.panDocumentKey || null,
          status: 'PENDING',
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  static async login(input: LoginInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      throw AppError.forbidden('Your account has been suspended. Please contact administrator support.');
    }

    if (user.status === 'INACTIVE') {
      throw AppError.unauthorized('Your account is currently inactive.');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      vendor: user.vendor,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            status: true,
            accountStatus: true,
            rating: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User not found.');
    }

    return user;
  }

  static async updateProfile(userId: string, data: { name?: string; role?: any; status?: any }) {
    if (
      (data as any).role !== undefined ||
      (data as any).status !== undefined ||
      (data as any).isAdmin !== undefined ||
      (data as any).isSuperAdmin !== undefined
    ) {
      throw AppError.forbidden(
        'Privilege escalation attempt detected: Modifying user role or administrative attributes is strictly forbidden.'
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    return updated;
  }
}
