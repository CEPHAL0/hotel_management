const { AppDataSource } = require("../config/database");
const { User, UserRole } = require("../entities/User");
const { AppError } = require("../middleware/error.middleware");
const bcrypt = require("bcrypt");
const { validate } = require("class-validator");
const { plainToClass } = require("class-transformer");
const { CreateAdminDto, UpdateAdminDto } = require("../dto/admin.dto");

class AdminController {
    // Get all admin users
    static async getAllAdmins(req, res, next) {
        try {
            const userRepository = AppDataSource.getRepository(User);

            const admins = await userRepository.find({
                where: { role: UserRole.ADMIN },
                select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
            });

            res.json({
                status: 'success',
                data: admins
            });
        } catch (error) {
            next(error);
        }
    }

    // Create a new admin user
    static async createAdmin(req, res, next) {
        try {
            const createAdminDto = plainToClass(CreateAdminDto, req.body);
            const errors = await validate(createAdminDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => {
                    return {
                        field: error.property,
                        message: Object.values(error.constraints || {}).join(', ')
                    };
                });
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages
                });
            }

            const { name, email, password } = createAdminDto;

            const userRepository = AppDataSource.getRepository(User);

            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = userRepository.create({
                name,
                email,
                password: hashedPassword,
                role: UserRole.ADMIN
            });

            await userRepository.save(admin);

            res.status(201).json({
                status: 'success',
                data: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Update an admin user
    static async updateAdmin(req, res, next) {
        try {
            const { id } = req.params;
            const updateAdminDto = plainToClass(UpdateAdminDto, req.body);
            const errors = await validate(updateAdminDto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => {
                    return {
                        field: error.property,
                        message: Object.values(error.constraints || {}).join(', ')
                    };
                });
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages
                });
            }

            const { name, email } = updateAdminDto;

            const userRepository = AppDataSource.getRepository(User);

            const admin = await userRepository.findOne({
                where: { id: parseInt(id), role: UserRole.ADMIN }
            });

            if (!admin) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Admin user not found'
                });
            }

            if (email && email !== admin.email) {
                const existingUser = await userRepository.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Email already exists'
                    });
                }
                admin.email = email;
            }

            if (name) {
                admin.name = name;
            }

            await userRepository.save(admin);

            res.json({
                status: 'success',
                data: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete an admin user
    static async deleteAdmin(req, res, next) {
        try {
            const { id } = req.params;

            const userRepository = AppDataSource.getRepository(User);

            // Check if this is the last admin
            const adminCount = await userRepository.count({ where: { role: UserRole.ADMIN } });
            if (adminCount <= 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cannot delete the last admin user'
                });
            }

            const admin = await userRepository.findOne({
                where: { id: parseInt(id), role: UserRole.ADMIN }
            });

            if (!admin) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Admin user not found'
                });
            }

            await userRepository.remove(admin);

            res.json({
                status: 'success',
                message: 'Admin user deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;
