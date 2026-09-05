import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, requireVendor } from '../middlewares/rbac.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../schemas/product.schema';

const router = Router();

// Public discovery
router.get('/', validate(productQuerySchema), ProductController.getProducts);
router.get('/:idOrSlug', ProductController.getProductByIdOrSlug);

// Vendor-protected product CRUD
router.post(
  '/',
  authenticate,
  requireRole('VENDOR'),
  requireVendor,
  validate(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticate,
  requireRole('VENDOR'),
  requireVendor,
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  requireRole('VENDOR'),
  requireVendor,
  ProductController.deleteProduct
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('VENDOR', 'ADMIN'),
  ProductController.toggleStatus
);

export default router;
