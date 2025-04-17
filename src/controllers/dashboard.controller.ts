import { Request, Response } from "express";
import { Booking, BookingStatus } from "../entities/Booking";
import { Room, RoomStatus } from "../entities/Room";
import { Stay, StayStatus } from "../entities/Stay";
import { Payment, PaymentStatus } from "../entities/Payment";

export class DashboardController {
    static async getStatistics(req: Request, res: Response) {
        // Get total number of bookings by type
        const bookingsByType = await Booking.createQueryBuilder("booking")
            .select("COUNT(*)", "count")
            .addSelect("booking.status", "status")
            .groupBy("booking.status")
            .getRawMany();

        // Get total number of bookings
        const totalBookings = await Booking.count();

        // Get total revenue from completed payments
        const totalRevenue = await Payment.createQueryBuilder("payment")
            .select("SUM(payment.amount)", "total")
            .where("payment.status = :status", { status: PaymentStatus.COMPLETED })
            .getRawOne();

        // Get total number of active and completed stays
        const staysByStatus = await Stay.createQueryBuilder("stay")
            .select("COUNT(*)", "count")
            .addSelect("stay.status", "status")
            .groupBy("stay.status")
            .getRawMany();

        // Get total number of available and occupied rooms
        const roomsByStatus = await Room.createQueryBuilder("room")
            .select("COUNT(*)", "count")
            .addSelect("room.status", "status")
            .groupBy("room.status")
            .getRawMany();

        res.json({
            status: 'success',
            data: {
                bookingsByType,
                totalBookings,
                totalRevenue: totalRevenue?.total || 0,
                staysByStatus,
                roomsByStatus
            }
        });
    }
} 