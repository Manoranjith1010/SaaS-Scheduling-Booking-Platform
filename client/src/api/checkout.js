// Dev: empty -> Vite proxy forwards /api to the server.
// Render: set to the API origin at build time (see render.yaml).
const API_BASE = import.meta.env.VITE_API_BASE || "";

const TOKEN_KEY = "bookflow_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) clearToken();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// --- auth ---
export const register = (email, password) =>
  request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) });

export const login = (email, password) =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const me = () => request("/api/auth/me");

// --- bookings + payments ---
export const getCatalog = () => request("/api/bookings/catalog");

export const createBooking = (serviceName) =>
  request("/api/bookings", { method: "POST", body: JSON.stringify({ serviceName }) });

export const createCheckoutSession = (bookingId) =>
  request("/api/checkout/session", { method: "POST", body: JSON.stringify({ bookingId }) });

export const getOrder = (orderId) => request(`/api/orders/${orderId}`);
