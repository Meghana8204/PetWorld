import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import { seedAdmin } from "./seeder/adminSeeder.js";

import userRoutes from "./routes/authRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userProfileRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

/* ================= LOAD ENV ================= */
dotenv.config({ override: true });

/* ================= APP INIT ================= */
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ================= ROOT ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🐾 Welcome to PetPal API");
});

/* ================= ROUTES ================= */
app.use("/api/auth", userRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userProfileRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/notifications", notificationRoutes);

/* ================= SERVER BOOTSTRAP ================= */
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    // ✅ Seed admin ONLY if not exists
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
