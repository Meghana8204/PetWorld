// src/pages/home/HeroIntro.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// 🎥 Background pet videos
import bgVideo1 from "../assets/bgVideo.mp4"; // Dogs
import bgVideo2 from "../assets/Bird.mp4"; // Birds
import bgVideo3 from "../assets/Fish.mp4"; // Fish

const HeroIntro = () => {
  const navigate = useNavigate();
  const videos = [bgVideo1, bgVideo2, bgVideo3];
  const [currentVideo, setCurrentVideo] = useState(0);

  // 🔁 Switch videos every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [videos.length]);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* 🎥 Background Video */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.video
            key={currentVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <source src={videos[currentVideo]} type="video/mp4" />
          </motion.video>
        </AnimatePresence>
        {/* 🌈 Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* 🐾 Floating icons for depth */}
      <motion.div
        className="absolute left-[8%] top-[15%] text-4xl sm:text-6xl md:text-7xl opacity-30 hidden sm:block"
        animate={{ y: [0, -25, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        🐾
      </motion.div>
      <motion.div
        className="absolute right-[8%] bottom-[15%] text-4xl sm:text-6xl md:text-7xl opacity-30 hidden sm:block"
        animate={{ y: [0, 25, 0], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        🐕
      </motion.div>

      {/* 🌟 Hero Content */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center min-h-[85vh] px-4 sm:px-6 md:px-10"
      >
        {/* 🐶 Main Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-5 leading-tight drop-shadow-2xl"
          style={{
            textShadow:
              "0 0 20px rgba(255,255,255,0.4), 0 0 50px rgba(255,182,193,0.5)",
          }}
        >
          Welcome to <span className="text-pink-400">Pet Paradise</span>
        </motion.h1>

        {/* 🐾 Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 max-w-[90%] sm:max-w-2xl leading-relaxed"
        >
          Your one-stop shop for <span className="text-pink-400 font-semibold">pets, care, and love</span>.
          <br className="hidden sm:block" />
          Adopt, shop, or pamper your furry, feathery, and finned friends today 🐾.
        </motion.p>

        {/* 🎯 Call-to-Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6"
        >
          <motion.button
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 25px rgba(255,182,193,0.7)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/pets")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold shadow-lg transition"
          >
            🛍️ Shop Pets
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 25px rgba(255,255,255,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/sell")}
            className="bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold shadow-lg transition"
          >
            🐾 Sell a Pet
          </motion.button>
        </motion.div>

        {/* 💕 Floating Emojis for warmth */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["💖", "🐾", "🐕", "🐈", "🐟"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-lg sm:text-2xl opacity-25"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 20, -20, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* 👇 Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 flex flex-col items-center text-white opacity-90 text-xs sm:text-sm md:text-base"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span>Scroll to explore</span>
          <motion.div className="mt-1 sm:mt-2 text-lg sm:text-xl">⬇️</motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default HeroIntro;
