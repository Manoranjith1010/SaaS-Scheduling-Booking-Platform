import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceName: { type: String, required: true },
    startsAt: { type: Date, required: true },
    // price is the trusted source of truth for how much to charge (integer, minor units)
    priceCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },
    paid: { type: Boolean, default: false },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
