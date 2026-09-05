import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { addToCartSchema, updateCartItemSchema } from '../schemas/cart.schema';

const router = Router();

router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/', validate(addToCartSchema), CartController.addToCart);
router.put('/:itemId', validate(updateCartItemSchema), CartController.updateQuantity);
router.delete('/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
