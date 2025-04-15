import jwt from "jsonwebtoken";
import { UserRole } from "../entities/User";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const generateToken = (userId: number, role: UserRole): string => {
    return jwt.sign(
        { id: userId, role },
        JWT_SECRET,
    );
};

export const verifyToken = (token: string): { id: number; role: UserRole } => {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: UserRole };
    return decoded;
};