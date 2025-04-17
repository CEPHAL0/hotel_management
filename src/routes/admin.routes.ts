import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, authorize, requireAdmin } from "../middleware/auth.middleware";
import { UserRole } from "../entities/User";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply admin authorization to all routes
router.use(requireAdmin);

// Admin user management routes
router.get("/users", AdminController.getAllAdmins);
router.post("/users", AdminController.createAdmin);
router.patch("/users/:id", AdminController.updateAdmin);
router.delete("/users/:id", AdminController.deleteAdmin);

export default router; 