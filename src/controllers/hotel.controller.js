const { AppDataSource } = require("../config/database");
const Hotel = require("../entities/Hotel");
const { AppError } = require("../middleware/error.middleware");
const { validate } = require("class-validator");
const { plainToClass } = require("class-transformer");
const { CreateHotelDto, UpdateHotelDto } = require("../dto/hotel.dto");

class HotelController {
    static async createHotel(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const createHotelDto = plainToClass(CreateHotelDto, req.body);
            const errors = await validate(createHotelDto);

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

            const hotel = hotelRepo.create(createHotelDto);
            await hotelRepo.save(hotel);

            res.status(201).json({
                status: 'success',
                data: {
                    id: hotel.id,
                    name: hotel.name,
                    city: hotel.city,
                    address: hotel.address,
                    description: hotel.description
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHotels(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const hotels = await hotelRepo.find({
                relations: ['rooms'],
                order: {
                    name: 'ASC'
                }
            });

            res.json({
                status: 'success',
                data: hotels.map(hotel => ({
                    id: hotel.id,
                    name: hotel.name,
                    city: hotel.city,
                    address: hotel.address,
                    description: hotel.description,
                    roomCount: hotel.rooms.length
                }))
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHotel(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { id } = req.params;

            const hotel = await hotelRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['rooms']
            });

            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            res.json({
                status: 'success',
                data: {
                    id: hotel.id,
                    name: hotel.name,
                    city: hotel.city,
                    address: hotel.address,
                    description: hotel.description,
                    rooms: hotel.rooms.map(room => ({
                        id: room.id,
                        roomNumber: room.roomNumber,
                        type: room.type,
                        price: room.price,
                        capacity: room.capacity,
                        status: room.status
                    }))
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateHotel(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { id } = req.params;
            const updateHotelDto = plainToClass(UpdateHotelDto, req.body);
            const errors = await validate(updateHotelDto);

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

            const hotel = await hotelRepo.findOne({ where: { id: parseInt(id) } });
            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            // Only include properties that are explicitly provided in the request body
            const updates = {};
            Object.keys(req.body).forEach(key => {
                if (req.body[key] !== null && req.body[key] !== undefined) {
                    updates[key] = req.body[key];
                }
            });

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No valid fields provided for update'
                });
            }

            await hotelRepo.update(id, updates);

            const updatedHotel = await hotelRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['rooms']
            });

            res.json({
                status: 'success',
                data: {
                    id: updatedHotel.id,
                    name: updatedHotel.name,
                    city: updatedHotel.city,
                    address: updatedHotel.address,
                    description: updatedHotel.description,
                    roomCount: updatedHotel.rooms.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteHotel(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { id } = req.params;

            const hotel = await hotelRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['rooms']
            });

            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            // Check if hotel has any rooms
            if (hotel.rooms.length > 0) {
                throw new AppError("Cannot delete hotel with existing rooms. Please delete the rooms first.", 400);
            }

            await hotelRepo.remove(hotel);

            res.json({
                status: 'success',
                message: 'Hotel deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHotelRooms(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { id } = req.params;

            const hotel = await hotelRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['rooms']
            });

            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            res.json({
                status: 'success',
                data: {
                    hotel: {
                        id: hotel.id,
                        name: hotel.name
                    },
                    rooms: hotel.rooms.map(room => ({
                        id: room.id,
                        roomNumber: room.roomNumber,
                        type: room.type,
                        price: room.price,
                        capacity: room.capacity,
                        status: room.status,
                        description: room.description
                    }))
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HotelController; 