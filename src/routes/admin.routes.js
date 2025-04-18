const { Router } = require("express");
const AdminController  = require("../controllers/admin.controller");
const { authMiddleware, authorize, requireAdmin } = require("../middleware/auth.middleware");
const { UserRole } = require("../entities/User");

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

module.exports = router; 