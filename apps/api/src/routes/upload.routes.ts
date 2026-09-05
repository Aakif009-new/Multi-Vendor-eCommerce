import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireVendor } from '../middlewares/rbac.middleware';
import { AppError } from '../utils/appError';

const router = Router();

// Configure Multer Memory Storage with 5MB limit and MIME type validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400));
    }
  },
});

// POST /api/upload/image (Approved Vendors only)
router.post(
  '/image',
  authenticate,
  requireVendor,
  upload.single('image'),
  UploadController.uploadImage
);

export default router;
