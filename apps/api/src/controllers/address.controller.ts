import { Response, NextFunction } from 'express';
import { AddressService } from '../services/address.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class AddressController {
  static async getAddresses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const addresses = await AddressService.getAddresses(req.user!.id);
      sendSuccess(res, addresses, 'Addresses retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async createAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await AddressService.createAddress(req.user!.id, req.body);
      sendSuccess(res, address, 'Address added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AddressService.updateAddress(req.user!.id, req.params.id, req.body);
      sendSuccess(res, updated, 'Address updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AddressService.deleteAddress(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Address deleted', 200);
    } catch (error) {
      next(error);
    }
  }

  static async setDefault(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AddressService.setDefaultAddress(req.user!.id, req.params.id);
      sendSuccess(res, updated, 'Default address set', 200);
    } catch (error) {
      next(error);
    }
  }
}
