const { AppDataSource } = require("../config/database");
const Hotel = require("../entities/Hotel");
const { AppError } = require("../middleware/error.middleware");
const { validate } = require("class-validator");
const { plainToClass } = require("class-transformer");
const { CreateHotelDto, UpdateHotelDto } = require("../dto/hotel.dto");
const { uploadImage, deleteOldImage, handleMulterError } = require("../utils/fileUpload");
const path = require('path');

class HotelController {
    // Middleware for handling image upload
    static uploadHotelImage = uploadImage('image');

    static async createHotel(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            
            // Check if image was uploaded
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Image is required for creating a hotel'
                });
            }

            // Extract form data from request
            const hotelData = {
                name: req.body.name,
                city: req.body.city,
                address: req.body.address,
                description: req.body.description
            };

            const createHotelDto = plainToClass(CreateHotelDto, hotelData);
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

            // Handle image upload
            const imageUrl = `/uploads/${req.file.filename}`;

            const hotel = hotelRepo.create({
                ...createHotelDto,
                imageUrl
            });

            await hotelRepo.save(hotel);

            res.status(201).json({
                status: 'success',
                data: {
                    id: hotel.id,
                    name: hotel.name,
                    city: hotel.city,
                    address: hotel.address,
                    description: hotel.description,
                    imageUrl: hotel.imageUrl,
                    rating: 0
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHotels(req, res, next) {
        try {
            const hotelRepo = AppDataSource.getRepository(Hotel);
            
            const hotels = await hotelRepo.createQueryBuilder("hotel")
                .leftJoinAndSelect("hotel.rooms", "room")
                .leftJoinAndSelect("room.reviews", "review")
                .orderBy("hotel.name", "ASC")
                .getMany();

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
                    imageUrl: hotel.imageUrl,
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
                    imageUrl: hotel.imageUrl,
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
                        imageUrl: room.imageUrl,
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

            // Get existing hotel
            const hotel = await hotelRepo.findOne({ where: { id: parseInt(id) } });
            if (!hotel) {
                throw new AppError("Hotel not found", 404);
            }

            // Create update object with only provided fields
            const updates = {};
            
            // Only update fields that are provided in the request
            if (req.body.name !== undefined) updates.name = req.body.name;
            if (req.body.city !== undefined) updates.city = req.body.city;
            if (req.body.address !== undefined) updates.address = req.body.address;
            if (req.body.description !== undefined) updates.description = req.body.description;

            // Handle image upload if provided
            if (req.file) {
                // Delete old image if exists
                if (hotel.imageUrl) {
                    deleteOldImage(hotel.imageUrl);
                }
                updates.imageUrl = `/uploads/${req.file.filename}`;
            }

            // Only proceed with update if there are actual changes
            if (Object.keys(updates).length > 0) {
                await hotelRepo.update(id, updates);
            }

            const updatedHotel = await hotelRepo.createQueryBuilder("hotel")
                .leftJoinAndSelect("hotel.rooms", "room")
                .leftJoinAndSelect("room.reviews", "review")
                .where("hotel.id = :id", { id: parseInt(id) })
                .getOne();

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
                    imageUrl: updatedHotel.imageUrl,
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

            // Delete hotel image if exists
            if (hotel.imageUrl) {
                deleteOldImage(hotel.imageUrl);
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