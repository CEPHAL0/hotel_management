import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Booking } from "./Booking";
import { Stay } from "./Stay";
import { Review } from "./Review";
import { Payment } from "./Payment";

export enum UserRole {
    ADMIN = "admin",
    USER = "user"
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty()
    name!: string;

    @Column({ unique: true })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @Column()
    @MinLength(6)
    @IsNotEmpty()
    password!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    @OneToMany(() => Booking, booking => booking.user)
    bookings!: Booking[];

    @OneToMany(() => Stay, stay => stay.user)
    stays!: Stay[];

    @OneToMany(() => Review, review => review.user)
    reviews!: Review[];

    @OneToMany(() => Payment, payment => payment.user)
    payments!: Payment[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 