import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getOrder } from "../api/checkout";

/**
 * Payment confirmation is asynchronous: Stripe redirects here immediately, but
 * the order is only marked "paid" once our webhook fires. So we poll briefly.
 */
export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const [state, setState] = useState("checking"); // checking | paid | pending | error

  useEffect(() => {
    if (!orderId) return setState("error");
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const order = await getOrder(orderId);
        if (order.status === "paid") {
          setState("paid");
          clearInterval(timer);
        } else if (["failed", "cancelled"].includes(order.status)) {
          setState("error");
          clearInterval(timer);
        } else if (tries >= 6) {
          setState("pending");
          clearInterval(timer);
        }
      } catch {
        setState("error");
        clearInterval(timer);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [orderId]);

  return (
    <div className="page">
      <div className="result">
        {state === "checking" && (
          <>
            <div className="spinner" />
            <h2>Confirming your payment…</h2>
            <p className="muted">This only takes a moment.</p>
          </>
        )}

        {state === "paid" && (
          <>
            <div className="icon">✅</div>
            <h2>Payment confirmed</h2>
            <p className="muted">Your booking is secured. A receipt is on its way.</p>
            <Link to="/">Book another session</Link>
          </>
        )}

        {state === "pending" && (
          <>
            <div className="icon">💳</div>
            <h2>Payment received</h2>
            <p className="muted">
              We&apos;re finalizing your booking — you&apos;ll get a confirmation
              email shortly. No need to pay again.
            </p>
            <Link to="/">Back to home</Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="icon">⚠️</div>
            <h2>We couldn&apos;t confirm your payment</h2>
            <p className="muted">
              If you were charged, contact support and quote order{" "}
              <strong>{orderId}</strong>.
            </p>
            <Link to="/">Try again</Link>
          </>
        )}
      </div>
    </div>
  );
}
