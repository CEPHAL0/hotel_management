const { Router } = require("express");
const { AuthController } = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validation.middleware");
const { LoginDto, RegisterDto } = require("../dto/auth.dto");
const { asyncHandler } = require("../utils/asyncHandler");

const router = Router();

// Public routes
router.post("/login", validateRequest(LoginDto), asyncHandler(AuthController.login));
router.post("/register", validateRequest(RegisterDto), asyncHandler(AuthController.register));

module.exports = router; 