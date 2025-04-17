const { IsNotEmpty, IsEnum } = require("class-validator");
const { StayStatus } = require("../entities/Stay");

class UpdateStayStatusDto {
    constructor() {
        this.status = null;
    }
}

// Add validation decorators
const updateStayStatusDto = new UpdateStayStatusDto();

// UpdateStayStatusDto validations
IsNotEmpty()(UpdateStayStatusDto.prototype, 'status');
IsEnum(StayStatus)(UpdateStayStatusDto.prototype, 'status');

module.exports = {
    UpdateStayStatusDto
}; 