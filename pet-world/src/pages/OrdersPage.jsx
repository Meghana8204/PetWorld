import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const boxIcon =
    "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/boxIcon.svg";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5001/api/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (data.success) {
          setOrders(data.orders);
        } else {
          toast.error("Failed to load your orders ❌");
        }
      } catch (error) {
        console.error("Order Fetch Error:", error);
        toast.error("Error fetching your orders 🐾");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-600">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mb-3"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <img
          src={boxIcon}
          alt="boxIcon"
          className="w-12 h-12 opacity-50 mb-4"
        />
        <h2 className="text-lg font-medium">No Orders Yet 🐶</h2>
        <p className="text-sm mt-2">
          Looks like you haven’t purchased anything yet.
        </p>
      </div>
    );
  }

  return (
    <div className="md:p-10 p-4 space-y-4 bg-gradient-to-br from-blue-50 via-white to-pink-50 min-h-screen">
      <h2 className="text-2xl font-bold text-blue-700">My Orders</h2>

      {orders.map((order, index) => {
        const item = order.items?.[0];
        const pet = item?.pet;
        const quantity = item?.quantity || 1;

        const addr = order.address || {};
        const addressString = addr
          ? `${addr.house || ""}, ${addr.area || ""}, ${addr.city || ""}, ${
              addr.pincode || ""
            }`
          : "No Address";

        return (
          <div
            key={index}
            className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center gap-5 p-5 max-w-5xl rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition bg-white"
          >
            {/* 🐕 Pet Info */}
            <div className="flex gap-5 items-center">
              <img
                className="w-12 h-12 object-cover opacity-70"
                src={
                  pet?.image ||
                  "https://cdn-icons-png.flaticon.com/512/616/616408.png"
                }
                alt="pet"
              />
              <div className="flex flex-col">
                <p className="font-medium text-gray-800">
                  {pet?.name || "Unknown Pet"}{" "}
                  <span
                    className={`text-indigo-500 ${
                      quantity < 2 && "hidden"
                    }`}
                  >
                    × {quantity}
                  </span>
                </p>
                <p className="text-gray-500 text-sm">
                  {pet?.category || "Pet Category"}
                </p>
              </div>
            </div>

            {/* 🏠 Address */}
            <div className="text-sm">
              <p className="font-medium mb-1 text-gray-700">
                {addr.name || "User"}
              </p>
              <p className="text-gray-500">{addressString}</p>
            </div>

            {/* 💰 Amount */}
            <p className="font-semibold text-base my-auto text-gray-800">
              ₹{order.totalAmount?.toLocaleString() || 0}
            </p>

            {/* 💳 Payment Info */}
            <div className="flex flex-col text-sm text-gray-700">
              <p>
                <span className="font-medium">Method:</span>{" "}
                {order.paymentMethod}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p>
                <span className="font-medium">Payment:</span>{" "}
                <span
                  className={`${
                    order.paymentMethod === "Cash on Delivery"
                      ? "text-blue-600 font-semibold"
                      : order.paymentStatus === "Paid"
                      ? "text-green-600 font-semibold"
                      : "text-yellow-600 font-medium"
                  }`}
                >
                  {order.paymentMethod === "Cash on Delivery"
                    ? "COD"
                    : order.paymentStatus}
                </span>
              </p>
              <p>
                <span className="font-medium">Order:</span>{" "}
                {order.orderStatus}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
