import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Cloudinary Image Upload & Authorization', () => {
  let vendorToken: string;
  let customerToken: string;
  let vendorUserId: string;
  let customerUserId: string;
  let vendorId: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('Pass@123');

    // Vendor User
    const vUser = await prisma.user.create({
      data: {
        name: 'Upload Vendor',
        email: `up_vend_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendorUserId = vUser.id;

    const vendor = await prisma.vendor.create({
      data: {
        userId: vUser.id,
        businessName: 'Upload Studio',
        slug: `up-studio-${Date.now()}`,
        businessAddress: '100 Studio Way',
        phone: '9876543210',
        status: 'APPROVED',
      },
    });
    vendorId = vendor.id;

    vendorToken = signToken({ userId: vUser.id, email: vUser.email, role: 'VENDOR' });

    // Normal Customer
    const cUser = await prisma.user.create({
      data: {
        name: 'Upload Customer',
        email: `up_cust_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customerUserId = cUser.id;

    customerToken = signToken({ userId: cUser.id, email: cUser.email, role: 'CUSTOMER' });
  });

  afterAll(async () => {
    if (vendorId) await prisma.vendor.deleteMany({ where: { id: vendorId } });
    if (vendorUserId) await prisma.user.deleteMany({ where: { id: vendorUserId } });
    if (customerUserId) await prisma.user.deleteMany({ where: { id: customerUserId } });
  });

  it('CRITICAL: should FORBID non-vendor user from uploading product images (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${customerToken}`)
      .attach('image', Buffer.from('fake image content'), 'test.png');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should REJECT upload when no file is attached in request (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow authorized vendor to upload product image asset', async () => {
    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${vendorToken}`)
      .attach('image', pngBuffer, 'pixel.png');

    expect([201, 502]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.data.url).toBeDefined();
    }
  });
});
