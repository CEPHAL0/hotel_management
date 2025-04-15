import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { CreateReviewDto, UpdateReviewDto } from "../dto/review.dto";
import { asyncHandler } from "../utils/asyncHandler";

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

export default router; 