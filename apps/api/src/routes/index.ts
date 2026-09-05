import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import vendorRoutes from './vendor.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import addressRoutes from './address.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';
import uploadRoutes from './upload.routes';
import seedRoutes from './seed.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/vendors', vendorRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/addresses', addressRoutes);
router.use('/admin', adminRoutes);

// Phase 3 Transactional & External Routes
router.use('/upload', uploadRoutes);
router.use('/seed', seedRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);

export default router;
