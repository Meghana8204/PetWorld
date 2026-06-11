import React from "react";
import { motion } from "framer-motion";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/utils/axiosInstance";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// avoid linter false-positive when motion is only used in JSX
void motion;

const Wishlist = () => {
  const { wishlist, clearWishlist, refreshWishlist } = useWishlist();
  const { user } = useAuth();

  // Sync wishlist from server when user is present
  React.useEffect(() => {
    if (user) refreshWishlist();
  }, [user, refreshWishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Wishlist is Empty 😿
        </h2>
        <Link
          to="/"
          className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-5 py-2 rounded-lg shadow-md hover:from-pink-500 hover:to-indigo-600 transition-all"
        >
          Browse Pets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          Your Wishlist ❤️
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearWishlist}
          className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 shadow-sm"
        >
          Clear All
        </motion.button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {wishlist.map((pet) => (
          <motion.div
            key={pet._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl shadow-md overflow-hidden transition-all bg-white hover:shadow-xl cursor-pointer"
          >
            {/* Pet Image */}
            <div className="overflow-hidden h-56">
              <motion.img
                src={pet.image}
                alt={pet.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Pet Info */}
            <div className="p-5 flex flex-col justify-between h-36">
              <h2 className="font-semibold text-lg text-gray-800 mb-2 truncate">
                {pet.name}
              </h2>

              <div className="flex justify-between items-center gap-2">
                <Link
                  to={`/pets/${pet._id}`}
                  state={{ pet }}
                  className="text-sm text-indigo-600 font-medium hover:underline truncate"
                >
                  View Details →
                </Link>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (!user) {
                      toast.error("Please login to modify wishlist 🔐");
                      return;
                    }
                    try {
                      await axiosInstance.delete(`/wishlist/remove/${pet._id}`);
                      await refreshWishlist();
                    } catch (err) {
                      console.error("Error removing wishlist item:", err?.response?.data || err.message);
                      toast.error(err?.response?.data?.message || "Failed to remove item");
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 whitespace-nowrap"
                >
                  Remove
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
