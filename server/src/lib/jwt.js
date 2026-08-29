import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET is not set");
}

const TTL = process.env.JWT_TTL || "7d";

export const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: TTL });

export const verifyToken = (token) => jwt.verify(token, SECRET);
