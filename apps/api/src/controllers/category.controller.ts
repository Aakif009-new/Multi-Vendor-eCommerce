import { Request, Response, NextFunction } from 'express';
import { CategoryService, BrandService } from '../services/category.service';
import { sendSuccess } from '../utils/apiResponse';

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getCategories(req.query.includeInactive === 'true');
      sendSuccess(res, categories, 'Categories retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await CategoryService.updateCategory(req.params.id, req.body);
      sendSuccess(res, updated, 'Category updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deactivated = await CategoryService.deactivateCategory(req.params.id);
      sendSuccess(res, deactivated, 'Category deactivated safely', 200);
    } catch (error) {
      next(error);
    }
  }
}

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
