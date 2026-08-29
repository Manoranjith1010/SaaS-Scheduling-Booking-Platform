// Relative base: dev uses the Vite proxy, Docker/prod uses the nginx proxy.
const API_BASE = import.meta.env.VITE_API_BASE || "";

// Dev-only auth headers; replace with your real auth (cookie/JWT) integration.
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-id": localStorage.getItem("userId") || "",
    "x-user-email": localStorage.getItem("userEmail") || "",
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const getCatalog = () => request("/api/bookings/catalog");

export const createBooking = (serviceName) =>
  request("/api/bookings", {
    method: "POST",
    body: JSON.stringify({ serviceName }),
  });

export const createCheckoutSession = (bookingId) =>
  request("/api/checkout/session", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });

export const getOrder = (orderId) => request(`/api/orders/${orderId}`);
