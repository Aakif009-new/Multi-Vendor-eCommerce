import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import {
  createBrandSchema,
  updateBrandSchema,
} from '../schemas/brand.schema';

const router = Router();

router.get('/', BrandController.getBrands);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createBrandSchema),
  BrandController.createBrand
);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateBrandSchema),
  BrandController.updateBrand
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  BrandController.deactivateBrand
);

export default router;
