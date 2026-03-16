import { type Request, type Response, type NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ValidationError } from "../utils/errorHandler";

/**
 * Extend Express Request to include validated data
 */
declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

/**
 * Middleware to validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const path = err.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        throw new ValidationError("Validation failed", errors);
      }
      throw new ValidationError("Invalid request body");
    }
  };
}

/**
 * Middleware to validate request query parameters
 * @param schema - Zod schema to validate against
 * @returns Express middleware
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.validatedQuery = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const path = err.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        throw new ValidationError("Invalid query parameters", errors);
      }
      throw new ValidationError("Invalid query parameters");
    }
  };
}

/**
 * Middleware to validate request params
 * @param schema - Zod schema to validate against
 * @returns Express middleware
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.validatedParams = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const path = err.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        throw new ValidationError("Invalid parameters", errors);
      }
      throw new ValidationError("Invalid parameters");
    }
  };
}
