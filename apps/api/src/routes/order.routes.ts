import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireVendor } from '../middlewares/rbac.middleware';
import { paymentLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Customer Specific Endpoints
router.post('/checkout', authenticate, OrderController.checkout);
router.post('/verify-payment', authenticate, paymentLimiter, OrderController.verifyPayment);
router.get('/me', authenticate, OrderController.getMyOrders);
router.get('/dashboard-stats', authenticate, OrderController.getCustomerDashboardStats);

// Vendor-Scoped Endpoints
router.get('/vendor', authenticate, requireVendor, OrderController.getVendorOrders);
router.patch('/vendor/items/:id/status', authenticate, requireVendor, OrderController.updateVendorOrderItemStatus);

// Parameterized Order ID Endpoint (Must follow all static routes)
router.get('/:id', authenticate, OrderController.getOrderById);

export default router;
