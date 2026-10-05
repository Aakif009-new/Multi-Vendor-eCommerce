import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { prisma } from '../config/db';

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Extract from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // 2. Extract from HTTP-only cookie
      token = req.cookies.token;
    }

    if (!token) {
      throw AppError.unauthorized('Authentication token is missing. Please sign in.');
    }

    // 3. Verify JWT signature & expiration
    const payload = verifyToken(token);

    // 4. Verify user still exists and is not suspended with complete vendor relation in single query
    const user = await prisma.user.findUnique({
       where: { id: payload.userId },
       select: {
         id: true,
         name: true,
         email: true,
         role: true,
         status: true,
         createdAt: true,
         vendor: {
           select: {
             id: true,
             userId: true,
             businessName: true,
             slug: true,
             status: true,
             accountStatus: true,
             rating: true,
           },
         },
       },
     });

    if (!user) {
      throw AppError.unauthorized('The user belonging to this token no longer exists.');
    }

    if (user.status === 'SUSPENDED') {
      throw AppError.forbidden('Your account has been suspended. Please contact support.');
    }

    if (user.status === 'INACTIVE') {
      throw AppError.unauthorized('Your account is currently inactive.');
    }

    // Attach user and vendor to request object
    req.user = user;
    if (user.vendor) {
      req.vendor = user.vendor;
    }
    next();
  } catch (error) {
    next(error);
  }
}
