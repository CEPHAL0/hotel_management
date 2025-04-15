import { IsNotEmpty, IsNumber, IsString, Min, Max, Length } from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;

    @IsNotEmpty()
    @IsString()
    @Length(10, 500)
    comment!: string;
}

export class UpdateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;

    @IsNotEmpty()
    @IsString()
    @Length(10, 500)
    comment!: string;
} 