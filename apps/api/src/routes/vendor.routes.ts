import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, requireVendor } from '../middlewares/rbac.middleware';
import {
  vendorApplicationSchema,
  updateVendorProfileSchema,
} from '../schemas/vendor.schema';

const router = Router();

// Public
router.get('/', VendorController.getDirectory);
router.get('/store/:idOrSlug', VendorController.getStorefront);

// Merchant Application
router.post('/apply', authenticate, validate(vendorApplicationSchema), VendorController.apply);

// Authenticated Vendor Portal APIs
router.get('/me', authenticate, requireRole('VENDOR'), VendorController.getMyProfile);
router.put(
  '/me',
  authenticate,
  requireRole('VENDOR'),
  validate(updateVendorProfileSchema),
  VendorController.updateMyProfile
);
router.get('/me/products', authenticate, requireRole('VENDOR'), requireVendor, VendorController.getMyProducts);
router.get('/me/stats', authenticate, requireRole('VENDOR'), requireVendor, VendorController.getMyStats);

export default router;
