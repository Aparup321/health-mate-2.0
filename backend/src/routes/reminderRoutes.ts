import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import reminderController from "../controllers/reminderController";

const router = Router();

/**
 * Reminder Routes
 */

// Get user's reminder settings
router.get("/schedule", requireAuth, reminderController.getReminderSettings);

// Update reminder preferences
router.put("/schedule", requireAuth, reminderController.updateReminderSettings);

// Send test reminder
router.post("/test/:type", requireAuth, reminderController.sendTestReminder);

export default router;
