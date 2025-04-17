import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authMiddleware, authorize, requireAdmin } from "../middleware/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply admin authorization to all routes
router.use(requireAdmin);

// Dashboard routes
router.get("/", DashboardController.getStatistics);

export default router; 