import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

// POST /api/payments/webhook
router.post('/webhook', PaymentController.handleWebhook);

export default router;
