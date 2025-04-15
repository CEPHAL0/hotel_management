import { Request, Response, NextFunction } from "express";
import { Booking, BookingStatus } from "../entities/Booking";
import { Room } from "../entities/Room";
import { User, UserRole } from "../entities/User";
import { AppError } from "../middleware/error.middleware";
import { CreateBookingDto, UpdateBookingDto } from "../dto/booking.dto";
import { Between, Not } from "typeorm";
import { StayController } from "./stay.controller";
import { mailService } from "../services/mail.service";

export class BookingController {
    static async createBooking(req: Request, res: Response, next: NextFunction) {
        const { roomId } = req.params;
        const bookingData = req.body as CreateBookingDto;
        const userId = req.user!.id;

        // Validate roomId
        if (!roomId || isNaN(parseInt(roomId))) {
            throw new AppError("Invalid room ID", 400);
        }

        // Check if room exists and is available
        const room = await Room.findOne({
            where: { id: parseInt(roomId) }
        });

        if (!room) {
            throw new AppError("Room not found", 404);
        }

        if (room.status !== "available") {
            throw new AppError("Room is not available for booking", 400);
        }

        // Check if room capacity is sufficient
        if (room.capacity < bookingData.guests) {
            throw new AppError("Room capacity exceeded", 400);
        }

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
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

        const booking = new Booking();
        booking.user = { id: userId } as User;
        booking.room = { id: parseInt(roomId) } as Room;
        booking.checkInDate = bookingData.checkInDate;
        booking.checkOutDate = bookingData.checkOutDate;
        booking.guests = bookingData.guests;
        booking.totalPrice = totalPrice;
        booking.status = BookingStatus.PENDING;

        await booking.save();

        // Load relations before sending email
        const bookingWithRelations = await Booking.findOne({
            where: { id: booking.id },
            relations: ['room', 'user']
        });

        if (!bookingWithRelations) {
            throw new AppError("Error loading booking details", 500);
        }

        // Send notification to admin
        const admin = await User.findOne({ where: { role: UserRole.ADMIN } });
        if (admin) {
            await mailService.sendNewBookingNotification(admin, bookingWithRelations);
        }

        

        return res.status(201).json({
            status: "success",
            data: bookingWithRelations
        });

    }

    static async getBookings(req: Request, res: Response, next: NextFunction) {
        const userId = req.user!.id;
        const bookings = await Booking.find({
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

    static async getBooking(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const userId = req.user!.id;

        if (!id || isNaN(parseInt(id))) {
            throw new AppError("Invalid booking ID", 400);
        }

        const booking = await Booking.findOne({
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

    static async cancelBooking(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const userId = req.user!.id;

        if (!id || isNaN(parseInt(id))) {
            throw new AppError("Invalid booking ID", 400);
        }

        const booking = await Booking.findOne({
            where: { id: parseInt(id), user: { id: userId } }
        });

        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new AppError("Booking is already cancelled", 400);
        }

        booking.status = BookingStatus.CANCELLED;
        await booking.save();

        return res.json({
            status: 'success',
            message: 'Booking cancelled successfully'
        });

    }

    static async getAllBookings(req: Request, res: Response, next: NextFunction) {
        const bookings = await Booking.find({
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

    static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { status } = req.body as UpdateBookingDto;

        if (!id || isNaN(parseInt(id))) {
            throw new AppError("Invalid booking ID", 400);
        }

        if (!status || !Object.values(BookingStatus).includes(status)) {
            throw new AppError("Invalid booking status", 400);
        }

        const booking = await Booking.findOne({
            where: { id: parseInt(id) },
            relations: ["user", "room"]
        });

        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        booking.status = status;
        await booking.save();

        // Send notification to user
        await mailService.sendBookingStatusUpdate(booking.user, booking);

        // If booking is confirmed, create a stay
        if (status === BookingStatus.CONFIRMED) {
            await StayController.createStay(booking);
        }

        return res.json({
            status: "success",
            data: booking
        });

    }
} 