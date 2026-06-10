import Offer from "../models/offerModel.js";
import User from "../models/userModel.js";
import { createNotification } from "./notificationController.js";

// 🧑‍💼 Admin creates or updates an offer
export const updateOffer = async (req, res) => {
  try {
    const { message, code, discount, minOrderAmount, isActive } = req.body;

    let offer = await Offer.findOne();
    if (offer) {
      // Update existing offer
      offer.message = message || offer.message;
      offer.code = code || offer.code;
      offer.discount = discount ?? offer.discount;
      offer.minOrderAmount = minOrderAmount ?? offer.minOrderAmount;
      offer.isActive = isActive ?? offer.isActive;
      await offer.save();
    } else {
      // Create new offer
      offer = await Offer.create({
        message,
        code,
        discount,
        minOrderAmount,
        isActive,
      });
    }

    // 🔔 Create notifications for all regular users
    if (isActive) {
      const allUsers = await User.find({ role: "user" });
      for (const user of allUsers) {
        await createNotification(
          user._id,
          "offer",
          "🎁 New Offer Available",
          `${message} - Get ${discount}% off with code "${code}"`,
          offer._id.toString(),
          "offer"
        );
      }
    }

    res.json({ success: true, message: "Offer updated successfully 🎉", offer });
  } catch (error) {
    res.status(500).json({ message: "Error updating offer", error: error.message });
  }
};

// 🐾 Public endpoint — fetch current active offer
export const getActiveOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!offer) return res.json({ success: false, message: "No active offers" });
    res.json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ message: "Error fetching offer", error: error.message });
  }
};
