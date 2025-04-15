import { Router } from "express";
import { StayController } from "../controllers/stay.controller";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { UpdateStayStatusDto } from "../dto/stay.dto";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Admin routes
router.use(authMiddleware, requireAdmin);

router.get(
    "/",
    asyncHandler(StayController.getAllStays)
);

router.patch(
    "/:id/status",
    validateRequest(UpdateStayStatusDto),
    asyncHandler(StayController.updateStayStatus)
);

export default router; 