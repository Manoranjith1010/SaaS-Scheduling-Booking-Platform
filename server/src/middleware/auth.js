import { verifyToken } from "../lib/jwt.js";

/**
 * Verifies a Bearer JWT issued by /api/auth/login or /api/auth/register and
 * populates `req.user` with `{ id, email }`.
 */
export function requireAuth(req, res, next) {
  const header = req.header("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}
