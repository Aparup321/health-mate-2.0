import express from "express";
import authController from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * Public routes (no auth required)
 */
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);

/**
 * Protected routes (auth required)
 */
router.get("/me", requireAuth, authController.getCurrentUser);
router.put("/me", requireAuth, authController.updateProfile);

export default router;
