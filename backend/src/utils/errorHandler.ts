import { type Response, type Request, type NextFunction } from "express";

/**
 * Custom API Error class
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends APIError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends APIError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Unauthorized error class
 */
export class UnauthorizedError extends APIError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden error class
 */
export class ForbiddenError extends APIError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends APIError {
  constructor(message: string = "Conflict") {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Send error response
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>,
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(errors && { errors }),
    },
  });
}

/**
 * Send success response
 */
export function sendSuccessResponse(
  res: Response,
  statusCode: number,
  data?: unknown,
  message: string = "Success",
): void {
  const payload: {
    success: boolean;
    message: string;
    data?: unknown;
  } = {
    success: true,
    message,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  res.status(statusCode).json(payload);
}

/**
 * Handle async route errors - wraps async route handlers
 * @param fn - Async route handler function
 * @returns Express middleware that catches errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}
