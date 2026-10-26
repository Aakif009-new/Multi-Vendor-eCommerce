import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/vendor.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { DocumentStorageService } from '../services/documentStorage.service';
import { AppError } from '../utils/appError';

export class VendorController {
  static async getDirectory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendors = await VendorService.getApprovedVendors();
      sendSuccess(res, vendors, 'Vendor directory retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getStorefront(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.getVendorBySlugOrId(req.params.idOrSlug);
      sendSuccess(res, vendor, 'Storefront retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await VendorService.applyForVendor(req.user!.id, req.body);
      sendSuccess(res, application, 'Vendor application submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await VendorService.getVendorProfile(req.user!.id);
      sendSuccess(res, profile, 'Vendor profile retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await VendorService.updateVendorProfile(req.user!.id, req.body);
      sendSuccess(res, updated, 'Vendor profile updated', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMyProducts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await VendorService.getVendorProducts(req.vendor!.id);
      sendSuccess(res, products, 'Vendor products retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMyStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await VendorService.getVendorStats(req.vendor!.id);
      sendSuccess(res, stats, 'Vendor statistics retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMyPanDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await VendorService.getVendorProfile(req.user!.id);
      if (!vendor.panDocumentKey && !vendor.panDocumentUrl) {
        throw AppError.notFound('No Business PAN Card document is currently on file for this vendor.');
      }

      const docKey = vendor.panDocumentKey || vendor.panDocumentUrl!;
      const accessUrl = DocumentStorageService.generateSecureAccessUrl(docKey);

      sendSuccess(
        res,
        {
          accessUrl,
          expiresInSeconds: 900,
          notice: 'This document access URL is temporary and expires in 15 minutes. Authenticity has not been verified with government records.',
        },
        'Secure document access URL generated',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  static async streamPrivateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { file, expires, sig } = req.query as { file?: string; expires?: string; sig?: string };
      if (!file || !expires || !sig) {
        throw AppError.badRequest('Missing required secure access parameters');
      }

      const { buffer, mimeType } = DocumentStorageService.readVaultDocument(file, expires, sig);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'inline; filename="business-pan-document"');
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}
