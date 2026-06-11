// src/pages/Seller/SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SellerLayout from "../../pages/Seller/SellerLayout";
import SellerProducts from "../../pages/Seller/SellerProducts";
import SellerOrders from "../../pages/Seller/SellerOrders";
import SellerAnalytics from "../../pages/Seller/SellerAnalytics";
import SellerAddProduct from "../../pages/Seller/SellerAddProduct";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SellerDashboard() {
  const [view, setView] = useState("products");
  const [editingPet, setEditingPet] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Support deep-linking to addProduct with pre-filled pet via navigation state
    if (location?.state?.pet) {
      setEditingPet(location.state.pet);
      setView("addProduct");
      // clear location state after consuming
      navigate(location.pathname, { replace: true });
    }
    // support explicit ?view=... query param
    const params = new URLSearchParams(location.search);
    const qview = params.get("view");
    if (qview) setView(qview);
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully 👋");
    setTimeout(() => {
      toast.dismiss();
      navigate("/login", { replace: true });
    }, 2000);
  };

  return (
    <SellerLayout setView={setView} currentView={view}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-indigo-700">
          Seller Dashboard 🐾
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout 🔒
        </button>
      </div>

      {/* View Switcher */}
      {view === "products" && <SellerProducts />}
      {view === "orders" && <SellerOrders />}
      {view === "analytics" && <SellerAnalytics />}
      {view === "addProduct" && (
        <SellerAddProduct editingPet={editingPet} clearEditing={() => setEditingPet(null)} />
      )}
    </SellerLayout>
  );
}
