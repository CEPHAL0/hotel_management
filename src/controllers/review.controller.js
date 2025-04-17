const { AppDataSource } = require("../config/database");
const { Review } = require("../entities/Review");
const { Room } = require("../entities/Room");
const { Stay, StayStatus } = require("../entities/Stay");
const { AppError } = require("../middleware/error.middleware");

class ReviewController {
    // Get all reviews for a room
    static async getRoomReviews(req, res) {
        const { roomId } = req.params;
        const reviewRepo = AppDataSource.getRepository(Review);

        const reviews = await reviewRepo.find({
            where: { room: { id: parseInt(roomId) } },
            relations: ['user'],
            order: {
                createdAt: 'DESC'
            }
        });

        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.json({
            status: 'success',
            data: {
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews: reviews.length,
                reviews: reviews.map(review => ({
                    id: review.id,
                    user: {
                        id: review.user.id,
                        name: review.user.name
                    },
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt
                }))
            }
        });
    }

    // Create a review
    static async createReview(req, res) {
        const { roomId } = req.params;
        const reviewData = req.body;
        const userId = req.user.id;

        const stayRepo = AppDataSource.getRepository(Stay);
        const reviewRepo = AppDataSource.getRepository(Review);

        const completedStays = await stayRepo.find({
            where: {
                user: { id: userId },
                room: { id: parseInt(roomId) },
                status: StayStatus.COMPLETED
            }
        });

        if (completedStays.length === 0) {
            throw new AppError("You can only review rooms where you have completed a stay", 403);
        }

        const existingReview = await reviewRepo.findOne({
            where: {
                user: { id: userId },
                room: { id: parseInt(roomId) }
            }
        });

        if (existingReview) {
            throw new AppError("You have already reviewed this room", 400);
        }

        const review = reviewRepo.create({
            user: { id: userId },
            room: { id: parseInt(roomId) },
            ...reviewData
        });

        await reviewRepo.save(review);

        res.status(201).json({
            status: 'success',
            data: {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }
        });
    }

    // Update a review
    static async updateReview(req, res) {
        const { id } = req.params;
        const reviewData = req.body;
        const userId = req.user.id;

        const reviewRepo = AppDataSource.getRepository(Review);
        const review = await reviewRepo.findOne({
            where: { id: parseInt(id) },
            relations: ['user']
        });

        if (!review) {
            throw new AppError("Review not found", 404);
        }

        if (review.user.id !== userId) {
            throw new AppError("You can only update your own reviews", 403);
        }

        Object.assign(review, reviewData);
        await reviewRepo.save(review);

        res.json({
            status: 'success',
            data: {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                updatedAt: review.updatedAt
            }
        });
    }

    // Delete a review
    static async deleteReview(req, res) {
        const { id } = req.params;
        const userId = req.user.id;

        const reviewRepo = AppDataSource.getRepository(Review);
        const review = await reviewRepo.findOne({
            where: { id: parseInt(id) },
            relations: ['user']
        });

        if (!review) {
            throw new AppError("Review not found", 404);
        }

        if (review.user.id !== userId) {
            throw new AppError("You can only delete your own reviews", 403);
        }

        await reviewRepo.remove(review);

        res.json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    }
}

module.exports = ReviewController;
