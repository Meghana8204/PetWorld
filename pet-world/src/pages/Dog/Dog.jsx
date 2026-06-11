import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// avoid linter false-positive for unused `motion` when used in JSX
void motion;

import axiosInstance from "../../api/utils/axiosInstance";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  PawPrint,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

export default function Dog() {
  const [dogs, setDogs] = useState([]);
  const [filteredDogs, setFilteredDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [showFilters, setShowFilters] = useState(false);
  const fetched = useRef(false);
  const navigate = useNavigate();
  const { wishlist, refreshWishlist } = useWishlist();
  const { user } = useAuth();

  // 🐶 Fetch approved dogs
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    async function fetchDogs() {
      try {
        const res = await axiosInstance.get(
          "/pets/approved?category=Dog"
        );
        const allDogs = res.data.pets || [];
        // normalize: ensure images array and specifications
        const normalized = allDogs.map((dog) => {
          const copy = { ...dog };
          if (!Array.isArray(copy.images)) {
            if (copy.image) copy.images = [copy.image];
            else copy.images = [];
          }
          if (!Array.isArray(copy.specifications)) copy.specifications = [];
          return copy;
        });
        setDogs(normalized);
        setFilteredDogs(normalized);
        const highest = Math.max(...normalized.map((d) => d.price || 0), 50000);
        setMaxPrice(highest);
        setPriceRange([0, highest]);
      } catch (err) {
        console.error("❌ Error fetching dogs:", err);
        toast.error("Failed to load dogs 🐾");
      } finally {
        setLoading(false);
      }
    }

    fetchDogs();
  }, []);

  // 🔍 Apply Filters
  useEffect(() => {
    let filtered = [...dogs];
    if (search.trim()) {
      filtered = filtered.filter(
        (dog) =>
          dog.name?.toLowerCase().includes(search.toLowerCase()) ||
          dog.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    filtered = filtered.filter(
      (dog) => dog.price >= priceRange[0] && dog.price <= priceRange[1]
    );
    setFilteredDogs(filtered);
  }, [search, priceRange, dogs]);

  // 🛒 Add to Cart (not used in current card UI, kept for future expansion)
  const handleAddToCart = (dog) => {
    toast.dismiss(`cart-${dog._id}`);
    toast.success(`${dog.name} added to cart 🐾`, { id: `cart-${dog._id}` });
  };
  // silence linter about unused function
  void handleAddToCart;

  // ❤️ Wishlist Toggle
  const handleWishlist = async (dog) => {
    if (!user) {
      toast.error("Please login to add to wishlist 🔐");
      navigate("/login");
      return;
    }

    const alreadyLiked = wishlist.some((item) => item._id === dog._id);

    try {
      if (!alreadyLiked) {
        await axiosInstance.post("/wishlist/add", { petId: dog._id });
        await refreshWishlist();
        toast(`${dog.name} added to wishlist ❤️`, { id: `wish-${dog._id}`, icon: "❤️" });
      } else {
        await axiosInstance.delete(`/wishlist/remove/${dog._id}`);
        await refreshWishlist();
        toast(`${dog.name} removed from wishlist 💔`, { id: `wish-${dog._id}`, icon: "💔" });
      }
    } catch (err) {
      console.error("Error updating wishlist:", err?.response?.data || err.message);
      const msg = err?.response?.data?.message || "Wishlist update failed ❌";
      toast.error(msg);
    }
  };

  // 🎬 Animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-pink-50 overflow-hidden">

      {/* ☰ Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <PawPrint className="text-blue-600 w-6 h-6" /> Dogs
        </h1>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 text-blue-600 font-medium border border-blue-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-blue-50 transition"
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>

      {/* 🧭 Sidebar Filter */}
      <AnimatePresence>
        {(showFilters || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:w-72 w-full md:static fixed top-0 left-0 h-screen md:h-auto bg-white/90 backdrop-blur-lg shadow-xl md:shadow-none rounded-r-2xl z-50 border-r border-gray-100 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center md:mb-4">
              <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* 💰 Price Range */}
            <div className="mt-6">
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-blue-600"
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>₹0</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 🐶 Main Section */}
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10">
        {/* Header + Search */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 flex justify-center items-center gap-3">
            <PawPrint className="text-blue-600 w-7 h-7 sm:w-8 sm:h-8" />
            Find Your Perfect Dog 🐾
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-2xl mx-auto">
            Browse our cute, loyal, and playful friends waiting for their forever home!
          </p>

          {/* 🔍 Search Box */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search dogs by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white/80 backdrop-blur-md focus:ring-2 focus:ring-blue-500 outline-none transition text-sm sm:text-base"
              />
            </div>
          </div>
        </motion.div>

        {/* 🐕 Dogs Grid */}
        {loading ? (
          <p className="text-center text-gray-500 text-lg animate-pulse mt-20">
            Loading adorable dogs...
          </p>
        ) : filteredDogs.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-20">
            No dogs match your search 🐾
          </p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            {filteredDogs.map((dog, i) => {
              const isLiked = wishlist.some((item) => item._id === dog._id);
              return (
                <motion.div
                  key={dog._id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all cursor-pointer"
                  onClick={() => navigate(`/dogs/${dog._id}`)} // 👉 open full details page
                >
                  {/* 🖼 Image */}
                  <div className="relative h-52 sm:h-60 md:h-64 overflow-hidden">
                    <motion.img
                      src={
                        dog.image ||
                        "https://cdn-icons-png.flaticon.com/512/616/616408.png"
                      }
                      alt={dog.name}
                      className="object-cover w-full h-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* 📝 Details */}
                  <div className="p-4 sm:p-5">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                      {dog.name}
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {dog.category}
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {dog.offerPrice && dog.offerPrice > 0 ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">₹{dog.price?.toLocaleString()}</p>
                            <p className="text-base sm:text-lg font-bold text-blue-600">₹{dog.offerPrice?.toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="text-base sm:text-lg font-bold text-blue-600">₹{dog.price?.toLocaleString()}</p>
                        )}
                        <Heart
                          fill={isLiked ? "red" : "none"}
                          strokeWidth={1.5}
                          className={`transition cursor-pointer ml-auto ${
                            isLiked
                              ? "text-red-500"
                              : "text-gray-400 hover:text-red-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlist(dog);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
    );
  }
