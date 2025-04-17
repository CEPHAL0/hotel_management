const { Router } = require("express");
const { BookingController } = require("../controllers/booking.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validation.middleware");
const { CreateBookingDto, UpdateBookingDto } = require("../dto/booking.dto");
const { asyncHandler } = require("../utils/asyncHandler");

const router = Router();

// Public routes
router.get(
    "/",
    authMiddleware,
    asyncHandler(BookingController.getBookings)
);

router.get(
    "/:id",
    authMiddleware,
    asyncHandler(BookingController.getBooking)
);

router.post(
    "/rooms/:roomId",
    authMiddleware,
    validateRequest(CreateBookingDto),
    asyncHandler(BookingController.createBooking)
);

router.patch(
    "/:id/cancel",
    authMiddleware,
    asyncHandler(BookingController.cancelBooking)
);

// Admin routes
router.get(
    "/admin/all",
    authMiddleware,
    requireAdmin,
    asyncHandler(BookingController.getAllBookings)
);

router.patch(
    "/admin/:id/status",
    authMiddleware,
    requireAdmin,
    validateRequest(UpdateBookingDto),
    asyncHandler(BookingController.updateBookingStatus)
);

module.exports = router; 