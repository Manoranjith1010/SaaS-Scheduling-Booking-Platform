import { useEffect, useState } from "react";
import { getCatalog, createBooking, createCheckoutSession } from "./api/checkout";

const money = (cents, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

export default function App() {
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | booking | redirecting
  const [error, setError] = useState("");

  useEffect(() => {
    getCatalog().then(setCatalog).catch((e) => setError(e.message));
  }, []);

  async function handlePay() {
    if (!selected) return;
    setError("");
    try {
      setStatus("booking");
      const booking = await createBooking(selected.serviceName);
      setStatus("redirecting");
      const { url } = await createCheckoutSession(booking._id);
      window.location.assign(url);
    } catch (e) {
      setError(e.message);
      setStatus("idle");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <span className="logo">◆ BookFlow</span>
        <span className="badge">Test mode</span>
      </header>

      <main className="card">
        <h1>Book a session</h1>
        <p className="muted">Choose a service and pay securely with Stripe.</p>

        <ul className="services">
          {catalog.map((s) => (
            <li
              key={s.serviceName}
              className={`service ${selected?.serviceName === s.serviceName ? "is-selected" : ""}`}
              onClick={() => setSelected(s)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(s)}
            >
              <div>
                <div className="service-name">{s.serviceName}</div>
                <div className="muted small">Next available: tomorrow</div>
              </div>
              <div className="price">{money(s.priceCents)}</div>
            </li>
          ))}
        </ul>

        {error && <p role="alert" className="error">{error}</p>}

        <button
          className="pay-btn"
          disabled={!selected || status !== "idle"}
          onClick={handlePay}
        >
          {status === "booking" && "Creating booking…"}
          {status === "redirecting" && "Redirecting to Stripe…"}
          {status === "idle" &&
            (selected ? `Pay ${money(selected.priceCents)}` : "Select a service")}
        </button>

        <p className="muted small center">
          Test card <code>4242 4242 4242 4242</code> · any future date · any CVC
        </p>
      </main>
    </div>
  );
}
