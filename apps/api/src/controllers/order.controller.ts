import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { AppError } from '../utils/appError';

export class OrderController {
  static async checkout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { addressId } = req.body;
      if (!addressId) {
        throw new AppError('Shipping addressId is required for checkout', 400);
      }

      const result = await OrderService.checkout(req.user!.id, addressId);
      return sendSuccess(res, result, 'Order created successfully for Razorpay checkout', 201);
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new AppError('Missing required Razorpay payment confirmation parameters', 400);
      }

      const confirmedOrder = await OrderService.verifyAndConfirmPayment(req.user!.id, {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      return sendSuccess(res, confirmedOrder, 'Payment verified and order confirmed successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getCustomerOrders(req.user!.id);
      return sendSuccess(res, orders, 'Customer orders retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(req.user!.id, req.params.id);
      return sendSuccess(res, order, 'Order details retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await OrderService.getCustomerDashboardStats(req.user!.id);
      return sendSuccess(res, stats, 'Customer dashboard stats retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getVendorOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.vendor) {
        throw new AppError('Approved vendor profile required', 403);
      }

      const items = await OrderService.getVendorOrderItems(req.vendor.id);
      return sendSuccess(res, items, 'Vendor order items retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateVendorOrderItemStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.vendor) {
        throw new AppError('Approved vendor profile required', 403);
      }

      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        throw new AppError('New order item status is required', 400);
      }

      const updated = await OrderService.updateVendorOrderItemStatus(req.vendor.id, id, status);
      return sendSuccess(res, updated, 'Order item status updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
