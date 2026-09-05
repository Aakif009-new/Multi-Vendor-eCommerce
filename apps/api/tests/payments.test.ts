import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';
import crypto from 'crypto';
import { env } from '../src/config/env';

describe('Razorpay Test Mode & Cryptographic Payment Verification', () => {
  let customerToken: string;
  let customerId: string;
  let addressId: string;
  let orderId: string;
  let razorpayOrderId: string;
  let productId: string;
  let categoryId: string;
  let vendorId: string;
  let vendorUserId: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('Cust@123');

    const user = await prisma.user.create({
      data: {
        name: 'Payment Test Customer',
        email: `pay_cust_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customerId = user.id;
    customerToken = signToken({ userId: user.id, email: user.email, role: 'CUSTOMER' });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        title: 'Home',
        street: '100 Payment Way',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
        phone: '9876543210',
        isDefault: true,
      },
    });
    addressId = address.id;

    // Create a product and add to cart
    const vendorUser = await prisma.user.create({
      data: {
        name: 'Payment Vendor',
        email: `pay_vend_${Date.now()}@market.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendorUserId = vendorUser.id;

    const vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: 'Payments Test Store',
        slug: `payments-test-store-${Date.now()}`,
        businessAddress: 'Pay St',
        phone: '9876500000',
        status: 'APPROVED',
      },
    });
    vendorId = vendor.id;

    const cat = await prisma.category.create({
      data: {
        name: `Pay_Cat_${Date.now()}`,
        slug: `pay-cat-${Date.now()}`,
      },
    });
    categoryId = cat.id;

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: 'Handcrafted Brass Lamp',
        slug: `brass-lamp-${Date.now()}`,
        description: 'Traditional handcrafted brass lamp.',
        price: 2499,
        stock: 10,
        status: 'ACTIVE',
      },
    });
    productId = product.id;

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product.id, quantity: 1 });

    const checkoutRes = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ addressId });

    orderId = checkoutRes.body.data.order.id;
    razorpayOrderId = checkoutRes.body.data.razorpayOrderId;
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.payment.deleteMany({ where: { orderId } });
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    if (productId) {
      await prisma.cartItem.deleteMany({ where: { productId } });
      await prisma.product.deleteMany({ where: { id: productId } });
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

  it('should generate valid HMAC-SHA256 signature locally for testing', () => {
    const paymentId = 'pay_test_12345';
    const sig = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex');
    expect(sig).toBeDefined();
    expect(sig.length).toBe(64);
  });

  it('CRITICAL: should REJECT payment confirmation with forged signature (400 Bad Request)', async () => {
    const forgedSignature = 'invalid_forged_signature_hex_digest_string_1234567890abcdef';

    const res = await request(app)
      .post('/api/orders/verify-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: 'pay_test_12345',
        razorpaySignature: forgedSignature,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Payment signature verification failed');

    // Confirm DB was NOT updated to PAID
    const orderInDb = await prisma.order.findUnique({ where: { id: orderId } });
    expect(orderInDb?.paymentStatus).not.toBe('PAID');
  });

  it('should ACCEPT payment confirmation with authentic cryptographic HMAC signature', async () => {
    const paymentId = `pay_valid_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex');

    const res = await request(app)
      .post('/api/orders/verify-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(res.body.data.paymentStatus).toBe('PAID');
  });

  it('should handle duplicate payment verification idempotently', async () => {
    const paymentId = `pay_valid_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex');

    const res = await request(app)
      .post('/api/orders/verify-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
  });
});
