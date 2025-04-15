import { Request, Response } from "express";
import { User } from "../entities/User";
import { UserRole } from "../entities/User";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";
import { AppError } from "../middleware/error.middleware";
import { LoginDto, RegisterDto } from "../dto/auth.dto";

export class AuthController {
    static async login(req: Request, res: Response) {
        const { email, password } = req.body as LoginDto;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        const token = generateToken(user.id, user.role);
        res.json({ 
            status: 'success',
            data: { 
                token, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    role: user.role 
                } 
            }
        });
    }

    static async register(req: Request, res: Response) {
        const { name, email, password } = req.body as RegisterDto;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new AppError("Email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = User.create({
            name,
            email,
            password: hashedPassword,
            role: UserRole.USER
        });

        await user.save();
        
        const token = generateToken(user.id, user.role);
        res.status(201).json({ 
            status: 'success',
            data: { 
                token, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    role: user.role 
                } 
            }
        });
    }
} 