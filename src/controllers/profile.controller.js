const { AppDataSource } = require("../config/database");
const { User } = require("../entities/User");
const { AppError } = require("../middleware/error.middleware");
const bcrypt = require("bcrypt");
const { validate } = require("class-validator");
const { plainToClass } = require("class-transformer");
const { UpdateProfileDto, ChangePasswordDto } = require("../dto/profile.dto");

class ProfileController {
    // Get user profile
    static async getProfile(req, res, next) {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const userId = req.user.id;

            const user = await userRepo.findOne({
                where: { id: userId },
                select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            res.json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    // Update user profile
    static async updateProfile(req, res, next) {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const userId = req.user.id;

            const updateProfileDto = plainToClass(UpdateProfileDto, req.body);
            const errors = await validate(updateProfileDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => ({
                    field: error.property,
                    message: Object.values(error.constraints || {}).join(', ')
                }));

                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages
                });
            }

            const { name, email } = updateProfileDto;

            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            if (email && email !== user.email) {
                const existingUser = await userRepo.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Email already exists'
                    });
                }
                user.email = email;
            }

            if (name) {
                user.name = name;
            }

            await userRepo.save(user);

            res.json({
                status: 'success',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Change password
    static async changePassword(req, res, next) {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const userId = req.user.id;

            const changePasswordDto = plainToClass(ChangePasswordDto, req.body);
            const errors = await validate(changePasswordDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => ({
                    field: error.property,
                    message: Object.values(error.constraints || {}).join(', ')
                }));

                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages
                });
            }

            const { currentPassword, newPassword } = changePasswordDto;

            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await userRepo.save(user);

            res.json({
                status: 'success',
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProfileController;
