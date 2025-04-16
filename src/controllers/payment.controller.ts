import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { Booking } from "../entities/Booking";
import { AppError } from "../middleware/error.middleware";
import { Stripe } from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil'
});

// Extend Express Request type to include rawBody
declare global {
    namespace Express {
        interface Request {
            rawBody?: Buffer;
        }
    }
}

export class PaymentController {
    static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
        try {
            const { bookingId } = req.params;
            const userId = req.user!.id;

            // Find the booking
            const booking = await Booking.findOne({
                where: { id: parseInt(bookingId), user: { id: userId } },
                relations: ['user']
            });

            if (!booking) {
                throw new AppError('Booking not found', 404);
            }

            if (booking.status !== 'pending') {
                throw new AppError('Booking is not in pending status', 400);
            }

            const paymentIntent = await PaymentService.createPaymentIntent(booking);

            return res.json({
                status: 'success',
                data: {
                    clientSecret: paymentIntent.client_secret
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async handleWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const sig = req.headers['stripe-signature'];

            if (!sig) {
                throw new AppError('No stripe signature found', 400);
            }

            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!endpointSecret) {
                throw new AppError('STRIPE_WEBHOOK_SECRET is not defined in environment variables', 500);
            }

            if (!req.rawBody) {
                throw new AppError('No raw body found in request', 400);
            }

            let event;

            try {
                event = stripe.webhooks.constructEvent(
                    req.rawBody,
                    sig,
                    endpointSecret
                );
            } catch (err) {
                console.error('Webhook signature verification failed:', err);
                throw new AppError('Webhook signature verification failed', 400);
            }

            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                await PaymentService.handlePaymentSuccess(paymentIntent.id);
            }

            return res.json({ received: true });
        } catch (error) {
            next(error);
        }
    }
} 