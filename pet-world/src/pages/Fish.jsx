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

// Prevent some linters complaining about motion in JSX
void motion;

export default function Fish() {
  const [fish, setFish] = useState([]);
  const [filteredFish, setFilteredFish] = useState([]);
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

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    async function fetchFish() {
      try {
        const res = await axiosInstance.get("/pets/approved?category=Fish");
        const allFish = res.data.pets || [];
        // Normalize: ensure images array and specifications
        const normalized = allFish.map((f) => {
          const copy = { ...f };
          if (!Array.isArray(copy.images)) {
            if (copy.image) copy.images = [copy.image];
            else copy.images = [];
          }
          if (!Array.isArray(copy.specifications)) copy.specifications = [];
          return copy;
        });
        setFish(normalized);
        setFilteredFish(normalized);

        const highest = Math.max(...normalized.map((f) => f.price || 0), 50000);
        setMaxPrice(highest);
        setPriceRange([0, highest]);
      } catch (err) {
        console.error("❌ Error fetching fish:", err);
        toast.error("Failed to load fish 🐟");
      } finally {
        setLoading(false);
      }
    }

    fetchFish();
  }, []);

  useEffect(() => {
    let filtered = [...fish];

    if (search.trim()) {
      filtered = filtered.filter(
        (f) =>
          f.name?.toLowerCase().includes(search.toLowerCase()) ||
          f.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered = filtered.filter((f) => f.price >= priceRange[0] && f.price <= priceRange[1]);

    setFilteredFish(filtered);
  }, [search, priceRange, fish]);

  const handleAddToCart = async (f) => {
    if (!user) {
      toast.error("Please login to add items to cart 🔐");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        petId: f._id,
        quantity: 1,
      };

      await axiosInstance.post("/cart/add", payload);

      // addToCart expects (id, product) - use f._id as the cart key
      addToCart(f._id || f.id, {
        petId: f._id,
        name: f.name,
        price: f.price,
        image: f.image,
        category: f.category,
        quantity: 1,
      });

      toast.success(`${f.name} added to cart 🐾`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Error adding to cart ❌");
    }
  };

  const handleWishlist = async (f) => {
    if (!user) {
      toast.error("Please login to add to wishlist 🔐");
      navigate("/login");
      return;
    }

    const alreadyLiked = wishlist.some((item) => item._id === f._id);
      try {
        if (alreadyLiked) {
          await axiosInstance.delete(`/wishlist/remove/${f._id}`);
          await refreshWishlist();
          toast(`${f.name} removed from wishlist 💔`);
        } else {
          await axiosInstance.post("/wishlist/add", { petId: f._id });
          await refreshWishlist();
          toast(`${f.name} added to wishlist ❤️`);
        }
      } catch (err) {
        console.error("Error updating wishlist:", err?.response?.data || err.message);
        const msg = err?.response?.data?.message || "Wishlist update failed ❌";
        toast.error(msg);
      toast.error("Wishlist update failed ❌");
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-teal-50 via-white to-sky-50 overflow-hidden">

      <div className="md:hidden flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-sky-700 flex items-center gap-2">
          <PawPrint className="text-sky-600 w-6 h-6" /> Fish
        </h1>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 text-sky-600 font-medium border border-sky-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-sky-50 transition"
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>

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
              <h2 className="text-lg font-bold text-sky-700 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-sky-600"
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-sky-100 to-teal-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Total Fish:</strong> {fish.length}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Available:</strong> {filteredFish.length}
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-sky-700 flex justify-center items-center gap-3">
            <PawPrint className="text-sky-600 w-7 h-7 sm:w-8 sm:h-8" />
            Explore Beautiful Fish 🐟
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-2xl mx-auto">
            Find colorful and healthy fish from trusted sellers for your aquarium.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search fish by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white/80 backdrop-blur-md focus:ring-2 focus:ring-sky-500 outline-none transition text-sm sm:text-base"
              />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-500 text-lg animate-pulse mt-20">Loading fish...</p>
        ) : filteredFish.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-20">No fish match your search 🐟</p>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredFish.map((f, i) => {
              const isLiked = wishlist.some((item) => item._id === f._id);
              return (
                <motion.div
                  key={f._id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all cursor-pointer"
                  onClick={() => navigate(`/pets/${f._id}`)}
                >
                  <div className="relative h-52 sm:h-60 md:h-64 overflow-hidden bg-gradient-to-br from-sky-100 to-teal-100">
                    <motion.img
                      src={f.image || "https://cdn-icons-png.flaticon.com/512/616/616408.png"}
                      alt={f.name}
                      className="object-cover w-full h-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="p-4 sm:p-5">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{f.name}</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">{f.category}</p>

                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      {Array.isArray(f.specifications) && f.specifications.length > 0 ? (
                        f.specifications.slice(0, 2).map((s, idx) => (
                          <p key={idx}><strong>{s.label}:</strong> {s.value}</p>
                        ))
                      ) : (
                        <>
                          {f.breed && <p><strong>Breed:</strong> {f.breed}</p>}
                          {f.age && <p><strong>Age:</strong> {f.age}</p>}
                        </>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {f.offerPrice && f.offerPrice > 0 ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">₹{f.price?.toLocaleString()}</p>
                            <p className="text-base sm:text-lg font-bold text-sky-600">₹{f.offerPrice?.toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="text-base sm:text-lg font-bold text-sky-600">₹{f.price?.toLocaleString()}</p>
                        )}
                        <Heart
                          fill={isLiked ? "red" : "none"}
                          strokeWidth={1.5}
                          className={`transition cursor-pointer ml-auto ${
                            isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlist(f);
                          }}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(f);
                      }}
                      className="w-full mt-3 bg-gradient-to-r from-sky-500 to-teal-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
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
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 text-white text-sm sm:text-base font-semibold py-3 px-5 sm:px-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ShoppingCart size={20} /> Cart ({totalItems})
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
