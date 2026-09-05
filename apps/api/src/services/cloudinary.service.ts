import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export class CloudinaryService {
  /**
   * Upload image buffer (from Multer memory storage) to Cloudinary
   */
  static async uploadBuffer(
    buffer: Buffer,
    folder = 'bazaarone/products',
    publicId?: string
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject(new AppError('Failed to upload image asset to Cloudinary', 502));
          }
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload image directly from a remote URL (used by Pexels seeder)
   */
  static async uploadFromUrl(
    remoteUrl: string,
    folder = 'bazaarone/catalog',
    publicId?: string
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    try {
      const result = await cloudinary.uploader.upload(remoteUrl, {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      console.error('Cloudinary upload from URL fallback:', error?.message || error);
      return {
        url: remoteUrl,
        secureUrl: remoteUrl,
        publicId: publicId || `ext_${Date.now()}`,
      };
    }
  }

  /**
   * Delete asset from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }
}
