import { Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class WishlistController {
  static async getWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const wishlist = await WishlistService.getOrCreateWishlist(req.user!.id);
      sendSuccess(res, wishlist, 'Wishlist retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async addToWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await WishlistService.addToWishlist(req.user!.id, req.body.productId);
      sendSuccess(res, item, 'Item added to wishlist', 200);
    } catch (error) {
      next(error);
    }
  }

  static async removeFromWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WishlistService.removeFromWishlist(req.user!.id, req.params.productId);
      sendSuccess(res, result, 'Item removed from wishlist', 200);
    } catch (error) {
      next(error);
    }
  }

  static async moveToCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WishlistService.moveToCart(req.user!.id, req.params.productId);
      sendSuccess(res, result, 'Item moved to cart', 200);
    } catch (error) {
      next(error);
    }
  }
}
