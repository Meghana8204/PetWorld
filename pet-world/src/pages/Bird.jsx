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

// NOTE: some linters can incorrectly report `motion` as unused when it's used in JSX (<motion.div>),
// so keep a no-op reference to avoid false positives.
void motion;

export default function Bird() {
  const [birds, setBirds] = useState([]);
  const [filteredBirds, setFilteredBirds] = useState([]);
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

    async function fetchBirds() {
      try {
        const res = await axiosInstance.get("/pets/approved?category=Bird");
        const allBirds = res.data.pets || [];
        // Normalize: ensure images array and specifications
        const normalized = allBirds.map((bird) => {
          const copy = { ...bird };
          if (!Array.isArray(copy.images)) {
            if (copy.image) copy.images = [copy.image];
            else copy.images = [];
          }
          if (!Array.isArray(copy.specifications)) copy.specifications = [];
          return copy;
        });
        setBirds(normalized);
        setFilteredBirds(normalized);

        const highest = Math.max(...normalized.map((b) => b.price || 0), 50000);
        setMaxPrice(highest);
        setPriceRange([0, highest]);
      } catch (err) {
        console.error("❌ Error fetching birds:", err);
        toast.error("Failed to load birds 🐦");
      } finally {
        setLoading(false);
      }
    }

    fetchBirds();
  }, []);

  useEffect(() => {
    let filtered = [...birds];

    if (search.trim()) {
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(search.toLowerCase()) ||
          b.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered = filtered.filter((b) => b.price >= priceRange[0] && b.price <= priceRange[1]);

    setFilteredBirds(filtered);
  }, [search, priceRange, birds]);

  const handleAddToCart = async (bird) => {
    if (!user) {
      toast.error("Please login to add items to cart 🔐");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        petId: bird._id,
        quantity: 1,
      };

      await axiosInstance.post("/cart/add", payload);
      addToCart(bird._id || bird.id, {
        petId: bird._id,
        name: bird.name,
        price: bird.price,
        image: bird.image,
        category: bird.category,
        quantity: 1,
      });
      toast.success(`${bird.name} added to cart 🐾`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Error adding to cart ❌");
    }
  };

  const handleWishlist = async (bird) => {
    if (!user) {
      toast.error("Please login to add to wishlist 🔐");
      navigate("/login");
      return;
    }

    const alreadyLiked = wishlist.some((item) => item._id === bird._id);

    try {
      if (alreadyLiked) {
        await axiosInstance.delete(`/wishlist/remove/${bird._id}`);
        await refreshWishlist();
        toast(`${bird.name} removed from wishlist 💔`);
      } else {
        await axiosInstance.post("/wishlist/add", { petId: bird._id });
        await refreshWishlist();
        toast(`${bird.name} added to wishlist ❤️`);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err?.response?.data || err.message);
      const msg = err?.response?.data?.message || "Wishlist update failed ❌";
      toast.error(msg);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">

      <div className="md:hidden flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-cyan-700 flex items-center gap-2">
          <PawPrint className="text-cyan-600 w-6 h-6" /> Birds
        </h1>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 text-cyan-600 font-medium border border-cyan-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-cyan-50 transition"
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
              <h2 className="text-lg font-bold text-cyan-700 flex items-center gap-2">
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
                className="w-full accent-cyan-600"
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Total Birds:</strong> {birds.length}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Available:</strong> {filteredBirds.length}
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-cyan-700 flex justify-center items-center gap-3">
            <PawPrint className="text-cyan-600 w-7 h-7 sm:w-8 sm:h-8" />
            Find Your Feathered Friend 🐦
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-2xl mx-auto">
            Browse delightful birds available from verified sellers. Adopt or buy the bird that fits your home!
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search birds by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white/80 backdrop-blur-md focus:ring-2 focus:ring-cyan-500 outline-none transition text-sm sm:text-base"
              />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-500 text-lg animate-pulse mt-20">Loading birds...</p>
        ) : filteredBirds.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-20">No birds match your search 🐦</p>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredBirds.map((bird, i) => {
              const isLiked = wishlist.some((item) => item._id === bird._id);
              return (
                <motion.div
                  key={bird._id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all cursor-pointer"
                  onClick={() => navigate(`/pets/${bird._id}`)}
                >
                  <div className="relative h-52 sm:h-60 md:h-64 overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100">
                    <motion.img
                      src={bird.image || "https://cdn-icons-png.flaticon.com/512/616/616408.png"}
                      alt={bird.name}
                      className="object-cover w-full h-full"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="p-4 sm:p-5">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{bird.name}</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">{bird.category}</p>

                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      {Array.isArray(bird.specifications) && bird.specifications.length > 0 ? (
                        bird.specifications.slice(0, 2).map((s, idx) => (
                          <p key={idx}><strong>{s.label}:</strong> {s.value}</p>
                        ))
                      ) : (
                        <>
                          {bird.breed && <p><strong>Breed:</strong> {bird.breed}</p>}
                          {bird.age && <p><strong>Age:</strong> {bird.age}</p>}
                        </>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {bird.offerPrice && bird.offerPrice > 0 ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">₹{bird.price?.toLocaleString()}</p>
                            <p className="text-base sm:text-lg font-bold text-cyan-600">₹{bird.offerPrice?.toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="text-base sm:text-lg font-bold text-cyan-600">₹{bird.price?.toLocaleString()}</p>
                        )}
                        <Heart
                          fill={isLiked ? "red" : "none"}
                          strokeWidth={1.5}
                          className={`transition cursor-pointer ml-auto ${
                            isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlist(bird);
                          }}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(bird);
                      }}
                      className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
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
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm sm:text-base font-semibold py-3 px-5 sm:px-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ShoppingCart size={20} /> Cart ({totalItems})
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
