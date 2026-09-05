import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import {
  reviewVendorApplicationSchema,
  updateUserStatusSchema,
  moderateProductSchema,
} from '../schemas/admin.schema';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), AdminController.updateUserStatus);
router.get('/vendor-applications', AdminController.getVendorApplications);
router.patch(
  '/vendor-applications/:id',
  validate(reviewVendorApplicationSchema),
  AdminController.reviewVendorApplication
);
router.patch(
  '/products/:id/moderate',
  validate(moderateProductSchema),
  AdminController.moderateProduct
);

export default router;
