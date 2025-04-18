const { IsEmail, IsNotEmpty, IsString, MinLength, Matches } = require("class-validator");

class CreateAdminDto {
    constructor() {
        this.name = '';
        this.email = '';
        this.password = '';
    }
}

class UpdateAdminDto {
    constructor() {
        this.name = '';
        this.email = '';
    }
}

// Add validation decorators
const createAdminDto = new CreateAdminDto();
const updateAdminDto = new UpdateAdminDto();

// CreateAdminDto validations
IsString()(CreateAdminDto.prototype, 'name');
IsNotEmpty({ message: "Name is required" })(CreateAdminDto.prototype, 'name');
MinLength(2, { message: "Name must be at least 2 characters long" })(CreateAdminDto.prototype, 'name');

IsEmail({}, { message: "Please provide a valid email address" })(CreateAdminDto.prototype, 'email');
IsNotEmpty({ message: "Email is required" })(CreateAdminDto.prototype, 'email');

IsString()(CreateAdminDto.prototype, 'password');
IsNotEmpty({ message: "Password is required" })(CreateAdminDto.prototype, 'password');
MinLength(8, { message: "Password must be at least 8 characters long" })(CreateAdminDto.prototype, 'password');

// UpdateAdminDto validations
IsString()(UpdateAdminDto.prototype, 'name');
IsNotEmpty({ message: "Name is required" })(UpdateAdminDto.prototype, 'name');
MinLength(2, { message: "Name must be at least 2 characters long" })(UpdateAdminDto.prototype, 'name');

IsEmail({}, { message: "Please provide a valid email address" })(UpdateAdminDto.prototype, 'email');
IsNotEmpty({ message: "Email is required" })(UpdateAdminDto.prototype, 'email');

module.exports = {
    CreateAdminDto,
    UpdateAdminDto
}; 