import jwt, {
  type JwtPayload,
  type SignOptions,
  type Secret,
} from "jsonwebtoken";

const JWT_SECRET: Secret =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRE: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRE as SignOptions["expiresIn"]) || "7d";
const REFRESH_TOKEN_EXPIRE: SignOptions["expiresIn"] =
  (process.env.REFRESH_TOKEN_EXPIRE as SignOptions["expiresIn"]) || "30d";

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE,
  });
}

/**
 * Generate both tokens
 */
export function generateTokens(
  userId: string,
  email: string,
): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId),
  };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
  authHeader: string | undefined,
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
