import { User } from "../entities/User";
import { UserRole } from "../entities/User";
import bcrypt from "bcrypt";

export const createAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || "hotel.manager.islington@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = User.create({
            name: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: UserRole.ADMIN
        });
        
        await admin.save();
        console.log("Admin user created successfully");
    }
}; 