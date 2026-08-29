import express from "express";
import Booking from "../models/Booking.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const CATALOG = [
  { serviceName: "30-min Consultation", priceCents: 2500 },
  { serviceName: "60-min Strategy Session", priceCents: 6000 },
  { serviceName: "Full-day Workshop", priceCents: 45000 },
];

/** GET /api/bookings/catalog — services a user can book */
router.get("/catalog", (_req, res) => res.json(CATALOG));

/** GET /api/bookings — current user's bookings */
router.get("/", requireAuth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(bookings);
});

/**
 * POST /api/bookings
 * Body: { serviceName, startsAt }
 * Price is taken from the server-side catalog, not the request.
 */
router.post("/", requireAuth, async (req, res) => {
  const { serviceName, startsAt } = req.body;
  const service = CATALOG.find((s) => s.serviceName === serviceName);
  if (!service) return res.status(400).json({ error: "Unknown service" });

  const booking = await Booking.create({
    userId: req.user.id,
    serviceName: service.serviceName,
    priceCents: service.priceCents,
    currency: "usd",
    startsAt: startsAt ? new Date(startsAt) : new Date(Date.now() + 86400000),
  });
  res.status(201).json(booking);
});

export default router;
