import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

/* 🔐 Protected Routes - Require Authentication */

/* 🔔 GET ALL NOTIFICATIONS */
router.get("/", protect, getNotifications);

/* ✅ MARK NOTIFICATION AS READ */
router.patch("/:id/read", protect, markAsRead);

/* 🗑️ DELETE NOTIFICATION */
router.delete("/:id", protect, deleteNotification);

/* 🧹 DELETE ALL NOTIFICATIONS */
router.delete("/", protect, deleteAllNotifications);

export default router;
