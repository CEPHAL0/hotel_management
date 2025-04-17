const { AppDataSource } = require("../config/database");  // Import AppDataSource
const { User, UserRole } = require("../entities/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt.utils");
const { AppError } = require("../middleware/error.middleware");
const { LoginDto, RegisterDto } = require("../dto/auth.dto");

class AuthController {
    // User login
    static async login(req, res) {
        const { email, password } = req.body;
        
        // Get the User repository using AppDataSource
        const userRepository = AppDataSource.getRepository(User);
        
        // Use .findOneBy() to fetch the user by email
        const user = await userRepository.findOneBy({ email });
        
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

    // User registration
    static async register(req, res) {
        const { name, email, password } = req.body;
        
        // Get the User repository using AppDataSource
        const userRepository = AppDataSource.getRepository(User);
        
        // Check if user already exists
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            throw new AppError("Email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user
        const user = userRepository.create({
            name,
            email,
            password: hashedPassword,
            role: UserRole.USER
        });

        // Save the new user to the database
        await userRepository.save(user);
        
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

module.exports = { AuthController };
