import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true }, // minor units (cents/paise), integer
    currency: { type: String, default: "usd" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntent: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
