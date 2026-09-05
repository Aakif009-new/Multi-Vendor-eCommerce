import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/webhook.service';
import { sendSuccess } from '../utils/apiResponse';

export class PaymentController {
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || '';
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await WebhookService.processRazorpayWebhook(rawBody, signature, req.body);
      return sendSuccess(res, result, 'Razorpay webhook processed successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
