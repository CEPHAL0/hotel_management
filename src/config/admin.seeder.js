const { AppDataSource } = require("../config/database");
const { User, UserRole } = require("../entities/User");
const bcrypt = require("bcrypt");

const createAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || "hotel.manager.islington@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    try {
        // Get the User repository using AppDataSource
        const userRepository = AppDataSource.getRepository(User);

        // Check if an admin already exists
        const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            // Hash the admin password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Create a new admin user
            const admin = userRepository.create({
                name: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.ADMIN
            });

            // Save the admin user to the database
            await userRepository.save(admin);
            console.log("Admin user created successfully");
        }
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
};

module.exports = {
    createAdminUser
};
