// src/components/SellerSidebar.jsx
import React from "react";
import { FaDog, FaPlusCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SellerSidebar({ setView, currentView }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menu = [
    { key: "products", label: "My Pets", icon: <FaDog /> },
    { key: "add", label: "Add Pet", icon: <FaPlusCircle /> },
  ];

  return (
    <aside className="bg-gradient-to-b from-indigo-600 to-indigo-800 text-white w-64 min-h-screen p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">Seller Panel 🛍️</h2>
        <ul className="space-y-4">
          {menu.map((item) => (
            <li
              key={item.key}
              onClick={() => setView(item.key)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                currentView === item.key ? "bg-indigo-500" : "hover:bg-indigo-700"
              }`}
            >
              {item.icon} <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 mt-10 bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg w-full text-center justify-center"
      >
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
