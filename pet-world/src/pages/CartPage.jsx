import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { X, MapPin } from "lucide-react";
import axiosInstance from "../api/utils/axiosInstance";
import { RAZORPAY_KEY_ID } from "../config/payment";
import getErrorMessage from "../utils/getErrorMessage";

// silence motion unused warning
void motion;

export default function CartPage() {
  const { cart, updateQuantity, deleteItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    mobile: "",
    house: "",
    area: "",
    city: "",
    pincode: "",
  });
  const [savedAddress, setSavedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(false);

  // 🎁 Coupon/Offer states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  // 🐾 Convert cart object to array - use petId as key
  const cartItems = Object.entries(cart || {}).map(([petId, item]) => ({
    ...item,
    petId,
  }));

  // 🧮 Totals
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = (totalPrice * 0.09).toFixed(2);
  const totalAmount = (totalPrice + parseFloat(tax)).toFixed(2);

  // 💾 Save Address
  const handleSaveAddress = () => {
    const { name, mobile, house, area, city, pincode } = address;
    if (!name || !mobile || !house || !area || !city || !pincode) {
      toast.error("Please fill all address fields 🏠");
      return;
    }
    setSavedAddress(address);
    setShowAddressModal(false);
    setAddress({ name: "", mobile: "", house: "", area: "", city: "", pincode: "" });
    toast.success("Address saved ✅");
  };

  // 🎁 APPLY COUPON / OFFER CODE
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      // Fetch active offer from backend
      const { data } = await axiosInstance.get("/offers");

      if (!data.success || !data.offer) {
        toast.error("No active offers available");
        setCouponLoading(false);
        return;
      }

      const offer = data.offer;

      // Check if coupon code matches and offer is active
      if (!offer.isActive) {
        toast.error("This offer is not currently active");
        setCouponLoading(false);
        return;
      }

      if (offer.code.toUpperCase() !== couponCode.toUpperCase()) {
        toast.error("Invalid coupon code ❌");
        setCouponLoading(false);
        return;
      }

      // Check minimum order amount
      if (totalPrice < offer.minOrderAmount) {
        toast.error(
          `Minimum order amount ₹${offer.minOrderAmount} required for this coupon`
        );
        setCouponLoading(false);
        return;
      }

      // Calculate discount
      const discount = (totalPrice * offer.discount) / 100;
      setDiscountAmount(discount);
      setAppliedCoupon(offer);
      setCouponCode("");
      toast.success(`🎉 Coupon applied! ${offer.discount}% off`);
    } catch (error) {
      console.error("❌ Coupon error:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // 🗑️ Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // 🧮 Calculate final total with discount
  const finalTotal = (parseFloat(totalAmount) - discountAmount).toFixed(2);

  // 🧾 Handle Place Order (COD - Direct)
  const handlePlaceOrderCOD = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!savedAddress) {
      toast.error("Please add a delivery address 🏠");
      return;
    }

    setLoading(true);

    try {
      const orderItems = cartItems.map((item) => ({
        petId: item.petId,
        quantity: item.quantity,
      }));

      const orderData = {
        items: orderItems,
        totalPrice: finalTotal,
        paymentMethod: "Cash on Delivery",
        address: savedAddress,
      };

      const { data } = await axiosInstance.post("/orders/place", orderData);

      if (data.success) {
        clearCart();
        toast.success("Order placed successfully 🎉", {
          style: { background: "#4f46e5", color: "#fff" },
        });

        setTimeout(() => {
          navigate("/orders");
        }, 1200);
      } else {
        toast.error(data.message || "Failed to place order ❌");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order ❌");
    } finally {
      setLoading(false);
    }
  };

  // 💳 Handle Razorpay Payment (Online)
  const handleRazorpayPayment = async () => {
    if (!savedAddress) {
      toast.error("Please add a delivery address 🏠");
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load ❌");
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Create Razorpay order
      const { data } = await axiosInstance.post("/payments/create-order", {
        amount: Math.round(finalTotal),
      });

      if (!data.success) {
        toast.error("Unable to create payment order ❌");
        return;
      }

      const { order, keyId } = data;

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: keyId || RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Pet World 🐾",
        description: "Pet Purchase",
        image: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            await axiosInstance.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Place order in DB
            const orderItems = cartItems.map((item) => ({
              petId: item.petId,
              quantity: item.quantity,
            }));

            const orderData = {
              items: orderItems,
              totalPrice: finalTotal,
              paymentMethod: "Razorpay",
              address: savedAddress,
            };

            const orderRes = await axiosInstance.post("/orders/place", orderData);

            if (orderRes.data.success) {
              clearCart();
              toast.success("Payment successful 🎉", {
                style: { background: "#4f46e5", color: "#fff" },
              });

              setTimeout(() => {
                navigate("/orders");
              }, 1200);
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed ❌");
          }
        },
        prefill: {
          name: savedAddress.name,
          email: user?.email || "customer@example.com",
          contact: savedAddress.mobile,
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () => toast.error("Payment Failed ❌"));
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(getErrorMessage(err, "Unable to initiate payment"));
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🧾 Handle Checkout
  const handleCheckout = () => {
    if (paymentMethod === "Cash on Delivery") {
      handlePlaceOrderCOD();
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <div className="flex flex-col md:flex-row py-16 px-6 max-w-6xl mx-auto min-h-screen">
      {/* 🛒 Left Section */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Your Pet Cart 🐾{" "}
          <span className="text-sm text-indigo-500 font-medium">
            ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
          </span>
        </h1>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-4">🛍️ Your cart is empty.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b border-gray-300">
              <p>Product</p>
              <p className="text-center">Price</p>
              <p className="text-center">Quantity</p>
              <p className="text-center">Remove</p>
            </div>

            {/* Cart Items */}
            {cartItems.map((item) => (
              <div
                key={item.petId}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-gray-200 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                  </div>
                </div>

                <p className="text-center text-gray-700 font-medium">
                  ₹{item.price}
                </p>

                <div className="flex justify-center">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-600 outline-none cursor-pointer"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.petId, parseInt(e.target.value))
                    }
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => deleteItem(item.petId)}
                  className="mx-auto text-red-500 hover:text-red-600 transition cursor-pointer"
                  title="Remove Item"
                >
                  ❌
                </button>
              </div>
            ))}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => navigate("/")}
                className="text-indigo-500 font-medium hover:underline"
              >
                ← Continue Shopping
              </button>

              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>

      {/* 📦 Order Summary */}
      {cartItems.length > 0 && (
        <div className="max-w-[360px] w-full bg-white shadow-lg border border-gray-200 rounded-lg p-6 mt-12 md:mt-0 md:ml-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>
          <hr className="border-gray-300 mb-4" />

          {/* Address Section */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 uppercase">
              Delivery Address
            </p>
            {savedAddress ? (
              <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 mt-2">
                <p className="font-medium text-gray-800">
                  {savedAddress.name} ({savedAddress.mobile})
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {savedAddress.house}, {savedAddress.area},<br />
                  {savedAddress.city} - {savedAddress.pincode}
                </p>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-indigo-500 text-xs mt-2 hover:underline"
                >
                  Change Address
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddressModal(true)}
                className="mt-2 border border-dashed border-indigo-400 text-indigo-600 w-full py-2 rounded-lg hover:bg-indigo-50 transition"
              >
                + Add New Address
              </motion.button>
            )}
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase text-gray-700">
              Payment Method
            </p>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 rounded outline-none text-sm"
            >
              <option value="Cash on Delivery">Cash On Delivery</option>
              <option value="Razorpay">Online Payment (Razorpay)</option>
            </select>
          </div>

          <hr className="border-gray-300 mb-4" />

          {/* Coupon/Offer Section */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">🎁 Apply Coupon</p>
            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      ✅ {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-green-600">
                      {appliedCoupon.discount}% off applied
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleApplyCoupon()
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </motion.button>
              </div>
            )}
          </div>

          <hr className="border-gray-300 mb-4" />

          {/* Price Summary */}
          <div className="space-y-2 text-sm text-gray-700">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </p>
            <p className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </p>
            <p className="flex justify-between">
              <span>Tax (9%)</span>
              <span>₹{tax}</span>
            </p>
            {discountAmount > 0 && (
              <p className="flex justify-between text-green-600 font-medium">
                <span>Discount ({appliedCoupon?.discount}%)</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </p>
            )}
            <p className="flex justify-between font-semibold text-base mt-3 pt-2 border-t">
              <span>Total:</span>
              <span>₹{finalTotal}</span>
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={loading || !savedAddress}
            className={`w-full mt-6 py-3 rounded-lg font-medium transition ${
              loading || !savedAddress
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            {loading ? "Processing..." : paymentMethod === "Cash on Delivery" ? "Place Order (COD)" : "Proceed to Payment"}
          </motion.button>
        </div>
      )}

      {/* ADDRESS MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative"
            >
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2 mb-4">
                <MapPin size={20} /> Add Delivery Address
              </h2>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {["Full Name", "Mobile Number", "House No.", "Road / Area", "City", "Pincode"].map(
                  (label, index) => {
                    const keys = ["name", "mobile", "house", "area", "city", "pincode"];
                    return (
                      <input
                        key={index}
                        type="text"
                        placeholder={label}
                        value={address[keys[index]]}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            [keys[index]]: e.target.value,
                          })
                        }
                        className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    );
                  }
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveAddress}
                className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Save Address
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
