import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

export default function AdminSidebar({ setView, currentView }) {
  const links = [
    { id: "pending", label: "Pending Pets" },
    { id: "approved", label: "Approved Pets" },
    { id: "rejected", label: "Rejected Pets" },
    { id: "sellers", label: "Sellers" },
    { id: "users", label: "Users" },
    { id: "offers", label: "🎁 Manage Offers" },
    { id: "addSeller", label: "Add Seller" },
  ];

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-indigo-700 text-white p-6 shadow-lg min-h-screen"
    >
      <h2 className="text-2xl font-bold mb-8 text-center">Admin Panel 🛠</h2>

      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.id}>
            <button
              onClick={() => setView(link.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                currentView === link.id
                  ? "bg-indigo-500"
                  : "hover:bg-indigo-600"
              }`}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/auth";
        }}
        className="mt-10 w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg"
      >
        Logout
      </button>
    </motion.aside>
  );
}