import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('should return system health metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('BazaarOne Multi-Vendor Marketplace API');
    expect(res.body.data.status).toBeDefined();
  });
});
