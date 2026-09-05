import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';
import crypto from 'crypto';
import { env } from '../src/config/env';

describe('Inventory Business Logic & Stock Protection', () => {
  let customerToken: string;
  let customerId: string;
  let addressId: string;
  let testProductId: string;
  let vendorId: string;
  let vendorUserId: string;
  let categoryId: string;
  let orderId: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('Cust@123');

    // Create Customer
    const user = await prisma.user.create({
      data: {
        name: 'Inventory Test Customer',
        email: `inv_cust_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customerId = user.id;
    customerToken = signToken({ userId: user.id, email: user.email, role: 'CUSTOMER' });

    // Create Shipping Address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        title: 'Home',
        street: '123 Inventory Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
        phone: '9988776655',
        isDefault: true,
      },
    });
    addressId = address.id;

    // Create Vendor & Category
    const vendorUser = await prisma.user.create({
      data: {
        name: 'Inventory Vendor',
        email: `inv_vend_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendorUserId = vendorUser.id;

    const vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: 'Inventory Merchant Hub',
        slug: `inv-merchant-${Date.now()}`,
        businessAddress: 'Market St',
        phone: '9876500003',
        status: 'APPROVED',
      },
    });
    vendorId = vendor.id;

    const cat = await prisma.category.create({
      data: {
        name: `Inv_Cat_${Date.now()}`,
        slug: `inv-cat-${Date.now()}`,
      },
    });
    categoryId = cat.id;

    // Create Product with stock = 10
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: 'Handcrafted Sandalwood Sculpture',
        slug: `sandalwood-sculpture-${Date.now()}`,
        description: 'Authentic Mysore sandalwood carving.',
        price: 3500,
        stock: 10,
        status: 'ACTIVE',
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.payment.deleteMany({ where: { orderId } });
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    if (testProductId) {
      await prisma.cartItem.deleteMany({ where: { productId: testProductId } });
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    if (vendorId) await prisma.vendor.deleteMany({ where: { id: vendorId } });
    if (vendorUserId) await prisma.user.deleteMany({ where: { id: vendorUserId } });
    if (customerId) {
      await prisma.cart.deleteMany({ where: { userId: customerId } });
      await prisma.address.deleteMany({ where: { userId: customerId } });
      await prisma.user.deleteMany({ where: { id: customerId } });
    }
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
  });

  it('should REJECT checkout when requested quantity exceeds available stock', async () => {
    // Add 15 to cart (Stock is only 10)
    const addRes = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProductId,
        quantity: 15,
      });

    // Cart service checks stock and rejects
    expect(addRes.status).toBe(400);
    expect(addRes.body.success).toBe(false);
    expect(addRes.body.message).toContain('Insufficient stock');
  });

  it('should accurately deduct inventory stock upon verified order payment confirmation', async () => {
    // 1. Add 2 items to cart
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProductId,
        quantity: 2,
      });

    // 2. Checkout
    const checkoutRes = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ addressId });

    expect(checkoutRes.status).toBe(201);
    orderId = checkoutRes.body.data.order.id;
    const razorpayOrderId = checkoutRes.body.data.razorpayOrderId;
    const razorpayPaymentId = `pay_${Date.now()}`;

    // 3. Generate valid cryptographic signature
    const signature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // 4. Verify payment
    const confirmRes = await request(app)
      .post('/api/orders/verify-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: signature,
      });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('CONFIRMED');

    // 5. Verify product stock in DB was decremented by 2 (10 -> 8)
    const updatedProduct = await prisma.product.findUnique({
      where: { id: testProductId },
    });

    expect(updatedProduct?.stock).toBe(8);
  });
});
