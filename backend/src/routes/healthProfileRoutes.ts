import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { CreateHealthProfileSchema, UpdateHealthProfileSchema } from "../models/HealthProfile";
import healthProfileController from "../controllers/healthProfileController";

const router = Router();

/**
 * Health Profile Routes
 */

// Create health profile
router.post(
  "/",
  requireAuth,
  validateRequest(CreateHealthProfileSchema),
  healthProfileController.createProfile
);

// Get current user's health profile
router.get("/", requireAuth, healthProfileController.getProfile);

// Update health profile
router.put(
  "/",
  requireAuth,
  validateRequest(UpdateHealthProfileSchema),
  healthProfileController.updateProfile
);

// Get BMI and category
router.get("/bmi", requireAuth, healthProfileController.getBMI);

export default router;
