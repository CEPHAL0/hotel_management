const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity, OneToMany } = require("typeorm");
const { IsNotEmpty, IsNumber, IsDate, Min, IsEnum } = require("class-validator");
const { User } = require("./User");
const { Room } = require("./Room");
const { Payment } = require("./Payment");

const BookingStatus = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    COMPLETED: "completed"
};

@Entity()
class Booking extends BaseEntity {
    constructor() {
        super();
    }
}

PrimaryGeneratedColumn()(Booking.prototype, 'id');

ManyToOne(() => User, user => user.bookings)(Booking.prototype, 'user');
ManyToOne(() => Room, room => room.bookings)(Booking.prototype, 'room');

Column()(Booking.prototype, 'checkInDate');
IsDate()(Booking.prototype, 'checkInDate');
IsNotEmpty()(Booking.prototype, 'checkInDate');

Column()(Booking.prototype, 'checkOutDate');
IsDate()(Booking.prototype, 'checkOutDate');
IsNotEmpty()(Booking.prototype, 'checkOutDate');

Column()(Booking.prototype, 'guests');
IsNumber()(Booking.prototype, 'guests');
Min(1)(Booking.prototype, 'guests');
IsNotEmpty()(Booking.prototype, 'guests');

Column()(Booking.prototype, 'totalPrice');
IsNumber()(Booking.prototype, 'totalPrice');
Min(0)(Booking.prototype, 'totalPrice');
IsNotEmpty()(Booking.prototype, 'totalPrice');

Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING
})(Booking.prototype, 'status');
IsEnum(BookingStatus)(Booking.prototype, 'status');

OneToMany(() => Payment, payment => payment.booking)(Booking.prototype, 'payments');

CreateDateColumn()(Booking.prototype, 'createdAt');
UpdateDateColumn()(Booking.prototype, 'updatedAt');

module.exports = { Booking, BookingStatus }; 