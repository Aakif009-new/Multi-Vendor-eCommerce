import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { env } from '../src/config/env';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';
import {
  CANONICAL_SUPER_ADMIN_EMAIL,
  auditSuperAdminUniqueness,
  assertSuperAdminUniqueness,
} from '../src/utils/superAdminGuard';

describe('Security Audit: Super Admin Uniqueness & Privilege Escalation Immunity', () => {
  const timestamp = Date.now();
  let adminUser: any;
  let adminToken: string;
  let customerUser: any;
  let customerToken: string;
  let vendorUser: any;
  let vendorToken: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('SecurePass@123');

    // 1. Locate or verify Canonical Super Administrator
    adminUser = await prisma.user.findUnique({
      where: { email: CANONICAL_SUPER_ADMIN_EMAIL },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Super Administrator',
          email: CANONICAL_SUPER_ADMIN_EMAIL,
          passwordHash: pwdHash,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
    }

    adminToken = signToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
    });

    // 2. Setup standard Customer fixture
    customerUser = await prisma.user.create({
      data: {
        name: 'Audit Customer',
        email: `customer_audit_${timestamp}@bazaarone.test`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });

    customerToken = signToken({
      userId: customerUser.id,
      email: customerUser.email,
      role: 'CUSTOMER',
    });

    // 3. Setup standard Vendor fixture
    vendorUser = await prisma.user.create({
      data: {
        name: 'Audit Vendor',
        email: `vendor_audit_${timestamp}@bazaarone.test`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });

    vendorToken = signToken({
      userId: vendorUser.id,
      email: vendorUser.email,
      role: 'VENDOR',
    });
  });

  afterAll(async () => {
    // Cleanup ephemeral audit fixtures (never touch canonical admin)
    if (customerUser) {
      await prisma.user.deleteMany({
        where: { id: { in: [customerUser.id, vendorUser?.id] } },
      });
    }
    // Clean up any registered test users with email prefix
    await prisma.user.deleteMany({
      where: { email: { contains: `_audit_${timestamp}` } },
    });
  });

  // =========================================================================
  // SECTION 1: Super Admin Uniqueness & Singleton Integrity Invariants
  // =========================================================================
  describe('1. Super Admin Uniqueness & Singleton Invariant', () => {
    it('MUST verify that exactly one Super Admin exists in the database', async () => {
      const audit = await auditSuperAdminUniqueness();
      expect(audit.isUnique).toBe(true);
      expect(audit.adminCount).toBe(1);
      expect(audit.adminEmails).toEqual([CANONICAL_SUPER_ADMIN_EMAIL]);
      expect(audit.violations).toHaveLength(0);
    });

    it('MUST enforce singleton guard: assertSuperAdminUniqueness rejects creating a second admin', async () => {
      await expect(
        assertSuperAdminUniqueness('intruder_admin@bazaarone.test')
      ).rejects.toThrow('Strict Singleton Violation');
    });

    it('MUST prevent admin suspension or deactivation via management endpoint', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SUSPENDED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot suspend Super Administrator accounts');

      // Database verification: status remains ACTIVE
      const recheckedAdmin = await prisma.user.findUnique({ where: { id: adminUser.id } });
      expect(recheckedAdmin?.status).toBe('ACTIVE');
    });
  });

  // =========================================================================
  // SECTION 2: Public Registration Privilege Escalation Resistance
  // =========================================================================
  describe('2. Public Registration Privilege Escalation Resistance (POST /api/auth/register)', () => {
    it('should reject registration with explicit role: "ADMIN" (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Intruder One',
          email: `intruder1_audit_${timestamp}@bazaarone.test`,
          password: 'Password@123',
          role: 'ADMIN',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Public registration as Administrator is not permitted');
    });

    it('should reject registration with lowercase role: "admin" (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Intruder Two',
          email: `intruder2_audit_${timestamp}@bazaarone.test`,
          password: 'Password@123',
          role: 'admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Public registration as Administrator is not permitted');
    });

    it('should reject registration with mixed-case role: "Admin" (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Intruder Three',
          email: `intruder3_audit_${timestamp}@bazaarone.test`,
          password: 'Password@123',
          role: 'Admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Public registration as Administrator is not permitted');
    });

    it('should reject registration with synonym or whitespace role: " superadmin " (403 or 422)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Intruder Four',
          email: `intruder4_audit_${timestamp}@bazaarone.test`,
          password: 'Password@123',
          role: ' superadmin ',
        });

      // Zod reject with 422 or service reject with 403; must never succeed
      expect([403, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with mass-assignment extra properties ({ role: "ADMIN", isAdmin: true })', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Intruder Five',
          email: `intruder5_audit_${timestamp}@bazaarone.test`,
          password: 'Password@123',
          role: 'ADMIN',
          isAdmin: true,
          isSuperAdmin: true,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Verify no user was created with this email
      const checkUser = await prisma.user.findUnique({
        where: { email: `intruder5_audit_${timestamp}@bazaarone.test` },
      });
      expect(checkUser).toBeNull();
    });

    it('should reject multipart/form-data registration with field role="ADMIN" (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .field('name', 'Intruder Multipart')
        .field('email', `intruder_multi_audit_${timestamp}@bazaarone.test`)
        .field('password', 'Password@123')
        .field('role', 'ADMIN');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should safely default to CUSTOMER when role is omitted in registration', async () => {
      const regEmail = `legit_cust_audit_${timestamp}@bazaarone.test`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Legit Customer',
          email: regEmail,
          password: 'Password@123',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('CUSTOMER');

      const dbUser = await prisma.user.findUnique({ where: { email: regEmail } });
      expect(dbUser?.role).toBe('CUSTOMER');
    });

    it('should assign VENDOR (never ADMIN) when valid vendor registration is submitted', async () => {
      const regEmail = `legit_vend_audit_${timestamp}@bazaarone.test`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Legit Vendor',
          email: regEmail,
          password: 'Password@123',
          role: 'VENDOR',
          businessName: 'Legit Store',
          businessAddress: '100 Market St',
          phone: '9876543210',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('VENDOR');

      const dbUser = await prisma.user.findUnique({ where: { email: regEmail } });
      expect(dbUser?.role).toBe('VENDOR');
    });
  });

  // =========================================================================
  // SECTION 3: Profile Update Privilege Escalation Resistance (PUT /api/auth/profile)
  // =========================================================================
  describe('3. Profile Update Privilege Escalation Resistance (PUT /api/auth/profile)', () => {
    it('should reject role modification attempt with role: "ADMIN" (403 Forbidden)', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Escalation Attempt',
          role: 'ADMIN',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Privilege escalation attempt detected');

      // Verify user in DB still has role CUSTOMER
      const dbUser = await prisma.user.findUnique({ where: { id: customerUser.id } });
      expect(dbUser?.role).toBe('CUSTOMER');
    });

    it('should reject administrative attribute tampering ({ isAdmin: true }) (403 Forbidden)', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Escalation Attempt 2',
          isAdmin: true,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject account status modification via profile update ({ status: "SUSPENDED" }) (403 Forbidden)', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          status: 'SUSPENDED',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject role tampering submitted via cookie authentication', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Cookie', [`token=${customerToken}`])
        .send({
          role: 'ADMIN',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should permit legitimate profile name update without touching role or status', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Updated Legitimate Customer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Updated Legitimate Customer');
      expect(res.body.data.user.role).toBe('CUSTOMER');

      const dbUser = await prisma.user.findUnique({ where: { id: customerUser.id } });
      expect(dbUser?.name).toBe('Updated Legitimate Customer');
      expect(dbUser?.role).toBe('CUSTOMER');
    });
  });

  // =========================================================================
  // SECTION 4: JWT & Cookie Tampering Resistance
  // =========================================================================
  describe('4. JWT & Cookie Tampering Resistance', () => {
    it('should reject tampered JWT with forged signature (401 Unauthorized)', async () => {
      // Craft a token signed with an unauthorized/different secret
      const forgedToken = jwt.sign(
        { userId: customerUser.id, email: customerUser.email, role: 'ADMIN' },
        'attacker-bogus-secret-key-1234567890'
      );

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject forged JWT with "alg: none" attack (401 Unauthorized)', async () => {
      // Insecure JWT with no signature
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({ userId: customerUser.id, email: customerUser.email, role: 'ADMIN' })
      ).toString('base64url');
      const unsignedToken = `${header}.${payload}.`;

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${unsignedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('MUST enforce Database Role Authority: JWT forged role claim is overridden by DB truth (403 Forbidden)', async () => {
      // Even if a validly signed JWT claims role: "ADMIN", the backend authenticate middleware
      // fetches user fresh from MongoDB Atlas where role is "CUSTOMER".
      // When requireRole('ADMIN') executes, it uses req.user.role from DB, denying access.
      const spoofedJwt = signToken({
        userId: customerUser.id,
        email: customerUser.email,
        role: 'ADMIN' as any, // Forged role claim
      });

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${spoofedJwt}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Role 'CUSTOMER' is not authorized");
    });

    it('should reject forged cookie token (401 Unauthorized)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', ['token=forged.invalid.token']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should ignore arbitrary session cookies like bazaarone_session=ADMIN', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', ['bazaarone_session=ADMIN']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // SECTION 5: RBAC Route & Admin Management Endpoint Isolation
  // =========================================================================
  describe('5. RBAC Route & Admin Management Endpoint Isolation', () => {
    it('should reject unauthenticated access to GET /api/admin/stats (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('should reject customer access to GET /api/admin/stats (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject vendor access to GET /api/admin/stats (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject customer access to GET /api/admin/users (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject customer access to PATCH /api/admin/users/:id/status (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${customerUser.id}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'SUSPENDED' });

      expect(res.status).toBe(403);
    });

    it('should reject customer access to GET /api/admin/vendor-applications (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/vendor-applications')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject customer access to POST /api/categories (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Hacked Category' });

      expect(res.status).toBe(403);
    });

    it('should allow authentic Super Admin access to GET /api/admin/stats (200 OK)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalVendors');
    });

    it('should allow authentic Super Admin access to GET /api/admin/users (200 OK)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 6: Final Invariant Verification
  // =========================================================================
  describe('6. Post-Audit Database Invariant Verification', () => {
    it('MUST verify that exactly 1 Super Admin remains in MongoDB Atlas after all tests', async () => {
      const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
      expect(totalAdmins).toBe(1);

      const currentAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      expect(currentAdmin?.email).toBe(CANONICAL_SUPER_ADMIN_EMAIL);
      expect(currentAdmin?.status).toBe('ACTIVE');
    });
  });
});
