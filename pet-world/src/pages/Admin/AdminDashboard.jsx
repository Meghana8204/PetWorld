import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import AdminSidebar from "../../components/AdminSidebar";
import OfferManagement from "./OfferManagement";

export default function AdminDashboard() {
  const [view, setView] = useState("pending");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // 🧠 Fetch data dynamically
  const fetchData = async () => {
    try {
      setLoading(true);

      if (!token) {
        toast.error("Unauthorized access — please log in again.");
        return;
      }

      if (view === "addSeller" || view === "offers") return;

      const endpoints = {
        pending: "/admin/pets/pending",
        approved: "/admin/pets/approved",
        rejected: "/admin/pets/rejected",
        sellers: "/admin/sellers",
        users: "/admin/users",
      };

      const endpoint = endpoints[view];
      if (!endpoint) return toast.error("Invalid view selected");

      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseData =
        res.data.pendingPets ||
        res.data.approvedPets ||
        res.data.rejectedPets ||
        res.data.sellers ||
        res.data.users ||
        [];

      setData(responseData);
    } catch (err) {
      console.error("❌ Fetch error:", err.response || err.message);
      if (err.response?.status === 401)
        toast.error("Session expired or unauthorized. Please log in again.");
      else toast.error("Failed to load data 😿");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== "addSeller" && view !== "offers") fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // ✅ Approve/Reject Pets
  const handleReview = async (id, action) => {
    try {
      await axiosInstance.put(
        `/admin/review/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Pet ${action}ed successfully! 🐾`);
      fetchData();
    } catch (err) {
      console.error("❌ Review error:", err);
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  // ✅ Add Seller Form
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
  });

  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/admin/create-seller", sellerForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Seller added successfully! 🧾");
      setSellerForm({ name: "", email: "", password: "", shopName: "" });
    } catch (err) {
      console.error("❌ Add Seller Error:", err);
      toast.error(err.response?.data?.message || "Error adding seller");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-100">
      <AdminSidebar setView={setView} currentView={view} />

      <div className="flex-1 p-8 overflow-y-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-indigo-700 mb-6"
        >
          Admin Dashboard –{" "}
          <span className="capitalize">
            {view === "addSeller" ? "Add Seller Form" : view === "offers" ? "Manage Offers" : `${view} Items`}
          </span>
        </motion.h1>

        {/* 🎁 Offer Management */}
        {view === "offers" ? (
          <OfferManagement />
        ) : view === "addSeller" ? (
          <form
            onSubmit={handleAddSeller}
            className="max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              🧾 Create New Seller
            </h2>
            {["name", "email", "password", "shopName"].map((field) => (
              <div key={field} className="mb-4">
                <label className="block text-sm text-gray-600 capitalize mb-1">
                  {field}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  value={sellerForm[field]}
                  onChange={(e) =>
                    setSellerForm({ ...sellerForm, [field]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all"
            >
              Add Seller
            </button>
          </form>
        ) : loading ? (
          <p className="text-gray-500 text-center mt-20 animate-pulse">
            Loading data...
          </p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">No items found 🐾</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden p-4 border border-gray-100 hover:shadow-xl"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-48 w-full object-cover rounded-lg"
                  />
                )}
                <div className="p-2">
                  <h3 className="text-lg font-semibold mt-3 text-gray-800">
                    {item.name || item.shopName}
                  </h3>
                  {item.email && (
                    <p className="text-sm text-gray-500">{item.email}</p>
                  )}
                  {item.price && (
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      ₹{item.price}
                    </p>
                  )}
                  {view === "pending" && (
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => handleReview(item._id, "approve")}
                        className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition"
                      >
                        Approve ✅
                      </button>
                      <button
                        onClick={() => handleReview(item._id, "reject")}
                        className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Reject ❌
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
