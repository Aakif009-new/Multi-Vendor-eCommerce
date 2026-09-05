import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.getProducts(req.query);
      sendSuccess(res, result.products, 'Products retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getProductByIdOrSlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductByIdOrSlug(req.params.idOrSlug);
      sendSuccess(res, product, 'Product details retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.vendor!.id, req.body);
      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await ProductService.updateProduct(req.vendor!.id, req.params.id, req.body);
      sendSuccess(res, updated, 'Product updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.deleteProduct(req.vendor!.id, req.params.id);
      sendSuccess(res, result, 'Product deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await ProductService.toggleProductStatus(
        req.vendor!.id,
        req.params.id,
        req.body.status
      );
      sendSuccess(res, updated, 'Product status updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
