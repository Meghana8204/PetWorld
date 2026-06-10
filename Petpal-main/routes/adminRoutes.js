import express from "express";
import {
  loginAdmin,
  createSeller,
  getPendingItems,
  getApprovedItems,
  getRejectedItems,
  getAllSellers,
  getAllUsers,
} from "../controllers/adminController.js";
import { reviewPet } from "../controllers/petController.js"; // ✅ Approve/Reject handler
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================================
   🧑‍💻 ADMIN AUTH
================================ */
router.post("/login", loginAdmin);

/* ================================
   🧾 SELLER MANAGEMENT
================================ */
router.post("/create-seller", protect, adminOnly, createSeller);
router.get("/sellers", protect, adminOnly, getAllSellers);

/* ================================
   👥 USER MANAGEMENT
================================ */
router.get("/users", protect, adminOnly, getAllUsers);

/* ================================
   🐾 PET MANAGEMENT
   (Matches frontend routes exactly)
================================ */
router.get("/pets/pending", protect, adminOnly, getPendingItems);
router.get("/pets/approved", protect, adminOnly, getApprovedItems);
router.get("/pets/rejected", protect, adminOnly, getRejectedItems);

// ✅ Admin Approves / Rejects a Pet
router.put("/review/:id", protect, adminOnly, reviewPet);

export default router;
