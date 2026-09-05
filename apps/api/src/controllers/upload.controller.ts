import { Response, NextFunction } from 'express';
import { CloudinaryService } from '../services/cloudinary.service';
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
}
