import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  CreatePeerChallengeSchema,
  UpdatePeerChallengeSchema,
} from "../models/Leaderboard";
import peerChallengeController from "../controllers/peerChallengeController";

const router = Router();

/**
 * Peer Challenge Routes
 */

// Create new challenge
router.post(
  "/",
  requireAuth,
  validateRequest(CreatePeerChallengeSchema),
  peerChallengeController.createChallenge
);

// Get user's challenges
router.get("/", requireAuth, peerChallengeController.getUserChallenges);

// Get challenge details
router.get("/:id", requireAuth, peerChallengeController.getChallengeDetails);

// Update challenge
router.put(
  "/:id",
  requireAuth,
  validateRequest(UpdatePeerChallengeSchema),
  peerChallengeController.updateChallenge
);

// Join challenge
router.post("/:id/join", requireAuth, peerChallengeController.joinChallenge);

// Leave challenge
router.post("/:id/leave", requireAuth, peerChallengeController.leaveChallenge);

export default router;
