import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Payment routes
router.get("/", PaymentController.getPayments);
router.get("/:id", PaymentController.getPaymentById);

// Create payment intent
router.post('/:bookingId/create-payment-intent', PaymentController.createPaymentIntent);

// Stripe webhook endpoint
router.post('/webhook', PaymentController.handleWebhook);

export default router; 