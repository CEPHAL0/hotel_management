import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import authRoutes from "./routes/auth.routes";
import roomRoutes from "./routes/room.routes";
import bookingRoutes from "./routes/booking.routes";
import stayRoutes from "./routes/stay.routes";
import reviewRoutes from "./routes/review.routes";
import paymentRoutes from "./routes/payment.routes";
import profileRoutes from "./routes/profile.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import adminRoutes from "./routes/admin.routes";
import { createAdminUser } from "./config/admin.seeder";
import { errorHandler } from "./middleware/error.middleware";
import { AppError } from "./middleware/error.middleware";
import helmet from 'helmet';
import morgan from 'morgan';
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected successfully");
        await createAdminUser();
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1);
    }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stays", stayRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// Regular payment routes with JSON body
app.use('/api/payments', paymentRoutes);

// Stripe webhook endpoint with raw body
app.post(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
        // Store the raw body for webhook verification
        const rawBody = req.body;
        req.rawBody = rawBody;
        next();
    },
    paymentRoutes
);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server only after database is initialized
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

export default app; 