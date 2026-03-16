import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import {
  APIError,
  ValidationError,
  sendErrorResponse,
} from "../utils/errorHandler";

/**
 * Global error handling middleware
 */
export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error("Error:", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.issues.forEach((err) => {
      const path = err.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });

    sendErrorResponse(res, 400, "Validation failed", errors);
    return;
  }

  // Handle custom API errors
  if (error instanceof APIError) {
    sendErrorResponse(res, error.statusCode, error.message);
    return;
  }

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    const errors: Record<string, string[]> = {};
    Object.entries(error).forEach(([key, value]: [string, any]) => {
      if (value?.message) {
        errors[key] = [value.message];
      }
    });

    sendErrorResponse(res, 400, "Validation error", errors);
    return;
  }

  // Handle Mongoose duplicate key errors
  if (error.name === "MongoServerError" && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    const message = `${field} already exists`;

    sendErrorResponse(res, 409, message);
    return;
  }

  // Handle other Mongoose errors
  if (error.name === "CastError") {
    sendErrorResponse(res, 400, "Invalid ID format");
    return;
  }

  // Default error response
  sendErrorResponse(
    res,
    500,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message,
  );
}

/**
 * 404 Not Found middleware
 */
export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  sendErrorResponse(res, 404, `Route ${req.originalUrl} not found`);
}
