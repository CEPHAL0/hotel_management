const { User, UserRole } = require("../entities/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt.utils");
const { AppError } = require("../middleware/error.middleware");
const { LoginDto, RegisterDto } = require("../dto/auth.dto");

class AuthController {
    static async login(req, res) {
        const { email, password } = req.body;
        
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

    static async register(req, res) {
        const { name, email, password } = req.body;
        
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

module.exports = { AuthController }; 