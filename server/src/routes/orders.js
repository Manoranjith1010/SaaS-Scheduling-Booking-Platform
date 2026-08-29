import express from "express";
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/orders/:id
 * Lightweight status endpoint the success page polls to confirm payment.
 */
router.get("/:id", requireAuth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id }).select(
    "status amount currency"
  );
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;
