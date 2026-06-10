// 📁 controllers/orderController.js
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Pet from "../models/petModel.js";
import Seller from "../models/sellerModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createNotification } from "./notificationController.js";

/* ==========================================================
   🛒 PLACE ORDER (Direct or Cart Checkout)
========================================================== */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      petId,
      quantity = 1,
      totalPrice,
      paymentMethod,
      razorpayOrderId,
      address,
    } = req.body;

    let orderItems = [];
    let totalAmount = 0;

    /* ==========================================================
       🐶 DIRECT CHECKOUT (Single Pet)
    ========================================================== */
    if (petId) {
      const pet = await Pet.findById(petId).populate("seller", "name email shopName");
      if (!pet)
        return res.status(404).json({ success: false, message: "Pet not found" });

      // ✅ Safely extract seller ID (handle nested or direct)
      const sellerId =
        pet.seller?._id?.toString() ||
        pet.seller?.toString() ||
        null;

      orderItems = [{ pet: pet._id, quantity }];
      totalAmount = totalPrice || pet.price * quantity;

      // 💾 Save single order
      const order = await Order.create({
        user: userId,
        items: orderItems,
        totalAmount,
        seller: sellerId,
        paymentMethod: paymentMethod || "Cash on Delivery",
        paymentStatus: "Pending",
        razorpayOrderId: razorpayOrderId || null,
        address,
        orderStatus: "Placed",
      });

      const populatedOrder = await Order.findById(order._id)
        .populate("items.pet", "name price category image")
        .populate("user", "name email")
        .populate("seller", "name shopName email");

      return res.status(201).json({
        success: true,
        message: "Order created successfully 🎉",
        order: populatedOrder,
      });
    }

    /* ==========================================================
       🛍️ CART CHECKOUT (Multiple Sellers)
    ========================================================== */
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.pet",
      populate: { path: "seller", select: "name email shopName" },
    });

    if (!cart || cart.items.length === 0)
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });

    // 🔁 Group items by seller (use optional chaining to handle missing pet links)
    const groupedBySeller = {};
    cart.items.forEach((item) => {
      const seller =
        item.pet?.seller?._id?.toString() ||
        item.pet?.seller?.toString() ||
        "unknown";
      if (!groupedBySeller[seller]) groupedBySeller[seller] = [];
      groupedBySeller[seller].push(item);
    });

    const orders = [];

    // 💾 Create one order per seller
    for (const [seller, items] of Object.entries(groupedBySeller)) {
      const total = items.reduce(
        (sum, item) => sum + item.pet.price * item.quantity,
        0
      );

      // ✅ Detect and assign seller safely
      const derivedSellerId =
        items[0]?.pet?.seller?._id?.toString() ||
        items[0]?.pet?.seller?.toString() ||
        (seller === "unknown" ? null : seller);

      const order = await Order.create({
        user: userId,
        items: items.map((i) => ({ pet: i.pet._id, quantity: i.quantity })),
        totalAmount: total,
        seller: derivedSellerId || null,
        paymentMethod: paymentMethod || "Cash on Delivery",
        paymentStatus: "Pending",
        razorpayOrderId: razorpayOrderId || null,
        address,
        orderStatus: "Placed",
      });

      orders.push(order);
    }

    // 🧹 Clear user's cart
    await Cart.findOneAndDelete({ user: userId });

    // 📦 Fetch all created orders
    const populatedOrders = await Order.find({
      _id: { $in: orders.map((o) => o._id) },
    })
      .populate("items.pet", "name price category image")
      .populate("user", "name email")
      .populate("seller", "name shopName email");

    return res.status(201).json({
      success: true,
      message: "Multiple orders created successfully 🎉",
      orders: populatedOrders,
    });
  } catch (error) {
    console.error("❌ placeOrder error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
};

/* ==========================================================
   💳 MARK ORDER AS PAID (After Razorpay Verification)
========================================================== */
export const markOrderAsPaid = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay order or payment ID",
      });
    }

    // 🔍 Find order
    let order = await Order.findOne({
      $or: [
        { razorpayOrderId: razorpay_order_id },
        { paymentId: razorpay_payment_id },
      ],
    })
      .populate("user", "name email")
      .populate("seller", "name email shopName");

    if (!order) {
      console.log("⚠️ Order not found for Razorpay ID:", razorpay_order_id);
      return res.status(404).json({
        success: false,
        message: "Order not found in DB for this payment ID",
      });
    }

    // ✅ Update payment details
    order.paymentId = razorpay_payment_id;
    order.paymentStatus = "Paid";
    order.orderStatus = "Placed";
    await order.save();

    console.log(`✅ Payment marked as PAID for Order: ${order._id}`);

    // 📧 Notify buyer + seller
    try {
      const { user, seller } = order;

      if (user?.email) {
        await sendEmail(
          user.email,
          "💳 Payment Successful - PetPal",
          `<h2>Hi ${user.name || "PetPal User"},</h2>
           <p>Your payment (<strong>${razorpay_payment_id}</strong>) for order <strong>${order._id}</strong> was successful ✅</p>
           <p><strong>Total:</strong> ₹${order.totalAmount}</p>
           <br><p>🐾 Regards,<br><strong>PetPal Team</strong></p>`
        );
      }

      if (seller?.email) {
        await sendEmail(
          seller.email,
          "🛍️ Order Payment Received - PetPal",
          `<h2>Hi ${seller.shopName || seller.name || "Seller"},</h2>
           <p>Payment received for order <strong>${order._id}</strong> 💰</p>
           <p><strong>Total:</strong> ₹${order.totalAmount}</p>
           <br><p>🐶 Regards,<br><strong>PetPal Admin Team</strong></p>`
        );
      }
    } catch (err) {
      console.error("❌ Email send failed after payment:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Order payment updated successfully",
      order,
    });
  } catch (error) {
    console.error("❌ markOrderAsPaid error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating order payment",
      error: error.message,
    });
  }
};

/* ==========================================================
   👤 USER: Get My Orders
========================================================== */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.pet", "name category image price")
      .populate("seller", "shopName email")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ getUserOrders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message,
    });
  }
};

/* ==========================================================
   🧑‍💼 SELLER: Get Orders
========================================================== */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const directOrders = await Order.find({ seller: sellerId })
      .populate("items.pet", "name price image category seller")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const petsBySeller = await Pet.find({ seller: sellerId }).select("_id");
    const petIds = petsBySeller.map((p) => p._id);

    const petLinkedOrders = await Order.find({ "items.pet": { $in: petIds } })
      .populate("items.pet", "name price image category seller")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const allOrdersMap = new Map();
    [...directOrders, ...petLinkedOrders].forEach((o) =>
      allOrdersMap.set(o._id.toString(), o)
    );

    res.json({
      success: true,
      count: allOrdersMap.size,
      orders: Array.from(allOrdersMap.values()),
    });
  } catch (error) {
    console.error("❌ getSellerOrders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching seller orders",
      error: error.message,
    });
  }
};

/* ==========================================================
   🔄 UPDATE ORDER STATUS
========================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("seller", "name email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    // � Create notification for user
    await createNotification(
      order.user._id,
      "order",
      `📦 Order Status Update`,
      `Your order #${order._id.toString().slice(-6)} is now ${status}`,
      order._id.toString(),
      "order"
    );

    // �📧 Notify user via email
    try {
      await sendEmail(
        order.user.email,
        `📦 Order Update: ${status}`,
        `<h2>Hi ${order.user.name || "PetPal User"},</h2>
         <p>Your order <strong>${order._id}</strong> is now <strong>${status}</strong>.</p>
         <br><p>🐾 Regards,<br><strong>PetPal Team</strong></p>`
      );
    } catch (err) {
      console.error("❌ Failed to send order status email:", err.message);
    }

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("❌ updateOrderStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};
