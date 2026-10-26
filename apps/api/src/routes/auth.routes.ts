import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema';
import { AppError } from '../utils/appError';
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_FILE_SIZE } from '../utils/fileValidation';

const router = Router();

// Configure Multer for vendor document onboarding (5 MB limit, PDF/JPEG/PNG)
const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_DOCUMENT_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid document format. Only PDF, JPEG, and PNG files are accepted.', 400));
    }
  },
});

router.post(
  '/register',
  authLimiter,
  uploadDocument.single('panDocument'),
  validate(registerSchema),
  AuthController.register
);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);
router.put(
  '/profile',
  authenticate,
  (req, _res, next) => {
    if (
      req.body &&
      (req.body.role !== undefined ||
        req.body.status !== undefined ||
        req.body.isAdmin !== undefined ||
        req.body.isSuperAdmin !== undefined)
    ) {
      return next(
        AppError.forbidden(
          'Privilege escalation attempt detected: Modifying user role or administrative attributes is strictly forbidden.'
        )
      );
    }
    next();
  },
  validate(updateProfileSchema),
  AuthController.updateProfile
);
router.post('/logout', AuthController.logout);

export default router;
