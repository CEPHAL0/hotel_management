const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } = require("typeorm");
const { IsEmail, IsNotEmpty, MinLength } = require("class-validator");
const { Booking } = require("./Booking");
const { Stay } = require("./Stay");
const { Review } = require("./Review");
const { Payment } = require("./Payment");

const UserRole = {
    ADMIN: "admin",
    USER: "user"
};

@Entity()
class User extends BaseEntity {
    constructor() {
        super();
    }
}

PrimaryGeneratedColumn()(User.prototype, 'id');
Column()(User.prototype, 'name');
IsNotEmpty()(User.prototype, 'name');

Column({ unique: true })(User.prototype, 'email');
IsEmail()(User.prototype, 'email');
IsNotEmpty()(User.prototype, 'email');

Column()(User.prototype, 'password');
MinLength(6)(User.prototype, 'password');
IsNotEmpty()(User.prototype, 'password');

Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
})(User.prototype, 'role');

OneToMany(() => Booking, booking => booking.user)(User.prototype, 'bookings');
OneToMany(() => Stay, stay => stay.user)(User.prototype, 'stays');
OneToMany(() => Review, review => review.user)(User.prototype, 'reviews');
OneToMany(() => Payment, payment => payment.user)(User.prototype, 'payments');

CreateDateColumn()(User.prototype, 'createdAt');
UpdateDateColumn()(User.prototype, 'updatedAt');

module.exports = { User, UserRole }; 