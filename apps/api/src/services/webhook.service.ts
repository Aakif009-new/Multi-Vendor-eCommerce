import { prisma } from '../config/db';
import { PaymentService } from './payment.service';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export class WebhookService {
  /**
   * Process Razorpay Webhook Event
   */
  static async processRazorpayWebhook(
    rawBody: string | Buffer,
    signature: string,
    eventPayload: any
  ) {
    // 1. Signature Verification
    const isValid = PaymentService.verifyWebhookSignature(
      rawBody,
      signature,
      env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      throw new AppError('Invalid Razorpay webhook signature', 400);
    }

    const eventId = eventPayload.event_id || eventPayload.id || `evt_${Date.now()}`;
    const eventType = eventPayload.event;

    // 2. Idempotency Check: prevent duplicate event execution
    const existingPayment = await prisma.payment.findFirst({
      where: { webhookEventId: eventId },
    });

    if (existingPayment) {
      return { processed: true, message: 'Event already processed (idempotent)' };
    }

    // 3. Handle Events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = await prisma.order.findUnique({
          where: { razorpayOrderId: rzpOrderId },
          include: { orderItems: true },
        });

        if (order && order.paymentStatus !== 'PAID') {
          // Atomically decrement stock
          for (const item of order.orderItems) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }

          // Update Order and OrderItems
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              razorpayPaymentId: rzpPaymentId,
            },
          });

          await prisma.orderItem.updateMany({
            where: { orderId: order.id },
            data: { status: 'CONFIRMED' },
          });

          // Record Payment
          await prisma.payment.create({
            data: {
              orderId: order.id,
              amount: order.totalAmount,
              status: 'PAID',
              transactionId: rzpPaymentId,
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: rzpPaymentId,
              webhookEventId: eventId,
            },
          });
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;

      if (rzpOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId: rzpOrderId },
          data: { paymentStatus: 'FAILED' },
        });
      }
    }

    return { processed: true, event: eventType };
  }
}
