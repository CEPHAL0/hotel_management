const { ValidationError } = require("class-validator");
const { QueryFailedError } = require("typeorm");

class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Handle ValidationError array
    if (Array.isArray(err) && err[0] instanceof ValidationError) {
        const errors = err.map(error => ({
            field: error.property,
            message: Object.values(error.constraints || {}).join(', ')
        }));

        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
    }

    // Handle AppError with additional errors property
    if (err instanceof AppError) {
        const response = {
            status: 'error',
            message: err.message
        };

        if (err.errors) {
            response.errors = err.errors;
        }

        return res.status(err.statusCode).json(response);
    }

    // Handle Database Errors
    if (err instanceof QueryFailedError) {
        // Handle unique constraint violations
        if (err.message.includes('duplicate key')) {
            return res.status(400).json({
                status: 'fail',
                message: 'Duplicate entry found',
                errors: [err.message]
            });
        }
        // Handle other database errors
        return res.status(500).json({
            status: 'error',
            message: 'Database error occurred',
            errors: [err.message]
        });
    }

    // Handle other errors
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};

module.exports = { AppError, errorHandler }; 