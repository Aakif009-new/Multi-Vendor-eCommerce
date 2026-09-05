import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Cart Management & Inventory Stock Protection', () => {
  let customerToken: string;
  let customerId: string;
  let inStockProduct: any;
  let outOfStockProduct: any;
  let cartItemId: string;
  let categoryId: string;
  let vendorId: string;
  let vendorUserId: string;

  beforeAll(async () => {
    // 1. Setup Customer
    const pwdHash = await hashPassword('Customer@123');
    const user = await prisma.user.create({
      data: {
        name: 'Cart Tester',
        email: `cart_user_${Date.now()}@test.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customerId = user.id;
    customerToken = signToken({ userId: user.id, email: user.email, role: 'CUSTOMER' });

    // 2. Setup Category & Vendor
    const cat = await prisma.category.create({
      data: {
        name: `Cat_Cart_${Date.now()}`,
        slug: `cat-cart-${Date.now()}`,
        isActive: true,
      },
    });
    categoryId = cat.id;

    const vendorUser = await prisma.user.create({
      data: {
        name: 'Vendor Cart',
        email: `vendor_cart_${Date.now()}@test.com`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });
    vendorUserId = vendorUser.id;

    const vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: 'Cart Vendor Store',
        slug: `cart-vendor-${Date.now()}`,
        businessAddress: 'Cart Ave',
        phone: '1234567890',
        status: 'APPROVED',
      },
    });
    vendorId = vendor.id;

    // In-stock product (stock: 10)
    inStockProduct = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: 'Noise Cancelling Wireless Headphones',
        slug: `headphones-${Date.now()}`,
        description: 'Premium active noise-cancelling over-ear headphones.',
        price: 7999,
        discountPrice: 6999,
        stock: 10,
        status: 'ACTIVE',
      },
    });

    // Out-of-stock product (stock: 0)
    outOfStockProduct = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: cat.id,
        name: 'Vintage Mechanical Keyboard',
        slug: `keyboard-${Date.now()}`,
        description: 'Retro mechanical keyboard with custom switches.',
        price: 4999,
        stock: 0,
        status: 'ACTIVE',
      },
    });
  });

  afterAll(async () => {
    if (inStockProduct) {
      await prisma.cartItem.deleteMany({ where: { productId: inStockProduct.id } });
      await prisma.product.deleteMany({ where: { id: inStockProduct.id } });
    }
    if (outOfStockProduct) {
      await prisma.cartItem.deleteMany({ where: { productId: outOfStockProduct.id } });
      await prisma.product.deleteMany({ where: { id: outOfStockProduct.id } });
    }
    if (vendorId) await prisma.vendor.deleteMany({ where: { id: vendorId } });
    if (vendorUserId) await prisma.user.deleteMany({ where: { id: vendorUserId } });
    if (customerId) {
      await prisma.cart.deleteMany({ where: { userId: customerId } });
      await prisma.user.deleteMany({ where: { id: customerId } });
    }
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
  });

  it('should allow customer to add available product to cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: inStockProduct.id,
        quantity: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const item = res.body.data.items.find((i: any) => i.productId === inStockProduct.id);
    expect(item).toBeDefined();
    expect(item.quantity).toBe(2);
    cartItemId = item.id;
  });

  it('should REJECT adding product when requested quantity exceeds stock', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: inStockProduct.id,
        quantity: 99, // Stock is 10
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Insufficient stock');
  });

  it('should REJECT adding out-of-stock product to cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: outOfStockProduct.id,
        quantity: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Insufficient stock');
  });

  it('should update item quantity in cart', async () => {
    const res = await request(app)
      .put(`/api/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const item = res.body.data.items.find((i: any) => i.id === cartItemId);
    expect(item.quantity).toBe(4);
  });

  it('should retrieve cart on GET /api/cart', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });

  it('should clear cart on DELETE /api/cart', async () => {
    const res = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(getRes.body.data.items.length).toBe(0);
    expect(getRes.body.data.subtotal).toBe(0);
  });
});
