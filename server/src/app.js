import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

import stripeWebhook from "./routes/stripeWebhook.js";
import checkoutRoutes from "./routes/checkout.js";
import orderRoutes from "./routes/orders.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();

// --- Stripe webhook MUST be mounted before express.json() (needs raw body) ---
app.use("/api/webhooks/stripe", stripeWebhook);

// --- JSON parsing for everything else ---
app.use(express.json());

// (Optional) basic CORS for local dev with a separate frontend origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-user-id, x-user-email");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

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
