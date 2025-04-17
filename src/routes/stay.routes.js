const { Router } = require("express");
const { StayController } = require("../controllers/stay.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validation.middleware");
const { UpdateStayStatusDto } = require("../dto/stay.dto");
const { asyncHandler } = require("../utils/asyncHandler");

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

module.exports = router; 