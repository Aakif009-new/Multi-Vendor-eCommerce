import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Product System & Vendor Ownership Isolation', () => {
  let categoryId: string;
  let vendor1Token: string;
  let vendor1Id: string;
  let vendor1UserId: string;
  let vendor2Token: string;
  let vendor2Id: string;
  let vendor2UserId: string;
  let createdProductId: string;

  beforeAll(async () => {
    // 1. Seed or find a category
    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: `Electronics_${Date.now()}`,
          slug: `electronics-${Date.now()}`,
          isActive: true,
        },
      });
    }
    categoryId = cat.id;

    // 2. Setup Vendor 1 (Approved)
    const pwdHash = await hashPassword('Vendor@123');
    const user1 = await prisma.user.create({
      data: {
        name: 'Vendor One',
        email: `vendor1_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendor1UserId = user1.id;

    const v1 = await prisma.vendor.create({
      data: {
        userId: user1.id,
        businessName: 'Vendor One Store',
        slug: `vendor-one-${Date.now()}`,
        businessAddress: '123 Market St',
        phone: '9988776655',
        status: 'APPROVED',
        accountStatus: 'ACTIVE',
      },
    });
    vendor1Id = v1.id;
    vendor1Token = signToken({ userId: user1.id, email: user1.email, role: 'VENDOR' });

    // 3. Setup Vendor 2 (Approved)
    const user2 = await prisma.user.create({
      data: {
        name: 'Vendor Two',
        email: `vendor2_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendor2UserId = user2.id;

    const v2 = await prisma.vendor.create({
      data: {
        userId: user2.id,
        businessName: 'Vendor Two Store',
        slug: `vendor-two-${Date.now()}`,
        businessAddress: '456 Market St',
        phone: '9988776656',
        status: 'APPROVED',
        accountStatus: 'ACTIVE',
      },
    });
    vendor2Id = v2.id;
    vendor2Token = signToken({ userId: user2.id, email: user2.email, role: 'VENDOR' });
  });

  afterAll(async () => {
    if (createdProductId) {
      await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
    if (vendor1Id) await prisma.vendor.deleteMany({ where: { id: vendor1Id } });
    if (vendor2Id) await prisma.vendor.deleteMany({ where: { id: vendor2Id } });
    if (vendor1UserId) await prisma.user.deleteMany({ where: { id: vendor1UserId } });
    if (vendor2UserId) await prisma.user.deleteMany({ where: { id: vendor2UserId } });
  });

  it('should list products on GET /api/products with pagination meta', async () => {
    const res = await request(app).get('/api/products?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page', 1);
  });

  it('should allow Vendor 1 to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${vendor1Token}`)
      .send({
        name: 'Wireless Bluetooth Headset',
        description: 'High-definition wireless audio headset with long battery life.',
        price: 4999,
        discountPrice: 3999,
        stock: 50,
        sku: `TEST-HEADSET-${Date.now()}`,
        categoryId,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Wireless Bluetooth Headset');
    expect(res.body.data.vendorId).toBe(vendor1Id);
    createdProductId = res.body.data.id;
  });

  it('should allow public user to view product details by ID or slug', async () => {
    const res = await request(app).get(`/api/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdProductId);
    expect(res.body.data.vendor.businessName).toBe('Vendor One Store');
  });

  it('should allow Vendor 1 to update their own product', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${vendor1Token}`)
      .send({
        price: 15999,
        stock: 20,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(15999);
    expect(res.body.data.stock).toBe(20);
  });

  it('CRITICAL: should FORBID Vendor 2 from updating Vendor 1 product (Ownership Check)', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${vendor2Token}`)
      .send({
        price: 1, // Malicious price tampering attempt
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('CRITICAL: should FORBID Vendor 2 from deleting Vendor 1 product', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${vendor2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow Vendor 1 to delete their own product', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${vendor1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
