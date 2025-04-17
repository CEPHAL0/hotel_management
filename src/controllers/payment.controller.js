const { PaymentService } = require("../services/payment.service");
const { Booking } = require("../entities/Booking");
const { AppError } = require("../middleware/error.middleware");
const Stripe = require('stripe');
const dotenv = require('dotenv');
const { Payment } = require("../entities/Payment");

dotenv.config();

if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil'
});

class PaymentController {
    static async createPaymentIntent(req, res, next) {
        try {
            const { bookingId } = req.params;
            const userId = req.user.id;

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

    static async handleWebhook(req, res, next) {
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

    // Get all payments for the authenticated user
    static async getPayments(req, res) {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const [payments, total] = await Payment.findAndCount({
            where: { user: { id: userId } },
            relations: ['booking'],
            order: { createdAt: 'DESC' },
            skip,
            take: Number(limit)
        });

        res.json({
            status: 'success',
            data: {
                payments,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }

    // Get payment details by ID
    static async getPaymentById(req, res) {
        const { id } = req.params;
        const userId = req.user.id;

        const payment = await Payment.findOne({
            where: { id: parseInt(id), user: { id: userId } },
            relations: ['booking']
        });

        if (!payment) {
            throw new AppError("Payment not found", 404);
        }

        res.json({
            status: 'success',
            data: payment
        });
    }
}

module.exports = PaymentController; 