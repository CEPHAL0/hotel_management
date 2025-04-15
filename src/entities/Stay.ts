import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from "typeorm";
import { IsNotEmpty, IsDate, IsNumber, IsEnum } from "class-validator";
import { User } from "./User";
import { Room } from "./Room";

export enum StayStatus {
    ACTIVE = "active",
    COMPLETED = "completed"
}

@Entity()
export class Stay extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.stays)
    user!: User;

    @ManyToOne(() => Room, room => room.stays)
    room!: Room;

    @Column()
    @IsDate()
    @IsNotEmpty()
    startDate!: Date;

    @Column()
    @IsDate()
    @IsNotEmpty()
    endDate!: Date;

    @Column()
    @IsNumber()
    @IsNotEmpty()
    totalDays!: number;

    @Column({
        type: "enum",
        enum: StayStatus,
        default: StayStatus.ACTIVE
    })
    @IsEnum(StayStatus)
    status!: StayStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 