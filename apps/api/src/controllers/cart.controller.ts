import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class CartController {
  static async getCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.getOrCreateCart(req.user!.id);
      sendSuccess(res, cart, 'Cart retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async addToCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.addToCart(req.user!.id, req.body.productId, req.body.quantity);
      sendSuccess(res, cart, 'Item added to cart', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.updateQuantity(req.user!.id, req.params.itemId, req.body.quantity);
      sendSuccess(res, cart, 'Cart updated', 200);
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.removeItem(req.user!.id, req.params.itemId);
      sendSuccess(res, cart, 'Item removed from cart', 200);
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CartService.clearCart(req.user!.id);
      sendSuccess(res, result, 'Cart cleared', 200);
    } catch (error) {
      next(error);
    }
  }
}
