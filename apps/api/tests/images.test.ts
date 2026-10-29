import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

jest.setTimeout(60000);

describe('Cloudinary Image Upload & Authorization', () => {
  let vendorToken: string;
  let customerToken: string;

  beforeAll(async () => {
    // 1. Use seeded Vendor account
    const vUser = await prisma.user.findUnique({
      where: { email: 'apex@bazaarone.com' },
      include: { vendor: true },
    });
    if (!vUser) throw new Error('Apex Electronics vendor user not found.');
    vendorToken = signToken({ userId: vUser.id, email: vUser.email, role: 'VENDOR' });

    // 2. Use seeded Customer account
    const cUser = await prisma.user.findUnique({
      where: { email: 'customer@bazaarone.com' },
    });
    if (!cUser) throw new Error('Customer user not found.');
    customerToken = signToken({ userId: cUser.id, email: cUser.email, role: 'CUSTOMER' });
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

  it('should allow authorized vendor to upload product image asset to Cloudinary', async () => {
    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${vendorToken}`)
      .attach('image', pngBuffer, 'pixel.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
    expect(res.body.data.url).toMatch(/^https:\/\/res\.cloudinary\.com\//);

    // Clean up uploaded test asset
    if (res.body.data.publicId) {
      const { CloudinaryService } = require('../src/services/cloudinary.service');
      await CloudinaryService.deleteImage(res.body.data.publicId);
    }
  });
});
