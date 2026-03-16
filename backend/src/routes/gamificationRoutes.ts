import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import gamificationController from "../controllers/gamificationController";

const router = Router();

/**
 * Gamification Routes (Achievements, Points, Streaks)
 */

// ============================================================================
// ACHIEVEMENTS
// ============================================================================
router.get(
  "/achievements",
  requireAuth,
  gamificationController.getUserAchievements
);

router.get(
  "/achievements/available",
  requireAuth,
  gamificationController.getAvailableAchievements
);

// ============================================================================
// POINTS
// ============================================================================
router.get("/points", requireAuth, gamificationController.getUserPoints);

// ============================================================================
// STREAKS
// ============================================================================
router.get("/streaks", requireAuth, gamificationController.getUserStreaks);

router.put(
  "/streaks/:type",
  requireAuth,
  gamificationController.updateStreak
);

export default router;
