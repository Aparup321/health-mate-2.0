import { type Request, type Response } from "express";
import { GlobalLeaderboard, LocalLeaderboard } from "../models/Leaderboard";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";
import {
  getGlobalLeaderboardRankings,
  getLeaderboardByTier,
  getUserLeaderboardPosition,
} from "../utils/gameEngine";

class LeaderboardController {
  /**
   * Get global leaderboard
   * GET /api/v1/leaderboards/global?page=1&limit=20
   */
  getGlobalLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const leaderboard = await GlobalLeaderboard.find()
      .sort({ totalPoints: -1 })
      .limit(Number(limit))
      .skip(skip)
      .exec();

    const total = await GlobalLeaderboard.countDocuments();

    sendSuccessResponse(
      res,
      200,
      {
        leaderboard,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Global leaderboard retrieved",
    );
  });

  /**
   * Get leaderboard by tier
   * GET /api/v1/leaderboards/global/tier/:tier
   */
  getLeaderboardByTier = asyncHandler(async (req: Request, res: Response) => {
    const { tier } = req.params;
    const { limit = 50 } = req.query;
    if (typeof tier !== "string") {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid tier" },
      });
    }

    const validTiers = ["bronze", "silver", "gold", "platinum"];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid tier" },
      });
    }

    const leaderboard = await getLeaderboardByTier(
      tier as "bronze" | "silver" | "gold" | "platinum",
      Number(limit),
    );

    sendSuccessResponse(
      res,
      200,
      {
        tier,
        leaderboard,
      },
      `${tier.toUpperCase()} tier leaderboard retrieved`,
    );
  });

  /**
   * Get user's global leaderboard position
   * GET /api/v1/leaderboards/global/position/:userId
   */
  getUserGlobalPosition = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid user ID" },
      });
    }

    const position = await getUserLeaderboardPosition(userId);

    sendSuccessResponse(res, 200, position, "User global position retrieved");
  });

  /**
   * Get local leaderboard (peer challenge group)
   * GET /api/v1/leaderboards/local/:groupId
   */
  getLocalLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const leaderboard = await LocalLeaderboard.find({ groupId })
      .sort({ totalPoints: -1 })
      .limit(Number(limit))
      .skip(skip)
      .exec();

    const total = await LocalLeaderboard.countDocuments({ groupId });

    sendSuccessResponse(
      res,
      200,
      {
        groupId,
        leaderboard,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Local leaderboard retrieved",
    );
  });

  /**
   * Get user's position in local leaderboard
   * GET /api/v1/leaderboards/local/user/:groupId
   */
  getUserLocalPosition = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { groupId } = req.params;

    const user = await LocalLeaderboard.findOne({ userId, groupId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found in this group" },
      });
    }

    // Count how many users have more points in this group
    const usersAbove = await LocalLeaderboard.countDocuments({
      groupId,
      totalPoints: { $gt: user.totalPoints },
    });

    sendSuccessResponse(
      res,
      200,
      {
        userId,
        groupId,
        rank: usersAbove + 1,
        totalPoints: user.totalPoints,
        sessionsCompleted: user.sessionsCompleted,
        breaksTaken: user.breaksTaken,
        exerciseCount: user.exerciseCount,
      },
      "User local position retrieved",
    );
  });
}

export default new LeaderboardController();
