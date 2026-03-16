import { type Request, type Response } from "express";
import { User, SignupSchema, LoginSchema } from "../models/User";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";
import { generateTokens, verifyToken } from "../utils/jwtUtils";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errorHandler";

class AuthController {
  /**
   * User signup
   * POST /api/v1/auth/signup
   */
  signup = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Validate input
    const validation = SignupSchema.safeParse({ name, email, password });
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", "),
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: validation.data.email });
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Create new user
    const user = new User({
      name: validation.data.name,
      email: validation.data.email,
      password: validation.data.password,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email,
    );

    sendSuccessResponse(
      res,
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
        refreshToken,
      },
      "User registered successfully",
    );
  });

  /**
   * User login
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", "),
      );
    }

    // Find user and select password field (normally hidden)
    const user = await User.findOne({ email: validation.data.email }).select(
      "+password",
    );
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(
      validation.data.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email,
    );

    sendSuccessResponse(
      res,
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
        refreshToken,
      },
      "Login successful",
    );
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Get user from DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString(), user.email);

    sendSuccessResponse(
      res,
      200,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      "Token refreshed successfully",
    );
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    sendSuccessResponse(
      res,
      200,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      "User profile retrieved",
    );
  });

  /**
   * Update user profile
   * PUT /api/v1/auth/me
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { name, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    sendSuccessResponse(
      res,
      200,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      "User profile updated",
    );
  });
}

export default new AuthController();
