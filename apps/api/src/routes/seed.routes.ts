import { Router } from 'express';
import { SeedController } from '../controllers/seed.controller';

const router = Router();

// POST /api/seed/100-products
router.post('/100-products', SeedController.seed100Products);

export default router;
