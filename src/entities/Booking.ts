import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from "typeorm";
import { IsNotEmpty, IsNumber, IsDate, Min, IsEnum } from "class-validator";
import { User } from "./User";
import { Room } from "./Room";

export enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}

@Entity()
export class Booking extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.bookings)
    user!: User;

    @ManyToOne(() => Room, room => room.bookings)
    room!: Room;

    @Column()
    @IsDate()
    @IsNotEmpty()
    checkInDate!: Date;

    @Column()
    @IsDate()
    @IsNotEmpty()
    checkOutDate!: Date;

    @Column()
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    guests!: number;

    @Column()
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    totalPrice!: number;

    @Column({
        type: "enum",
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    @IsEnum(BookingStatus)
    status!: BookingStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 