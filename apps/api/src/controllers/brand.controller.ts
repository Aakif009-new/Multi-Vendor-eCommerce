import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/category.service';
import { sendSuccess } from '../utils/apiResponse';

export class BrandController {
  static async getBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await BrandService.getBrands(req.query.includeInactive === 'true');
      sendSuccess(res, brands, 'Brands retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async createBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await BrandService.createBrand(req.body);
      sendSuccess(res, brand, 'Brand created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await BrandService.updateBrand(req.params.id, req.body);
      sendSuccess(res, updated, 'Brand updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deactivated = await BrandService.deactivateBrand(req.params.id);
      sendSuccess(res, deactivated, 'Brand deactivated safely', 200);
    } catch (error) {
      next(error);
    }
  }
}
