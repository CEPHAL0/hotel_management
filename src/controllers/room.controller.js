const { AppDataSource } = require("../config/database");
const { Room, RoomStatus, RoomType } = require("../entities/Room");
const { Booking } = require("../entities/Booking");
const { Stay } = require("../entities/Stay");
const { AppError } = require("../middleware/error.middleware");
const { Not } = require("typeorm");
const Hotel = require("../entities/Hotel");
const { validate } = require("class-validator");
const { plainToClass } = require("class-transformer");
const { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } = require("../dto/room.dto");

class RoomController {
    static async createRoom(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { hotelId } = req.params;

            // Validate request body
            const createRoomDto = plainToClass(CreateRoomDto, req.body);
            const errors = await validate(createRoomDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => ({
                    field: error.property,
                    message: Object.values(error.constraints || {}).join(', ')
                }));

                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages
                });
            }

            // Check if hotel exists
            const hotel = await hotelRepo.findOne({ where: { id: parseInt(hotelId) } });
            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            // Check for duplicate room number
            const existingRoom = await roomRepo.findOne({
                where: {
                    roomNumber: createRoomDto.roomNumber,
                    hotel: { id: parseInt(hotelId) }
                }
            });

            if (existingRoom) {
                throw new AppError("Room number already exists in this hotel", 400);
            }

            const room = roomRepo.create({
                ...createRoomDto,
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

            // Validate request body
            const updateRoomDto = plainToClass(UpdateRoomDto, req.body);
            const errors = await validate(updateRoomDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => ({
                    field: error.property,
                    message: Object.values(error.constraints || {}).join(', ')
                }));

                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages
                });
            }

            // Check if room exists
            const room = await roomRepo.findOne({
                where: {
                    id: parseInt(id),
                    hotel: { id: parseInt(hotelId) }
                }
            });

            if (!room) {
                throw new AppError("Room not found", 404);
            }

            // Check for duplicate room number if being updated
            if (updateRoomDto.roomNumber && updateRoomDto.roomNumber !== room.roomNumber) {
                const existingRoom = await roomRepo.findOne({
                    where: {
                        roomNumber: updateRoomDto.roomNumber,
                        hotel: { id: parseInt(hotelId) }
                    }
                });

                if (existingRoom) {
                    throw new AppError("Room number already exists in this hotel", 400);
                }
            }

            // Update only provided fields
            const updates = {};
            Object.keys(updateRoomDto).forEach(key => {
                if (updateRoomDto[key] !== undefined) {
                    updates[key] = updateRoomDto[key];
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
            next(error);
        }
    }

    static async updateRoomStatus(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const { id } = req.params;

            // Validate request body
            const updateRoomStatusDto = plainToClass(UpdateRoomStatusDto, req.body);
            const errors = await validate(updateRoomStatusDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => ({
                    field: error.property,
                    message: Object.values(error.constraints || {}).join(', ')
                }));

                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages
                });
            }

            const room = await roomRepo.findOne({ where: { id: parseInt(id) } });
            if (!room) {
                throw new AppError("Room not found", 404);
            }

            room.status = updateRoomStatusDto.status;
            await roomRepo.save(room);

            res.json({
                status: 'success',
                data: {
                    id: room.id,
                    roomNumber: room.roomNumber,
                    status: room.status
                }
            });
        } catch (error) {
            next(error);
        }
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

    static async searchRooms(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const queryBuilder = roomRepo.createQueryBuilder("room")
                .leftJoinAndSelect("room.hotel", "hotel")
                .leftJoinAndSelect("room.reviews", "reviews");

            // Apply filters based on query parameters
            const {
                city,
                minPrice,
                maxPrice,
                minRating,
                roomType,
                capacity,
                checkInDate,
                checkOutDate,
                sortBy,
                sortOrder = 'ASC'
            } = req.query;

            // Location filter
            if (city) {
                queryBuilder.andWhere("LOWER(hotel.city) LIKE LOWER(:city)", { city: `%${city}%` });
            }

            // Price range filter
            if (minPrice) {
                queryBuilder.andWhere("room.price >= :minPrice", { minPrice: parseFloat(minPrice) });
            }
            if (maxPrice) {
                queryBuilder.andWhere("room.price <= :maxPrice", { maxPrice: parseFloat(maxPrice) });
            }

            // Room type filter
            if (roomType) {
                queryBuilder.andWhere("room.type = :roomType", { roomType });
            }

            // Capacity filter
            if (capacity) {
                queryBuilder.andWhere("room.capacity >= :capacity", { capacity: parseInt(capacity) });
            }

            // Availability filter (if dates are provided)
            if (checkInDate && checkOutDate) {
                queryBuilder
                    .leftJoin("room.bookings", "bookings")
                    .andWhere("(bookings.id IS NULL OR NOT (bookings.checkInDate <= :checkOutDate AND bookings.checkOutDate >= :checkInDate))", {
                        checkInDate: new Date(checkInDate),
                        checkOutDate: new Date(checkOutDate)
                    });
            }

            // Rating filter
            if (minRating) {
                queryBuilder
                    .addSelect("COALESCE(AVG(reviews.rating), 0)", "averageRating")
                    .groupBy("room.id, hotel.id")
                    .having("COALESCE(AVG(reviews.rating), 0) >= :minRating", { minRating: parseFloat(minRating) });
            } else {
                queryBuilder
                    .addSelect("COALESCE(AVG(reviews.rating), 0)", "averageRating")
                    .groupBy("room.id, hotel.id");
            }


            // Sorting
            if (sortBy) {
                const validSortFields = ['price', 'capacity', 'averageRating'];
                if (validSortFields.includes(sortBy)) {
                    queryBuilder.orderBy(`room.${sortBy}`, sortOrder);
                }
            } else {
                // Default sorting by price
                queryBuilder.orderBy("room.price", "ASC");
            }

            const rooms = await queryBuilder.getMany();

            // Format response
            const formattedRooms = rooms.map(room => ({
                id: room.id,
                roomNumber: room.roomNumber,
                type: room.type,
                price: room.price,
                capacity: room.capacity,
                status: room.status,
                description: room.description,
                hotel: {
                    id: room.hotel.id,
                    name: room.hotel.name,
                    city: room.hotel.city,
                    address: room.hotel.address
                },
                averageRating: room.averageRating || 0,
                reviewCount: room.reviews?.length || 0
            }));

            res.json({
                status: 'success',
                data: {
                    rooms: formattedRooms,
                    total: rooms.length,
                    filters: {
                        city,
                        minPrice,
                        maxPrice,
                        minRating,
                        roomType,
                        capacity,
                        checkInDate,
                        checkOutDate,
                        sortBy,
                        sortOrder
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RoomController;
