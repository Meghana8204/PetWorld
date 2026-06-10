// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Seller from "../models/sellerModel.js";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID (check all 3 collections)
      req.user =
        (await Admin.findById(decoded.id).select("-password")) ||
        (await Seller.findById(decoded.id).select("-password")) ||
        (await User.findById(decoded.id).select("-password"));

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("❌ Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ✅ Only allow admins
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};
