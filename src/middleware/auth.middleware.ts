import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { UserRole } from "../entities/User";

interface AuthRequest extends Request {
    user?: User;
}

interface JwtPayload {
    id: number;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new AppError("Authentication required", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        const user = await User.findOne({ where: { id: decoded.id } });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== UserRole.ADMIN) {
        throw new AppError("Access denied. Admin role required.", 403);
    }
    next();
};

export const authorize = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    };
}; 