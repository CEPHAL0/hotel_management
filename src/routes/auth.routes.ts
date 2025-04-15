import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { LoginDto, RegisterDto } from "../dto/auth.dto";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Public routes
router.post("/login", validateRequest(LoginDto), asyncHandler(AuthController.login));
router.post("/register", validateRequest(RegisterDto), asyncHandler(AuthController.register));

export default router;