const { Booking, BookingStatus } = require("../entities/Booking");
const { Room, RoomStatus } = require("../entities/Room");
const { Stay, StayStatus } = require("../entities/Stay");
const { Payment, PaymentStatus } = require("../entities/Payment");

class DashboardController {
    static async getStatistics(req, res) {
        try {
            // Get total number of bookings by type
            const bookingsByType = await Booking.createQueryBuilder("booking")
                .select("COUNT(*)", "count")
                .addSelect("booking.status", "status")
                .groupBy("booking.status")
                .getRawMany();

            // Get total number of bookings
            const totalBookings = await Booking.count();

            // Get total revenue from completed payments
            const totalRevenueResult = await Payment.createQueryBuilder("payment")
                .select("SUM(payment.amount)", "total")
                .where("payment.status = :status", { status: PaymentStatus.COMPLETED })
                .getRawOne();

            const totalRevenue = totalRevenueResult?.total || 0;

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

            return res.json({
                status: 'success',
                data: {
                    bookingsByType,
                    totalBookings,
                    totalRevenue,
                    staysByStatus,
                    roomsByStatus
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 'error',
                message: 'An error occurred while fetching statistics'
            });
        }
    }
}

module.exports = DashboardController;
