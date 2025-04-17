const { Room } = require("../entities/Room");
const { Booking } = require("../entities/Booking");
const { Stay } = require("../entities/Stay");
const { AppError } = require("../middleware/error.middleware");
const { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } = require("../dto/room.dto");
const { Not } = require("typeorm");

class RoomController {
    static async createRoom(req, res) {
        const roomData = req.body;
        
        const existingRoom = await Room.findOne({ where: { roomNumber: roomData.roomNumber } });
        if (existingRoom) {
            throw new AppError("Room number already exists", 400);
        }

        const room = new Room();
        Object.assign(room, roomData);
        await room.save();

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
        const { id } = req.params;
        const updateData = req.body;

        const room = await Room.findOne({ where: { id: parseInt(id) } });
        if (!room) {
            throw new AppError("Room not found", 404);
        }

        if (updateData.roomNumber) {
            const existingRoom = await Room.findOne({ 
                where: { 
                    roomNumber: updateData.roomNumber,
                    id: Not(parseInt(id))
                } 
            });
            if (existingRoom) {
                throw new AppError("Room number already exists", 400);
            }
        }

        Object.assign(room, updateData);
        await room.save();

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

    static async updateRoomStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        const room = await Room.findOne({ where: { id: parseInt(id) } });
        if (!room) {
            throw new AppError("Room not found", 404);
        }

        room.status = status;
        await room.save();

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
        const { id } = req.params;

        // Find the room with its relations
        const room = await Room.findOne({
            where: { id: parseInt(id) },
            relations: ['bookings', 'stays']
        });

        if (!room) {
            throw new AppError("Room not found", 404);
        }

        // Check for active bookings
        const activeBookings = room.bookings.filter(
            booking => booking.status !== "cancelled" && booking.status !== "completed"
        );

        if (activeBookings.length > 0) {
            throw new AppError(
                "Cannot delete room with active bookings. Please cancel or complete the bookings first.",
                400
            );
        }

        // Check for active stays
        const activeStays = room.stays.filter(stay => stay.status === "active");

        if (activeStays.length > 0) {
            throw new AppError(
                "Cannot delete room with active stays. Please complete the stays first.",
                400
            );
        }

        // Delete all bookings and stays associated with the room
        await Promise.all([
            Booking.delete({ room: { id: parseInt(id) } }),
            Stay.delete({ room: { id: parseInt(id) } })
        ]);

        // Delete the room
        await room.remove();

        res.json({
            status: 'success',
            message: 'Room deleted successfully'
        });
    }

    static async getRooms(req, res) {
        const rooms = await Room.find();
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
        const { id } = req.params;
        
        const room = await Room.findOne({ where: { id: parseInt(id) } });
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