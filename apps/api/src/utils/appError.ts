export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any;

  constructor(message: string, statusCode = 500, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors?: any) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden: You do not have permission to perform this action') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409);
  }

  static unprocessableEntity(message = 'Validation failed', errors?: any) {
    return new AppError(message, 422, errors);
  }

  static internal(message = 'Internal Server Error') {
    return new AppError(message, 500);
  }
}
