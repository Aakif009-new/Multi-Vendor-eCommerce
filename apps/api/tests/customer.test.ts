import request from 'supertest';
import crypto from 'crypto';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { env } from '../src/config/env';

describe('Customer Account Data System & Multi-Vendor Isolation', () => {
  let customerAToken: string;
  let customerAUser: any;
  let customerBToken: string;
  let customerBUser: any;

  let customerAAddress: any;
  let customerAOrderId: string;
  let apexProduct: any;
  let urbanProduct: any;

  beforeAll(async () => {
    // 1. Fetch 2 active products from different approved vendors for multi-vendor checkout
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE', stock: { gte: 5 } },
      include: { vendor: true },
      take: 10,
    });

    apexProduct = products.find((p) => p.vendor?.slug === 'apex-electronics') || products[0];
    urbanProduct = products.find((p) => p.vendor?.slug === 'urbancart') || products[1];
  });

  describe('1. Customer Profile & Ownership', () => {
    it('should register Customer A and retrieve profile securely', async () => {
      const email = `customer_a_${Date.now()}@test.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Customer XYZ',
          email,
          password: 'Password@123',
          role: 'CUSTOMER',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      customerAToken = res.body.data.token;
      customerAUser = res.body.data.user;

      expect(customerAUser.email).toBe(email);
      expect(customerAUser.role).toBe('CUSTOMER');
    });

    it('should allow Customer A to update their own profile', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({ name: 'Customer XYZ Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Customer XYZ Updated');
    });

    it('should allow Customer A to add a persistent shipping address', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          title: 'Home Sanctuary',
          street: '123 Palm Grove Lane',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          phone: '9876543210',
          isDefault: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      customerAAddress = res.body.data;
      expect(customerAAddress.userId).toBe(customerAUser.id);
      expect(customerAAddress.isDefault).toBe(true);
    });
  });

  describe('2. Customer Isolation & IDOR Protection', () => {
    it('should register Customer B and verify 0 inherited resources', async () => {
      const email = `customer_b_${Date.now()}@test.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Customer ABC',
          email,
          password: 'Password@123',
          role: 'CUSTOMER',
        });

      expect(res.status).toBe(201);
      customerBToken = res.body.data.token;
      customerBUser = res.body.data.user;

      // Customer B must have 0 addresses
      const addrRes = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${customerBToken}`);
      expect(addrRes.status).toBe(200);
      expect(addrRes.body.data.length).toBe(0);

      // Customer B must have 0 cart items
      const cartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerBToken}`);
      expect(cartRes.status).toBe(200);
      expect(cartRes.body.data.items.length).toBe(0);

      // Customer B must have 0 orders
      const ordersRes = await request(app)
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${customerBToken}`);
      expect(ordersRes.status).toBe(200);
      expect(ordersRes.body.data.length).toBe(0);
    });

    it('CRITICAL: should FORBID Customer B from updating Customer A address (IDOR)', async () => {
      const res = await request(app)
        .put(`/api/addresses/${customerAAddress.id}`)
        .set('Authorization', `Bearer ${customerBToken}`)
        .send({ street: 'Malicious Infiltration' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('CRITICAL: should FORBID Customer B from deleting Customer A address (IDOR)', async () => {
      const res = await request(app)
        .delete(`/api/addresses/${customerAAddress.id}`)
        .set('Authorization', `Bearer ${customerBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Multi-Vendor Order Flow & Historical Snapshots', () => {
    it('should allow Customer A to build a multi-vendor cart and checkout', async () => {
      // 1. Add Apex product to cart
      const cart1 = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({ productId: apexProduct.id, quantity: 1 });
      expect(cart1.status).toBe(200);

      // 2. Add UrbanCart product to cart
      const cart2 = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({ productId: urbanProduct.id, quantity: 2 });
      expect(cart2.status).toBe(200);

      // 3. Initiate Checkout
      const checkoutRes = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({ addressId: customerAAddress.id });

      expect(checkoutRes.status).toBe(201);
      expect(checkoutRes.body.success).toBe(true);
      customerAOrderId = checkoutRes.body.data.order.id;
      const razorpayOrderId = checkoutRes.body.data.razorpayOrderId;

      // 4. Generate authentic HMAC signature
      const razorpayPaymentId = `pay_test_${Date.now()}`;
      const signature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      // 5. Verify & Confirm Payment
      const verifyRes = await request(app)
        .post('/api/orders/verify-payment')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          orderId: customerAOrderId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: signature,
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.status).toBe('CONFIRMED');
      expect(verifyRes.body.data.paymentStatus).toBe('PAID');
    });

    it('should preserve historical snapshots and show multi-vendor items to Customer A', async () => {
      const res = await request(app)
        .get(`/api/orders/${customerAOrderId}`)
        .set('Authorization', `Bearer ${customerAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const order = res.body.data;

      expect(order.id).toBe(customerAOrderId);
      expect(order.orderItems.length).toBe(2);

      // Verify snapshots
      for (const item of order.orderItems) {
        expect(item).toHaveProperty('productName');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('vendor');
        expect(item.vendor).toHaveProperty('businessName');
      }
    });

    it('CRITICAL: should FORBID Customer B from viewing Customer A order details (IDOR)', async () => {
      const res = await request(app)
        .get(`/api/orders/${customerAOrderId}`)
        .set('Authorization', `Bearer ${customerBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should provide authentic Customer Dashboard stats from database records', async () => {
      const res = await request(app)
        .get('/api/orders/dashboard-stats')
        .set('Authorization', `Bearer ${customerAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const stats = res.body.data;

      expect(stats.totalOrders).toBeGreaterThanOrEqual(1);
      expect(stats.totalSpent).toBeGreaterThan(0);
      expect(stats.savedAddressesCount).toBe(1);
      expect(Array.isArray(stats.recentOrders)).toBe(true);
    });
  });

  describe('4. Logout & Login Data Persistence Verification', () => {
    it('should verify all customer records persist identically upon relogin', async () => {
      // 1. Customer A logs out
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${customerAToken}`);
      expect(logoutRes.status).toBe(200);

      // 2. Customer A logs in again
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: customerAUser.email,
          password: 'Password@123',
        });

      expect(loginRes.status).toBe(200);
      const newToken = loginRes.body.data.token;

      // 3. Verify Customer A orders still exist
      const ordersRes = await request(app)
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${newToken}`);
      expect(ordersRes.status).toBe(200);
      expect(ordersRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(ordersRes.body.data[0].id).toBe(customerAOrderId);

      // 4. Verify Customer A addresses still exist
      const addressRes = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${newToken}`);
      expect(addressRes.status).toBe(200);
      expect(addressRes.body.data.length).toBe(1);
      expect(addressRes.body.data[0].id).toBe(customerAAddress.id);
    });
  });
});
