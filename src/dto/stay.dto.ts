import { IsNotEmpty, IsEnum } from "class-validator";
import { StayStatus } from "../entities/Stay";

export class UpdateStayStatusDto {
    @IsNotEmpty()
    @IsEnum(StayStatus)
    status!: StayStatus;
} 