import { prisma } from '../config/db';
import { AppError } from './appError';

export const CANONICAL_SUPER_ADMIN_EMAIL = 'admin@bazaarone.com';

export interface SuperAdminAuditResult {
  isUnique: boolean;
  adminCount: number;
  adminEmails: string[];
  canonicalAdminId?: string;
  violations: string[];
}

/**
 * Strictly verifies the Super Admin singleton invariant:
 * 1. Exactly 1 user in the database must hold the ADMIN role.
 * 2. That user must match the canonical administrator identity.
 */
export async function auditSuperAdminUniqueness(): Promise<SuperAdminAuditResult> {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, status: true, role: true },
  });

  const violations: string[] = [];
  const adminEmails = admins.map((a) => a.email);

  if (admins.length === 0) {
    violations.push('CRITICAL: No Super Administrator account exists in the database.');
  } else if (admins.length > 1) {
    violations.push(
      `CRITICAL: Super Admin uniqueness violated! Found ${admins.length} accounts with ADMIN role: ${adminEmails.join(', ')}`
    );
  }

  const canonical = admins.find((a) => a.email.toLowerCase() === CANONICAL_SUPER_ADMIN_EMAIL.toLowerCase());
  if (!canonical && admins.length > 0) {
    violations.push(
      `WARNING: Active ADMIN does not match canonical email (${CANONICAL_SUPER_ADMIN_EMAIL}). Found: ${adminEmails.join(', ')}`
    );
  }

  return {
    isUnique: admins.length === 1,
    adminCount: admins.length,
    adminEmails,
    canonicalAdminId: canonical?.id,
    violations,
  };
}

/**
 * Asserts that no additional Super Admin account can be created or promoted.
 * Throws 403 Forbidden if an ADMIN account already exists and target is not canonical.
 */
export async function assertSuperAdminUniqueness(targetEmail?: string, targetId?: string): Promise<void> {
  const currentAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });

  if (currentAdmins.length >= 1) {
    const existingAdmin = currentAdmins[0];
    const isSameAdmin =
      (targetId && existingAdmin.id === targetId) ||
      (targetEmail && existingAdmin.email.toLowerCase() === targetEmail.toLowerCase());

    if (!isSameAdmin) {
      throw AppError.forbidden(
        'Strict Singleton Violation: Exactly one Super Administrator is permitted in the system.'
      );
    }
  }
}
