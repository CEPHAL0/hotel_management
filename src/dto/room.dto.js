const { IsNotEmpty, IsString, IsNumber, Min, IsEnum, IsOptional } = require("class-validator");
const { RoomType, RoomStatus } = require("../entities/Room");

class CreateRoomDto {
    constructor() {
        this.roomNumber = '';
        this.type = null;
        this.price = 0;
        this.capacity = 0;
        this.status = null;
        this.description = '';
    }
}

class UpdateRoomDto {
    constructor() {
        this.roomNumber = null;
        this.type = null;
        this.price = null;
        this.capacity = null;
        this.status = null;
        this.description = '';
    }
}

class UpdateRoomStatusDto {
    constructor() {
        this.status = null;
    }
}

// Add validation decorators
const createRoomDto = new CreateRoomDto();
const updateRoomDto = new UpdateRoomDto();
const updateRoomStatusDto = new UpdateRoomStatusDto();

// CreateRoomDto validations
IsNotEmpty()(CreateRoomDto.prototype, 'roomNumber');
IsString()(CreateRoomDto.prototype, 'roomNumber');

IsEnum(RoomType)(CreateRoomDto.prototype, 'type');
IsNotEmpty()(CreateRoomDto.prototype, 'type');

IsNumber()(CreateRoomDto.prototype, 'price');
Min(0)(CreateRoomDto.prototype, 'price');
IsNotEmpty()(CreateRoomDto.prototype, 'price');

IsNumber()(CreateRoomDto.prototype, 'capacity');
Min(1)(CreateRoomDto.prototype, 'capacity');
IsNotEmpty()(CreateRoomDto.prototype, 'capacity');

IsEnum(RoomStatus)(CreateRoomDto.prototype, 'status');
IsOptional()(CreateRoomDto.prototype, 'status');

IsString()(CreateRoomDto.prototype, 'description');
IsOptional()(CreateRoomDto.prototype, 'description');

// UpdateRoomDto validations
IsString()(UpdateRoomDto.prototype, 'roomNumber');
IsOptional()(UpdateRoomDto.prototype, 'roomNumber');

IsEnum(RoomType)(UpdateRoomDto.prototype, 'type');
IsOptional()(UpdateRoomDto.prototype, 'type');

IsNumber()(UpdateRoomDto.prototype, 'price');
Min(0)(UpdateRoomDto.prototype, 'price');
IsOptional()(UpdateRoomDto.prototype, 'price');

IsNumber()(UpdateRoomDto.prototype, 'capacity');
Min(1)(UpdateRoomDto.prototype, 'capacity');
IsOptional()(UpdateRoomDto.prototype, 'capacity');

IsEnum(RoomStatus)(UpdateRoomDto.prototype, 'status');
IsOptional()(UpdateRoomDto.prototype, 'status');

IsString()(UpdateRoomDto.prototype, 'description');
IsOptional()(UpdateRoomDto.prototype, 'description');

// UpdateRoomStatusDto validations
IsEnum(RoomStatus)(UpdateRoomStatusDto.prototype, 'status');
IsNotEmpty()(UpdateRoomStatusDto.prototype, 'status');

module.exports = {
    CreateRoomDto,
    UpdateRoomDto,
    UpdateRoomStatusDto
}; 