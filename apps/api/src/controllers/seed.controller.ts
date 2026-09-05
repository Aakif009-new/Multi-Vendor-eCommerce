import { Request, Response, NextFunction } from 'express';
import { SeedService } from '../services/seed.service';
import { sendSuccess } from '../utils/apiResponse';

export class SeedController {
  static async seed100Products(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SeedService.seed100Products();
      return sendSuccess(res, result, '100 Products Catalog Seeded Successfully across 12 Categories', 200);
    } catch (error) {
      next(error);
    }
  }
}
