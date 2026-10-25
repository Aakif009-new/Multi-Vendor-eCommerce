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
    businessName: 'Artisan Crafts Co',
    businessAddress: '45 Handmade Lane, Bengaluru',
    phone: '9876543210',
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

  it('should reject registration with a weak password shorter than 8 characters (422)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Pass User',
      email: `weak_${timestamp}@test.com`,
      password: 'Pass1', // only 5 chars
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body.errors)).toContain('at least 8 characters');
  });

  it('should reject registration with a whitespace-only name (422)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '   ',
      email: `whitespace_${timestamp}@test.com`,
      password: 'Password@123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with control characters in name (422)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sarah\x00Jenkins',
      email: `controlchar_${timestamp}@test.com`,
      password: 'Password@123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with an oversized name exceeding 70 characters (422)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A'.repeat(75),
      email: `oversized_${timestamp}@test.com`,
      password: 'Password@123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with an oversized password exceeding 128 characters (422)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Oversized Password User',
      email: `hugepwd_${timestamp}@test.com`,
      password: 'P'.repeat(130),
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with an invalid email format (422)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Invalid Email User',
      email: 'not-an-email',
      password: 'Password@123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should register a new VENDOR with pending store status and business profile', async () => {
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

  it('should reject login with wrong password (401 generic message)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testCustomer.email,
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should reject login with non-existent email using the same generic 401 message (no enumeration)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: `nonexistent_${Date.now()}@bazaarone.com`,
      password: 'SomePassword@123',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should reject login with invalid email format (422)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'invalid-email-format',
      password: 'Password@123',
    });
    expect(res.status).toBe(422);
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

  it('should reject request with malformed JWT on GET /api/auth/me (401)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer malformed.jwt.token.string');
    expect(res.status).toBe(401);
  });
});
