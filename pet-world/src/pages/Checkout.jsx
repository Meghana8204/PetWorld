import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// avoid linter false-positive for unused `motion` when used in JSX
void motion;
import {
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  MapPin,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import axiosInstance from "../api/utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { RAZORPAY_KEY_ID } from "../config/payment";
import getErrorMessage from "../utils/getErrorMessage";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // 🐾 Support both single product and cart items
  const product = useMemo(
    () => location.state?.product || location.state?.dog || location.state?.cat,
    [location.state]
  );
  const cartItems = useMemo(() => location.state?.cartItems || [], [location.state]);

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
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
  const [loading, setLoading] = useState(false);
  
  // 🎁 Coupon/Offer states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  // 🧮 Calculate total price
  const totalPrice = useMemo(() => {
    if (cartItems.length > 0) {
      return cartItems.reduce(
        (sum, item) => sum + (item.offerPrice || item.price) * (item.quantity || 1),
        0
      );
    }
    if (!product) return 0;
    return (product.offerPrice || product.price) * quantity;
  }, [product, quantity, cartItems]);

  // 🚨 Redirect if no products
  useEffect(() => {
    if (!product && cartItems.length === 0) {
      toast.error("No products selected 🐾");
      navigate(-1);
    }
  }, [product, cartItems, navigate]);

  // 💾 Save Address
  const handleSaveAddress = () => {
    const { name, mobile, house, area, city, pincode } = address;
    if (!name || !mobile || !house || !area || !city || !pincode) {
      toast.error("Please fill all address fields 🏠");
      return;
    }
    setSavedAddress(address);
    setShowAddressModal(false);
    toast.success("Address saved ✅");
  };

  /* ==========================================================
     💾 CREATE ORDER IN DB (COD / Razorpay pending)
  ========================================================== */
  const createOrderInDB = async (paymentId, method, razorpayOrderId = null) => {
    try {
      setLoading(true);

      const orderItems =
        cartItems.length > 0
          ? cartItems.map((item) => ({
              petId: item._id || item.id,
              quantity: item.quantity || 1,
            }))
          : [
              {
                petId: product._id || product.id,
                quantity,
              },
            ];

      const orderData = {
        items: orderItems,
        totalPrice: finalTotal,
        product: cartItems.length > 0 ? cartItems : product,
        paymentId,
        paymentMethod: method,
        quantity: cartItems.length > 0 ? undefined : quantity,
        address: savedAddress,
        razorpayOrderId,
        // include petId for direct (single product) checkout so backend uses direct flow
        ...(cartItems.length === 0 && { petId: product._id || product.id }),
      };

      const { data } = await axiosInstance.post("/orders/place", orderData);

      if (data.success) {
        toast.success("Order saved ✅");
        return data.order;
      } else {
        toast.error(data.message || "Failed to save order ❌");
        return null;
      }
    } catch (error) {
      console.error("❌ Order Save Error:", error);
      toast.error("Server error while saving order 🐾");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     💳 RAZORPAY PAYMENT FLOW
  ========================================================== */
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

  const handleRazorpayPayment = async () => {
    if (!savedAddress) {
      toast.error("Please add your delivery address 🏠");
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load ❌");
      return;
    }

    try {
      // Step 1️⃣: Create Razorpay order
      const { data } = await axiosInstance.post("/payments/create-order", {
        amount: finalTotal,
      });

      if (!data.success) {
        toast.error("Unable to create Razorpay order ❌");
        return;
      }

      const { order, keyId } = data;

      // Step 2️⃣: Save pending order in DB
      const dbOrder = await createOrderInDB(null, "Razorpay", order.id);
      if (!dbOrder) return;

      // Step 3️⃣: Initialize Razorpay checkout
      const options = {
        key: keyId || RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Pet World 🐾",
        description: `Purchase of ${product?.name || "Items"}`,
        image: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verify = await axios.post(
              "http://localhost:5001/api/payments/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (verify.data.success) {
              toast.success("Payment Verified 🎉");

              await axios.put(
                "http://localhost:5001/api/orders/mark-paid",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              // Redirect to Orders page so user can see their paid order
              navigate("/orders");
            } else {
              toast.error("Payment Verification Failed ❌");
            }
          } catch (error) {
            console.error("❌ Verification Error:", error);
            toast.error("Server verification failed 🚫");
          }
        },
        prefill: {
          name: savedAddress.name,
          email: user?.email || "customer@example.com",
          contact: savedAddress.mobile,
        },
        notes: {
          address: `${savedAddress.house}, ${savedAddress.area}, ${savedAddress.city} - ${savedAddress.pincode}`,
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () => toast.error("Payment Failed ❌"));
    } catch (err) {
      console.error("Payment Error:", err);
      toast.error(getErrorMessage(err, "Unable to initiate payment"));
    }
  };

  /* ==========================================================
     🎁 APPLY COUPON / OFFER CODE
  ========================================================== */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      // Fetch active offer from backend
      const { data } = await axios.get("http://localhost:5001/api/offers");

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

  /* ==========================================================
     🧾 CALCULATE FINAL TOTAL WITH DISCOUNT
  ========================================================== */
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  /* ==========================================================
     🧾 PLACE ORDER (COD / RAZORPAY)
  ========================================================== */
  const handlePlaceOrder = async () => {
    if (!user) {
      // Redirect to login, pass intended redirect and checkout state
      navigate("/login", {
        state: {
          from: "/checkout",
          checkoutState: {
            product,
            cartItems,
            quantity,
            paymentMethod,
            address: savedAddress || address,
          },
        },
        replace: true,
      });
      return;
    }
    if (!savedAddress) {
      toast.error("Please add your delivery address 🏠");
      return;
    }

    if (paymentMethod === "cod") {
      await createOrderInDB(null, "Cash on Delivery");
      toast.success("Order placed successfully 🎉");
      // Redirect to Orders page so user can see their placed order
      navigate("/orders");
    } else if (paymentMethod === "card") {
      handleRazorpayPayment();
    }
  };

  /* ==========================================================
     🖼️ UI RENDER
  ========================================================== */
  if (!product && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <p className="text-center text-gray-500 text-lg">
          No products selected. Redirecting...
        </p>
      </div>
    );
  }

  const displayProduct = product || (cartItems.length > 0 ? cartItems[0] : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span>/</span>
        <span>Checkout</span>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Order Summary 🛒
          </h2>

          {/* Product Info */}
          {displayProduct && (
            <div className="flex flex-col sm:flex-row gap-6 border-b pb-6">
              <img
                src={
                  displayProduct.image ||
                  "https://cdn-icons-png.flaticon.com/512/1995/1995640.png"
                }
                alt={displayProduct.name}
                className="w-40 h-40 rounded-lg object-cover shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">
                  {displayProduct.name}
                </h3>
                <p className="text-gray-500">{displayProduct.category}</p>

                <div className="mt-3">
                  {displayProduct.offerPrice ? (
                    <>
                      <p className="text-gray-400 line-through">
                        ₹{displayProduct.price.toLocaleString()}
                      </p>
                      <p className="text-blue-600 text-xl font-semibold">
                        ₹{displayProduct.offerPrice.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-blue-600 text-xl font-semibold">
                      ₹{displayProduct.price.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-gray-600 font-medium">Quantity:</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-blue-600 text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="text-gray-700 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="text-blue-600 text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delivery Address 🏠
            </h3>
            {savedAddress ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">
                    {savedAddress.name} ({savedAddress.mobile})
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {savedAddress.house}, {savedAddress.area},<br />
                    {savedAddress.city} - {savedAddress.pincode}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddressModal(true)}
                className="mt-3 border border-dashed border-blue-400 text-blue-600 py-2.5 px-5 rounded-lg hover:bg-blue-50 transition"
              >
                + Add New Address
              </motion.button>
            )}
          </div>

          {/* Payment */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Payment Method 💳
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <Truck size={18} className="text-blue-600" />
                <span>Cash on Delivery</span>
              </label>

              <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <CreditCard size={18} className="text-blue-600" />
                <span>Credit / Debit Card (Razorpay)</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 h-fit"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Price Details</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Price</span>
              <span>₹{(displayProduct?.offerPrice || displayProduct?.price)?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity</span>
              <span>× {quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>

            {/* Coupon/Offer Section */}
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">🎁 Apply Coupon</p>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3 mb-3">
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
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </motion.button>
                </div>
              )}
            </div>

            <hr />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount ({appliedCoupon?.discount}%)</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck size={20} /> {loading ? "Processing..." : "Place Order"}
          </motion.button>
        </motion.div>
      </div>

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

              <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2 mb-4">
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
                        className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    );
                  }
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveAddress}
                className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
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
