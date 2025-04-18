const { AppDataSource } = require("../config/database");
const { Booking, BookingStatus } = require("../entities/Booking");
const { Room, RoomStatus, RoomType } = require("../entities/Room");
const { Stay, StayStatus } = require("../entities/Stay");
const { Payment, PaymentStatus } = require("../entities/Payment");
const Hotel = require("../entities/Hotel");

class DashboardController {
    static async getStatistics(req, res) {
        try {
            const bookingRepo = AppDataSource.getRepository(Booking);
            const roomRepo = AppDataSource.getRepository(Room);
            const stayRepo = AppDataSource.getRepository(Stay);
            const paymentRepo = AppDataSource.getRepository(Payment);
            const hotelRepo = AppDataSource.getRepository(Hotel);

            // Get total number of bookings by type
            const bookingsByType = await bookingRepo.createQueryBuilder("booking")
                .select("COUNT(*)", "count")
                .addSelect("booking.status", "status")
                .groupBy("booking.status")
                .getRawMany();

            // Get total number of bookings
            const totalBookings = await bookingRepo.count();

            // Get total revenue from completed payments
            const totalRevenueResult = await paymentRepo.createQueryBuilder("payment")
                .select("SUM(payment.amount)", "total")
                .where("payment.status = :status", { status: PaymentStatus.COMPLETED })
                .getRawOne();

            const totalRevenue = totalRevenueResult?.total || 0;

            // Get total number of active and completed stays
            const staysByStatus = await stayRepo.createQueryBuilder("stay")
                .select("COUNT(*)", "count")
                .addSelect("stay.status", "status")
                .groupBy("stay.status")
                .getRawMany();

            // Get total number of available and occupied rooms
            const roomsByStatus = await roomRepo.createQueryBuilder("room")
                .select("COUNT(*)", "count")
                .addSelect("room.status", "status")
                .groupBy("room.status")
                .getRawMany();

            // Get total number of hotels
            const totalHotels = await hotelRepo.count();

            // Get rooms by type
            const roomsByType = await roomRepo.createQueryBuilder("room")
                .select("COUNT(*)", "count")
                .addSelect("room.type", "type")
                .groupBy("room.type")
                .getRawMany();

            // Get average room price by type
            const avgRoomPriceByType = await roomRepo.createQueryBuilder("room")
                .select("AVG(room.price)", "averagePrice")
                .addSelect("room.type", "type")
                .groupBy("room.type")
                .getRawMany();

            // Get occupancy rate by hotel
            const hotelOccupancy = await hotelRepo.createQueryBuilder("hotel")
                .leftJoinAndSelect("hotel.rooms", "room")
                .select("hotel.name", "hotelName")
                .addSelect("COUNT(room.id)", "totalRooms")
                .addSelect("SUM(CASE WHEN room.status = :occupied THEN 1 ELSE 0 END)", "occupiedRooms")
                .setParameter("occupied", RoomStatus.OCCUPIED)
                .groupBy("hotel.id")
                .getRawMany();

            // Get revenue by hotel
            const revenueByHotel = await hotelRepo.createQueryBuilder("hotel")
                .leftJoin("hotel.rooms", "room")
                .leftJoin("room.bookings", "booking")
                .leftJoin("booking.payments", "payment")
                .select("hotel.name", "hotelName")
                .addSelect("SUM(payment.amount)", "totalRevenue")
                .where("payment.status = :status", { status: PaymentStatus.COMPLETED })
                .groupBy("hotel.id")
                .getRawMany();

            // Get recent bookings (last 7 days)
            const recentBookings = await bookingRepo.createQueryBuilder("booking")
                .leftJoinAndSelect("booking.room", "room")
                .leftJoinAndSelect("room.hotel", "hotel")
                .where("booking.createdAt >= :date", { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
                .orderBy("booking.createdAt", "DESC")
                .take(10)
                .getMany();

            return res.json({
                status: 'success',
                data: {
                    bookingsByType,
                    totalBookings,
                    totalRevenue,
                    staysByStatus,
                    roomsByStatus,
                    totalHotels,
                    roomsByType,
                    avgRoomPriceByType,
                    hotelOccupancy: hotelOccupancy.map(hotel => ({
                        ...hotel,
                        occupancyRate: hotel.totalRooms > 0 
                            ? (hotel.occupiedRooms / hotel.totalRooms) * 100 
                            : 0
                    })),
                    revenueByHotel,
                    recentBookings: recentBookings.map(booking => ({
                        id: booking.id,
                        status: booking.status,
                        hotelName: booking.room.hotel.name,
                        roomNumber: booking.room.roomNumber,
                        createdAt: booking.createdAt
                    }))
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
