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
                    description: hotel.description,
                    rating: 0 // New hotel starts with 0 rating
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHotels(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            
            // Get hotels with their rooms and room reviews
            const hotels = await hotelRepo.createQueryBuilder("hotel")
                .leftJoinAndSelect("hotel.rooms", "room")
                .leftJoinAndSelect("room.reviews", "review")
                .orderBy("hotel.name", "ASC")
                .getMany();

            // Calculate average rating for each hotel
            const hotelsWithRating = hotels.map(hotel => {
                let totalRating = 0;
                let totalReviews = 0;

                hotel.rooms.forEach(room => {
                    if (room.reviews && room.reviews.length > 0) {
                        const roomRating = room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length;
                        totalRating += roomRating;
                        totalReviews++;
                    }
                });

                const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

                return {
                    id: hotel.id,
                    name: hotel.name,
                    city: hotel.city,
                    address: hotel.address,
                    description: hotel.description,
                    rating: averageRating,
                    totalRooms: hotel.rooms.length,
                    totalReviews: totalReviews
                };
            });

            res.json({
                status: 'success',
                data: hotelsWithRating
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHotel(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            const { id } = req.params;

            const hotel = await hotelRepo.createQueryBuilder("hotel")
                .leftJoinAndSelect("hotel.rooms", "room")
                .leftJoinAndSelect("room.reviews", "review")
                .where("hotel.id = :id", { id: parseInt(id) })
                .getOne();

            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            // Calculate average rating for the hotel
            let totalRating = 0;
            let totalReviews = 0;

            hotel.rooms.forEach(room => {
                if (room.reviews && room.reviews.length > 0) {
                    const roomRating = room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length;
                    totalRating += roomRating;
                    totalReviews++;
                }
            });

            const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

            res.json({
                status: 'success',
                data: {
                    id: hotel.id,
                    name: hotel.name,
                    city: hotel.city,
                    address: hotel.address,
                    description: hotel.description,
                    rating: averageRating,
                    totalRooms: hotel.rooms.length,
                    totalReviews: totalReviews,
                    rooms: hotel.rooms.map(room => ({
                        id: room.id,
                        roomNumber: room.roomNumber,
                        type: room.type,
                        price: room.price,
                        capacity: room.capacity,
                        status: room.status,
                        description: room.description,
                        rating: room.reviews && room.reviews.length > 0 
                            ? room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length 
                            : 0,
                        reviewCount: room.reviews?.length || 0
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

            // Update only provided fields
            const updates = {};
            Object.keys(updateHotelDto).forEach(key => {
                if (updateHotelDto[key] !== undefined) {
                    updates[key] = updateHotelDto[key];
                }
            });

            await hotelRepo.update(id, updates);

            // Get updated hotel with rooms and reviews to calculate new rating
            const updatedHotel = await hotelRepo.createQueryBuilder("hotel")
                .leftJoinAndSelect("hotel.rooms", "room")
                .leftJoinAndSelect("room.reviews", "review")
                .where("hotel.id = :id", { id: parseInt(id) })
                .getOne();

            // Calculate average rating
            let totalRating = 0;
            let totalReviews = 0;

            updatedHotel.rooms.forEach(room => {
                if (room.reviews && room.reviews.length > 0) {
                    const roomRating = room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length;
                    totalRating += roomRating;
                    totalReviews++;
                }
            });

            const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

            res.json({
                status: 'success',
                data: {
                    id: updatedHotel.id,
                    name: updatedHotel.name,
                    city: updatedHotel.city,
                    address: updatedHotel.address,
                    description: updatedHotel.description,
                    rating: averageRating,
                    totalRooms: updatedHotel.rooms.length,
                    totalReviews: totalReviews
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