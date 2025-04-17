require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { AppDataSource } = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const stayRoutes = require("./routes/stay.routes");
const reviewRoutes = require("./routes/review.routes");
const paymentRoutes = require("./routes/payment.routes");
const profileRoutes = require("./routes/profile.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const { createAdminUser } = require("./config/admin.seeder");
const { errorHandler } = require("./middleware/error.middleware");
const helmet = require('helmet');
const morgan = require('morgan');

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
        await AppDataSource.initialize(); // Ensure this is called to initialize TypeORM connection
        console.log("Database connected successfully");
        await createAdminUser();  // Seed the admin user
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1);  // Exit the app in case of failure
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

module.exports = app;
