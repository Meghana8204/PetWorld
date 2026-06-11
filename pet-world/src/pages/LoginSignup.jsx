import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// 🐕 Pet images
import Dog1 from "../assets/Dog1.jpg";
import Cat from "../assets/Cat.jpg";
import Bird from "../assets/Bird.jpg";
import Fish from "../assets/Fish.jpg";

/* ================= API CONFIG ================= */
const API_BASE = "http://localhost:5001/api/auth";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const images = [Dog1, Cat, Bird, Fish];
  const imageTitles = [
    "Shop for Happy Paws 🐾",
    "Cozy Cats, Warm Hearts 🐱",
    "Chirpy Companions 🦜",
    "Dive into Pet Joy 🐠",
  ];

  /* ================= IMAGE ROTATION ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      toast.error("⚠️ Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/login" : "/register";

      const payload = isLogin
        ? {
            email: formData.email.trim(),
            password: formData.password.trim(),
          }
        : {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password.trim(),
          };

      const { data } = await axios.post(
        `${API_BASE}${endpoint}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!data?.token) {
        throw new Error("Invalid server response");
      }

      // ✅ Save auth
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      login(data);

      if (isLogin) {
        toast.success(`🎉 Welcome back!`);

        setTimeout(() => {
          // If redirected from checkout, go back to checkout with state
          if (location.state?.from === "/checkout") {
            navigate("/checkout", {
              state: location.state.checkoutState || {},
              replace: true,
            });
          } else if (data.role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else if (data.role === "seller") {
            navigate("/seller/dashboard", { replace: true });
          } else {
            navigate("/shop", { replace: true });
          }
        }, 1800);
      } else {
        toast.success("🐾 Account created! Please log in.");
        setIsLogin(true);
        setFormData({ name: "", email: "", password: "" });
      }

    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        (status === 401
          ? "Invalid email or password"
          : status === 409
          ? "Account already exists"
          : "⚠️ Something went wrong. Please try again.");
          
      if (status !== 401 && status !== 409) {
        console.error("❌ Login/Register Error:", err);
      }

      toast.error(message);
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-pink-100">

      {/* 🌈 Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300/30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-300/30 blur-3xl rounded-full animate-pulse" />

      {/* 🐾 LEFT – IMAGES */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-10">
        <div className="relative w-[90%] h-[85vh] rounded-3xl overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              alt="Pet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-indigo-600/70 text-white px-6 py-2 rounded-full backdrop-blur-md"
          >
            {imageTitles[currentImage]}
          </motion.div>
        </div>
      </div>

      {/* 🧾 RIGHT – FORM */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex flex-col justify-center items-center w-full md:w-1/2 px-6"
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl p-8"
        >
          <h2 className="text-4xl font-bold text-indigo-700 text-center mb-4">
            {isLogin ? "Welcome Back 🐾" : "Join Pet World 🌟"}
          </h2>

          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mb-3 h-11 px-5 rounded-full border"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-3 h-11 px-5 rounded-full border"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-4 h-11 px-5 rounded-full border"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 rounded-full text-white font-semibold ${
              loading
                ? "bg-gray-400"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>

          <p className="text-center text-sm mt-4">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-indigo-600 font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already a member?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-indigo-600 font-medium"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
