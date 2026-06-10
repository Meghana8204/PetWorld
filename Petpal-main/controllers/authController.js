import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Seller from "../models/sellerModel.js";
import User from "../models/userModel.js";

/* =====================================================
   🔐 JWT TOKEN GENERATOR
===================================================== */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

/* =====================================================
   🧍 USER REGISTRATION (CUSTOMER ONLY)
===================================================== */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error("❌ Register Error:", error.message);
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

/* =====================================================
   🚪 UNIVERSAL LOGIN (ADMIN | SELLER | USER)
===================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    console.log("🟡 Login attempt:", email);

    /* ===================== ADMIN ===================== */
    const admin = await Admin.findOne({ email });
      console.log("Admin login: entered email:", email);
      console.log("Admin login: found admin:", admin);
    if (admin) {
        console.log("Admin login: entered password:", password);
        console.log("Admin login: hashed password from DB:", admin.password);
      const isMatch = await bcrypt.compare(password, admin.password);
        console.log("Admin login: bcrypt isMatch:", isMatch);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      console.log("✅ Admin login success");
      return res.status(200).json({
        _id: admin._id,
        email: admin.email,
        role: "admin",
        token: generateToken(admin._id, "admin"),
      });
    }

    /* ===================== SELLER ===================== */
      // Debug: log all sellers to verify collection
      const allSellers = await Seller.find({});
      console.log("All sellers:", allSellers.map(s => s.email));
    const seller = await Seller.findOne({ email });
    if (seller) {
      console.log("[SELLER LOGIN] Entered password:", password);
      console.log("[SELLER LOGIN] Hashed password from DB:", seller.password);
      const isMatch = await bcrypt.compare(password, seller.password);
      console.log("[SELLER LOGIN] bcrypt isMatch:", isMatch);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      console.log("✅ Seller login success");
      return res.status(200).json({
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: "seller",
        token: generateToken(seller._id, "seller"),
      });
    }

    /* ===================== USER ===================== */
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      console.log("✅ User login success");
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    }

    /* ===================== NOT FOUND ===================== */
    return res.status(401).json({
      message: "Invalid email or password",
    });

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};
