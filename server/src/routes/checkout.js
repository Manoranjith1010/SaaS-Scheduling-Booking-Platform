import express from "express";
import { stripe } from "../lib/stripe.js";
import { CLIENT_URL } from "../lib/config.js";
import Order from "../models/Order.js";
import Booking from "../models/Booking.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/checkout/session
 * Body: { bookingId }
 *
 * Creates a Stripe Checkout Session and returns its hosted-page URL.
 * The amount is derived from the trusted Booking record in the DB, never
 * from the request body.
 */
router.post("/session", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user.id });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.paid) {
      return res.status(409).json({ error: "Booking is already paid" });
    }

    const amount = Math.round(booking.priceCents);

    const order = await Order.create({
      userId: req.user.id,
      bookingId: booking._id,
      amount,
      currency: booking.currency,
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order._id.toString(),
      customer_email: req.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: booking.currency,
            product_data: { name: `Booking: ${booking.serviceName}` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/checkout/success?order=${order._id}`,
      cancel_url: `${CLIENT_URL}/checkout/cancel?order=${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        bookingId: booking._id.toString(),
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.json({ url: session.url });
  } catch (err) {
    console.error("POST /checkout/session error:", err);
    return res.status(500).json({ error: "Could not start checkout" });
  }
});

export default router;
