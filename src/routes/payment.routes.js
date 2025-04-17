const { Router } = require("express");
const  PaymentController  = require("../controllers/payment.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

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

module.exports = router; 