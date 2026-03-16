import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  CreateHydrationLogSchema,
  UpdateHydrationLogSchema,
  CreateBreakLogSchema,
  UpdateBreakLogSchema,
  CreateSmokingLogSchema,
  UpdateSmokingLogSchema,
  CreateExerciseSchema,
  UpdateExerciseSchema,
} from "../models/Activity";
import activityController from "../controllers/activityController";

const router = Router();

/**
 * Activity Logging Routes
 */

// ============================================================================
// HYDRATION
// ============================================================================
router.post(
  "/hydration",
  requireAuth,
  validateRequest(CreateHydrationLogSchema),
  activityController.logHydration
);

router.get("/hydration", requireAuth, activityController.getHydrationHistory);

router.put(
  "/hydration/:id",
  requireAuth,
  validateRequest(UpdateHydrationLogSchema),
  activityController.updateHydration
);

router.delete("/hydration/:id", requireAuth, activityController.deleteHydration);

// ============================================================================
// EXERCISE
// ============================================================================
router.post(
  "/exercise",
  requireAuth,
  validateRequest(CreateExerciseSchema),
  activityController.logExercise
);

router.get("/exercise", requireAuth, activityController.getExerciseHistory);

router.put(
  "/exercise/:id",
  requireAuth,
  validateRequest(UpdateExerciseSchema),
  activityController.updateExercise
);

router.delete("/exercise/:id", requireAuth, activityController.deleteExercise);

// ============================================================================
// BREAKS
// ============================================================================
router.post(
  "/breaks",
  requireAuth,
  validateRequest(CreateBreakLogSchema),
  activityController.logBreak
);

router.get("/breaks", requireAuth, activityController.getBreakHistory);

router.delete("/breaks/:id", requireAuth, activityController.deleteBreak);

// ============================================================================
// SMOKING
// ============================================================================
router.post(
  "/smoking",
  requireAuth,
  validateRequest(CreateSmokingLogSchema),
  activityController.logSmoking
);

router.get("/smoking", requireAuth, activityController.getSmokingHistory);

router.put(
  "/smoking/:id",
  requireAuth,
  validateRequest(UpdateSmokingLogSchema),
  activityController.updateSmoking
);

router.delete("/smoking/:id", requireAuth, activityController.deleteSmoking);

export default router;
