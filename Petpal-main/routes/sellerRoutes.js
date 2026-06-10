// 📁 routes/sellerRoutes.js
import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

// 🧩 Controllers
import {
  addPet,
  getSellerPets,
  getApprovedPetsByCategory, // ✅ public fetch for users
} from "../controllers/petController.js";
import { updateSellerPet, deleteSellerPet } from "../controllers/petController.js";

import {
  loginSeller,
  getSellerAnalytics,
  getMyPets, // ✅ replaced alias for consistency
} from "../controllers/sellerController.js";

const router = express.Router();

/* =====================================================
   🔐 AUTH & SELLER OPERATIONS
===================================================== */

// 🧑‍💼 Seller Login (Public)
router.post("/login", loginSeller);

// 🐾 Add new pet (Protected + Cloudinary upload)
router.post("/add-pet", protect, upload.single("image"), addPet);

// ✏️ Update a seller pet (Protected)
router.put(
  "/my-pets/:id",
  protect,
  upload.single("image"),
  updateSellerPet
);

// 🗑️ Delete a seller pet (Protected)
router.delete("/my-pets/:id", protect, deleteSellerPet);

// 🧾 Fetch seller’s uploaded pets (Protected)
router.get("/my-pets", protect, getMyPets);

// 📊 Seller Analytics Dashboard (Protected)
router.get("/analytics", protect, getSellerAnalytics);

/* =====================================================
   🐕 PUBLIC ROUTES (Visible to all users)
===================================================== */

// ✅ Fetch all approved pets, optionally filtered by category
// Example: GET /api/sellers/approved?category=Dog
router.get("/approved", getApprovedPetsByCategory);

/* =====================================================
   🧪 HEALTH CHECK / TEST ROUTE
===================================================== */
router.get("/", (req, res) => {
  res.json({ message: "✅ Seller route working properly 🧑‍💼" });
});

export default router;
