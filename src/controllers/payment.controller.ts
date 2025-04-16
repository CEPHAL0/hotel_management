import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { Booking } from "../entities/Booking";
import { AppError } from "../middleware/error.middleware";
import {Stripe} from 'stripe';

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
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

            let event;

            try {
                event = Stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
            } catch (err) {
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