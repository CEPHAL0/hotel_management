const { AppDataSource } = require("../config/database");  // Import AppDataSource
const { Booking, BookingStatus } = require("../entities/Booking");
const { Room } = require("../entities/Room");
const { User, UserRole } = require("../entities/User");
const { AppError } = require("../middleware/error.middleware");
const { CreateBookingDto, UpdateBookingDto } = require("../dto/booking.dto");
const { Between, Not } = require("typeorm");
const { StayController } = require("./stay.controller");
const mailService = require("../services/mail.service");

class BookingController {
    static async createBooking(req, res, next) {
        const { roomId } = req.params;
        const bookingData = req.body;
        const userId = req.user.id;

        // Validate roomId
        if (!roomId || isNaN(parseInt(roomId))) {
            throw new AppError("Invalid room ID", 400);
        }

        // Get the Room repository using AppDataSource
        const roomRepository = AppDataSource.getRepository(Room);
        const room = await roomRepository.findOne({ where: { id: parseInt(roomId) } });

        if (!room) {
            throw new AppError("Room not found", 404);
        }

        // Check if room capacity is sufficient
        if (room.capacity < bookingData.guests) {
            throw new AppError("Room capacity exceeded", 400);
        }

        // Get the Booking repository using AppDataSource
        const bookingRepository = AppDataSource.getRepository(Booking);
        // Check for overlapping bookings
        const overlappingBookings = await bookingRepository.find({
            where: {
                room: { id: parseInt(roomId) },
                status: Not(BookingStatus.CANCELLED),
                checkInDate: Between(bookingData.checkInDate, bookingData.checkOutDate),
                checkOutDate: Between(bookingData.checkInDate, bookingData.checkOutDate)
            }
        });

        if (overlappingBookings.length > 0) {
            throw new AppError("Room is already booked for the selected dates", 400);
        }

        // Calculate total price
        const days = Math.ceil(
            (bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalPrice = room.price * days;

        const booking = bookingRepository.create({
            user: { id: userId },
            room: { id: parseInt(roomId) },
            checkInDate: new Date(bookingData.checkInDate),
            checkOutDate: new Date(bookingData.checkOutDate),
            guests: bookingData.guests,
            totalPrice: totalPrice,
            status: BookingStatus.PENDING
        });

        await bookingRepository.save(booking);

        // Load relations before sending email
        const bookingWithRelations = await bookingRepository.findOne({
            where: { id: booking.id },
            relations: ['room', 'user']
        });

        if (!bookingWithRelations) {
            throw new AppError("Error loading booking details", 500);
        }

        // Send notification to admin
        const adminRepository = AppDataSource.getRepository(User);
        const admin = await adminRepository.findOne({ where: { role: UserRole.ADMIN } });
        if (admin) {
            await mailService.sendNewBookingNotification(admin, bookingWithRelations);
        }

        if (bookingWithRelations && bookingWithRelations.user) {
            const { password, role, ...userWithoutPassword } = bookingWithRelations.user;
            bookingWithRelations.user = userWithoutPassword;
        }
        
        return res.status(201).json({
            status: "success",
            data: bookingWithRelations
        });
    }

    static async getBookings(req, res, next) {
        const userId = req.user.id;
        const bookingRepository = AppDataSource.getRepository(Booking);
        const bookings = await bookingRepository.find({
            where: { user: { id: userId } },
            relations: ['room']
        });

        return res.json({
            status: 'success',
            data: bookings.map(booking => ({
                id: booking.id,
                room: {
                    id: booking.room.id,
                    roomNumber: booking.room.roomNumber,
                    type: booking.room.type,
                    capacity: booking.room.capacity
                },
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status
            }))
        });
    }

    static async getBooking(req, res, next) {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id || isNaN(parseInt(id))) {
            throw new AppError("Invalid booking ID", 400);
        }

        const bookingRepository = AppDataSource.getRepository(Booking);
        const booking = await bookingRepository.findOne({
            where: { id: parseInt(id), user: { id: userId } },
            relations: ['room']
        });

        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        return res.json({
            status: 'success',
            data: {
                id: booking.id,
                room: {
                    id: booking.room.id,
                    roomNumber: booking.room.roomNumber,
                    type: booking.room.type,
                    capacity: booking.room.capacity
                },
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status
            }
        });
    }

    static async cancelBooking(req, res, next) {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id || isNaN(parseInt(id))) {
            throw new AppError("Invalid booking ID", 400);
        }

        const bookingRepository = AppDataSource.getRepository(Booking);
        const booking = await bookingRepository.findOne({
            where: { id: parseInt(id), user: { id: userId } }
        });

        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new AppError("Booking is already cancelled", 400);
        }

        booking.status = BookingStatus.CANCELLED;
        await bookingRepository.save(booking);

        return res.json({
            status: 'success',
            message: 'Booking cancelled successfully'
        });
    }

    static async getAllBookings(req, res, next) {
        const bookingRepository = AppDataSource.getRepository(Booking);
        const bookings = await bookingRepository.find({
            relations: ['user', 'room'],
            order: {
                createdAt: 'DESC'
            }
        });

        return res.json({
            status: 'success',
            data: bookings.map(booking => ({
                id: booking.id,
                user: {
                    id: booking.user.id,
                    name: booking.user.name,
                    email: booking.user.email
                },
                room: {
                    id: booking.room.id,
                    roomNumber: booking.room.roomNumber,
                    type: booking.room.type
                },
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
                createdAt: booking.createdAt
            }))
        });
    }

    static async updateBooking(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            if (!id || isNaN(parseInt(id))) {
                throw new AppError("Invalid booking ID", 400);
            }

            const bookingRepository = AppDataSource.getRepository(Booking);
            const booking = await bookingRepository.findOne({
                where: { id: parseInt(id), user: { id: userId } },
                relations: ['room']
            });

            if (!booking) {
                throw new AppError("Booking not found", 404);
            }

            // Only allow updates for pending bookings
            if (booking.status !== BookingStatus.PENDING) {
                throw new AppError("Can only update pending bookings", 400);
            }

            const updates = {};
            const allowedFields = ['checkInDate', 'checkOutDate', 'guests'];

            // Validate and prepare updates
            if (updateData.checkInDate !== undefined) {
                updates.checkInDate = new Date(updateData.checkInDate);
            }
            if (updateData.checkOutDate !== undefined) {
                updates.checkOutDate = new Date(updateData.checkOutDate);
            }
            if (updateData.guests !== undefined) {
                // Check room capacity
                if (updateData.guests > booking.room.capacity) {
                    throw new AppError("Room capacity exceeded", 400);
                }
                updates.guests = updateData.guests;
            }

            // If dates are being updated, check for overlapping bookings
            if (updates.checkInDate || updates.checkOutDate) {
                const checkInDate = updates.checkInDate || booking.checkInDate;
                const checkOutDate = updates.checkOutDate || booking.checkOutDate;

                const overlappingBookings = await bookingRepository.find({
                    where: {
                        id: Not(parseInt(id)),
                        room: { id: booking.room.id },
                        status: Not(BookingStatus.CANCELLED),
                        checkInDate: Between(checkInDate, checkOutDate),
                        checkOutDate: Between(checkInDate, checkOutDate)
                    }
                });

                if (overlappingBookings.length > 0) {
                    throw new AppError("Room is already booked for the selected dates", 400);
                }

                // Recalculate total price if dates changed
                const days = Math.ceil(
                    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                updates.totalPrice = booking.room.price * days;
            }

            // Only perform update if there are changes
            if (Object.keys(updates).length > 0) {
                await bookingRepository.update(id, updates);
            }

            // Fetch updated booking
            const updatedBooking = await bookingRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['room']
            });

            return res.json({
                status: 'success',
                data: {
                    id: updatedBooking.id,
                    room: {
                        id: updatedBooking.room.id,
                        roomNumber: updatedBooking.room.roomNumber,
                        type: updatedBooking.room.type,
                        capacity: updatedBooking.room.capacity
                    },
                    checkInDate: updatedBooking.checkInDate,
                    checkOutDate: updatedBooking.checkOutDate,
                    guests: updatedBooking.guests,
                    totalPrice: updatedBooking.totalPrice,
                    status: updatedBooking.status
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateBookingStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id || isNaN(parseInt(id))) {
                throw new AppError("Invalid booking ID", 400);
            }

            if (!Object.values(BookingStatus).includes(status)) {
                throw new AppError("Invalid booking status", 400);
            }

            const bookingRepository = AppDataSource.getRepository(Booking);
            const booking = await bookingRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['room', 'user']
            });

            if (!booking) {
                throw new AppError("Booking not found", 404);
            }

            // Only update if status is different
            if (status !== booking.status) {
                await bookingRepository.update(id, { status });

                // If status is changed to CONFIRMED, create a stay
                if (status === BookingStatus.CONFIRMED) {
                    await StayController.createStayFromBooking(booking);
                }

                // Notify user about status change
                await mailService.sendBookingStatusUpdate(booking.user, booking);
            }

            // Fetch updated booking
            const updatedBooking = await bookingRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['room']
            });

            return res.json({
                status: 'success',
                data: {
                    id: updatedBooking.id,
                    room: {
                        id: updatedBooking.room.id,
                        roomNumber: updatedBooking.room.roomNumber,
                        type: updatedBooking.room.type,
                        capacity: updatedBooking.room.capacity
                    },
                    checkInDate: updatedBooking.checkInDate,
                    checkOutDate: updatedBooking.checkOutDate,
                    guests: updatedBooking.guests,
                    totalPrice: updatedBooking.totalPrice,
                    status: updatedBooking.status
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BookingController;
