import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from "typeorm";
import { IsNotEmpty, IsNumber, IsString, Min, Max, Length } from "class-validator";
import { User } from "./User";
import { Room } from "./Room";

@Entity()
export class Review extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.reviews)
    user!: User;

    @ManyToOne(() => Room, room => room.reviews)
    room!: Room;

    @Column()
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rating!: number;

    @Column()
    @IsString()
    @Length(10, 500)
    @IsNotEmpty()
    comment!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 