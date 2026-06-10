// 📁 routes/orderRoutes.js
import express from "express";
import crypto from "crypto"; // ✅ for Razorpay signature verification
import { protect } from "../middleware/authMiddleware.js";
import {
  placeOrder,
  updateOrderStatus,
  getUserOrders,
  getSellerOrders,
  markOrderAsPaid,
} from "../controllers/orderController.js";
import Order from "../models/orderModel.js";

const router = express.Router();

/* ==========================================================
   👤 USER ROUTES
========================================================== */

/**
 * @route   POST /api/orders/place
 * @desc    Place a new order (Direct pet or Cart checkout)
 * @access  Private (User)
 */
router.post("/place", protect, placeOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get all orders placed by the logged-in user
 * @access  Private (User)
 */
router.get("/my-orders", protect, getUserOrders);

/**
 * @route   PUT /api/orders/mark-paid
 * @desc    Mark order as paid (used after Razorpay verification)
 * @access  Private (User)
 */
router.put("/mark-paid", protect, markOrderAsPaid);

/**
 * @route   POST /api/orders/verify-payment
 * @desc    Verify Razorpay signature and mark order as paid (secure)
 * @access  Private (User)
 */
router.post("/verify-payment", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    // 🧾 Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // ❌ Invalid signature → reject
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay signature. Payment verification failed.",
      });
    }

    // ✅ Signature verified → mark order as paid
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this Razorpay Order ID",
      });
    }

    order.paymentId = razorpay_payment_id;
    order.paymentStatus = "Paid";
    order.orderStatus = "Placed";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully ✅",
      order,
    });
  } catch (error) {
    console.error("❌ verify-payment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error verifying Razorpay payment",
      error: error.message,
    });
  }
});

/* ==========================================================
   🧑‍💼 SELLER ROUTES
========================================================== */

/**
 * @route   GET /api/orders/seller-orders
 * @desc    Fetch all customer orders belonging to the logged-in seller
 * @access  Private (Seller)
 */
router.get("/seller-orders", protect, getSellerOrders);

/**
 * @route   PUT /api/orders/update/:id
 * @desc    Update order status (Placed → Shipped → Delivered)
 * @access  Private (Seller/Admin)
 */
router.put("/update/:id", protect, updateOrderStatus);

export default router;
