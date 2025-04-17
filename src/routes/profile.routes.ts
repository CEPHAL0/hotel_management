import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Profile routes
router.get("/", ProfileController.getProfile);
router.patch("/", ProfileController.updateProfile);
router.patch("/change-password", ProfileController.changePassword);

export default router; 