const nodemailer = require('nodemailer');
const { User } = require('../entities/User');
const { Booking } = require('../entities/Booking');



class MailService {
    constructor() {
        this.isConfigured = this.validateConfiguration();
        if (this.isConfigured) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        }
    }

    validateConfiguration() {
        const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.warn('Email service is not configured. Missing environment variables:', missingVars);
            return false;
        }
        return true;
    }

    async sendNewBookingNotification(admin, booking) {
        if (!this.isConfigured) {
            console.warn('Email service is not configured. Skipping notification.');
            return;
        }

        try {
            const room = await booking.room;
            const user = await booking.user;

            const formatDate = (date) => {
                if (!date) return 'N/A';
                const d = new Date(date);
                return d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const mailOptions = {
                from: process.env.SMTP_FROM,
                to: admin.email,
                subject: 'New Booking Request',
                html: `
                    <h2>New Booking Request</h2>
                    <p>A new booking has been made by ${user.name} (${user.email}).</p>
                    
                    <h3>Booking Details:</h3>
                    <ul>
                        <li>Room: ${room.roomNumber} (${room.type})</li>
                        <li>Check-in: ${formatDate(booking.checkInDate)}</li>
                        <li>Check-out: ${formatDate(booking.checkOutDate)}</li>
                        <li>Guests: ${booking.guests}</li>
                        <li>Total Price: NPR ${booking.totalPrice.toLocaleString()}</li>
                    </ul>
                    
                    <p>Please review and update the booking status.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('Booking notification email sent successfully');
        } catch (error) {
            console.error('Error sending booking notification:', error.message);
            // Don't throw the error, just log it
        }
    }

    async sendBookingStatusUpdate(user, booking) {
        if (!this.isConfigured) {
            console.warn('Email service is not configured. Skipping status update notification.');
            return;
        }

        try {
            const room = await booking.room;

            const formatDate = (date) => {
                if (!date) return 'N/A';
                const d = new Date(date);
                return d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const mailOptions = {
                from: process.env.SMTP_FROM,
                to: user.email,
                subject: 'Booking Status Update',
                html: `
                    <h2>Booking Status Update</h2>
                    <p>Your booking status has been updated to: <strong>${booking.status}</strong></p>
                    
                    <h3>Booking Details:</h3>
                    <ul>
                        <li>Room: ${room.roomNumber} (${room.type})</li>
                        <li>Check-in: ${formatDate(booking.checkInDate)}</li>
                        <li>Check-out: ${formatDate(booking.checkOutDate)}</li>
                        <li>Guests: ${booking.guests}</li>
                        <li>Total Price: NPR ${booking.totalPrice.toLocaleString()}</li>
                    </ul>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('Booking status update email sent successfully');
        } catch (error) {
            console.error('Error sending booking status update:', error.message);
            // Don't throw the error, just log it
        }
    }
}

const mailService = new MailService();

module.exports = mailService; 