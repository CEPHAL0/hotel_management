import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Create payment intent
router.post('/:bookingId/create-payment-intent', authMiddleware, PaymentController.createPaymentIntent);

// Stripe webhook endpoint
router.post('/webhook', PaymentController.handleWebhook);

export default router; 