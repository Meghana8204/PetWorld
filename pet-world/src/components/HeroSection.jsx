// ✅ src/pages/home/HeroSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// 🐾 Pet Images
import Dog1 from "../assets/Dog1.jpg";
import Cat from "../assets/Cat.jpg";
import Bird from "../assets/Bird.jpg";
import Fish from "../assets/Fish.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const pets = [
    {
      id: 1,
      title: "Adopt or Shop for Dogs 🐕",
      desc: "Find adorable, loyal, and playful companions. Choose from premium dog breeds and essential accessories all in one place.",
      image: Dog1,
      bg: "from-amber-100 via-yellow-50 to-white",
      gradientColor: "rgba(255, 215, 0, 0.4)",
      route: "/category/dogs",
    },
    {
      id: 2,
      title: "Charming Cats Await 🐱",
      desc: "From fluffy kittens to graceful adults, discover cats that match your lifestyle — plus grooming tools, toys, and care products.",
      image: Cat,
      bg: "from-pink-100 via-rose-50 to-white",
      gradientColor: "rgba(255, 182, 193, 0.4)",
      route: "/category/cats",
    },
    {
      id: 3,
      title: "Colorful Birds for Your Home 🦜",
      desc: "Brighten your days with songbirds and parrots. Shop for cages, food, and care accessories built for your winged friends.",
      image: Bird,
      bg: "from-sky-100 via-blue-50 to-white",
      gradientColor: "rgba(135, 206, 250, 0.4)",
      route: "/category/birds",
    },
    {
      id: 4,
      title: "Discover Aquatic Beauty 🐠",
      desc: "Bring calm and color to your space with exotic fish. Explore aquariums, décor, and essentials for a thriving underwater world.",
      image: Fish,
      bg: "from-teal-100 via-emerald-50 to-white",
      gradientColor: "rgba(64, 224, 208, 0.4)",
      route: "/category/fish",
    },
  ];

  return (
    <section className="flex flex-col w-full">
      {pets.map((pet, index) => (
        <div
          key={pet.id}
          className={`relative flex flex-col md:flex-row items-center justify-between gap-10 py-14 sm:py-20 lg:py-28 px-4 sm:px-8 md:px-14 lg:px-20 bg-gradient-to-br ${pet.bg} overflow-hidden`}
        >
          {/* 🌈 Animated Gradient Glow */}
          <motion.div
            className="absolute inset-0 blur-3xl opacity-50"
            style={{
              background: `radial-gradient(circle at ${
                index % 2 === 0 ? "20%" : "80%"
              } 50%, ${pet.gradientColor}, transparent 60%)`,
            }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* 🖼️ Pet Image Section */}
          <motion.div
            className={`relative w-full sm:w-4/5 md:w-1/2 flex justify-center z-10 ${
              index % 2 === 0 ? "order-1" : "order-2"
            }`}
            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            {/* Glowing Background behind Image */}
            <motion.div
              className="absolute -inset-6 rounded-full blur-3xl z-0"
              style={{
                background: `linear-gradient(135deg, ${pet.gradientColor}, transparent)`,
              }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Floating Image */}
            <motion.img
              src={pet.image}
              alt={pet.title}
              className="rounded-3xl shadow-2xl w-[85%] sm:w-72 md:w-80 lg:w-[26rem] xl:w-[30rem] h-auto object-cover relative z-10"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* 🐾 Text Section */}
          <motion.div
            className={`w-full md:w-1/2 flex flex-col items-center md:items-start ${
              index % 2 === 0 ? "order-2" : "order-1"
            } text-center md:text-left z-20`}
            initial={{ opacity: 0, x: index % 2 === 0 ? 100 : -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-4 leading-tight"
              whileHover={{ scale: 1.03 }}
            >
              {pet.title}
            </motion.h2>

            <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 leading-relaxed max-w-xl">
              {pet.desc}
            </p>

            {/* 🛍️ CTA Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(pet.route)}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition"
              >
                🛍️ Shop Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/wishlist")}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white border border-indigo-600 text-indigo-700 text-sm sm:text-base font-semibold rounded-full shadow-md hover:bg-indigo-50 transition"
              >
                ❤️ Add to Wishlist
              </motion.button>
            </div>
          </motion.div>
        </div>
      ))}
    </section>
  );
};

export default HeroSection;
