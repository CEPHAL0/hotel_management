import { Request, Response, NextFunction } from "express";
import { User, UserRole } from "../entities/User";
import { AppError } from "../middleware/error.middleware";
import bcrypt from "bcrypt";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { CreateAdminDto, UpdateAdminDto } from "../dto/admin.dto";

export class AdminController {
    // Get all admin users
    static async getAllAdmins(req: Request, res: Response, next: NextFunction) {
        try {
            const admins = await User.find({
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
    static async createAdmin(req: Request, res: Response, next: NextFunction) {
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

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = User.create({
                name,
                email,
                password: hashedPassword,
                role: UserRole.ADMIN
            });

            await admin.save();

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
    static async updateAdmin(req: Request, res: Response, next: NextFunction) {
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

            const admin = await User.findOne({
                where: { id: parseInt(id), role: UserRole.ADMIN }
            });

            if (!admin) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Admin user not found'
                });
            }

            if (email && email !== admin.email) {
                const existingUser = await User.findOne({ where: { email } });
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

            await admin.save();

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
    static async deleteAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // Check if this is the last admin
            const adminCount = await User.count({ where: { role: UserRole.ADMIN } });
            if (adminCount <= 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cannot delete the last admin user'
                });
            }

            const admin = await User.findOne({
                where: { id: parseInt(id), role: UserRole.ADMIN }
            });

            if (!admin) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Admin user not found'
                });
            }

            await admin.remove();

            res.json({
                status: 'success',
                message: 'Admin user deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
} 