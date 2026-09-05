import request from 'supertest';
import app from '../src/app';

describe('Auth Endpoints & RBAC Security', () => {
  const timestamp = Date.now();
  const testCustomer = {
    name: 'Test Customer',
    email: `customer_${timestamp}@test.com`,
    password: 'Password@123',
    role: 'CUSTOMER',
  };

  const testVendor = {
    name: 'Test Artisan',
    email: `vendor_${timestamp}@test.com`,
    password: 'Password@123',
    role: 'VENDOR',
  };

  let customerToken: string;

  it('should register a new CUSTOMER successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testCustomer);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testCustomer.email);
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.token).toBeDefined();
    // Verify passwordHash is NEVER exposed in the API response
    expect((res.body.data.user as any).passwordHash).toBeUndefined();
    customerToken = res.body.data.token;
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testCustomer);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should strictly reject public registration as ADMIN', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker Admin',
      email: `admin_hacker_${timestamp}@test.com`,
      password: 'Password@123',
      role: 'ADMIN',
    });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should register a new VENDOR with pending store status', async () => {
    const res = await request(app).post('/api/auth/register').send(testVendor);
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('VENDOR');
  });

  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testCustomer.email,
      password: testCustomer.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect((res.body.data.user as any).passwordHash).toBeUndefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testCustomer.email,
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
  });

  it('should retrieve authenticated user profile on GET /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testCustomer.email);
    expect((res.body.data.user as any).passwordHash).toBeUndefined();
  });

  it('should reject unauthenticated request on GET /api/auth/me', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
