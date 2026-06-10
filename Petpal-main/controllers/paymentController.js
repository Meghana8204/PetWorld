import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config({ override: true });

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing in backend .env");
  }

  return { keyId, keySecret };
};

/* ======================================================
   CREATE ORDER (Razorpay)
====================================================== */
export const createOrder = async (req, res) => {
  try {
    const numericAmount = Number(req.body?.amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid amount is required",
      });
    }

    const { keyId, keySecret } = getRazorpayCredentials();

    console.log("Razorpay Key ID:", keyId);
    console.log("Razorpay Secret Loaded:", !!keySecret);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order",
      });
    }

    console.log("Razorpay order created:", order.id);

    res.status(200).json({
      success: true,
      keyId,
      order,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);

    res.status(500).json({
      success: false,
      message: "Razorpay order creation failed",
      error:
        error?.error?.description ||
        error?.message ||
        "Unknown error while creating order",
    });
  }
};

/* ======================================================
   VERIFY PAYMENT (Razorpay)
====================================================== */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log("Verifying payment:", {
      razorpay_order_id,
      razorpay_payment_id,
      hasSignature: !!razorpay_signature,
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    const { keySecret } = getRazorpayCredentials();

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("Razorpay signature mismatch");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const order = await Order.findOneAndUpdate(
      { paymentId: razorpay_payment_id },
      { paymentStatus: "Paid" },
      { new: true }
    );

    if (order) {
      console.log("Payment status updated in DB:", order._id);

      try {
        if (order.user?.email) {
          await sendEmail(
            order.user.email,
            "Payment Successful - PetPal Order Confirmed!",
            `
            <h2>Hi ${order.user.name || "PetPal User"},</h2>
            <p>Your payment for order <strong>${order._id}</strong> has been confirmed successfully.</p>
            <p><strong>Amount Paid:</strong> Rs.${order.totalAmount}</p>
            <p>You can track your order anytime in <strong>My Orders</strong>.</p>
            <br>
            <p>Regards,<br><strong>PetPal Team</strong></p>
          `
          );
          console.log(`Payment success email sent to ${order.user.email}`);
        }
      } catch (err) {
        console.error("Email sending error:", err.message);
      }
    } else {
      console.log("Order not found in DB for this payment ID");
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
