// 📁 src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, Heart, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import LOGO from "../assets/Logo.jpg";

// avoid linter false-positive for unused `motion` when used in JSX
void motion;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();

  // 🌀 Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 📦 Fetch user orders when logged in
  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  // 📦 Refetch orders when location changes (user navigates to /orders after placing order)
  useEffect(() => {
    if (user && location.pathname === "/orders") {
      fetchUserOrders();
    }
  }, [user, location.pathname]);

  // 📦 Fetch orders from backend
  const fetchUserOrders = async () => {
    try {
      const res = await axiosInstance.get("/orders/my-orders");
      setUserOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // 🔍 Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchText.trim();
    if (q) {
      // navigate to search results page with query param
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchText("");
    }
  };

  // 👋 Logout handler
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully 👋");
    navigate("/");
  };

  const handleLoginClick = () => {
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-md"
          : "bg-transparent backdrop-blur-sm"
      }`}
    >
      {/* 🌈 Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-pink-100 via-amber-50 to-indigo-100 blur-3xl"
        />
      </div>

      {/* 🧭 Navbar Container */}
      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <motion.img
            src={LOGO}
            alt="Pet World Logo"
            className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover shadow-md border border-white/50"
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-amber-500 to-indigo-600 bg-clip-text text-transparent">
            Pet World
          </h1>
        </motion.div>

        {/* 🔍 Desktop Search + User Actions */}
        <div className="hidden md:flex items-center gap-6 flex-grow justify-center">
          {/* Search */}
          <motion.form
            onSubmit={handleSearch}
            whileHover={{ scale: 1.02 }}
            className="flex items-center border border-gray-200 rounded-full gap-2 h-[42px] max-w-md w-full px-3 bg-white/80 shadow-sm backdrop-blur-md"
          >
            <input
              type="text"
              placeholder="Search pets, food, or toys..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-indigo-600 px-4 py-1.5 rounded-full text-sm text-white font-semibold hover:from-indigo-600 hover:to-pink-500 transition"
            >
              Search
            </motion.button>
          </motion.form>

          {/* User + Cart */}
          <div className="flex items-center gap-5">
            {/* User Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-200 rounded-full shadow-sm hover:bg-white"
              >
                <User className="w-5 h-5 text-pink-600" />
                <span className="text-gray-700 font-medium">
                  {user ? user.name || user.email?.split("@")[0] : "Account"}
                </span>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    {!user ? (
                      <li
                        onClick={handleLoginClick}
                        className="px-4 py-2 hover:bg-pink-50 cursor-pointer font-medium text-pink-600"
                      >
                        Sign In
                      </li>
                    ) : (
                      <>
                        <li
                          onClick={() => {
                            navigate("/profile");
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-pink-50 cursor-pointer"
                        >
                          My Profile
                        </li>
                        <li
                          onClick={() => {
                            navigate("/orders");
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-pink-50 cursor-pointer flex items-center gap-2 justify-between"
                        >
                          <span>Orders</span>
                          {userOrders.length > 0 && (
                            <span className="bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                              {userOrders.length}
                            </span>
                          )}
                        </li>
                        <li
                          onClick={() => {
                            navigate("/wishlist");
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-pink-50 cursor-pointer flex items-center gap-2 justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-500" /> Wishlist
                          </span>
                          {wishlist.length > 0 && (
                            <span className="bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                              {wishlist.length}
                            </span>
                          )}
                        </li>
                        <li
                          onClick={() => {
                            navigate("/notifications");
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-pink-50 cursor-pointer flex items-center gap-2"
                        >
                          <Bell className="w-4 h-4 text-indigo-500" /> Notifications
                        </li>
                        <li
                          onClick={handleLogout}
                          className="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer font-medium"
                        >
                          Logout
                        </li>
                      </>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* 🛒 Cart Icon */}
            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <ShoppingCart
                onClick={() => navigate("/cart")}
                className="w-6 h-6 cursor-pointer text-gray-700 hover:text-pink-600 transition"
              />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.div>
          </div>
        </div>

        {/* 📱 Mobile Icons */}
        <div className="flex items-center gap-3 md:hidden">
          <motion.div whileHover={{ scale: 1.1 }} className="relative">
            <ShoppingCart
              onClick={() => navigate("/cart")}
              className="w-6 h-6 cursor-pointer text-gray-700 hover:text-pink-600 transition"
            />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {totalItems}
              </span>
            )}
          </motion.div>
          <button
            className="text-gray-700"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col gap-3 p-5 border-t border-white/30 bg-white/80 backdrop-blur-xl"
          >
            {/* Mobile Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 border border-gray-300 rounded-full px-3 h-[42px] bg-white/70 shadow-sm"
            >
              <input
                type="text"
                placeholder="Find pets or accessories..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-indigo-600 px-4 py-1 rounded-full text-white text-sm font-semibold"
              >
                Go
              </button>
            </form>

            {/* Mobile Menu Items */}
            {!user ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLoginClick}
                className="bg-gradient-to-r from-pink-500 to-indigo-600 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:from-indigo-600 hover:to-pink-500 transition"
              >
                Sign In
              </motion.button>
            ) : (
              <>
                <li
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left hover:bg-pink-50 rounded cursor-pointer"
                >
                  My Profile
                </li>
                <li
                  onClick={() => {
                    navigate("/orders");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left hover:bg-pink-50 rounded cursor-pointer flex items-center justify-between"
                >
                  <span>Orders</span>
                  {userOrders.length > 0 && (
                    <span className="bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {userOrders.length}
                    </span>
                  )}
                </li>
                <li
                  onClick={() => {
                    navigate("/wishlist");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left hover:bg-pink-50 rounded flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-pink-500" /> Wishlist
                </li>
                <li
                  onClick={() => {
                    navigate("/notifications");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left hover:bg-pink-50 rounded flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-indigo-500" /> Notifications
                </li>
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-semibold hover:text-red-600 mt-2"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
