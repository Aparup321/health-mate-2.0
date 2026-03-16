import { type Request, type Response } from "express";
import { sendSuccessResponse } from "../utils/errorHandler";
import { asyncHandler } from "../utils/errorHandler";
import {
  getUserActiveReminders,
  updateReminderPreference,
  sendTestReminder,
} from "../utils/reminderEngine";

class ReminderController {
  /**
   * Get user's reminder settings
   * GET /api/v1/reminders/schedule
   */
  getReminderSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    const activeReminders = getUserActiveReminders(userId);

    const reminderTypes = [
      "work_session",
      "hydration",
      "exercise",
      "smoking_avoidance",
    ];

    const settings = reminderTypes.map((type) => ({
      type,
      enabled: activeReminders.includes(type),
    }));

    sendSuccessResponse(
      res,
      200,
      { reminders: settings },
      "Reminder settings retrieved",
    );
  });

  /**
   * Update reminder preferences
   * PUT /api/v1/reminders/schedule
   */
  updateReminderSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { reminderType, enabled } = req.body;
    if (typeof reminderType !== "string") {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid reminder type" },
      });
    }

    const validTypes = [
      "work_session",
      "hydration",
      "exercise",
      "smoking_avoidance",
    ];

    if (!validTypes.includes(reminderType)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid reminder type" },
      });
    }

    updateReminderPreference(
      userId,
      reminderType as
        | "work_session"
        | "hydration"
        | "exercise"
        | "smoking_avoidance",
      enabled,
    );

    sendSuccessResponse(
      res,
      200,
      { reminderType, enabled },
      "Reminder preference updated",
    );
  });

  /**
   * Send test reminder
   * POST /api/v1/reminders/test/:type
   */
  sendTestReminder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { type } = req.params;
    if (typeof type !== "string") {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid reminder type" },
      });
    }

    const validTypes = [
      "work_session",
      "hydration",
      "exercise",
      "smoking_avoidance",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid reminder type" },
      });
    }

    await sendTestReminder(
      userId,
      type as "work_session" | "hydration" | "exercise" | "smoking_avoidance",
    );

    sendSuccessResponse(res, 200, { type }, `Test ${type} reminder sent`);
  });
}

export default new ReminderController();
