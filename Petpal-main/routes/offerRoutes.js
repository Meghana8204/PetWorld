import express from "express";
import { updateOffer, getActiveOffer } from "../controllers/offerController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧑‍💼 Admin updates offer
router.put("/update", protect, adminOnly, updateOffer);

// 🐾 Public route for everyone to view
router.get("/", getActiveOffer);

export default router;
