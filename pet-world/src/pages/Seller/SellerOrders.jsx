// src/pages/Seller/SellerOrders.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

const ORDER_STEPS = [
  { label: "Order Placed", icon: Package, color: "text-indigo-500" },
  { label: "Shipped", icon: Truck, color: "text-blue-500" },
  { label: "Out for Delivery", icon: Truck, color: "text-orange-500" },
  { label: "Delivered", icon: CheckCircle2, color: "text-green-500" },
];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axiosInstance.get("/orders/seller-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // simulate slight delay for animation
        setTimeout(() => {
          setOrders(res.data?.orders || []);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        toast.error("Failed to load orders 📦");
        setLoading(false);
      }
    }
    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(true);
    try {
      const res = await axiosInstance.put(
        `/orders/update/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Order updated to "${status}" ✅`);
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, orderStatus: status } : o
          )
        );
      }
    } catch (err) {
      console.error("❌ Error updating order:", err);
      toast.error("Failed to update order status 🚫");
    } finally {
      setTimeout(() => setUpdating(false), 800);
    }
  };

  const getStepIndex = (status) => {
    const map = {
      "Order Placed": 0,
      Shipped: 1,
      "Out for Delivery": 2,
      Delivered: 3,
    };
    return map[status] ?? 0;
  };

  /* 🐾 Shared Animated Pet Loader */
  const PetLoader = ({ text = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-purple-100 text-gray-700">
      <motion.div
        className="relative w-28 h-28 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="Running Dog"
          className="absolute w-20 h-20 object-contain left-0 bottom-0"
          animate={{ x: [0, 60, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-sm"
          animate={{ scaleX: [1, 0.6, 1] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <motion.h2
        className="text-xl sm:text-2xl font-bold text-indigo-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {text}
      </motion.h2>
      <motion.p
        className="text-sm text-gray-500 mt-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🐶 Please wait, your pets are moving!
      </motion.p>
    </div>
  );

  if (loading) return <PetLoader text="Fetching Your Orders..." />;

  if (orders.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500 px-6 text-center">
        <Package size={50} className="mb-4 opacity-70" />
        <h2 className="text-xl font-semibold">No Orders Yet 🐾</h2>
        <p className="text-sm mt-2">
          You haven’t received any customer orders yet.
        </p>
      </div>
    );

  /* 🧾 Main Orders UI */
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-10">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-700 mb-6 sm:mb-8">
        🧾 Customer Orders
      </h1>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {orders.map((order, index) => {
            const pet = order.items?.[0]?.pet;
            const status = order.orderStatus;
            const step = getStepIndex(status);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative bg-white/80 backdrop-blur-md border border-indigo-100 shadow-md hover:shadow-xl transition-all rounded-2xl overflow-hidden flex flex-col"
              >
                {/* 🐕 Pet Image */}
                <div className="h-40 sm:h-48 w-full overflow-hidden">
                  <motion.img
                    src={
                      pet?.image ||
                      "https://cdn-icons-png.flaticon.com/512/616/616408.png"
                    }
                    alt={pet?.name || "Pet"}
                    className="object-cover w-full h-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* 🧾 Order Info */}
                <div className="p-4 sm:p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                        {pet?.name || "Unknown Pet"}
                      </h2>
                      <span
                        className={`text-xs sm:text-sm px-3 py-1 rounded-full font-semibold ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600 space-y-1 mt-2">
                      <p className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium text-gray-900">
                          ₹{order.totalAmount?.toLocaleString()}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-medium truncate">
                          {order.user?.name || "—"}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Email:</span>
                        <span className="text-indigo-600 truncate max-w-[140px] sm:max-w-[160px]">
                          {order.user?.email || "—"}
                        </span>
                      </p>
                    </div>

                    {/* 🪄 Progress Timeline */}
                    <div className="mt-5">
                      <div className="relative flex justify-between items-center">
                        {ORDER_STEPS.map((stepItem, idx) => {
                          const Icon = stepItem.icon;
                          const isActive = idx <= step;
                          return (
                            <motion.div
                              key={idx}
                              className="flex flex-col items-center z-10 w-full"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <div
                                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 ${
                                  isActive
                                    ? `${stepItem.color} border-current bg-white`
                                    : "border-gray-300 text-gray-300 bg-white"
                                }`}
                              >
                                <Icon
                                  size={18}
                                  className={`${
                                    isActive ? stepItem.color : "text-gray-300"
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs mt-2 ${
                                  isActive
                                    ? "text-gray-700 font-medium"
                                    : "text-gray-400"
                                }`}
                              >
                                {stepItem.label}
                              </span>
                            </motion.div>
                          );
                        })}
                        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(step / (ORDER_STEPS.length - 1)) * 100}%`,
                            }}
                            transition={{ duration: 0.8 }}
                            className="h-0.5 bg-gradient-to-r from-indigo-500 to-green-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 📋 Status Dropdown */}
                    <div className="mt-6">
                      <label className="text-xs sm:text-sm font-semibold text-gray-700">
                        Update Status
                      </label>
                      <div className="relative mt-1">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          disabled={updating}
                          className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown
                          className="absolute right-2.5 sm:right-3 top-2 text-gray-400 pointer-events-none"
                          size={14}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 📅 Footer */}
                  <div className="flex justify-between items-center mt-5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      {status === "Delivered" ? (
                        <CheckCircle2 className="text-green-500" size={16} />
                      ) : status === "Cancelled" ? (
                        <XCircle className="text-red-500" size={16} />
                      ) : (
                        <Truck className="text-blue-500" size={16} />
                      )}
                      <span
                        className={`font-medium ${
                          status === "Delivered"
                            ? "text-green-600"
                            : status === "Cancelled"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 🐾 Overlay Loader when Updating */}
      <AnimatePresence>
        {updating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md z-50"
          >
            <PetLoader text="Updating Order Status..." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
