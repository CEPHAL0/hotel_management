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
const { uploadImage, deleteOldImage, handleMulterError } = require("../utils/fileUpload");
const path = require('path');

class RoomController {
    // Middleware for handling image upload
    static uploadRoomImage = uploadImage('image');

    static async createRoom(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { hotelId } = req.params;

            // Check if image was uploaded
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Image is required for creating a room'
                });
            }

            // Check if hotel exists
            const hotel = await hotelRepo.findOne({ where: { id: parseInt(hotelId) } });
            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            // Create DTO from request body
            const createRoomDto = plainToClass(CreateRoomDto, {
                roomNumber: req.body.roomNumber?.trim(),
                type: req.body.type?.trim(),
                price: req.body.price ? parseFloat(req.body.price) : undefined,
                capacity: req.body.capacity ? parseInt(req.body.capacity) : undefined,
                description: req.body.description?.trim(),
                status: RoomStatus.AVAILABLE
            });

            // Validate DTO
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

            // Validate room number uniqueness
            const existingRoom = await roomRepo.findOne({
                where: {
                    roomNumber: createRoomDto.roomNumber,
                    hotel: { id: parseInt(hotelId) }
                }
            });

            if (existingRoom) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Room number already exists in this hotel'
                });
            }

            // Handle image upload
            const imageUrl = `/uploads/${req.file.filename}`;

            const room = roomRepo.create({
                ...createRoomDto,
                imageUrl,
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
                    imageUrl: room.imageUrl,
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
            const { id } = req.params;

            // Get existing room
            const room = await roomRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['hotel']
            });

            if (!room) {
                throw new AppError("Room not found", 404);
            }

            // Create DTO from request body
            const updateRoomDto = plainToClass(UpdateRoomDto, {
                roomNumber: req.body.roomNumber?.trim(),
                type: req.body.type?.trim(),
                price: req.body.price ? parseFloat(req.body.price) : undefined,
                capacity: req.body.capacity ? parseInt(req.body.capacity) : undefined,
                status: req.body.status?.trim(),
                description: req.body.description?.trim()
            });

            // Validate DTO
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

            // Create update object with only provided fields
            const updates = {};

            // Only update fields that are provided in the request
            if (updateRoomDto.roomNumber !== undefined) {
                // Check for duplicate room number if being updated
                if (updateRoomDto.roomNumber !== room.roomNumber) {
                    const existingRoom = await roomRepo.findOne({
                        where: {
                            roomNumber: updateRoomDto.roomNumber,
                            hotel: { id: room.hotel.id }
                        }
                    });

                    if (existingRoom) {
                        return res.status(400).json({
                            status: 'error',
                            message: 'Room number already exists in this hotel'
                        });
                    }
                }
                updates.roomNumber = updateRoomDto.roomNumber;
            }

            if (updateRoomDto.type !== undefined) {
                updates.type = updateRoomDto.type;
            }

            if (updateRoomDto.price !== undefined) {
                updates.price = updateRoomDto.price;
            }

            if (updateRoomDto.capacity !== undefined) {
                updates.capacity = updateRoomDto.capacity;
            }

            if (updateRoomDto.status !== undefined) {
                updates.status = updateRoomDto.status;
            }

            if (updateRoomDto.description !== undefined) {
                updates.description = updateRoomDto.description;
            }

            // Handle image upload if provided
            if (req.file) {
                // Delete old image if exists
                if (room.imageUrl) {
                    deleteOldImage(room.imageUrl);
                }
                updates.imageUrl = `/uploads/${req.file.filename}`;
            }

            // Only proceed with update if there are actual changes
            if (Object.keys(updates).length > 0) {
                await roomRepo.update(id, updates);
            }

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
                    imageUrl: updatedRoom.imageUrl,
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
                imageUrl: room.imageUrl,
                hotel: {
                    id: room.hotel.id,
                    name: room.hotel.name
                }
            }))
        });
    }

    static async getRoom(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const { id } = req.params;

            // Validate room ID
            const roomId = parseInt(id);
            if (isNaN(roomId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid room ID'
                });
            }

            const room = await roomRepo.findOne({
                where: { id: roomId },
                relations: ['hotel']
            });

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
                    description: room.description,
                    imageUrl: room.imageUrl,
                    hotel: {
                        id: room.hotel.id,
                        name: room.hotel.name
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async searchRooms(req, res, next) {
        try {
            const roomRepo = AppDataSource.getRepository(Room);
            const queryBuilder = roomRepo.createQueryBuilder("room")
                .leftJoinAndSelect("room.hotel", "hotel")
                .leftJoinAndSelect("room.reviews", "reviews")
                .leftJoinAndSelect("room.bookings", "bookings");

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
                const minPriceNum = parseFloat(minPrice);
                if (!isNaN(minPriceNum)) {
                    queryBuilder.andWhere("room.price >= :minPrice", { minPrice: minPriceNum });
                }
            }
            if (maxPrice) {
                const maxPriceNum = parseFloat(maxPrice);
                if (!isNaN(maxPriceNum)) {
                    queryBuilder.andWhere("room.price <= :maxPrice", { maxPrice: maxPriceNum });
                }
            }

            // Room type filter
            if (roomType) {
                queryBuilder.andWhere("room.type = :roomType", { roomType });
            }

            // Capacity filter
            if (capacity) {
                const capacityNum = parseInt(capacity);
                if (!isNaN(capacityNum)) {
                    queryBuilder.andWhere("room.capacity >= :capacity", { capacity: capacityNum });
                }
            }

            // Date availability filter
            if (checkInDate && checkOutDate) {
                const startDate = new Date(checkInDate);
                const endDate = new Date(checkOutDate);

                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    // Find rooms that are either:
                    // 1. Not booked at all
                    // 2. Have bookings that don't overlap with the requested dates
                    queryBuilder.andWhere(`
                        (bookings.id IS NULL OR 
                        NOT EXISTS (
                            SELECT 1 FROM bookings b 
                            WHERE b.roomId = room.id 
                            AND b.status != 'cancelled'
                            AND (
                                (b.checkInDate <= :endDate AND b.checkOutDate >= :startDate)
                            )
                        ))
                    `, { startDate, endDate });
                }
            }

            // Rating filter
            if (minRating) {
                const minRatingNum = parseFloat(minRating);
                if (!isNaN(minRatingNum)) {
                    queryBuilder
                        .addSelect("COALESCE(AVG(reviews.rating), 0)", "averageRating")
                        .groupBy("room.id, hotel.id")
                        .having("COALESCE(AVG(reviews.rating), 0) >= :minRating", { minRating: minRatingNum });
                }
            } else {
                queryBuilder
                    .addSelect("COALESCE(AVG(reviews.rating), 0)", "averageRating")
                    .groupBy("room.id, hotel.id");
            }

            // Only show available rooms
            queryBuilder.andWhere("room.status = :status", { status: RoomStatus.AVAILABLE });

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
                imageUrl: room.imageUrl,
                hotel: {
                    id: room.hotel.id,
                    name: room.hotel.name,
                    city: room.hotel.city,
                    address: room.hotel.address,
                    imageUrl: room.hotel.imageUrl
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
