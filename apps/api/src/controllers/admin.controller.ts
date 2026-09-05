import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class AdminController {
  static async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getStats();
      sendSuccess(res, stats, 'Admin marketplace metrics', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.getUsers(req.query);
      sendSuccess(res, result.users, 'Users list', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AdminService.updateUserStatus(req.params.id, req.body.status);
      sendSuccess(res, updated, 'User status updated', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getVendorApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const applications = await AdminService.getVendorApplications();
      sendSuccess(res, applications, 'Vendor applications list', 200);
    } catch (error) {
      next(error);
    }
  }

  static async reviewVendorApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewed = await AdminService.reviewVendorApplication(
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, reviewed, `Vendor application ${req.body.status.toLowerCase()}`, 200);
    } catch (error) {
      next(error);
    }
  }

  static async moderateProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const moderated = await AdminService.moderateProduct(req.params.id, req.body.status);
      sendSuccess(res, moderated, 'Product moderated', 200);
    } catch (error) {
      next(error);
    }
  }
}
