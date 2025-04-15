import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ValidationError } from "class-validator";
import { AppError } from "./error.middleware";

export const validateRequest = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = plainToClass(dtoClass, req.body);
            const errors = await validate(dto, {
                whitelist: true,
                forbidNonWhitelisted: true
            });

            if (errors.length > 0) {
                const errorMessages = errors.map(error => ({
                    field: error.property,
                    message: Object.values(error.constraints || {}).join(', ')
                }));

                const error = new AppError("Validation failed", 400);
                (error as any).errors = errorMessages;
                throw error;
            }

            req.body = dto;
            next();
        } catch (error) {
            next(error);
        }
    };
}; 