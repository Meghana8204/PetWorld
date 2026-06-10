// models/petModel.js
import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    // 🐾 Basic Info
    name: {
      type: String,
      required: [true, "Pet name is required"],
      trim: true,
      minlength: [2, "Pet name must be at least 2 characters"],
    },

    category: {
      type: String,
      required: [true, "Pet category is required"],
      enum: ["Dog", "Cat", "Bird", "Fish", "Other"],
      default: "Other",
    },

    type: {
      type: String,
      default: "pet",
    },

    // 💰 Pricing
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },

    offerPrice: {
      type: Number,
      min: [0, "Offer price must be positive"],
      default: 0,
    },

    // 📝 Description
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // 🖼️ Image URL
    image: {
      type: String,
      default: "",
    },

    // 📦 Inventory
    inStock: {
      type: Boolean,
      default: true,
    },

    // 🕓 Approval Workflow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
      maxlength: [200, "Rejection reason too long"],
    },

    // 🧑‍💼 Seller Reference
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller reference is required"],
      index: true, // speeds up lookups by seller
    },

    // 🧹 Optional Soft Delete / Archiving Support (future use)
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // don't return this field by default
    },

    // 🧾 Seller-provided specifications (array of small key/value pairs)
    specifications: {
      type: [
        {
          label: { type: String },
          value: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// 🧠 Virtuals or Methods (optional: to compute discount, etc.)
petSchema.virtual("discountPercentage").get(function () {
  if (this.offerPrice && this.price > this.offerPrice) {
    return Math.round(((this.price - this.offerPrice) / this.price) * 100);
  }
  return 0;
});

// 🧾 Ensure virtuals show up in JSON responses
petSchema.set("toJSON", { virtuals: true });
petSchema.set("toObject", { virtuals: true });

// ✅ Model Export
const Pet = mongoose.model("Pet", petSchema);
export default Pet;
