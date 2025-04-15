import { IsNotEmpty, IsDate, Min, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { BookingStatus } from "../entities/Booking";

export class CreateBookingDto {
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    checkInDate!: Date;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    checkOutDate!: Date;

    @IsNotEmpty()
    @Min(1)
    guests!: number;
}

export class UpdateBookingDto {
    @IsNotEmpty()
    @IsEnum(BookingStatus)
    status!: BookingStatus;
}

export class UpdateBookingStatusDto {
    @IsNotEmpty()
    @IsEnum(BookingStatus)
    status!: BookingStatus;
} 