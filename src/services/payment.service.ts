import Stripe from 'stripe';
import { Payment, PaymentStatus } from '../entities/Payment';
import { Booking, BookingStatus } from '../entities/Booking';
import { Stay, StayStatus } from '../entities/Stay';
import { AppError } from '../middleware/error.middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil'
});

export class PaymentService {
    static async createPaymentIntent(booking: Booking) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(booking.totalPrice),
                currency: 'usd',
                metadata: {
                    bookingId: booking.id.toString(),
                    userId: booking.user.id.toString()
                }
            });

            return paymentIntent;
        } catch (error) {
            throw new AppError('Error creating payment intent', 500);
        }
    }

    static async handlePaymentSuccess(paymentIntentId: string) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            const bookingId = parseInt(paymentIntent.metadata.bookingId);
            
            // Find the booking
            const booking = await Booking.findOne({
                where: { id: bookingId },
                relations: ['room', 'user']
            });

            if (!booking) {
                throw new AppError('Booking not found', 404);
            }

            if (booking.status !== BookingStatus.PENDING) {
                throw new AppError('Booking is not in pending status', 400);
            }

            // Create payment record
            const payment = new Payment();
            payment.amount = paymentIntent.amount / 100; // Convert from cents
            payment.currency = paymentIntent.currency;
            payment.stripePaymentId = paymentIntent.id;
            payment.status = PaymentStatus.COMPLETED;
            payment.booking = booking;
            payment.user = booking.user;
            await payment.save();

            // Update booking status
            booking.status = BookingStatus.CONFIRMED;
            await booking.save();

            // Create stay
            const stay = new Stay();
            stay.room = booking.room;
            stay.user = booking.user;
            stay.startDate = booking.checkInDate;
            stay.endDate = booking.checkOutDate;
            stay.status = StayStatus.ACTIVE;
            await stay.save();

            return { booking, payment, stay };
        } catch (error) {
            throw new AppError('Error processing payment', 500);
        }
    }
} 