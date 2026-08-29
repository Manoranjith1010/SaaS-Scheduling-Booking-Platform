import express from "express";
import { stripe } from "../lib/stripe.js";
import Order from "../models/Order.js";
import Booking from "../models/Booking.js";

const router = express.Router();

/**
 * POST /api/webhooks/stripe
 *
 * The ONLY place an order is marked "paid". The browser redirect to
 * success_url is UX only and must never grant access.
 *
 * Requires the raw request body for signature verification, so this router
 * is mounted BEFORE express.json() in app.js.
 */
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const order = await Order.findById(session.metadata?.orderId);
        if (!order) break;
        if (order.status === "paid") break; // idempotent: ignore duplicates/replays

        // Defense in depth: confirm what was actually paid.
        if (
          session.payment_status !== "paid" ||
          session.amount_total !== order.amount
        ) {
          order.status = "failed";
          await order.save();
          break;
        }

        order.status = "paid";
        order.stripePaymentIntent = session.payment_intent;
        order.paidAt = new Date();
        await order.save();

        await Booking.findByIdAndUpdate(order.bookingId, {
          paid: true,
          confirmedAt: new Date(),
        });
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        await Order.updateOne(
          { _id: session.metadata?.orderId, status: "pending" },
          { status: "cancelled" }
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await Order.updateOne(
          { stripePaymentIntent: pi.id, status: { $ne: "paid" } },
          { status: "failed" }
        );
        break;
      }

      default:
        // ignore unhandled event types
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).end(); // non-2xx => Stripe retries
  }
});

export default router;
