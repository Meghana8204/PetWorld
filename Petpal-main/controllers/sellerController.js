// 📁 controllers/sellerController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/sellerModel.js";
import Pet from "../models/petModel.js";
import Order from "../models/orderModel.js";

/* =====================================================
   🔐 SELLER LOGIN
===================================================== */
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 🔍 Check if seller exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      console.warn(`⚠️ Login failed — seller not found: ${email}`);
      return res.status(400).json({ message: "Seller not found" });
    }

    // 🔐 Validate password (supports both hashed & plain)
    let isMatch = false;
    if (seller.password.startsWith("$2a$") || seller.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, seller.password);
    } else {
      isMatch = password === seller.password;
    }

    if (!isMatch) {
      console.warn(`⚠️ Invalid credentials for: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🧾 Generate JWT token
    const token = generateToken(seller._id, "seller");

    // ✅ Success response
    res.status(200).json({
      success: true,
      message: "Seller logged in successfully ✅",
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        shopName: seller.shopName || "",
        role: seller.role || "seller",
      },
      token,
    });

    console.log(`✅ Seller logged in successfully: ${email}`);
  } catch (error) {
    console.error("❌ Seller Login Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =====================================================
   📊 SELLER ANALYTICS (REAL DATA)
===================================================== */
export const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // 1️⃣ Fetch all approved pets by this seller
    const pets = await Pet.find({ seller: sellerId, status: "approved" });

    // 2️⃣ Get all completed (Paid) orders that include seller’s pets
    const orders = await Order.find({
      "items.pet": { $in: pets.map((p) => p._id) },
      paymentStatus: "Paid",
    }).populate("items.pet", "name price");

    // 3️⃣ Calculate total sales & revenue
    let totalSales = 0;
    let totalRevenue = 0;
    const productSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (pets.some((p) => p._id.equals(item.pet._id))) {
          totalSales += item.quantity;
          totalRevenue += item.pet.price * item.quantity;
          productSales[item.pet.name] =
            (productSales[item.pet.name] || 0) + item.quantity;
        }
      });
    });

    // 4️⃣ Determine best-selling pet
    const bestSelling =
      Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    // 5️⃣ Monthly sales trend
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      sales: 0,
      revenue: 0,
    }));

    orders.forEach((order) => {
      const monthIndex = new Date(order.createdAt).getMonth();
      let orderRevenue = 0;
      order.items.forEach((item) => {
        if (pets.some((p) => p._id.equals(item.pet._id))) {
          orderRevenue += item.pet.price * item.quantity;
          monthlyData[monthIndex].sales += item.quantity;
        }
      });
      monthlyData[monthIndex].revenue += orderRevenue;
    });

    res.status(200).json({
      success: true,
      totalSales,
      totalRevenue,
      bestSelling,
      monthlyData,
    });
  } catch (error) {
    console.error("❌ Seller analytics error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};

/* =====================================================
   🧾 GET SELLER’S PETS
===================================================== */
export const getMyPets = async (req, res) => {
  try {
    const sellerId = req.user?._id;
    const pets = await Pet.find({ seller: sellerId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, pets });
  } catch (error) {
    console.error("❌ Error fetching seller pets:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller pets",
      error: error.message,
    });
  }
};

/* =====================================================
   🐾 ADD NEW PET (By Seller)
===================================================== */
export const addPet = async (req, res) => {
  try {
    const sellerId = req.user?._id;
    const { name, category, price, offerPrice, description, image } = req.body;

    if (!name || !category || !price || !image) {
      return res
        .status(400)
        .json({ message: "Name, category, price, and image are required" });
    }

    const pet = await Pet.create({
      name,
      category,
      price,
      offerPrice,
      description,
      image,
      seller: sellerId,
      status: "pending", // admin must approve
    });

    res.status(201).json({
      success: true,
      message: "Pet added successfully and pending admin approval 🐾",
      pet,
    });
  } catch (error) {
    console.error("❌ Error adding pet:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add pet",
      error: error.message,
    });
  }
};

/* =====================================================
   🔑 TOKEN GENERATOR
===================================================== */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
