import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      default: "Welcome to PetPal 🐾",
    },
    code: { type: String, default: "" },
    discount: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
