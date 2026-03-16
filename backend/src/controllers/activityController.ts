import { type Request, type Response } from "express";
import {
  HydrationLog,
  BreakLog,
  SmokingLog,
  Exercise,
} from "../models/Activity";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";
import {
  awardPoints,
  checkAndAwardAchievements,
  updateStreak,
  calculateExercisePoints,
} from "../utils/gameEngine";
import { POINTS_CONFIG, HEALTH_GOALS } from "../config/constants";

class ActivityController {
  // ========================================================================
  // HYDRATION
  // ========================================================================

  logHydration = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { date, amount, time, notes } = req.validatedBody || req.body;

      const log = new HydrationLog({
        userId,
        date: date || new Date(),
        amount,
        time: time || new Date(),
        notes,
      });

      await log.save();

      // Award points
      await awardPoints(userId, POINTS_CONFIG.HYDRATION_LOG, "hydration_log");

      // Check daily goal
      const dailyTotal = await HydrationLog.aggregate([
        {
          $match: {
            userId,
            date: {
              $gte: new Date(new Date(date || new Date()).setHours(0, 0, 0, 0)),
              $lt: new Date(new Date(date || new Date()).setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: { _id: null, total: { $sum: "$amount" } },
        },
      ]);

      if (
        dailyTotal.length > 0 &&
        dailyTotal[0].total >= HEALTH_GOALS.DAILY_WATER_INTAKE_ML
      ) {
        await awardPoints(
          userId,
          POINTS_CONFIG.DAILY_HYDRATION_GOAL_BONUS,
          "daily_hydration_goal"
        );

        // Update hydration streak
        await updateStreak(userId, "hydration");
      }

      sendSuccessResponse(res, 201, log, "Hydration logged successfully");
    }
  );

  getHydrationHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { limit = 20, page = 1 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const logs = await HydrationLog.find({ userId })
        .sort({ time: -1 })
        .limit(Number(limit))
        .skip(skip)
        .exec();

      const total = await HydrationLog.countDocuments({ userId });

      sendSuccessResponse(res, 200, { logs, total, page, limit }, "Hydration history retrieved");
    }
  );

  updateHydration = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.validatedBody || req.body;

      const log = await HydrationLog.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
      );

      if (!log) {
        return res.status(404).json({
          success: false,
          error: { message: "Hydration log not found" },
        });
      }

      sendSuccessResponse(res, 200, log, "Hydration log updated");
    }
  );

  deleteHydration = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const log = await HydrationLog.findOneAndDelete({ _id: id, userId });

      if (!log) {
        return res.status(404).json({
          success: false,
          error: { message: "Hydration log not found" },
        });
      }

      sendSuccessResponse(res, 200, {}, "Hydration log deleted");
    }
  );

  // ========================================================================
  // EXERCISE
  // ========================================================================

  logExercise = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { date, exerciseType, duration, intensity, caloriesBurned, notes } =
        req.validatedBody || req.body;

      const exercise = new Exercise({
        userId,
        date: date || new Date(),
        exerciseType,
        duration,
        intensity,
        caloriesBurned,
        notes,
      });

      await exercise.save();

      // Award points based on intensity
      const points = calculateExercisePoints(intensity);
      await awardPoints(userId, points, "exercise");

      // Update exercise streak
      await updateStreak(userId, "exercise");

      // Check exercise count achievements
      const exerciseCount = await Exercise.countDocuments({ userId });
      await checkAndAwardAchievements(userId, "exercise_count", exerciseCount);

      sendSuccessResponse(res, 201, exercise, "Exercise logged successfully");
    }
  );

  getExerciseHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { limit = 20, page = 1 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const logs = await Exercise.find({ userId })
        .sort({ date: -1 })
        .limit(Number(limit))
        .skip(skip)
        .exec();

      const total = await Exercise.countDocuments({ userId });

      sendSuccessResponse(res, 200, { logs, total, page, limit }, "Exercise history retrieved");
    }
  );

  updateExercise = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.validatedBody || req.body;

      const log = await Exercise.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
      );

      if (!log) {
        return res.status(404).json({
          success: false,
          error: { message: "Exercise log not found" },
        });
      }

      sendSuccessResponse(res, 200, log, "Exercise log updated");
    }
  );

  deleteExercise = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const log = await Exercise.findOneAndDelete({ _id: id, userId });

      if (!log) {
        return res.status(404).json({
          success: false,
          error: { message: "Exercise log not found" },
        });
      }

      sendSuccessResponse(res, 200, {}, "Exercise log deleted");
    }
  );

  // ========================================================================
  // BREAKS
  // ========================================================================

  logBreak = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { sessionId, breakType, duration, date, notes } =
        req.validatedBody || req.body;

      const log = new BreakLog({
        userId,
        sessionId: sessionId || undefined,
        breakType,
        duration,
        date: date || new Date(),
        notes,
      });

      await log.save();

      // Award points for break
      await awardPoints(userId, POINTS_CONFIG.BREAK_TAKEN, "break_taken");

      // Check break count achievements
      const breakCount = await BreakLog.countDocuments({ userId });
      await checkAndAwardAchievements(userId, "break_count", breakCount);

      sendSuccessResponse(res, 201, log, "Break logged successfully");
    }
  );

  getBreakHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { limit = 20, page = 1 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const logs = await BreakLog.find({ userId })
        .sort({ date: -1 })
        .limit(Number(limit))
        .skip(skip)
        .exec();

      const total = await BreakLog.countDocuments({ userId });

      sendSuccessResponse(res, 200, { logs, total, page, limit }, "Break history retrieved");
    }
  );

  deleteBreak = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const log = await BreakLog.findOneAndDelete({ _id: id, userId });

      if (!log) {
        return res.status(404).json({
          success: false,
          error: { message: "Break log not found" },
        });
      }

      sendSuccessResponse(res, 200, {}, "Break log deleted");
    }
  );

  // ========================================================================
  // SMOKING
  // ========================================================================

  logSmoking = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { date, cigarettesSmoked, time, cravingLevel, notes } =
        req.validatedBody || req.body;

      const log = new SmokingLog({
        userId,
        date,
        cigarettesSmoked,
        time,
        cravingLevel,
        notes,
      });

      await log.save();

      // If no smoking, award points
      if (cigarettesSmoked === 0) {
        await awardPoints(userId, POINTS_CONFIG.NO_SMOKING_DAILY, "no_smoking_daily");

        // Update smoke-free streak
        await updateStreak(userId, "smoke_free");

        // Check smoke-free achievements
        const smokeFreeData = await SmokingLog.find({
          userId,
          cigarettesSmoked: 0,
        }).sort({ date: -1 });

        // Simple streak count (in production, use more sophisticated logic)
        const streakLength = smokeFreeData.length;
        await checkAndAwardAchievements(userId, "smoke_free_streak", streakLength);
      }

      sendSuccessResponse(res, 201, log, "Smoking logged successfully");
    }
  );

  getSmokingHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { limit = 20, page = 1 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const logs = await SmokingLog.find({ userId })
        .sort({ time: -1 })
        .limit(Number(limit))
        .skip(skip)
        .exec();

      const total = await SmokingLog.countDocuments({ userId });

      sendSuccessResponse(res, 200, { logs, total, page, limit }, "Smoking history retrieved");
    }
  );

  updateSmoking = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.validatedBody || req.body;

      const log = await SmokingLog.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
      );

      if (!log) {
        return res.status(404).json({
          success: false,
          error: { message: "Smoking log not found" },
        });
      }

      sendSuccessResponse(res, 200, log, "Smoking log updated");
    }
  );

  deleteSmoking = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const log = await SmokingLog.findOneAndDelete({ _id: id, userId });

      if (!log) {
        return res.status(404).json({
          success: false,
          error: { message: "Smoking log not found" },
        });
      }

      sendSuccessResponse(res, 200, {}, "Smoking log deleted");
    }
  );
}

export default new ActivityController();
