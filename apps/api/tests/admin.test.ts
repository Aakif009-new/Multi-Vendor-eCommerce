import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Admin Governance & Role-Based Access Control', () => {
  let adminToken: string;
  let customerToken: string;
  let vendorAppId: string;
  let applicantUserId: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('Admin@123');

    // 1. Setup Admin (Use canonical Super Administrator to preserve Super Admin uniqueness)
    let admin = await prisma.user.findUnique({ where: { email: 'admin@bazaarone.com' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          name: 'Super Administrator',
          email: 'admin@bazaarone.com',
          passwordHash: pwdHash,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
    }
    adminToken = signToken({ userId: admin.id, email: admin.email, role: 'ADMIN' });

    // 2. Setup Customer (Unauthorized for admin routes)
    const customer = await prisma.user.create({
      data: {
        name: 'Normal Customer',
        email: `customer_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customerToken = signToken({ userId: customer.id, email: customer.email, role: 'CUSTOMER' });

    // 3. Setup Applicant User
    const applicant = await prisma.user.create({
      data: {
        name: 'Merchant Applicant',
        email: `applicant_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    applicantUserId = applicant.id;

    const application = await prisma.vendorApplication.create({
      data: {
        userId: applicant.id,
        businessName: 'Artisan Woodworks',
        businessAddress: '789 Craft St',
        phone: '9898989898',
        status: 'PENDING',
      },
    });
    vendorAppId = application.id;
  });

  it('CRITICAL: should REJECT non-admin user on GET /api/admin/stats with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow Super Admin to fetch marketplace statistics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeDefined();
    expect(res.body.data.totalProducts).toBeDefined();
  });

  it('should allow Super Admin to APPROVE a pending vendor application', async () => {
    const res = await request(app)
      .patch(`/api/admin/vendor-applications/${vendorAppId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'APPROVED',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');

    // Verify applicant role is now promoted to VENDOR
    const updatedUser = await prisma.user.findUnique({ where: { id: applicantUserId } });
    expect(updatedUser?.role).toBe('VENDOR');
  });

  let createdCategoryId: string | null = null;
  let createdBrandId: string | null = null;

  afterAll(async () => {
    // Teardown: Clean up test created category and brand to prevent database pollution
    if (createdCategoryId) {
      await prisma.category.delete({ where: { id: createdCategoryId } }).catch(() => {});
    }
    if (createdBrandId) {
      await prisma.brand.delete({ where: { id: createdBrandId } }).catch(() => {});
    }
  });

  it('should reject category creation with internal test placeholder name (422)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Category 1792938522548',
        description: 'Placeholder test name',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should allow Super Admin to create a new Category and Brand', async () => {
    const suffix = Date.now().toString().slice(-4);
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Specialty Crafts ${suffix}`,
        description: 'Managed by Super Admin.',
      });

    expect(catRes.status).toBe(201);
    expect(catRes.body.success).toBe(true);
    createdCategoryId = catRes.body.data.id;

    const brandRes = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Specialty Studio ${suffix}`,
        description: 'Official Brand.',
      });

    expect(brandRes.status).toBe(201);
    expect(brandRes.body.success).toBe(true);
    createdBrandId = brandRes.body.data.id;
  });
});
