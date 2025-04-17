import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from "class-validator";

export class CreateAdminDto {
    @IsString()
    @IsNotEmpty({ message: "Name is required" })
    @MinLength(2, { message: "Name must be at least 2 characters long" })
    name: string;

    @IsEmail({}, { message: "Please provide a valid email address" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password: string;
}

export class UpdateAdminDto {
    @IsString()
    @IsNotEmpty({ message: "Name is required" })
    @MinLength(2, { message: "Name must be at least 2 characters long" })
    name: string;

    @IsEmail({}, { message: "Please provide a valid email address" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;
} 