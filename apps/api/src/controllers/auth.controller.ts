import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.register(req.body);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.cookie('bazaarone_session', '1', { ...COOKIE_OPTIONS, httpOnly: false });
      sendSuccess(res, { user, token }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.login(req.body);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.cookie('bazaarone_session', '1', { ...COOKIE_OPTIONS, httpOnly: false });
      sendSuccess(res, { user, token }, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user is already loaded by authenticate middleware with full user and vendor profile.
      // Reusing it eliminates a duplicate MongoDB Atlas network query.
      sendSuccess(res, { user: req.user }, 'Profile retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await AuthService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, { user: updatedUser }, 'Profile updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      res.clearCookie('bazaarone_session', {
        httpOnly: false,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
