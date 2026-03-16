import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedError } from "../utils/errorHandler";
import { verifyToken, extractTokenFromHeader, type TokenPayload } from "../utils/jwtUtils";

/**
 * Extend Express Request to include user info from JWT
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      auth?: TokenPayload;
    }
  }
}

/**
 * Middleware to extract and verify JWT token
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    throw new UnauthorizedError("No authentication token provided");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  // Add to request for easy access
  req.userId = decoded.userId;
  req.userEmail = decoded.email;
  req.auth = decoded;

  next();
}

/**
 * Optional auth middleware - doesn't require auth but extracts user if available
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.auth = decoded;
    }
  }

  next();
}

/**
 * Verify user owns the resource (for user-specific endpoints)
 * @param paramName - Name of the URL parameter containing userId
 */
export function requireOwnership(paramName: string = "userId") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resourceUserId = req.params[paramName];

    if (!req.userId) {
      throw new UnauthorizedError("Authentication required");
    }

    if (req.userId !== resourceUserId) {
      throw new UnauthorizedError("You don't have permission to access this resource");
    }

    next();
  };
}
