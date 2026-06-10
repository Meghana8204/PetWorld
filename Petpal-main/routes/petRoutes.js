// routes/sellerRoutes.js
import express from "express";
import {
  addPet,
  reviewPet,
  getApprovedPets,
  getSellerPets,
  getPetById,
} from "../controllers/petController.js";
import {
  loginSeller,
  getSellerAnalytics,
} from "../controllers/sellerController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

/* ============================================================
   🧩 SELLER AUTH ROUTES
============================================================ */

// 🔐 Seller Login
router.post("/login", loginSeller);

/* ============================================================
   🧩 SELLER ROUTES (Protected)
============================================================ */

// 🐾 Seller Adds New Pet / Product (with Cloudinary image upload)
router.post("/add-pet", protect, upload.single("image"), addPet);

// 🐾 Seller Fetches All Their Uploaded Pets
router.get("/my-pets", protect, getSellerPets);

// 📊 Seller Analytics (Dashboard)
router.get("/analytics", protect, getSellerAnalytics);

/* ============================================================
   🧩 ADMIN ROUTES (Protected + Admin Only)
============================================================ */

// 👩‍💻 Admin Reviews Pet (Approve / Reject)
router.put("/review/:id", protect, adminOnly, reviewPet);

/* ============================================================
   🧩 PUBLIC ROUTES
============================================================ */

// 👤 Fetch all approved pets for shop/dog/cat pages
// Example: /api/sellers/approved?category=Dog
router.get("/approved", getApprovedPets);
router.get("/:id", getPetById);

/* ============================================================
   🧪 TEST ROUTE
============================================================ */

router.get("/", (req, res) =>
  res.json({ message: "✅ Seller routes working fine 🧑‍💼" })
);

export default router;
