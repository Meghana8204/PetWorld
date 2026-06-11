// src/components/LoadingOverlay.jsx
import React from "react";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-sky-200 via-blue-100 to-pink-100 overflow-hidden z-[9999]">
      {/* ☁️ Moving clouds */}
      <motion.div
        className="absolute top-10 left-0 w-full flex space-x-16 opacity-70"
        initial={{ x: 0 }}
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-24 h-12 bg-white rounded-full blur-md"
            style={{ filter: "blur(10px)" }}
          ></div>
        ))}
      </motion.div>

      {/* 💨 Wind effect */}
      <motion.div
        className="absolute flex space-x-2 left-1/4 top-1/2"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: [0, 1, 0], x: [0, 60, 120] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <Wind className="text-blue-500 w-6 h-6 opacity-70" />
        <Wind className="text-blue-400 w-5 h-5 opacity-50" />
      </motion.div>

      {/* 🦸‍♂️ SuperDog flying */}
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Flying Dog with Cape */}
        <motion.div
          initial={{ x: "-60vw", rotate: -5, y: 0 }}
          animate={{
            x: "60vw",
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="relative"
        >
          {/* Dog Image */}
          <img
            src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
            alt="SuperDog"
            className="w-28 h-28 object-contain"
          />

          {/* Cape */}
          <motion.div
            className="absolute -top-3 right-2 w-12 h-12 bg-red-500 rounded-tr-full rounded-bl-[40%] opacity-80"
            initial={{ rotate: -20 }}
            animate={{ rotate: [-15, 15, -15] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          ></motion.div>
        </motion.div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.9, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="mt-8 text-lg font-bold text-gray-700 tracking-wide"
        >
          SuperDog is flying to your page... 🦸‍♂️🐶
        </motion.p>
      </motion.div>
    </div>
  );
}
