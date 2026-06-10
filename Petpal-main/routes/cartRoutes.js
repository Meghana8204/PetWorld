import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/remove/:petId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

export default router;
