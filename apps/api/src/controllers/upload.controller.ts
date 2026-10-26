import { Response, NextFunction } from 'express';
import { CloudinaryService } from '../services/cloudinary.service';
import { DocumentStorageService } from '../services/documentStorage.service';
import { validateFileMagicBytes } from '../utils/fileValidation';
import { prisma } from '../config/db';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { AuthRequest } from '../types';

export class UploadController {
  static async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Please provide an image file to upload', 400);
      }

      const folder = req.vendor
        ? `bazaarone/vendors/${req.vendor.slug}`
        : 'bazaarone/products';

      const result = await CloudinaryService.uploadBuffer(req.file.buffer, folder);

      return sendSuccess(
        res,
        {
          url: result.secureUrl || result.url,
          publicId: result.publicId,
        },
        'Image uploaded successfully to Cloudinary',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async uploadPanDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Please provide a Business PAN Card document to upload', 400);
      }

      // Validate binary magic bytes and file integrity
      const magicCheck = validateFileMagicBytes(req.file.buffer, req.file.mimetype);
      if (!magicCheck.isValid) {
        throw AppError.badRequest(magicCheck.error || 'Invalid document file signature.');
      }

      const storedDoc = await DocumentStorageService.storePrivateDocument(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      // If user is an existing vendor, update their record
      if (req.user?.id) {
        await prisma.vendor.updateMany({
          where: { userId: req.user.id },
          data: {
            panDocumentUrl: storedDoc.documentUrl,
            panDocumentKey: storedDoc.documentKey,
          },
        });

        await prisma.vendorApplication.updateMany({
          where: { userId: req.user.id, status: 'PENDING' },
          data: {
            panDocumentUrl: storedDoc.documentUrl,
            panDocumentKey: storedDoc.documentKey,
          },
        });
      }

      return sendSuccess(
        res,
        {
          documentUrl: storedDoc.documentUrl,
          documentKey: storedDoc.documentKey,
          storageType: storedDoc.storageType,
          notice: 'Business PAN document uploaded securely. Document authenticity has not been independently verified against government records.',
        },
        'Business PAN document uploaded securely',
        201
      );
    } catch (error) {
      next(error);
    }
  }
}
