import { type Request, type Response } from "express";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";
import {
  getUserAchievements,
  getAvailableAchievements,
  getUserTotalPoints,
  getUserStreaks,
  updateStreak as updateStreakEngine,
} from "../utils/gameEngine";

class GamificationController {
  /**
   * Get user's unlocked achievements
   * GET /api/v1/gamification/achievements
   */
  getUserAchievements = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const achievements = await getUserAchievements(userId);

    sendSuccessResponse(
      res,
      200,
      {
        count: achievements.length,
        achievements,
      },
      "Achievements retrieved",
    );
  });

  /**
   * Get available achievements (not yet unlocked)
   * GET /api/v1/gamification/achievements/available
   */
  getAvailableAchievements = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;

      const available = await getAvailableAchievements(userId);

      sendSuccessResponse(
        res,
        200,
        {
          count: available.length,
          achievements: available,
        },
        "Available achievements retrieved",
      );
    },
  );

  /**
   * Get user's total points
   * GET /api/v1/gamification/points
   */
  getUserPoints = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const points = await getUserTotalPoints(userId);

    sendSuccessResponse(res, 200, { totalPoints: points }, "Points retrieved");
  });

  /**
   * Get user's streaks
   * GET /api/v1/gamification/streaks
   */
  getUserStreaks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const streaks = await getUserStreaks(userId);

    sendSuccessResponse(
      res,
      200,
      {
        count: streaks.length,
        streaks,
      },
      "Streaks retrieved",
    );
  });

  /**
   * Update streak
   * PUT /api/v1/gamification/streaks/:type
   */
  updateStreak = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { type } = req.params;
    if (typeof type !== "string") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid streak type",
        },
      });
    }

    const validTypes = ["work_sessions", "hydration", "exercise", "smoke_free"];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid streak type",
        },
      });
    }

    const streak = await updateStreakEngine(
      userId,
      type as "work_sessions" | "hydration" | "exercise" | "smoke_free",
    );

    sendSuccessResponse(res, 200, streak, "Streak updated");
  });
}

export default new GamificationController();
