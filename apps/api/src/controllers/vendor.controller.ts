import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/vendor.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

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
}
