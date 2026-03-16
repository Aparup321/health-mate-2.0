import { type Request, type Response } from "express";
import {
  HealthProfile,
  calculateBMI,
  getBMICategory,
} from "../models/HealthProfile";
import { GlobalLeaderboard, determineTier } from "../models/Leaderboard";
import { User } from "../models/User";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";
import { checkAndAwardAchievements } from "../utils/gameEngine";
import { setupUserReminders as setupReminders } from "../utils/reminderEngine";

class HealthProfileController {
  /**
   * Create health profile
   * POST /api/v1/health-profile
   */
  createProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { height, weight, gender, age, isSmoker, exerciseFamiliarity } =
      req.validatedBody || req.body;

    // Check if profile already exists
    let profile = await HealthProfile.findOne({ userId });
    if (profile) {
      return res.status(409).json({
        success: false,
        error: { message: "Health profile already exists" },
      });
    }

    // Calculate BMI
    const bmi = calculateBMI(height, weight);

    // Create health profile
    profile = new HealthProfile({
      userId,
      height,
      weight,
      gender,
      age,
      bmi,
      isSmoker,
      exerciseFamiliarity,
    });

    await profile.save();

    // Create/update global leaderboard entry
    const user = await User.findById(userId);
    let leaderboard = await GlobalLeaderboard.findOne({ userId });

    if (!leaderboard) {
      leaderboard = new GlobalLeaderboard({
        userId,
        userName: user?.name || "User",
        totalPoints: 0,
        tier: "bronze",
        rank: 0,
      });
      await leaderboard.save();
    }

    // Award achievement for creating profile
    await checkAndAwardAchievements(userId, "profile_created");

    // Setup reminders for user
    setupReminders(userId, isSmoker);

    sendSuccessResponse(
      res,
      201,
      profile,
      "Health profile created successfully",
    );
  });

  /**
   * Get health profile
   * GET /api/v1/health-profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const profile = await HealthProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: "Health profile not found" },
      });
    }

    sendSuccessResponse(res, 200, profile, "Health profile retrieved");
  });

  /**
   * Update health profile
   * PUT /api/v1/health-profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const updates = req.validatedBody || req.body;

    let profile = await HealthProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: "Health profile not found" },
      });
    }

    // Recalculate BMI if height or weight changed
    if (updates.height || updates.weight) {
      const height = updates.height || profile.height;
      const weight = updates.weight || profile.weight;
      updates.bmi = calculateBMI(height, weight);
    }

    // Update fields
    Object.assign(profile, updates);
    await profile.save();

    sendSuccessResponse(
      res,
      200,
      profile,
      "Health profile updated successfully",
    );
  });

  /**
   * Get BMI and category
   * GET /api/v1/health-profile/bmi
   */
  getBMI = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const profile = await HealthProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: "Health profile not found" },
      });
    }

    const category = getBMICategory(profile.bmi);

    sendSuccessResponse(
      res,
      200,
      {
        bmi: profile.bmi,
        category,
        height: profile.height,
        weight: profile.weight,
      },
      "BMI information retrieved",
    );
  });
}

export default new HealthProfileController();
