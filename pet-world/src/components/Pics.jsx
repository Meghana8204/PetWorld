import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind } from "lucide-react"; // For SuperDog wind animation

import Cat from "../assets/Cat.jpg";
import Dog from "../assets/dog.jpg";
import Bird from "../assets/bird.jpg";
import Fish from "../assets/fish.jpg";

const Pics = () => {
  const [tilt, setTilt] = useState({});
  const [loadingPet, setLoadingPet] = useState(null);
  const navigate = useNavigate();
  const threshold = 15;

  const handleMove = (e, index) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setTilt((prev) => ({
      ...prev,
      [index]: { x: y * -threshold, y: x * threshold },
    }));
  };

  const handleLeave = (index) =>
    setTilt((prev) => ({
      ...prev,
      [index]: { x: 0, y: 0 },
    }));

  const handleNavigate = (card) => {
    setLoadingPet(card.title);
    setTimeout(() => {
      setLoadingPet(null);
      navigate(card.route);
    }, 1600);
  };

  const cards = [
    { image: Dog, title: "Dogs", route: "/dogs" },
    { image: Cat, title: "Cats", route: "/cats" },
    { image: Bird, title: "Birds", route: "/birds" },
    { image: Fish, title: "Fish", route: "/fish" },
  ];

  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 py-20 overflow-hidden">
      {loadingPet && <LoadingOverlay pet={loadingPet} />} {/* SuperDog Loader */}

      {/* Background gradient blur layers */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-14 text-gray-800 tracking-wide drop-shadow-md">
          Meet Our Lovely Pets 🐾
        </h2>

        {/* 🖥️ Desktop Grid */}
        <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 justify-items-center">
          {cards.map((card, index) => (
            <AnimatedCard
              key={index}
              card={card}
              index={index}
              tilt={tilt}
              handleMove={handleMove}
              handleLeave={handleLeave}
              handleNavigate={handleNavigate}
              delay={index * 0.15}
            />
          ))}
        </div>

        {/* 📱 Mobile Layout */}
        <div className="flex flex-col items-center gap-6 sm:hidden">
          <div className="flex justify-center gap-6">
            {cards.slice(0, 2).map((card, index) => (
              <AnimatedCard
                key={index}
                card={card}
                index={index}
                tilt={tilt}
                handleMove={handleMove}
                handleLeave={handleLeave}
                handleNavigate={handleNavigate}
                delay={index * 0.1}
                small
                isCircle
              />
            ))}
          </div>
          <div className="flex justify-center gap-6">
            {cards.slice(2).map((card, index) => (
              <AnimatedCard
                key={index + 2}
                card={card}
                index={index + 2}
                tilt={tilt}
                handleMove={handleMove}
                handleLeave={handleLeave}
                handleNavigate={handleNavigate}
                delay={(index + 2) * 0.1}
                small
                isCircle
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const AnimatedCard = ({
  card,
  index,
  tilt,
  handleMove,
  handleLeave,
  handleNavigate,
  delay = 0,
  small = false,
  isCircle = false,
}) => {
  const motionProps = {
    initial: { opacity: 0, y: 40, scale: 0.9 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.6, delay },
    viewport: { once: true },
  };

  return (
    <motion.div {...motionProps}>
      <motion.div
        onMouseMove={(e) => handleMove(e, index)}
        onMouseLeave={() => handleLeave(index)}
        onClick={() => handleNavigate(card)}
        whileHover={{ scale: 1.05, rotateZ: 1 }}
        style={{
          transform: `perspective(800px) rotateX(${tilt[index]?.x || 0}deg) rotateY(${tilt[index]?.y || 0}deg)`,
          transition: "transform 0.25s ease-out",
        }}
        className={`group relative cursor-pointer overflow-hidden shadow-xl hover:shadow-2xl border border-white/40 backdrop-blur-md transition-all duration-300 transform-gpu 
        ${isCircle ? "rounded-full" : "rounded-3xl"} 
        ${small ? "w-[130px] h-[130px]" : "w-[180px] h-[180px] md:w-[210px] md:h-[210px]"}`}
      >
        <img
          src={card.image}
          alt={card.title}
          className={`w-full h-full object-cover ${
            isCircle ? "rounded-full" : "rounded-3xl"
          } group-hover:scale-110 transition-transform duration-700`}
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
            isCircle ? "rounded-full" : "rounded-3xl"
          }`}
        ></div>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white font-semibold text-base sm:text-lg drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
        >
          {card.title}
        </motion.h3>
      </motion.div>
    </motion.div>
  );
};

/* 🦸‍♂️ SuperDog Loading Overlay */
const LoadingOverlay = ({ pet }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-sky-200 via-blue-100 to-pink-100 overflow-hidden z-[9999]">
      {/* ☁️ Moving Clouds */}
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
          SuperDog is flying to your {pet} page... 🦸‍♂️🐶
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Pics;
