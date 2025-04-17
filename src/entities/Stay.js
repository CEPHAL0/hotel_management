const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } = require("typeorm");
const { IsNotEmpty, IsDate, IsNumber, IsEnum } = require("class-validator");
const { User } = require("./User");
const { Room } = require("./Room");

const StayStatus = {
    ACTIVE: "active",
    COMPLETED: "completed"
};

@Entity()
class Stay extends BaseEntity {
    constructor() {
        super();
    }
}

PrimaryGeneratedColumn()(Stay.prototype, 'id');

ManyToOne(() => User, user => user.stays)(Stay.prototype, 'user');
ManyToOne(() => Room, room => room.stays)(Stay.prototype, 'room');

Column()(Stay.prototype, 'startDate');
IsDate()(Stay.prototype, 'startDate');
IsNotEmpty()(Stay.prototype, 'startDate');

Column()(Stay.prototype, 'endDate');
IsDate()(Stay.prototype, 'endDate');
IsNotEmpty()(Stay.prototype, 'endDate');

Column()(Stay.prototype, 'totalDays');
IsNumber()(Stay.prototype, 'totalDays');
IsNotEmpty()(Stay.prototype, 'totalDays');

Column({
    type: "enum",
    enum: StayStatus,
    default: StayStatus.ACTIVE
})(Stay.prototype, 'status');
IsEnum(StayStatus)(Stay.prototype, 'status');

CreateDateColumn()(Stay.prototype, 'createdAt');
UpdateDateColumn()(Stay.prototype, 'updatedAt');

module.exports = { Stay, StayStatus }; 