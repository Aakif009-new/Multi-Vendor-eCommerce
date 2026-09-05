import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Wishlist Management', () => {
  let customerToken: string;
  let customerId: string;
  let testProductId: string;
  let categoryId: string;
  let vendorId: string;
  let vendorUserId: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('Customer@123');
    const user = await prisma.user.create({
      data: {
        name: 'Wishlist User',
        email: `wishlist_user_${Date.now()}@test.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customerId = user.id;
    customerToken = signToken({ userId: user.id, email: user.email, role: 'CUSTOMER' });

    const cat = await prisma.category.create({
      data: {
        name: `Cat_Wish_${Date.now()}`,
        slug: `cat-wish-${Date.now()}`,
      },
    });
    categoryId = cat.id;

    const vendorUser = await prisma.user.create({
      data: {
        name: 'Wish Vendor',
        email: `vendor_wish_${Date.now()}@test.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
      },
    });
    vendorUserId = vendorUser.id;

    const vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: 'Wishlist Store',
        slug: `wishlist-store-${Date.now()}`,
        businessAddress: 'Wish St',
        phone: '1122334455',
        status: 'APPROVED',
      },
    });
    vendorId = vendor.id;

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: 'Wishlist Test Camera',
        slug: `camera-${Date.now()}`,
        description: '4K Mirrorless Camera.',
        price: 49999,
        stock: 5,
        status: 'ACTIVE',
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    if (testProductId) {
      await prisma.cartItem.deleteMany({ where: { productId: testProductId } });
      await prisma.wishlistItem.deleteMany({ where: { productId: testProductId } });
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    if (vendorId) await prisma.vendor.deleteMany({ where: { id: vendorId } });
    if (vendorUserId) await prisma.user.deleteMany({ where: { id: vendorUserId } });
    if (customerId) {
      await prisma.wishlist.deleteMany({ where: { userId: customerId } });
      await prisma.cart.deleteMany({ where: { userId: customerId } });
      await prisma.user.deleteMany({ where: { id: customerId } });
    }
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
  });

  it('should add item to wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: testProductId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should prevent duplicate items in wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: testProductId });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('already in your wishlist');
  });

  it('should move item from wishlist to cart', async () => {
    const res = await request(app)
      .post(`/api/wishlist/${testProductId}/move-to-cart`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify item is now in cart
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(cartRes.body.data.items.some((i: any) => i.productId === testProductId)).toBe(true);
  });
});
