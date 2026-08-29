import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issue(user) {
  return signToken({ sub: user._id.toString(), email: user.email });
}

/** POST /api/auth/register  { email, password } */
router.post("/register", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Invalid email" });
  if (password.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });

  res.status(201).json({ token: issue(user), user: { id: user._id, email: user.email } });
});

/** POST /api/auth/login  { email, password } */
router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = await User.findOne({ email });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  res.json({ token: issue(user), user: { id: user._id, email: user.email } });
});

/** GET /api/auth/me — current user (validates the token) */
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
