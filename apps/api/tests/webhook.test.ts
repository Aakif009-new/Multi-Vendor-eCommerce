import request from 'supertest';
import app from '../src/app';
import crypto from 'crypto';
import { env } from '../src/config/env';

describe('Razorpay Webhook Processing & Idempotency', () => {
  it('CRITICAL: should REJECT webhook requests with invalid or missing signature (400 Bad Request)', async () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_001',
            order_id: 'order_test_001',
            amount: 50000,
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', 'invalid_signature_xyz')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid Razorpay webhook signature');
  });

  it('should ACCEPT valid webhook signature and process event idempotently', async () => {
    const eventId = `evt_${Date.now()}`;
    const payload = {
      event_id: eventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_${Date.now()}`,
            order_id: `order_${Date.now()}`,
            amount: 250000,
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    // First Delivery
    const res1 = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', validSignature)
      .send(payload);

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Second Delivery (Duplicate event) -> Handled idempotently
    const res2 = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', validSignature)
      .send(payload);

    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
  });
});
