/**
 * Placeholder auth middleware.
 *
 * Replace this with your real authentication (JWT verification, session lookup,
 * Passport, Clerk/Auth0, etc.). It must populate `req.user` with at least
 * `{ id, email }` for a trusted, logged-in user.
 *
 * For local development it accepts `x-user-id` / `x-user-email` headers.
 */
export function requireAuth(req, res, next) {
  const id = req.header("x-user-id");
  const email = req.header("x-user-email");

  if (!id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  req.user = { id, email };
  next();
}
