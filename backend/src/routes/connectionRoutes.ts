import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { SendConnectionRequestSchema, UpdateConnectionRequestSchema } from "../models/ConnectionRequest";
import connectionController from "../controllers/connectionController";

const router = Router();

router.post("/", requireAuth, validateRequest(SendConnectionRequestSchema), connectionController.sendRequest);
router.get("/received", requireAuth, connectionController.getReceivedRequests);
router.get("/sent", requireAuth, connectionController.getSentRequests);
router.get("/connections", requireAuth, connectionController.getConnections);
router.put("/:id", requireAuth, validateRequest(UpdateConnectionRequestSchema), connectionController.respondToRequest);
router.delete("/:id", requireAuth, connectionController.cancelRequest);

export default router;
