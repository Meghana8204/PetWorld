import bcrypt from "bcryptjs";
import Admin from "../models/adminModel.js";

export const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD is missing; skipping admin seed.");
    return;
  }

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin already exists for ${email}; skipping seed.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    name: "Admin",
    email,
    password: hashedPassword,
    confirmPassword: hashedPassword,
    role: "admin",
  });

  console.log(`Seeded default admin: ${email}`);
};
