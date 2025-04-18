const { IsNotEmpty, IsNumber, IsString, Min, Max, Length } = require("class-validator");

class CreateReviewDto {
    constructor() {
        this.rating = 0;
        this.comment = '';
    }
}

class UpdateReviewDto {
    constructor() {
        this.rating = 0;
        this.comment = '';
    }
}

// Add validation decorators
const createReviewDto = new CreateReviewDto();
const updateReviewDto = new UpdateReviewDto();

// CreateReviewDto validations
IsNotEmpty()(CreateReviewDto.prototype, 'rating');
IsNumber()(CreateReviewDto.prototype, 'rating');
Min(1)(CreateReviewDto.prototype, 'rating');
Max(5)(CreateReviewDto.prototype, 'rating');

IsNotEmpty()(CreateReviewDto.prototype, 'comment');
IsString()(CreateReviewDto.prototype, 'comment');
Length(10, 500)(CreateReviewDto.prototype, 'comment');

// UpdateReviewDto validations
IsNotEmpty()(UpdateReviewDto.prototype, 'rating');
IsNumber()(UpdateReviewDto.prototype, 'rating');
Min(1)(UpdateReviewDto.prototype, 'rating');
Max(5)(UpdateReviewDto.prototype, 'rating');

IsNotEmpty()(UpdateReviewDto.prototype, 'comment');
IsString()(UpdateReviewDto.prototype, 'comment');
Length(10, 500)(UpdateReviewDto.prototype, 'comment');

module.exports = {
    CreateReviewDto,
    UpdateReviewDto
}; 