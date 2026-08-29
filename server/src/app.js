import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

import { CLIENT_URL } from "./lib/config.js";
import stripeWebhook from "./routes/stripeWebhook.js";
import authRoutes from "./routes/auth.js";
import checkoutRoutes from "./routes/checkout.js";
import orderRoutes from "./routes/orders.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();

// --- Stripe webhook MUST be mounted before express.json() (needs raw body) ---
app.use("/api/webhooks/stripe", stripeWebhook);

// --- JSON parsing for everything else ---
app.use(express.json());

// --- CORS: allow the configured client origin (cross-origin API calls) ---
const ALLOWED_ORIGIN = CLIENT_URL;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  });
