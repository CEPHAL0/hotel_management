const { IsNotEmpty, IsDate, Min, IsEnum } = require("class-validator");
const { Type } = require("class-transformer");
const { BookingStatus } = require("../entities/Booking");

class CreateBookingDto {
    constructor() {
        this.checkInDate = null;
        this.checkOutDate = null;
        this.guests = 0;
    }
}

class UpdateBookingDto {
    constructor() {
        this.status = null;
    }
}

class UpdateBookingStatusDto {
    constructor() {
        this.status = null;
    }
}

// Add validation decorators
const createBookingDto = new CreateBookingDto();
const updateBookingDto = new UpdateBookingDto();
const updateBookingStatusDto = new UpdateBookingStatusDto();

// CreateBookingDto validations
IsNotEmpty()(CreateBookingDto.prototype, 'checkInDate');
IsDate()(CreateBookingDto.prototype, 'checkInDate');
Type(() => Date)(CreateBookingDto.prototype, 'checkInDate');

IsNotEmpty()(CreateBookingDto.prototype, 'checkOutDate');
IsDate()(CreateBookingDto.prototype, 'checkOutDate');
Type(() => Date)(CreateBookingDto.prototype, 'checkOutDate');

IsNotEmpty()(CreateBookingDto.prototype, 'guests');
Min(1)(CreateBookingDto.prototype, 'guests');

// UpdateBookingDto validations
IsNotEmpty()(UpdateBookingDto.prototype, 'status');
IsEnum(BookingStatus)(UpdateBookingDto.prototype, 'status');

// UpdateBookingStatusDto validations
IsNotEmpty()(UpdateBookingStatusDto.prototype, 'status');
IsEnum(BookingStatus)(UpdateBookingStatusDto.prototype, 'status');

module.exports = {
    CreateBookingDto,
    UpdateBookingDto,
    UpdateBookingStatusDto
}; 