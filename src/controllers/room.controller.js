const { AppDataSource } = require("../config/database");
const { Room } = require("../entities/Room");
const { Booking } = require("../entities/Booking");
const { Stay } = require("../entities/Stay");
const { AppError } = require("../middleware/error.middleware");
const { Not } = require("typeorm");
const Hotel = require("../entities/Hotel");

class RoomController {
    static async createRoom(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { hotelId } = req.params;
            const roomData = req.body;

            // Check if hotel exists
            const hotel = await hotelRepo.findOne({ where: { id: parseInt(hotelId) } });
            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            // Check for duplicate room number within the same hotel
            const existingRoom = await roomRepo.findOne({
                where: {
                    roomNumber: roomData.roomNumber,
                    hotel: { id: parseInt(hotelId) }
                }
            });
            if (existingRoom) {
                throw new AppError("Room number already exists in this hotel", 400);
            }

            const room = roomRepo.create({
                ...roomData,
                hotel: { id: parseInt(hotelId) }
            });
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
                    description: room.description,
                    hotel: {
                        id: hotel.id,
                        name: hotel.name
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateRoom(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const { id, hotelId } = req.params;
            const updateData = req.body;

            const room = await roomRepo.findOne({
                where: {
                    id: parseInt(id),
                    hotel: { id: parseInt(hotelId) }
                }
            });
            if (!room) {
                throw new AppError("Room not found in this hotel", 404);
            }

            if (updateData.roomNumber) {
                const existingRoom = await roomRepo.findOne({
                    where: {
                        roomNumber: updateData.roomNumber,
                        id: Not(parseInt(id)),
                        hotel: { id: parseInt(hotelId) }
                    }
                });
                if (existingRoom) {
                    throw new AppError("Room number already exists in this hotel", 400);
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

            const updatedRoom = await roomRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['hotel']
            });

            res.json({
                status: 'success',
                data: {
                    id: updatedRoom.id,
                    roomNumber: updatedRoom.roomNumber,
                    type: updatedRoom.type,
                    price: updatedRoom.price,
                    capacity: updatedRoom.capacity,
                    status: updatedRoom.status,
                    description: updatedRoom.description,
                    hotel: {
                        id: updatedRoom.hotel.id,
                        name: updatedRoom.hotel.name
                    }
                }
            });
        } catch (error) {
            next(error)
        }
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
        const { hotelId } = req.params;

        const rooms = await roomRepo.find({
            where: { hotel: { id: parseInt(hotelId) } },
            relations: ['hotel'],
            order: {
                roomNumber: 'ASC'
            }
        });

        res.json({
            status: 'success',
            data: rooms.map(room => ({
                id: room.id,
                roomNumber: room.roomNumber,
                type: room.type,
                price: room.price,
                capacity: room.capacity,
                status: room.status,
                description: room.description,
                hotel: {
                    id: room.hotel.id,
                    name: room.hotel.name
                }
            }))
        });
    }

    static async getRoom(req, res) {
        const roomRepo = AppDataSource.getRepository(Room);
        const { id, hotelId } = req.params;

        const room = await roomRepo.findOne({
            where: {
                id: parseInt(id),
                hotel: { id: parseInt(hotelId) }
            },
            relations: ['hotel']
        });

        if (!room) {
            throw new AppError("Room not found in this hotel", 404);
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
                description: room.description,
                hotel: {
                    id: room.hotel.id,
                    name: room.hotel.name
                }
            }
        });
    }
}

module.exports = RoomController;
