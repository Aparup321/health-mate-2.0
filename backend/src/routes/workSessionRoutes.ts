import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  CreateWorkSessionSchema,
  UpdateWorkSessionSchema,
} from "../models/WorkSession";
import workSessionController from "../controllers/workSessionController";

const router = Router();

/**
 * Work Session Routes
 */

// Start new work session
router.post(
  "/",
  requireAuth,
  validateRequest(CreateWorkSessionSchema),
  workSessionController.startSession
);

// Get all user's work sessions
router.get("/", requireAuth, workSessionController.getUserSessions);

// Get specific session
router.get("/:id", requireAuth, workSessionController.getSession);

// Update session
router.put(
  "/:id",
  requireAuth,
  validateRequest(UpdateWorkSessionSchema),
  workSessionController.updateSession
);

// End/cancel session
router.delete("/:id", requireAuth, workSessionController.endSession);

export default router;
