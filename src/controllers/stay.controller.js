const { AppDataSource } = require("../config/database");
const { Stay, StayStatus } = require("../entities/Stay");
const { Room, RoomStatus } = require("../entities/Room");
const { AppError } = require("../middleware/error.middleware");

class StayController {
    // Create a stay when booking is confirmed
    static async createStay(booking) {
        const stayRepo = AppDataSource.getRepository(Stay);
        const roomRepo = AppDataSource.getRepository(Room);

        // Ensure dates are Date objects
        const startDate = new Date(booking.checkInDate);
        const endDate = new Date(booking.checkOutDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new AppError("Invalid dates in booking", 400);
        }

        const stay = stayRepo.create({
            user: { id: booking.user.id },
            room: { id: booking.room.id },
            startDate: startDate,
            endDate: endDate,
            totalDays: Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ),
            status: StayStatus.ACTIVE
        });

        await stayRepo.save(stay);

        // Update room status to occupied
        const room = await roomRepo.findOne({ where: { id: booking.room.id } });
        if (room) {
            room.status = RoomStatus.OCCUPIED;
            await roomRepo.save(room);
        }

        return stay;
    }

    // Admin: Get all stays
    static async getAllStays(req, res) {
        const stayRepo = AppDataSource.getRepository(Stay);

        const stays = await stayRepo.find({
            relations: ['user', 'room'],
            order: {
                createdAt: 'DESC'
            }
        });

        res.json({
            status: 'success',
            data: stays.map(stay => ({
                id: stay.id,
                user: {
                    id: stay.user.id,
                    name: stay.user.name,
                    email: stay.user.email
                },
                room: {
                    id: stay.room.id,
                    roomNumber: stay.room.roomNumber,
                    type: stay.room.type
                },
                startDate: stay.startDate,
                endDate: stay.endDate,
                totalDays: stay.totalDays,
                status: stay.status,
                createdAt: stay.createdAt
            }))
        });
    }

    // Admin: Update stay status
    static async updateStayStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(StayStatus).includes(status)) {
            throw new AppError("Invalid stay status", 400);
        }

        const stayRepo = AppDataSource.getRepository(Stay);
        const roomRepo = AppDataSource.getRepository(Room);

        const stay = await stayRepo.findOne({
            where: { id: parseInt(id) },
            relations: ['room']
        });

        if (!stay) {
            throw new AppError("Stay not found", 404);
        }

        // If status is being changed to completed
        if (status === StayStatus.COMPLETED && stay.status !== StayStatus.COMPLETED) {
            const room = await roomRepo.findOne({ where: { id: stay.room.id } });
            if (room) {
                room.status = RoomStatus.AVAILABLE;
                await roomRepo.save(room);
            }
        }

        stay.status = status;
        await stayRepo.save(stay);

        res.json({
            status: 'success',
            data: {
                id: stay.id,
                room: {
                    id: stay.room.id,
                    roomNumber: stay.room.roomNumber,
                    type: stay.room.type
                },
                startDate: stay.startDate,
                endDate: stay.endDate,
                totalDays: stay.totalDays,
                status: stay.status
            }
        });
    }
}

module.exports = StayController;
