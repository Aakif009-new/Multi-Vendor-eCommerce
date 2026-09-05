import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../schemas/category.schema';

const router = Router();

router.get('/', CategoryController.getCategories);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createCategorySchema),
  CategoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  CategoryController.deactivateCategory
);

export default router;
