const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } = require("typeorm");
const { IsNotEmpty, IsNumber, IsString, Min, Max, Length } = require("class-validator");
const { User } = require("./User");
const { Room } = require("./Room");

@Entity()
class Review extends BaseEntity {
    constructor() {
        super();
    }
}

PrimaryGeneratedColumn()(Review.prototype, 'id');

ManyToOne(() => User, user => user.reviews)(Review.prototype, 'user');
ManyToOne(() => Room, room => room.reviews)(Review.prototype, 'room');

Column()(Review.prototype, 'rating');
IsNumber()(Review.prototype, 'rating');
Min(1)(Review.prototype, 'rating');
Max(5)(Review.prototype, 'rating');
IsNotEmpty()(Review.prototype, 'rating');

Column()(Review.prototype, 'comment');
IsString()(Review.prototype, 'comment');
Length(10, 500)(Review.prototype, 'comment');
IsNotEmpty()(Review.prototype, 'comment');

CreateDateColumn()(Review.prototype, 'createdAt');
UpdateDateColumn()(Review.prototype, 'updatedAt');

module.exports = { Review }; 