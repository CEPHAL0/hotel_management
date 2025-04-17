const { Router } = require("express");
const { ProfileController } = require("../controllers/profile.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Profile routes
router.get("/", ProfileController.getProfile);
router.patch("/", ProfileController.updateProfile);
router.patch("/change-password", ProfileController.changePassword);

module.exports = router; 