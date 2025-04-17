import { IsString, IsNotEmpty, MinLength, Matches } from "class-validator";

export class UpdateProfileDto {
    @IsString()
    @IsNotEmpty({ message: "Name is required" })
    @MinLength(2, { message: "Name must be at least 2 characters long" })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "Email is required" })
    email: string;
}

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: "Current password is required" })
    currentPassword: string;

    @IsString()
    @IsNotEmpty({ message: "New password is required" })
    @MinLength(8, { message: "New password must be at least 8 characters long" })
    newPassword: string;
}