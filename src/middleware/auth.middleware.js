const { AppError } = require("./error.middleware");
const jwt = require("jsonwebtoken");
const { User, UserRole } = require("../entities/User");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new AppError("Authentication required", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== UserRole.ADMIN) {
        throw new AppError("Access denied. Admin role required.", 403);
    }
    next();
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    requireAdmin,
    authorize
}; 