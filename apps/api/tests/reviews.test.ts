import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Product Reviews & Verified Purchase Eligibility', () => {
  let customer1Token: string;
  let customer1Id: string;
  let customer2Token: string;
  let customer2Id: string;
  let deliveredOrderItemId: string;
  let pendingOrderItemId: string;
  let reviewedProductId: string;
  let orderId: string;
  let vendorId: string;
  let vendorUserId: string;
  let categoryId: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('Review@123');

    // Customer 1 (Buyer)
    const c1 = await prisma.user.create({
      data: {
        name: 'Reviewer Customer One',
        email: `rev_c1_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customer1Id = c1.id;
    customer1Token = signToken({ userId: c1.id, email: c1.email, role: 'CUSTOMER' });

    // Customer 2 (Unrelated user)
    const c2 = await prisma.user.create({
      data: {
        name: 'Reviewer Customer Two',
        email: `rev_c2_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customer2Id = c2.id;
    customer2Token = signToken({ userId: c2.id, email: c2.email, role: 'CUSTOMER' });

    // Vendor & Category
    const vendorUser = await prisma.user.create({
      data: {
        name: 'Review Vendor',
        email: `rev_v_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendorUserId = vendorUser.id;

    const vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: 'Review Craft Guild',
        slug: `rev-guild-${Date.now()}`,
        businessAddress: '100 Review Road',
        phone: '9876543210',
        status: 'APPROVED',
      },
    });
    vendorId = vendor.id;

    const cat = await prisma.category.create({
      data: {
        name: `Rev_Cat_${Date.now()}`,
        slug: `rev-cat-${Date.now()}`,
      },
    });
    categoryId = cat.id;

    // Product
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: 'Handcrafted Terracotta Vase',
        slug: `terracotta-vase-${Date.now()}`,
        description: 'Traditional earthen vase.',
        price: 1200,
        stock: 8,
        rating: 0,
        numReviews: 0,
        status: 'ACTIVE',
      },
    });
    reviewedProductId = product.id;

    const address = await prisma.address.create({
      data: {
        userId: c1.id,
        title: 'Home',
        street: '12 Clay Court',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
        country: 'India',
        phone: '9876543210',
      },
    });

    // Create Order
    const order = await prisma.order.create({
      data: {
        userId: c1.id,
        addressId: address.id,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        totalAmount: 2400,
      },
    });
    orderId = order.id;

    // Create Order Items
    const deliveredItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        vendorId: vendor.id,
        productId: product.id,
        quantity: 1,
        price: 1200,
        status: 'DELIVERED',
      },
    });

    const pendingItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        vendorId: vendor.id,
        productId: product.id,
        quantity: 1,
        price: 1200,
        status: 'CONFIRMED',
      },
    });

    deliveredOrderItemId = deliveredItem.id;
    pendingOrderItemId = pendingItem.id;
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.review.deleteMany({ where: { orderItem: { orderId } } });
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    if (reviewedProductId) {
      await prisma.review.deleteMany({ where: { productId: reviewedProductId } });
      await prisma.cartItem.deleteMany({ where: { productId: reviewedProductId } });
      await prisma.product.deleteMany({ where: { id: reviewedProductId } });
    }
    if (vendorId) await prisma.vendor.deleteMany({ where: { id: vendorId } });
    if (vendorUserId) await prisma.user.deleteMany({ where: { id: vendorUserId } });
    if (customer1Id) {
      await prisma.address.deleteMany({ where: { userId: customer1Id } });
      await prisma.user.deleteMany({ where: { id: customer1Id } });
    }
    if (customer2Id) await prisma.user.deleteMany({ where: { id: customer2Id } });
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
  });

  it('CRITICAL: should REJECT review submission for an item that is NOT DELIVERED (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        orderItemId: pendingOrderItemId,
        rating: 5,
        comment: 'Premature review before delivery.',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('delivered');
  });

  it('CRITICAL: should REJECT review submission by a customer who did not purchase the item (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        orderItemId: deliveredOrderItemId,
        rating: 4,
        comment: 'Unauthorized review attempt.',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should REJECT review with invalid rating outside 1-5 range', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        orderItemId: deliveredOrderItemId,
        rating: 6, // Invalid
        comment: 'Too high rating.',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should ACCEPT verified purchase review and update Product average rating', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        orderItemId: deliveredOrderItemId,
        rating: 5,
        comment: 'Exceptional craftsmanship and smooth clay finish. Highly recommended!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);

    // Verify Product rating was updated in DB
    const updatedProduct = await prisma.product.findUnique({
      where: { id: reviewedProductId },
    });

    expect(updatedProduct?.rating).toBe(5.0);
    expect(updatedProduct?.numReviews).toBe(1);
  });

  it('CRITICAL: should REJECT duplicate review submission for the same purchased item', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        orderItemId: deliveredOrderItemId,
        rating: 4,
        comment: 'Trying to review again.',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already submitted a review');
  });
});
