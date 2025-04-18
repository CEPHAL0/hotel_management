const { IsEmail, IsNotEmpty, MinLength, IsString } = require("class-validator");

class LoginDto {
    constructor() {
        this.email = '';
        this.password = '';
    }
}

class RegisterDto {
    constructor() {
        this.name = '';
        this.email = '';
        this.password = '';
    }
}

// Add validation decorators
const loginDto = new LoginDto();
const registerDto = new RegisterDto();

// LoginDto validations
IsEmail()(LoginDto.prototype, 'email');
IsNotEmpty()(LoginDto.prototype, 'email');

IsString()(LoginDto.prototype, 'password');
IsNotEmpty()(LoginDto.prototype, 'password');
MinLength(6)(LoginDto.prototype, 'password');

// RegisterDto validations
IsString()(RegisterDto.prototype, 'name');
IsNotEmpty()(RegisterDto.prototype, 'name');

IsEmail()(RegisterDto.prototype, 'email');
IsNotEmpty()(RegisterDto.prototype, 'email');

IsString()(RegisterDto.prototype, 'password');
IsNotEmpty()(RegisterDto.prototype, 'password');
MinLength(6)(RegisterDto.prototype, 'password');

module.exports = {
    LoginDto,
    RegisterDto
}; 