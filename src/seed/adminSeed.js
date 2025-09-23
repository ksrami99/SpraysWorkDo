import bcrypt from "bcryptjs";
import { pool } from "../db/index.js";

const seedAdmin = async () => {
  try {
    const email = "admin@example.com";
    const password = "Admin@123"; // change this in production!
    const fullname = "Super Admin";

    // Check if admin already exists
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    await pool.query(
      `INSERT INTO users (email, password, fullname, role) VALUES (?, ?, ?, 'admin')`,
      [email, hashedPassword, fullname],
    );

    console.log("🎉 Admin user seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
