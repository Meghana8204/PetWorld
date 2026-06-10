import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    /* 👤 USER */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    /* 🐶 ITEMS */
    items: [
      {
        pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],

    /* 💰 TOTAL */
    totalAmount: { type: Number, required: true },

    /* 🧑‍💼 SELLER */
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
    },

    /* 💳 PAYMENT */
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Razorpay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    paymentId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },

    /* 🏠 ADDRESS */
    address: {
      name: String,
      mobile: String,
      house: String,
      area: String,
      city: String,
      pincode: String,
    },

    /* 🚚 STATUS */
    orderStatus: {
      type: String,
      enum: [
        "Order Placed",
        "Placed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },
  },
  { timestamps: true }
);

/* ✅ VIRTUALS */
orderSchema.virtual("isDelivered").get(function () {
  return this.orderStatus === "Delivered";
});

orderSchema.virtual("summary").get(function () {
  return `${this.items?.length || 0} item(s) • ₹${this.totalAmount} • ${
    this.paymentStatus
  }`;
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

export default mongoose.model("Order", orderSchema);
