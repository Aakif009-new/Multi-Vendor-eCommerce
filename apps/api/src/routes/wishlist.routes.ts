import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { addToWishlistSchema } from '../schemas/wishlist.schema';

const router = Router();

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/', validate(addToWishlistSchema), WishlistController.addToWishlist);
router.delete('/:productId', WishlistController.removeFromWishlist);
router.post('/:productId/move-to-cart', WishlistController.moveToCart);

export default router;
