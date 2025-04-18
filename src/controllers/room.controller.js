const { AppDataSource } = require("../config/database");
const { Room } = require("../entities/Room");
const { Booking } = require("../entities/Booking");
const { Stay } = require("../entities/Stay");
const { AppError } = require("../middleware/error.middleware");
const { Not } = require("typeorm");

class RoomController {
    static async createRoom(req, res) {
        const roomRepo = AppDataSource.getRepository(Room);
        const roomData = req.body;

        const existingRoom = await roomRepo.findOne({ where: { roomNumber: roomData.roomNumber } });
        if (existingRoom) {
            throw new AppError("Room number already exists", 400);
        }

        const room = roomRepo.create(roomData);
        await roomRepo.save(room);

        res.status(201).json({
            status: 'success',
            data: {
                id: room.id,
                roomNumber: room.roomNumber,
                type: room.type,
                price: room.price,
                capacity: room.capacity,
                status: room.status,
                description: room.description
            }
        });
    }

    static async updateRoom(req, res) {
        const roomRepo = AppDataSource.getRepository(Room);
        const { id } = req.params;
        const updateData = req.body;

        const room = await roomRepo.findOne({ where: { id: parseInt(id) } });
        if (!room) {
            throw new AppError("Room not found", 404);
        }

        if (updateData.roomNumber) {
            const existingRoom = await roomRepo.findOne({
                where: {
                    roomNumber: updateData.roomNumber,
                    id: Not(parseInt(id))
                }
            });
            if (existingRoom) {
                throw new AppError("Room number already exists", 400);
            }
        }

        const allowedFields = ['roomNumber', 'type', 'price', 'capacity', 'status', 'description'];
        const updates = {};
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updates[key] = updateData[key];
            }
        });

        await roomRepo.update(id, updates);

        const updatedRoom = await roomRepo.findOne({ where: { id: parseInt(id) } });

        res.json({
            status: 'success',
            data: {
                id: updatedRoom.id,
                roomNumber: updatedRoom.roomNumber,
                type: updatedRoom.type,
                price: updatedRoom.price,
                capacity: updatedRoom.capacity,
                status: updatedRoom.status,
                description: updatedRoom.description
            }
        });
    }

    static async updateRoomStatus(req, res) {
        const roomRepo = AppDataSource.getRepository(Room);
        const { id } = req.params;
        const { status } = req.body;

        const room = await roomRepo.findOne({ where: { id: parseInt(id) } });
        if (!room) {
            throw new AppError("Room not found", 404);
        }

        room.status = status;
        await roomRepo.save(room);

        res.json({
            status: 'success',
            data: {
                id: room.id,
                roomNumber: room.roomNumber,
                capacity: room.capacity,
                status: room.status,
                message: `Room status updated to ${status}`
            }
        });
    }

    static async deleteRoom(req, res) {
        const roomRepo = AppDataSource.getRepository(Room);
        const bookingRepo = AppDataSource.getRepository(Booking);
        const stayRepo = AppDataSource.getRepository(Stay);
        const { id } = req.params;

        const room = await roomRepo.findOne({
            where: { id: parseInt(id) },
            relations: ['bookings', 'stays']
        });

        if (!room) {
            throw new AppError("Room not found", 404);
        }

        const activeBookings = room.bookings.filter(
            booking => booking.status !== "cancelled" && booking.status !== "completed"
        );

        if (activeBookings.length > 0) {
            throw new AppError(
                "Cannot delete room with active bookings. Please cancel or complete the bookings first.",
                400
            );
        }

        const activeStays = room.stays.filter(stay => stay.status === "active");

        if (activeStays.length > 0) {
            throw new AppError(
                "Cannot delete room with active stays. Please complete the stays first.",
                400
            );
        }

        await Promise.all([
            bookingRepo.delete({ room: { id: parseInt(id) } }),
            stayRepo.delete({ room: { id: parseInt(id) } })
        ]);

        await roomRepo.remove(room);

        res.json({
            status: 'success',
            message: 'Room deleted successfully'
        });
    }

    static async getRooms(req, res) {
        const roomRepo = AppDataSource.getRepository(Room);
        const rooms = await roomRepo.find();
        res.json({
            status: 'success',
            data: rooms.map(room => ({
                id: room.id,
                roomNumber: room.roomNumber,
                type: room.type,
                price: room.price,
                capacity: room.capacity,
                status: room.status,
                description: room.description
            }))
        });
    }

    static async getRoom(req, res) {
        const roomRepo = AppDataSource.getRepository(Room);
        const { id } = req.params;

        const room = await roomRepo.findOne({ where: { id: parseInt(id) } });
        if (!room) {
            throw new AppError("Room not found", 404);
        }

        res.json({
            status: 'success',
            data: {
                id: room.id,
                roomNumber: room.roomNumber,
                type: room.type,
                price: room.price,
                capacity: room.capacity,
                status: room.status,
                description: room.description
            }
        });
    }
}

module.exports = RoomController;
