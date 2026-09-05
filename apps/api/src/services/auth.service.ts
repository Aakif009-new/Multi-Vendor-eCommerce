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
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Prevent public self-registration as ADMIN
    if (input.role === 'ADMIN') {
      throw AppError.forbidden('Public registration as Administrator is not permitted.');
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
        name: input.name.trim(),
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
      const vendorSlug = generateSlug(input.name);
      await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: `${input.name}'s Store`,
          slug: vendorSlug,
          businessAddress: 'Address Pending Update',
          phone: 'Phone Pending',
          status: 'PENDING',
          accountStatus: 'ACTIVE',
        },
      });

      await prisma.vendorApplication.create({
        data: {
          userId: user.id,
          businessName: `${input.name}'s Store`,
          businessAddress: 'Pending Details Submission',
          phone: 'Pending',
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

  static async updateProfile(userId: string, data: { name?: string }) {
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
