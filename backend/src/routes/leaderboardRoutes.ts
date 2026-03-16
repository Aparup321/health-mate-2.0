import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import leaderboardController from "../controllers/leaderboardController";

const router = Router();

/**
 * Leaderboard Routes
 */

// ============================================================================
// GLOBAL LEADERBOARD
// ============================================================================
router.get("/global", leaderboardController.getGlobalLeaderboard);

router.get("/global/tier/:tier", leaderboardController.getLeaderboardByTier);

router.get(
  "/global/position/:userId",
  requireAuth,
  leaderboardController.getUserGlobalPosition
);

// ============================================================================
// LOCAL LEADERBOARD (PEER CHALLENGES)
// ============================================================================
router.get(
  "/local/:groupId",
  requireAuth,
  leaderboardController.getLocalLeaderboard
);

router.get(
  "/local/user/:groupId",
  requireAuth,
  leaderboardController.getUserLocalPosition
);

export default router;
