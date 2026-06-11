import React from "react";
import { motion } from "framer-motion";
import { FaPaw, FaPlusCircle, FaChartLine, FaBoxOpen } from "react-icons/fa";

export default function SellerLayout({ children, setView, currentView }) {
  const menuItems = [
    { key: "products", label: "My Products", icon: <FaPaw /> },
    { key: "orders", label: "Orders", icon: <FaBoxOpen /> }, // 🆕 Added Orders tab
    { key: "addProduct", label: "Add Product", icon: <FaPlusCircle /> },
    { key: "analytics", label: "Sales Analytics", icon: <FaChartLine /> }, // changed key to match dashboard code
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-64 bg-indigo-700 text-white p-6 flex flex-col shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-8 text-center">🐾 Seller Panel</h2>

        <nav className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                currentView === item.key
                  ? "bg-indigo-500"
                  : "hover:bg-indigo-600"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main content area */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
