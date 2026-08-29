import { Link } from "react-router-dom";

export default function CheckoutCancel() {
  return (
    <div className="page">
      <div className="result">
        <div className="icon">↩️</div>
        <h2>Payment cancelled</h2>
        <p className="muted">
          No charge was made. Nothing was booked — you can start over whenever
          you&apos;re ready.
        </p>
        <Link to="/">Return to booking</Link>
      </div>
    </div>
  );
}
