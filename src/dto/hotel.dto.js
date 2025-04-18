const { IsNotEmpty, IsString, IsOptional } = require("class-validator");

class CreateHotelDto {
    constructor() {
        this.name = '';
        this.city = '';
        this.address = '';
        this.description = '';
    }
}

class UpdateHotelDto {
    constructor() {
        this.name = null;
        this.city = null;
        this.address = null;
        this.description = null;
    }
}

// Add validation decorators
const createHotelDto = new CreateHotelDto();
const updateHotelDto = new UpdateHotelDto();

// CreateHotelDto validations
IsNotEmpty()(CreateHotelDto.prototype, 'name');
IsString()(CreateHotelDto.prototype, 'name');

IsNotEmpty()(CreateHotelDto.prototype, 'city');
IsString()(CreateHotelDto.prototype, 'city');

IsNotEmpty()(CreateHotelDto.prototype, 'address');
IsString()(CreateHotelDto.prototype, 'address');

IsString()(CreateHotelDto.prototype, 'description');
IsOptional()(CreateHotelDto.prototype, 'description');

// UpdateHotelDto validations
IsString()(UpdateHotelDto.prototype, 'name');
IsOptional()(UpdateHotelDto.prototype, 'name');

IsString()(UpdateHotelDto.prototype, 'city');
IsOptional()(UpdateHotelDto.prototype, 'city');

IsString()(UpdateHotelDto.prototype, 'address');
IsOptional()(UpdateHotelDto.prototype, 'address');

IsString()(UpdateHotelDto.prototype, 'description');
IsOptional()(UpdateHotelDto.prototype, 'description');

module.exports = {
    CreateHotelDto,
    UpdateHotelDto
}; 