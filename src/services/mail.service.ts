import nodemailer from 'nodemailer';
import { User } from '../entities/User';
import { Booking } from '../entities/Booking';

class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
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

    async sendNewBookingNotification(admin: User, booking: Booking) {
        try {
            const room = await booking.room;
            const user = await booking.user;

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
                        <li>Check-in: ${booking.checkInDate.toLocaleDateString()}</li>
                        <li>Check-out: ${booking.checkOutDate.toLocaleDateString()}</li>
                        <li>Guests: ${booking.guests}</li>
                        <li>Total Price: NPR ${booking.totalPrice.toLocaleString()}</li>
                    </ul>
                    
                    <p>Please review and update the booking status.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending booking notification:', error);
            throw error;
        }
    }

    async sendBookingStatusUpdate(user: User, booking: Booking) {
        try {
            const room = await booking.room;

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
                        <li>Check-in: ${booking.checkInDate.toLocaleDateString()}</li>
                        <li>Check-out: ${booking.checkOutDate.toLocaleDateString()}</li>
                        <li>Guests: ${booking.guests}</li>
                        <li>Total Price: NPR ${booking.totalPrice.toLocaleString()}</li>
                    </ul>
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending booking status update:', error);
            throw error;
        }
    }
}

export const mailService = new MailService(); 