import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/utils/axiosInstance";
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
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

// silence linter about unused motion import
void motion;

export default function Cat() {
  const [cats, setCats] = useState([]);
  const [filteredCats, setFilteredCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [showFilters, setShowFilters] = useState(false);
  const fetched = useRef(false);

  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const { user } = useAuth();
  const { wishlist, refreshWishlist } = useWishlist();

  /* ==========================================================
     🐱 FETCH CATS
  ========================================================== */
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    async function fetchCats() {
      try {
        const res = await axiosInstance.get("/pets/approved?category=Cat");
        const allCats = res.data.pets || [];

        const normalized = allCats.map((cat) => ({
          ...cat,
          images: Array.isArray(cat.images)
            ? cat.images
            : cat.image
            ? [cat.image]
            : [],
          specifications: Array.isArray(cat.specifications)
            ? cat.specifications
            : [],
        }));

        setCats(normalized);
        setFilteredCats(normalized);

        const highest = Math.max(...normalized.map((c) => c.price || 0), 50000);
        setMaxPrice(highest);
        setPriceRange([0, highest]);
      } catch (err) {
        console.error("❌ Error fetching cats:", err);
        toast.error("Failed to load cats 🐱");
      } finally {
        setLoading(false);
      }
    }

    fetchCats();
  }, []);

  /* ==========================================================
     🔍 SEARCH + FILTER
  ========================================================== */
  useEffect(() => {
    let filtered = [...cats];

    if (search.trim()) {
      filtered = filtered.filter(
        (cat) =>
          cat.name?.toLowerCase().includes(search.toLowerCase()) ||
          cat.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (cat) => cat.price >= priceRange[0] && cat.price <= priceRange[1]
    );

    setFilteredCats(filtered);
  }, [search, priceRange, cats]);

  /* ==========================================================
     🛒 ADD TO CART
  ========================================================== */
  const handleAddToCart = async (cat) => {
    if (!user) {
      toast.error("Please login to add items to cart 🔐");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        petId: cat._id,
        quantity: 1,
      };

      await axiosInstance.post("/cart/add", payload);
      addToCart(cat._id || cat.id, {
        petId: cat._id,
        name: cat.name,
        price: cat.offerPrice && cat.offerPrice > 0 ? cat.offerPrice : cat.price,
        image: cat.images?.[0] || cat.image,
        category: cat.category,
        quantity: 1,
      });
      toast.success(`${cat.name} added to cart 🐾`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Error adding to cart ❌");
    }
  };

  /* ==========================================================
     ❤️ WISHLIST HANDLER
  ========================================================== */
  const handleWishlist = async (cat) => {
    if (!user) {
      toast.error("Please login to manage wishlist 🔐");
      navigate("/login");
      return;
    }

    const alreadyLiked = wishlist.some((item) => item._id === cat._id);

    try {
      if (alreadyLiked) {
        await axiosInstance.delete(`/wishlist/remove/${cat._id}`);
        await refreshWishlist();
        toast(`${cat.name} removed from wishlist 💔`);
      } else {
        await axiosInstance.post("/wishlist/add", { petId: cat._id });
        await refreshWishlist();
        toast(`${cat.name} added to wishlist ❤️`);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Failed to update wishlist ❌");
    }
  };

  /* ==========================================================
     🎬 Animations
  ========================================================== */
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  /* ==========================================================
     🖼️ RENDER
  ========================================================== */
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">

        {/* ☰ Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
          <h1 className="text-2xl font-bold text-pink-700 flex items-center gap-2">
            <PawPrint className="text-pink-600 w-6 h-6" /> Cats
          </h1>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 text-pink-600 font-medium border border-pink-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-pink-50 transition"
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
                <h2 className="text-lg font-bold text-pink-700 flex items-center gap-2">
                  <SlidersHorizontal size={18} /> Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 💰 Price Range Filter */}
              <div className="mt-6">
                <label className="block text-sm text-gray-700 mb-2 font-medium">
                  Price Range: ₹{priceRange[0].toLocaleString()} - ₹
                  {priceRange[1].toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([0, parseInt(e.target.value)])
                  }
                  className="w-full accent-pink-600"
                />
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>₹0</span>
                  <span>₹{maxPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Info Summary */}
              <div className="mt-8 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Total Cats:</strong> {cats.length}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Available:</strong> {filteredCats.length}
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 🐱 Main Section */}
        <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10">
          {/* Header + Search */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-700 flex justify-center items-center gap-3">
              <PawPrint className="text-pink-600 w-7 h-7 sm:w-8 sm:h-8" />
              Find Your Purrfect Cat 🐱
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-2xl mx-auto">
              Browse our adorable, cuddly, and loving feline friends waiting for their forever home!
            </p>

            {/* 🔍 Search Box */}
            <div className="mt-6 flex justify-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search cats by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white/80 backdrop-blur-md focus:ring-2 focus:ring-pink-500 outline-none transition text-sm sm:text-base"
                />
              </div>
            </div>
          </motion.div>

          {/* 🐾 Cats Grid */}
          {loading ? (
            <p className="text-center text-gray-500 text-lg animate-pulse mt-20">
              Loading adorable cats...
            </p>
          ) : filteredCats.length === 0 ? (
            <p className="text-center text-gray-400 text-lg mt-20">
              No cats match your search 🐱
            </p>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
            >
              {filteredCats.map((cat, i) => {
                const isLiked = wishlist.some((item) => item._id === cat._id);
                return (
                  <motion.div
                    key={cat._id}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.03 }}
                    className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all cursor-pointer"
                    onClick={() => navigate(`/pets/${cat._id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-52 sm:h-60 md:h-64 overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                      <motion.img
                        src={
                          cat.images?.[0] ||
                          "https://cdn-icons-png.flaticon.com/512/1995/1995640.png"
                        }
                        alt={cat.name}
                        className="object-cover w-full h-full"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    {/* Details */}
                    <div className="p-4 sm:p-5">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                        {cat.name}
                      </h2>
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        {cat.category}
                      </p>

                      {/* Specs */}
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        {Array.isArray(cat.specifications) &&
                        cat.specifications.length > 0 ? (
                          cat.specifications.slice(0, 2).map((s, idx) => (
                            <p key={idx}>
                              <strong>{s.label}:</strong> {s.value}
                            </p>
                          ))
                        ) : (
                          <>
                            {cat.breed && (
                              <p>
                                <strong>Breed:</strong> {cat.breed}
                              </p>
                            )}
                            {cat.age && (
                              <p>
                                <strong>Age:</strong> {cat.age}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Price & Wishlist */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {cat.offerPrice && cat.offerPrice > 0 ? (
                            <>
                              <p className="text-xs text-gray-400 line-through">
                                ₹{cat.price?.toLocaleString()}
                              </p>
                              <p className="text-base sm:text-lg font-bold text-pink-600">
                                ₹{cat.offerPrice?.toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <p className="text-base sm:text-lg font-bold text-pink-600">
                              ₹{cat.price?.toLocaleString()}
                            </p>
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
                              handleWishlist(cat);
                            }}
                          />
                        </div>
                      </div>

                      {/* Add to Cart */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(cat);
                        }}
                        className="w-full mt-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* 🛍 Floating Cart Button */}
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm sm:text-base font-semibold py-3 px-5 sm:px-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              <ShoppingCart size={20} /> Cart ({totalItems})
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  }
