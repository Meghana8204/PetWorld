import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /* 👤 USER */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    /* 📢 TYPE & CONTENT */
    type: {
      type: String,
      enum: ["offer", "product", "order", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },

    /* 🔗 RELATED ENTITY */
    relatedId: { type: String, default: null }, // offerId, petId, orderId, etc.
    relatedType: {
      type: String,
      enum: ["offer", "pet", "order", "other"],
      default: "other",
    },

    /* ✅ STATUS */
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
