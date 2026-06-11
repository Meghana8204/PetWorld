// src/pages/shop/PetFoodShop.jsx
import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/CartContext";

const PetFoodShop = () => {
  const { cart, addToCart, removeFromCart, totalItems } = useCart();

  // 🐶 Product data
  const foods = [
    {
      id: 1,
      name: "Pedigree Adult Dog Food",
      price: 799,
      image:
        "https://media.istockphoto.com/id/1055029940/photo/dog-food-in-a-stainless-steel-bowl.jpg?s=612x612&w=0&k=20&c=mdvzj_X6mUCKtolgUewK3YhcnsKBevjvCTNZG0dinxA=",
      category: "Dog",
      desc: "Wholesome, balanced nutrition for strong and healthy adult dogs.",
      rating: 4.5,
    },
    {
      id: 2,
      name: "Whiskas Tuna Cat Food",
      price: 499,
      image:
        "https://media.istockphoto.com/id/1226997452/photo/cat-food-and-two-cats.jpg?s=612x612&w=0&k=20&c=Eu-kmy2j1Y_ln3EtW8Ld_pPTNSR7JM4rT_FNs1XjWuI=",
      category: "Cat",
      desc: "Delicious tuna blend that supports energy and healthy fur.",
      rating: 4.3,
    },
    {
      id: 3,
      name: "TetraBits Fish Food",
      price: 299,
      image:
        "https://media.istockphoto.com/id/181954091/photo/feeding-fish.jpg?s=612x612&w=0&k=20&c=xdevo53zEeHf6pv8P-8g_KdjACSHbiSqxzusLH-kwrE=",
      category: "Fish",
      desc: "Nutrient-rich floating granules that enhance fish color and vitality.",
      rating: 4.6,
    },
    {
      id: 4,
      name: "Kaytee Bird Seed Mix",
      price: 399,
      image:
        "https://media.istockphoto.com/id/160353256/photo/pile-of-bird-seed-including-sunflower-seeds-wheat-and-maize.jpg?s=612x612&w=0&k=20&c=fZLcqumeiS4sYnUWjeuh5ja1XDKEBAmotd2ZxuOCm0k=",
      category: "Bird",
      desc: "Premium seed mix promoting strong feathers and lively chirping.",
      rating: 4.2,
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-white min-h-screen py-16 px-4 sm:px-8 lg:px-16">
      {/* 🌟 Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-slate-800 mb-4"
      >
        🛍️ Pet Food Store
      </motion.h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12 text-sm sm:text-base">
        Nourish your pets with trusted brands and wholesome meals. Choose from a
        variety of healthy foods for your furry and feathery friends.
      </p>

      {/* 🧺 Product Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto"
      >
        {foods.map((food) => {
          const quantity = cart[food.id]?.quantity || 0;
          return (
            <motion.div
              key={food.id}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col"
            >
              {/* 🐾 Image */}
              <motion.div className="relative">
                <motion.img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-52 sm:h-56 md:h-60 object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {food.category}
                </span>
              </motion.div>

              {/* 🧾 Details */}
              <div className="flex flex-col justify-between flex-grow p-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 line-clamp-1">
                    {food.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {food.desc}
                  </p>

                  {/* ⭐ Rating */}
                  <div className="flex items-center mt-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={food.rating > i ? "#facc15" : "none"}
                          stroke="#facc15"
                        />
                      ))}
                    <span className="ml-2 text-xs text-gray-500">
                      {food.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* 💰 Price & Add Controls */}
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-indigo-600 font-bold text-lg">
                    ₹{food.price}
                  </p>

                  {quantity === 0 ? (
                    <button
                      onClick={() => addToCart(food.id, food)}
                      className="flex items-center justify-center gap-2 bg-indigo-100 border border-indigo-300 rounded-full px-3 py-1.5 text-indigo-700 text-sm font-semibold hover:bg-indigo-200 transition"
                    >
                      <ShoppingCart size={16} /> Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-300 rounded-full px-3 py-1.5 select-none">
                      <button
                        onClick={() => removeFromCart(food.id)}
                        className="text-indigo-700 font-bold text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="text-indigo-700 font-medium w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => addToCart(food.id, food)}
                        className="text-indigo-700 font-bold text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 🛒 Floating Cart Summary */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 right-6 bg-white shadow-xl border border-gray-200 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-3 cursor-pointer hover:shadow-2xl hover:scale-105 transition"
          onClick={() => (window.location.href = "/cart")}
        >
          <ShoppingCart className="text-indigo-600" size={20} />
          <p className="font-semibold text-gray-700 text-sm sm:text-base">
            {totalItems} {totalItems === 1 ? "item" : "items"} in cart
          </p>
        </motion.div>
      )}
    </section>
  );
};

export default PetFoodShop;
