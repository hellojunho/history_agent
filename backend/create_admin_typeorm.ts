import { initializeDatabase } from "./src/data-source";
import { User } from "./src/entities/User";
import * as bcrypt from "bcrypt";

async function createAdmin() {
    try {
        console.log("Initializing database and syncing tables...");
        const dataSource = await initializeDatabase();
        
        console.log("Database initialized. Creating admin user...");
        const userRepository = dataSource.getRepository(User);
        
        const hash = await bcrypt.hash("admin", 10);
        
        let adminUser = await userRepository.findOneBy({ email: "admin@admin.com" });
        
        if (adminUser) {
            adminUser.passwordHash = hash;
            adminUser.role = "admin";
        } else {
            adminUser = userRepository.create({
                email: "admin@admin.com",
                passwordHash: hash,
                role: "admin",
            });
        }
        
        await userRepository.save(adminUser);
        console.log("✅ Admin account (admin@admin.com / admin) created successfully.");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating admin account:", err);
        process.exit(1);
    }
}

createAdmin();
