const { Router } = require("express");
const { ReviewController } = require("../controllers/review.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validation.middleware");
const { CreateReviewDto, UpdateReviewDto } = require("../dto/review.dto");
const { asyncHandler } = require("../utils/asyncHandler");

const router = Router();

// Public routes
router.get(
    "/rooms/:roomId",
    asyncHandler(ReviewController.getRoomReviews)
);

// Protected routes
router.use(authMiddleware);

router.post(
    "/rooms/:roomId",
    validateRequest(CreateReviewDto),
    asyncHandler(ReviewController.createReview)
);

router.patch(
    "/:id",
    validateRequest(UpdateReviewDto),
    asyncHandler(ReviewController.updateReview)
);

router.delete(
    "/:id",
    asyncHandler(ReviewController.deleteReview)
);

module.exports = router; 