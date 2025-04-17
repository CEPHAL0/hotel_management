const { IsString, IsNotEmpty, MinLength, Matches } = require("class-validator");

class UpdateProfileDto {
    constructor() {
        this.name = '';
        this.email = '';
    }
}

class ChangePasswordDto {
    constructor() {
        this.currentPassword = '';
        this.newPassword = '';
    }
}

// Add validation decorators
const updateProfileDto = new UpdateProfileDto();
const changePasswordDto = new ChangePasswordDto();

// UpdateProfileDto validations
IsString()(UpdateProfileDto.prototype, 'name');
IsNotEmpty({ message: "Name is required" })(UpdateProfileDto.prototype, 'name');
MinLength(2, { message: "Name must be at least 2 characters long" })(UpdateProfileDto.prototype, 'name');

IsString()(UpdateProfileDto.prototype, 'email');
IsNotEmpty({ message: "Email is required" })(UpdateProfileDto.prototype, 'email');

// ChangePasswordDto validations
IsString()(ChangePasswordDto.prototype, 'currentPassword');
IsNotEmpty({ message: "Current password is required" })(ChangePasswordDto.prototype, 'currentPassword');

IsString()(ChangePasswordDto.prototype, 'newPassword');
IsNotEmpty({ message: "New password is required" })(ChangePasswordDto.prototype, 'newPassword');
MinLength(8, { message: "New password must be at least 8 characters long" })(ChangePasswordDto.prototype, 'newPassword');

module.exports = {
    UpdateProfileDto,
    ChangePasswordDto
}; 