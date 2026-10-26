import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export interface StoredDocumentResult {
  documentUrl: string;
  documentKey: string;
  storageType: 'cloudinary-authenticated' | 'local-private-vault';
  format: string;
}

export class DocumentStorageService {
  private static localVaultDir = path.resolve(process.cwd(), 'storage/private-documents');

  /**
   * Securely store a private document buffer (e.g. Business PAN card).
   * Assets stored here are private and never served via public static endpoints.
   */
  static async storePrivateDocument(
    buffer: Buffer,
    mimeType: string,
    originalName?: string
  ): Promise<StoredDocumentResult> {
    const isPdf = mimeType === 'application/pdf';
    const ext = isPdf ? 'pdf' : mimeType.includes('png') ? 'png' : 'jpg';
    const resourceType = isPdf ? 'raw' : 'image';
    const uniqueId = `pan_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // 1. Try Cloudinary Authenticated Storage if configured
    if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      try {
        const cloudinaryResult = await new Promise<{ publicId: string; secureUrl: string }>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'bazaarone/vendor-documents/private',
                public_id: uniqueId,
                resource_type: resourceType,
                type: 'authenticated', // Restricts access: public requests receive 401 Unauthorized
                format: ext,
              },
              (err, result) => {
                if (err || !result) {
                  return reject(err || new Error('Upload to Cloudinary failed'));
                }
                resolve({
                  publicId: result.public_id,
                  secureUrl: result.secure_url,
                });
              }
            );

            Readable.from(buffer).pipe(uploadStream);
          }
        );

        return {
          documentUrl: cloudinaryResult.secureUrl,
          documentKey: cloudinaryResult.publicId,
          storageType: 'cloudinary-authenticated',
          format: ext,
        };
      } catch (cloudErr: any) {
        // Fall back to local secure private vault if Cloudinary network is unreachable
        console.warn('Cloudinary private upload failed or offline, storing in local secure private vault:', cloudErr?.message);
      }
    }

    // 2. Local Secure Private Vault (Never exposed via static web servers)
    if (!fs.existsSync(this.localVaultDir)) {
      fs.mkdirSync(this.localVaultDir, { recursive: true });
    }

    const safeFilename = `${uniqueId}.${ext}`;
    const filePath = path.join(this.localVaultDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    return {
      documentUrl: `/api/vendors/documents/private-vault/${safeFilename}`,
      documentKey: safeFilename,
      storageType: 'local-private-vault',
      format: ext,
    };
  }

  /**
   * Generates a temporary, time-limited signed URL or access token to view
   * the private document. Only accessible to the owning vendor or authorized admins.
   *
   * @param documentKey Cloudinary publicId or local vault filename
   * @param expiresInSeconds Duration in seconds for which the signed access is valid (default 15 minutes)
   */
  static generateSecureAccessUrl(
    documentKey: string,
    expiresInSeconds = 900
  ): string {
    if (!documentKey) {
      throw AppError.notFound('Document reference not found');
    }

    // Cloudinary signed URL
    if (documentKey.startsWith('bazaarone/')) {
      const isRaw = documentKey.endsWith('.pdf') || documentKey.includes('raw');
      const resourceType = isRaw ? 'raw' : 'image';
      const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

      return cloudinary.url(documentKey, {
        sign_url: true,
        type: 'authenticated',
        resource_type: resourceType,
        expires_at: expiresAt,
        secure: true,
      });
    }

    // Local secure vault signed token
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const hmac = crypto.createHmac('sha256', env.JWT_SECRET);
    hmac.update(`${documentKey}:${expiresAt}`);
    const signature = hmac.digest('hex');

    return `/api/vendors/documents/stream?file=${encodeURIComponent(
      documentKey
    )}&expires=${expiresAt}&sig=${signature}`;
  }

  /**
   * Validates a signed access token for the local secure vault and reads the file buffer.
   */
  static readVaultDocument(
    filename: string,
    expires: string,
    sig: string
  ): { buffer: Buffer; mimeType: string } {
    const expiresNum = parseInt(expires, 10);
    if (isNaN(expiresNum) || Date.now() > expiresNum) {
      throw AppError.unauthorized('Secure document access link has expired');
    }

    const hmac = crypto.createHmac('sha256', env.JWT_SECRET);
    hmac.update(`${filename}:${expiresNum}`);
    const expectedSig = hmac.digest('hex');

    if (sig !== expectedSig) {
      throw AppError.forbidden('Invalid document access signature');
    }

    // Sanitize filename against directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.localVaultDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw AppError.notFound('Document file not found in vault');
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeType =
      ext === '.pdf'
        ? 'application/pdf'
        : ext === '.png'
        ? 'image/png'
        : 'image/jpeg';

    return { buffer, mimeType };
  }
}
