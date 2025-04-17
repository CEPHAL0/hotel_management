const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } = require("typeorm");
const { Booking } = require("./Booking");
const { User } = require("./User");

const PaymentStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

@Entity()
class Payment extends BaseEntity {
    constructor() {
        super();
    }
}

PrimaryGeneratedColumn()(Payment.prototype, 'id');
Column()(Payment.prototype, 'amount');
Column()(Payment.prototype, 'currency');
Column()(Payment.prototype, 'stripePaymentId');

Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
})(Payment.prototype, 'status');

ManyToOne(() => Booking, booking => booking.payments)(Payment.prototype, 'booking');
ManyToOne(() => User, user => user.payments)(Payment.prototype, 'user');

CreateDateColumn()(Payment.prototype, 'createdAt');
UpdateDateColumn()(Payment.prototype, 'updatedAt');

module.exports = { Payment, PaymentStatus }; 