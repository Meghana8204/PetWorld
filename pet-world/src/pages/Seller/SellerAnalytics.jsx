import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SellerAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    bestSelling: "—",
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // 📊 Fetch Seller Analytics
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await axiosInstance.get("/sellers/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setAnalytics(res.data);
        } else {
          toast.error("Failed to load analytics data 📉");
        }
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
        toast.error("Error loading analytics data");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [token]);

  return (
    <div className="bg-white/90 rounded-xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📊 Sales Analytics
      </h2>

      {/* 🕓 Loading */}
      {loading ? (
        <p className="text-gray-500 text-center py-10 animate-pulse">
          Loading analytics...
        </p>
      ) : analytics.monthlyData.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No analytics data yet 📉
        </p>
      ) : (
        <>
          {/* 📦 Summary Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-indigo-100 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold">Total Sales</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {analytics.totalSales}
              </p>
            </div>
            <div className="bg-green-100 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold">Revenue</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{analytics.totalRevenue?.toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold">Top Product</h3>
              <p className="text-lg font-bold text-yellow-700">
                {analytics.bestSelling}
              </p>
            </div>
          </div>

          {/* 📈 Bar Chart */}
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="sales" fill="#6366F1" name="Sales" />
                <Bar dataKey="revenue" fill="#22C55E" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
