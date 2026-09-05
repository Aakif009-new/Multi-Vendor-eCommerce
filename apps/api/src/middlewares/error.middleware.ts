import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // If headers already sent, delegate to default express handler
  if (res.headersSent) {
    return;
  }

  // Known operational AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid authorization token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Authorization token has expired. Please sign in again', 401);
    return;
  }

  // Prisma Unique Constraint Error (P2002)
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'Record';
    sendError(res, `${target} already exists`, 409);
    return;
  }

  // SyntaxError from body-parser
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 'Malformed JSON payload in request body', 400);
    return;
  }

  // Unhandled / Internal Server Errors
  console.error('💥 [Unhandled Error]:', err);

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal Server Error';

  sendError(res, message, 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found on this server`, 404);
}
