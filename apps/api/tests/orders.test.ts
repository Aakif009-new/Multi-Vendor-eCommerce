import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';
import crypto from 'crypto';
import { env } from '../src/config/env';

describe('Multi-Vendor Order Processing & Vendor Isolation', () => {
  let customerToken: string;
  let customerId: string;
  let addressId: string;
  let vendor1Token: string;
  let vendor1Id: string;
  let vendor1UserId: string;
  let vendor2Token: string;
  let vendor2Id: string;
  let vendor2UserId: string;
  let prodVendor1Id: string;
  let prodVendor2Id: string;
  let categoryId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('Pass@123');

    // 1. Setup Customer
    const customer = await prisma.user.create({
      data: {
        name: 'Multi-Vendor Buyer',
        email: `mv_buyer_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customerId = customer.id;
    customerToken = signToken({ userId: customer.id, email: customer.email, role: 'CUSTOMER' });

    const address = await prisma.address.create({
      data: {
        userId: customer.id,
        title: 'Home',
        street: '88 Market St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        phone: '9876543210',
        isDefault: true,
      },
    });
    addressId = address.id;

    // 2. Setup Vendor 1 (Textiles)
    const userV1 = await prisma.user.create({
      data: {
        name: 'Vendor One',
        email: `mv_v1_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendor1UserId = userV1.id;

    const vendor1 = await prisma.vendor.create({
      data: {
        userId: userV1.id,
        businessName: 'Silk Weavers Guild',
        slug: `silk-weavers-${Date.now()}`,
        businessAddress: 'Silk Rd',
        phone: '9876500001',
        status: 'APPROVED',
      },
    });
    vendor1Id = vendor1.id;
    vendor1Token = signToken({ userId: userV1.id, email: userV1.email, role: 'VENDOR' });

    // 3. Setup Vendor 2 (Spices)
    const userV2 = await prisma.user.create({
      data: {
        name: 'Vendor Two',
        email: `mv_v2_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendor2UserId = userV2.id;

    const vendor2 = await prisma.vendor.create({
      data: {
        userId: userV2.id,
        businessName: 'Himalayan Spice Co',
        slug: `himalayan-spice-${Date.now()}`,
        businessAddress: 'Spice Market',
        phone: '9876500002',
        status: 'APPROVED',
      },
    });
    vendor2Id = vendor2.id;
    vendor2Token = signToken({ userId: userV2.id, email: userV2.email, role: 'VENDOR' });

    // 4. Setup Category
    const cat = await prisma.category.create({
      data: {
        name: `MV_Category_${Date.now()}`,
        slug: `mv-cat-${Date.now()}`,
      },
    });
    categoryId = cat.id;

    // 5. Products
    const p1 = await prisma.product.create({
      data: {
        vendorId: vendor1.id,
        categoryId: cat.id,
        name: 'Banarasi Silk Saree',
        slug: `saree-${Date.now()}`,
        description: 'Authentic pure silk saree.',
        price: 8500,
        discountPrice: 7999,
        stock: 5,
        status: 'ACTIVE',
      },
    });
    prodVendor1Id = p1.id;

    const p2 = await prisma.product.create({
      data: {
        vendorId: vendor2.id,
        categoryId: cat.id,
        name: 'Organic Kashmiri Saffron 5g',
        slug: `saffron-${Date.now()}`,
        description: 'Grade-A export saffron.',
        price: 1800,
        stock: 10,
        status: 'ACTIVE',
      },
    });
    prodVendor2Id = p2.id;
  });

  afterAll(async () => {
    if (createdOrderId) {
      await prisma.review.deleteMany({ where: { orderItem: { orderId: createdOrderId } } });
      await prisma.payment.deleteMany({ where: { orderId: createdOrderId } });
      await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } });
      await prisma.order.deleteMany({ where: { id: createdOrderId } });
    }
    if (prodVendor1Id) {
      await prisma.cartItem.deleteMany({ where: { productId: prodVendor1Id } });
      await prisma.product.deleteMany({ where: { id: prodVendor1Id } });
    }
    if (prodVendor2Id) {
      await prisma.cartItem.deleteMany({ where: { productId: prodVendor2Id } });
      await prisma.product.deleteMany({ where: { id: prodVendor2Id } });
    }
    if (vendor1Id) await prisma.vendor.deleteMany({ where: { id: vendor1Id } });
    if (vendor2Id) await prisma.vendor.deleteMany({ where: { id: vendor2Id } });
    if (vendor1UserId) await prisma.user.deleteMany({ where: { id: vendor1UserId } });
    if (vendor2UserId) await prisma.user.deleteMany({ where: { id: vendor2UserId } });
    if (customerId) {
      await prisma.cart.deleteMany({ where: { userId: customerId } });
      await prisma.address.deleteMany({ where: { userId: customerId } });
      await prisma.user.deleteMany({ where: { id: customerId } });
    }
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
  });

  it('should allow customer to create a single checkout containing items from multiple vendors', async () => {
    // Add V1 product
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: prodVendor1Id, quantity: 1 });

    // Add V2 product
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: prodVendor2Id, quantity: 2 });

    // Checkout
    const checkoutRes = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ addressId });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);
    createdOrderId = checkoutRes.body.data.order.id;

    // Verify order items partitioned per vendor
    const orderItems = checkoutRes.body.data.order.orderItems;
    expect(orderItems.length).toBe(2);

    const v1Item = orderItems.find((i: any) => i.vendorId === vendor1Id);
    const v2Item = orderItems.find((i: any) => i.vendorId === vendor2Id);

    expect(v1Item).toBeDefined();
    expect(v2Item).toBeDefined();
    expect(v1Item.price).toBe(8500);
    expect(v2Item.price).toBe(1800);
    expect(v2Item.quantity).toBe(2);
  });

  it('should isolate vendor order items: Vendor 1 sees only Vendor 1 items', async () => {
    const res = await request(app)
      .get('/api/orders/vendor')
      .set('Authorization', `Bearer ${vendor1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    for (const item of res.body.data) {
      expect(item.vendorId).toBe(vendor1Id);
    }
  });

  it('CRITICAL: should FORBID Vendor 2 from modifying the status of Vendor 1 order item', async () => {
    const v1Items = await prisma.orderItem.findMany({
      where: { vendorId: vendor1Id },
    });
    expect(v1Items.length).toBeGreaterThan(0);
    const v1ItemId = v1Items[0].id;

    const res = await request(app)
      .patch(`/api/orders/vendor/items/${v1ItemId}/status`)
      .set('Authorization', `Bearer ${vendor2Token}`)
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow Vendor 1 to update their own order item status to PACKED then SHIPPED', async () => {
    const v1Items = await prisma.orderItem.findMany({
      where: { vendorId: vendor1Id },
    });
    const v1ItemId = v1Items[0].id;

    const res = await request(app)
      .patch(`/api/orders/vendor/items/${v1ItemId}/status`)
      .set('Authorization', `Bearer ${vendor1Token}`)
      .send({ status: 'PACKED' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PACKED');
  });
});
