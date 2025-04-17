const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } = require("typeorm");
const { IsNotEmpty, IsNumber, IsString, Min, IsEnum } = require("class-validator");
const { Booking } = require("./Booking");
const { Stay } = require("./Stay");
const { Review } = require("./Review");

const RoomType = {
    SINGLE: "single",
    DOUBLE: "double",
    SUITE: "suite",
    DELUXE: "deluxe"
};

const RoomStatus = {
    AVAILABLE: "available",
    OCCUPIED: "occupied",
    MAINTENANCE: "maintenance"
};

@Entity()
class Room extends BaseEntity {
    constructor() {
        super();
    }
}

PrimaryGeneratedColumn()(Room.prototype, 'id');

Column()(Room.prototype, 'roomNumber');
IsNotEmpty()(Room.prototype, 'roomNumber');
IsString()(Room.prototype, 'roomNumber');

Column({
    type: "enum",
    enum: RoomType
})(Room.prototype, 'type');
IsEnum(RoomType)(Room.prototype, 'type');
IsNotEmpty()(Room.prototype, 'type');

Column()(Room.prototype, 'price');
IsNumber()(Room.prototype, 'price');
Min(0)(Room.prototype, 'price');
IsNotEmpty()(Room.prototype, 'price');

Column()(Room.prototype, 'capacity');
IsNumber()(Room.prototype, 'capacity');
Min(1)(Room.prototype, 'capacity');
IsNotEmpty()(Room.prototype, 'capacity');

Column({
    type: "enum",
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE
})(Room.prototype, 'status');
IsEnum(RoomStatus)(Room.prototype, 'status');

Column({ nullable: true })(Room.prototype, 'description');
IsString()(Room.prototype, 'description');

OneToMany(() => Booking, booking => booking.room)(Room.prototype, 'bookings');
OneToMany(() => Stay, stay => stay.room)(Room.prototype, 'stays');
OneToMany(() => Review, review => review.room)(Room.prototype, 'reviews');

CreateDateColumn()(Room.prototype, 'createdAt');
UpdateDateColumn()(Room.prototype, 'updatedAt');

module.exports = { Room, RoomType, RoomStatus }; 