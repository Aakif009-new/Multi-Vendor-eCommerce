import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class ReviewController {
  static async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await ReviewService.createReview(req.user!.id, req.body);
      return sendSuccess(res, review, 'Verified product review submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const reviews = await ReviewService.getProductReviews(productId);
      return sendSuccess(res, reviews, 'Product reviews retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
