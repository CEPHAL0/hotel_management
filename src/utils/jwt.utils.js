const jwt = require("jsonwebtoken");
const { UserRole } = require("../entities/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        JWT_SECRET,
    );
};

const verifyToken = (token) => {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
};

module.exports = { generateToken, verifyToken }; 