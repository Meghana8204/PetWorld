// src/components/OfferBanner.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function OfferBanner() {
  const [offer, setOffer] = useState(null);

  // 🧠 Fetch active offer from backend
  const fetchActiveOffer = async () => {
    try {
      const { data } = await axios.get("http://localhost:5001/api/offers");
      if (data.success && data.offer) {
        setOffer(data.offer);
      } else {
        setOffer(null);
      }
    } catch (error) {
      console.error("Error fetching active offer:", error);
      setOffer(null);
    }
  };

  useEffect(() => {
    fetchActiveOffer();
    const interval = setInterval(fetchActiveOffer, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // 🎬 Framer Motion Variants
  const variants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full overflow-hidden bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 text-white shadow-md"
    >
      {/* 🐾 Decorative Paw Prints */}
      <div className="absolute left-0 top-0 opacity-10 text-4xl sm:text-6xl select-none">
        🐾
      </div>
      <div className="absolute right-4 bottom-0 opacity-10 text-4xl sm:text-6xl select-none">
        🐾
      </div>

      {/* 💬 Offer Content */}
      <div
        className="
          max-w-screen-xl mx-auto 
          flex flex-col sm:flex-row items-center justify-center 
          gap-2 sm:gap-4 px-3 sm:px-6 py-3 
          text-sm sm:text-base font-medium text-center
        "
      >
        <AnimatePresence mode="wait">
          {offer ? (
            <motion.div
              key={offer._id || "active-offer"}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
            >
              {/* 🚚 Offer Message */}
              <p className="flex items-center gap-1">
                🚚 <span>{offer.message || "Exclusive Offer for Pet Lovers!"}</span>
              </p>

              <span className="hidden sm:inline text-white/60">|</span>

              {/* 🎁 Discount */}
              <p className="flex items-center gap-1">
                🎁 <span>{offer.discount ? `${offer.discount}% OFF` : "20% OFF"}</span>
              </p>

              <span className="hidden sm:inline text-white/60">|</span>

              {/* 🐾 Promo Code */}
              <p className="flex items-center gap-1">
                🐾 Use Code:{" "}
                <strong className="bg-white/20 px-2 py-0.5 rounded-md text-white font-semibold tracking-wide">
                  {offer.code || "PETLOVE20"}
                </strong>
              </p>
            </motion.div>
          ) : (
            // 🌈 Default Offer
            <motion.div
              key="default-offer"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
            >
              <p className="flex items-center gap-1">
                🚚 <span>Free Shipping on Orders Above ₹999</span>
              </p>
              <span className="hidden sm:inline text-white/60">|</span>
              <p className="flex items-center gap-1">
                🎁 <span>20% OFF on Pet Essentials</span>
              </p>
              <span className="hidden sm:inline text-white/60">|</span>
              <p className="flex items-center gap-1">
                🐾 Use Code:{" "}
                <strong className="bg-white/20 px-2 py-0.5 rounded-md text-white font-semibold tracking-wide">
                  PETLOVE20
                </strong>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
