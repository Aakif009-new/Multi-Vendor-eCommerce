import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public: GET /api/reviews/product/:productId
router.get('/product/:productId', ReviewController.getProductReviews);

// Authenticated (Verified Purchase): POST /api/reviews
router.post('/', authenticate, ReviewController.createReview);

export default router;
