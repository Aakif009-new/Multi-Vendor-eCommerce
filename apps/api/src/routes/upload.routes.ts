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

// Configure Multer for vendor PAN documents (5MB limit, PDF, JPEG, PNG)
const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid document format. Only PDF, JPEG, and PNG files are accepted.', 400));
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

// POST /api/upload/pan-document (Authenticated Vendors only - stores in private vault)
router.post(
  '/pan-document',
  authenticate,
  requireVendor,
  uploadDocument.single('panDocument'),
  UploadController.uploadPanDocument
);

export default router;
