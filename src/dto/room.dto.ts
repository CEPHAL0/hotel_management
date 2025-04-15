import { IsNotEmpty, IsString, IsNumber, Min, IsEnum, IsOptional } from "class-validator";
import { RoomType, RoomStatus } from "../entities/Room";

export class CreateRoomDto {
    @IsNotEmpty()
    @IsString()
    roomNumber!: string;

    @IsEnum(RoomType)
    @IsNotEmpty()
    type!: RoomType;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    price!: number;

    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    capacity!: number;

    @IsEnum(RoomStatus)
    @IsOptional()
    status?: RoomStatus;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateRoomDto {
    @IsString()
    @IsOptional()
    roomNumber?: string;

    @IsEnum(RoomType)
    @IsOptional()
    type?: RoomType;

    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    capacity?: number;

    @IsEnum(RoomStatus)
    @IsOptional()
    status?: RoomStatus;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateRoomStatusDto {
    @IsEnum(RoomStatus)
    @IsNotEmpty()
    status!: RoomStatus;
} 