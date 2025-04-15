import { Request, Response } from "express";
import { Stay, StayStatus } from "../entities/Stay";
import { Room, RoomStatus } from "../entities/Room";
import { AppError } from "../middleware/error.middleware";
import { UpdateStayStatusDto } from "../dto/stay.dto";

export class StayController {
    // Create a stay when booking is confirmed
    static async createStay(booking: any) {
        const stay = Stay.create({
            user: { id: booking.user.id },
            room: { id: booking.room.id },
            startDate: booking.checkInDate,
            endDate: booking.checkOutDate,
            totalDays: Math.ceil(
                (booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
            ),
            status: StayStatus.ACTIVE
        });

        await stay.save();

        // Update room status to occupied
        const room = await Room.findOne({ where: { id: booking.room.id } });
        if (room) {
            room.status = RoomStatus.OCCUPIED;
            await room.save();
        }

        return stay;
    }

    // Admin: Get all stays
    static async getAllStays(req: Request, res: Response) {
        const stays = await Stay.find({
            relations: ['user', 'room'],
            order: {
                createdAt: 'DESC'
            }
        });

        res.json({
            status: 'success',
            data: stays.map(stay => ({
                id: stay.id,
                user: {
                    id: stay.user.id,
                    name: stay.user.name,
                    email: stay.user.email
                },
                room: {
                    id: stay.room.id,
                    roomNumber: stay.room.roomNumber,
                    type: stay.room.type
                },
                startDate: stay.startDate,
                endDate: stay.endDate,
                totalDays: stay.totalDays,
                status: stay.status,
                createdAt: stay.createdAt
            }))
        });
    }

    // Admin: Update stay status
    static async updateStayStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(StayStatus).includes(status)) {
            throw new AppError("Invalid stay status", 400);
        }

        const stay = await Stay.findOne({
            where: { id: parseInt(id) },
            relations: ['room']
        });

        if (!stay) {
            throw new AppError("Stay not found", 404);
        }

        // If status is being changed to completed
        if (status === StayStatus.COMPLETED && stay.status !== StayStatus.COMPLETED) {
            // Update room status to available
            const room = await Room.findOne({ where: { id: stay.room.id } });
            if (room) {
                room.status = RoomStatus.AVAILABLE;
                await room.save();
            }
        }

        stay.status = status;
        await stay.save();

        res.json({
            status: 'success',
            data: {
                id: stay.id,
                room: {
                    id: stay.room.id,
                    roomNumber: stay.room.roomNumber,
                    type: stay.room.type
                },
                startDate: stay.startDate,
                endDate: stay.endDate,
                totalDays: stay.totalDays,
                status: stay.status
            }
        });
    }
} 