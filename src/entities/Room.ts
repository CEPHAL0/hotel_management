import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { IsNotEmpty, IsNumber, IsString, Min, IsEnum } from "class-validator";
import { Booking } from "./Booking";
import { Stay } from "./Stay";
import { Review } from "./Review";

export enum RoomType {
    SINGLE = "single",
    DOUBLE = "double",
    SUITE = "suite",
    DELUXE = "deluxe"
}

export enum RoomStatus {
    AVAILABLE = "available",
    OCCUPIED = "occupied",
    MAINTENANCE = "maintenance"
}

@Entity()
export class Room extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty()
    @IsString()
    roomNumber!: string;

    @Column({
        type: "enum",
        enum: RoomType
    })
    @IsEnum(RoomType)
    @IsNotEmpty()
    type!: RoomType;

    @Column()
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    price!: number;

    @Column()
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    capacity!: number;

    @Column({
        type: "enum",
        enum: RoomStatus,
        default: RoomStatus.AVAILABLE
    })
    @IsEnum(RoomStatus)
    status!: RoomStatus;

    @Column({ nullable: true })
    @IsString()
    description?: string;

    @OneToMany(() => Booking, booking => booking.room)
    bookings!: Booking[];

    @OneToMany(() => Stay, stay => stay.room)
    stays!: Stay[];

    @OneToMany(() => Review, review => review.room)
    reviews!: Review[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 