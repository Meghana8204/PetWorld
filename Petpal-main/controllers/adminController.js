// Admin Registration
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: "admin",
    });
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("❌ Admin Registration Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Seller from "../models/sellerModel.js";
import User from "../models/userModel.js";
import Pet from "../models/petModel.js";

/* =====================================================
   🧑‍💻 ADMIN LOGIN
===================================================== */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }
    // ✅ Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate token
    const token = generateToken(admin._id, admin.role);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (error) {
    console.error("❌ Admin Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =====================================================
   🧾 ADMIN CREATES A SELLER
===================================================== */
export const createSeller = async (req, res) => {
  try {
    const { name, email, password, shopName } = req.body;

    // ✅ Validate fields
    if (!name || !email || !password || !shopName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    // 🧾 Create new seller (let Mongoose pre-save hook hash password)
    console.log("[CREATE SELLER] Plain password:", password);
    const seller = await Seller.create({
      name,
      email,
      password, // plain password, NOT hashed
      shopName,
      role: "seller",
    });

    res.status(201).json({
      success: true,
      message: "✅ Seller created successfully",
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        shopName: seller.shopName,
        role: seller.role,
      },
    });
  } catch (error) {
    console.error("❌ Error creating seller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =====================================================
   🐾 PET MANAGEMENT — Admin Views
===================================================== */

// ⏳ Pending Pets (Awaiting Approval)
export const getPendingItems = async (req, res) => {
  try {
    const pendingPets = await Pet.find({ status: "pending" }).populate(
      "seller",
      "name email"
    );

    res.status(200).json({
      success: true,
      count: pendingPets.length,
      pendingPets,
    });
  } catch (error) {
    console.error("❌ Error fetching pending items:", error);
    res.status(500).json({
      message: "Error fetching pending items",
      error: error.message,
    });
  }
};

// ✅ Approved Pets
export const getApprovedItems = async (req, res) => {
  try {
    const approvedPets = await Pet.find({ status: "approved" }).populate(
      "seller",
      "name email"
    );

    res.status(200).json({
      success: true,
      count: approvedPets.length,
      approvedPets,
    });
  } catch (error) {
    console.error("❌ Error fetching approved items:", error);
    res.status(500).json({
      message: "Error fetching approved items",
      error: error.message,
    });
  }
};

// ❌ Rejected Pets
export const getRejectedItems = async (req, res) => {
  try {
    const rejectedPets = await Pet.find({ status: "rejected" }).populate(
      "seller",
      "name email"
    );

    res.status(200).json({
      success: true,
      count: rejectedPets.length,
      rejectedPets,
    });
  } catch (error) {
    console.error("❌ Error fetching rejected items:", error);
    res.status(500).json({
      message: "Error fetching rejected items",
      error: error.message,
    });
  }
};

/* =====================================================
   🧑‍💼 SELLER MANAGEMENT
===================================================== */
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password");
    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    console.error("❌ Error fetching sellers:", error);
    res.status(500).json({
      message: "Error fetching sellers",
      error: error.message,
    });
  }
};

/* =====================================================
   👥 USER MANAGEMENT
===================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

/* =====================================================
   🔐 TOKEN GENERATOR
===================================================== */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
