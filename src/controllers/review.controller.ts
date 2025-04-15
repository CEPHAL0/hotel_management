import { Request, Response } from "express";
import { Review } from "../entities/Review";
import { Room } from "../entities/Room";
import { Stay, StayStatus } from "../entities/Stay";
import { AppError } from "../middleware/error.middleware";
import { CreateReviewDto, UpdateReviewDto } from "../dto/review.dto";

export class ReviewController {
    // Get all reviews for a room
    static async getRoomReviews(req: Request, res: Response) {
        const { roomId } = req.params;

        const reviews = await Review.find({
            where: { room: { id: parseInt(roomId) } },
            relations: ['user'],
            order: {
                createdAt: 'DESC'
            }
        });

        // Calculate average rating
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
    static async createReview(req: Request, res: Response) {
        const { roomId } = req.params;
        const reviewData = req.body as CreateReviewDto;
        const userId = req.user!.id;

        // Check if user has completed any stays in this room
        const completedStays = await Stay.find({
            where: {
                user: { id: userId },
                room: { id: parseInt(roomId) },
                status: StayStatus.COMPLETED
            }
        });

        if (completedStays.length === 0) {
            throw new AppError(
                "You can only review rooms where you have completed a stay",
                403
            );
        }

        // Check if user has already reviewed this room
        const existingReview = await Review.findOne({
            where: {
                user: { id: userId },
                room: { id: parseInt(roomId) }
            }
        });

        if (existingReview) {
            throw new AppError(
                "You have already reviewed this room",
                400
            );
        }

        const review = Review.create({
            user: { id: userId },
            room: { id: parseInt(roomId) },
            ...reviewData
        });

        await review.save();

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
    static async updateReview(req: Request, res: Response) {
        const { id } = req.params;
        const reviewData = req.body as UpdateReviewDto;
        const userId = req.user!.id;

        const review = await Review.findOne({
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
        await review.save();

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
    static async deleteReview(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;

        const review = await Review.findOne({
            where: { id: parseInt(id) },
            relations: ['user']
        });

        if (!review) {
            throw new AppError("Review not found", 404);
        }

        if (review.user.id !== userId) {
            throw new AppError("You can only delete your own reviews", 403);
        }

        await review.remove();

        res.json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    }
} 