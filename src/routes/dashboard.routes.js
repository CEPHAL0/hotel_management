const { Router } = require("express");
const { DashboardController } = require("../controllers/dashboard.controller");
const { authMiddleware, authorize, requireAdmin } = require("../middleware/auth.middleware");
const { UserRole } = require("../entities/User");

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply admin authorization to all routes
router.use(requireAdmin);

// Dashboard routes
router.get("/", DashboardController.getStatistics);

module.exports = router; 