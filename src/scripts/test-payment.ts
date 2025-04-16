import { Booking, BookingStatus } from "../entities/Booking";
import { PaymentService } from "../services/payment.service";
import { AppDataSource } from "../config/database";

async function testPayment() {
    try {
        // Initialize database connection
        await AppDataSource.initialize();

        // Find a pending booking to test with
        const booking = await Booking.findOne({
            where: { status: BookingStatus.PENDING },
            relations: ['user', 'room']
        });

        if (!booking) {
            console.error('No pending booking found to test with');
            process.exit(1);
        }

        console.log('Testing payment for booking:', booking.id);

        // Create payment intent
        const paymentIntent = await PaymentService.createPaymentIntent(booking);
        console.log('Payment Intent created:', paymentIntent.id);
        console.log('Client Secret:', paymentIntent.client_secret);

        // Simulate successful payment
        console.log('\nSimulating successful payment...');
        const result = await PaymentService.handlePaymentSuccess(paymentIntent.id);
        console.log('Payment processed successfully');
        console.log('Updated booking:', result.booking);
        console.log('Created payment:', result.payment);
        console.log('Created stay:', result.stay);

    } catch (error) {
        console.error('Error testing payment:', error);
    } finally {
        await AppDataSource.destroy();
        process.exit(0);
    }
}

testPayment(); 