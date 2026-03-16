import { type Request, type Response } from "express";
import { WorkSession, calculateProductivityScore } from "../models/WorkSession";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";
import {
  awardPoints,
  checkAndAwardAchievements,
  updateStreak,
} from "../utils/gameEngine";
import { POINTS_CONFIG } from "../config/constants";
import { scheduleWorkSessionReminders } from "../utils/reminderEngine";

class WorkSessionController {
  /**
    * Start new work session
    * POST /api/v1/work-sessions
    */
  startSession = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { duration, workDuration, breaksScheduled, notes } =
        req.validatedBody || req.body;

      const session = new WorkSession({
        userId,
        duration,
        workDuration: workDuration || duration, // Default to duration if not provided
        breaksScheduled,
        notes,
        isActive: true,
      });

      await session.save();

      // Schedule reminders for this session
      scheduleWorkSessionReminders(userId, session._id.toString());

      sendSuccessResponse(res, 201, session, "Work session started");
    }
  );

  /**
   * Get all user's work sessions
   * GET /api/v1/work-sessions
   */
  getUserSessions = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { limit = 20, page = 1 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const sessions = await WorkSession.find({ userId })
        .sort({ sessionDate: -1 })
        .limit(Number(limit))
        .skip(skip)
        .exec();

      const total = await WorkSession.countDocuments({ userId });

      sendSuccessResponse(
        res,
        200,
        {
          sessions,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
        "Work sessions retrieved"
      );
    }
  );

  /**
   * Get specific session
   * GET /api/v1/work-sessions/:id
   */
  getSession = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      const session = await WorkSession.findOne({ _id: id, userId });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: { message: "Work session not found" },
        });
      }

      sendSuccessResponse(res, 200, session, "Work session retrieved");
    }
  );

  /**
   * Update session
   * PUT /api/v1/work-sessions/:id
   */
  updateSession = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.validatedBody || req.body;

      let session = await WorkSession.findOne({ _id: id, userId });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: { message: "Work session not found" },
        });
      }

      Object.assign(session, updates);
      await session.save();

      sendSuccessResponse(res, 200, session, "Work session updated");
    }
  );

  /**
   * End/cancel session
   * DELETE /api/v1/work-sessions/:id
   */
  endSession = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.userId!;
      const { id } = req.params;

      let session = await WorkSession.findOne({ _id: id, userId });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: { message: "Work session not found" },
        });
      }

      // Mark as inactive
      session.isActive = false;
      await session.save();

      // Award points for session completion
      await awardPoints(userId, POINTS_CONFIG.WORK_SESSION, "work_session");

      // Check if all scheduled breaks were taken
      if (
        session.breaksScheduled > 0 &&
        session.breaksTaken === session.breaksScheduled
      ) {
        await awardPoints(userId, POINTS_CONFIG.ALL_BREAKS_BONUS, "all_breaks_bonus");

        // Check perfect session achievement
        await checkAndAwardAchievements(userId, "perfect_session");
      }

      // Update streak
      await updateStreak(userId, "work_sessions");

      // Check session count achievements
      const sessionCount = await WorkSession.countDocuments({
        userId,
        isActive: false,
      });
      await checkAndAwardAchievements(userId, "session_count", sessionCount);

      sendSuccessResponse(res, 200, session, "Work session ended successfully");
    }
  );
}

export default new WorkSessionController();
