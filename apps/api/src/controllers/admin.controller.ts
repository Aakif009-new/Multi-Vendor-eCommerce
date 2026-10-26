import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { DocumentStorageService } from '../services/documentStorage.service';

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

  static async getApplicationPanDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const app = await prisma.vendorApplication.findUnique({
        where: { id: req.params.id },
      });
      if (!app) {
        throw AppError.notFound('Vendor application not found');
      }

      if (!app.panDocumentKey && !app.panDocumentUrl) {
        throw AppError.notFound('No Business PAN Card document was submitted with this application.');
      }

      const docKey = app.panDocumentKey || app.panDocumentUrl!;
      const accessUrl = DocumentStorageService.generateSecureAccessUrl(docKey);

      sendSuccess(
        res,
        {
          accessUrl,
          expiresInSeconds: 900,
          applicationId: app.id,
          businessName: app.businessName,
          gstin: app.gstin,
          panNumber: app.panNumber,
          notice: 'Authorized Administrator Access. Document authenticity has not been verified against government databases.',
        },
        'Secure PAN document access URL generated for administrator',
        200
      );
    } catch (error) {
      next(error);
    }
  }
}
