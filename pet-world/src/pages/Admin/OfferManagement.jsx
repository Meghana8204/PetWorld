import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function OfferManagement() {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    message: "",
    code: "",
    discount: "",
    minOrderAmount: "",
    isActive: false,
  });

  // 🧠 Fetch active offer
  const fetchOffer = async () => {
    try {
      const { data } = await axios.get("http://localhost:5001/api/offers");
      if (data.success && data.offer) {
        setOffer(data.offer);
        setFormData({
          message: data.offer.message || "",
          code: data.offer.code || "",
          discount: data.offer.discount || "",
          minOrderAmount: data.offer.minOrderAmount || "",
          isActive: data.offer.isActive || false,
        });
      } else {
        setOffer(null);
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
      toast.error("⚠️ Failed to load offer");
    }
  };

  useEffect(() => {
    fetchOffer();
  }, []);

  // 🧾 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle checkbox toggle
  const handleCheckbox = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  // 💾 Update or create offer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // JWT stored during admin login

      const { data } = await axios.put(
        "http://localhost:5001/api/offers/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("🎉 Offer updated successfully!");
        fetchOffer();
      } else {
        toast.error("⚠️ Failed to update offer");
      }
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error(error.response?.data?.message || "❌ Unauthorized or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">

      <div className="shadow-2xl rounded-2xl bg-white p-8">
        <h2 className="text-3xl font-semibold mb-6 text-indigo-700 flex items-center gap-2">
          🛠️ Offer Management
        </h2>

        {offer ? (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-xl shadow-lg">
            <p className="text-lg font-medium">{offer.message}</p>
            <p className="text-md font-medium">💰 Discount: {offer.discount}%</p>
            <p className="text-md font-medium">🔑 Code: {offer.code}</p>
            <p className="text-sm opacity-80 mt-1">
              Status: {offer.isActive ? "Active ✅" : "Inactive ❌"}
            </p>
          </div>
        ) : (
          <p className="mb-6 text-gray-500 italic">
            No active offer found. Create one below 👇
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Message</label>
            <input
              type="text"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter offer message"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="Enter discount percentage"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Promo Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter promo code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Minimum Order Amount (₹)</label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleChange}
              placeholder="Enter minimum order amount"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={handleCheckbox}
              className="w-4 h-4"
            />
            <label className="text-gray-700">Active Offer</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
            }`}
          >
            {loading ? "Saving..." : "Save Offer"}
          </button>
        </form>
      </div>
    </div>
  );
}
