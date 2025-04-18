const { validate } = require("class-validator");
const { plainToClass } = require("class-transformer");
const { ValidationError } = require("class-validator");
const { AppError } = require("./error.middleware");

const validateRequest = (dtoClass) => {
    return async (req, res, next) => {
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
                error.errors = errorMessages;
                throw error;
            }

            req.body = dto;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { validateRequest }; 