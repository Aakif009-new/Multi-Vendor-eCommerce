import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

describe('Address Management & User Ownership', () => {
  let user1Token: string;
  let user2Token: string;
  let address1Id: string;

  beforeAll(async () => {
    const pwdHash = await hashPassword('User@123');

    const u1 = await prisma.user.create({
      data: {
        name: 'Address User 1',
        email: `addr_user1_${Date.now()}@test.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    user1Token = signToken({ userId: u1.id, email: u1.email, role: 'CUSTOMER' });

    const u2 = await prisma.user.create({
      data: {
        name: 'Address User 2',
        email: `addr_user2_${Date.now()}@test.com`,
        passwordHash: pwdHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    user2Token = signToken({ userId: u2.id, email: u2.email, role: 'CUSTOMER' });
  });

  it('should create a new shipping address for User 1', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Home',
        street: '123 Palm Grove Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        phone: '9876543210',
        isDefault: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Home');
    expect(res.body.data.isDefault).toBe(true);
    address1Id = res.body.data.id;
  });

  it('should list addresses for User 1 on GET /api/addresses', async () => {
    const res = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(address1Id);
  });

  it('CRITICAL: should FORBID User 2 from updating User 1 address (Ownership Check)', async () => {
    const res = await request(app)
      .put(`/api/addresses/${address1Id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        street: 'Malicious Address Injection',
      });

    expect(res.status).toBe(403);
  });

  it('CRITICAL: should FORBID User 2 from deleting User 1 address', async () => {
    const res = await request(app)
      .delete(`/api/addresses/${address1Id}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(403);
  });

  it('should allow User 1 to update their address', async () => {
    const res = await request(app)
      .put(`/api/addresses/${address1Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        street: '123 Palm Grove Lane, Apartment 4B',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.street).toBe('123 Palm Grove Lane, Apartment 4B');
  });
});
