import jwt from "jsonwebtoken";
import type { JWTPayload } from "@/types/auth";

const secret = process.env.AUTH_JWT_SECRET!;
const expiresIn = (process.env.AUTH_JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_JWT_SECRET is not set");
}

/**
 * Sign a JWT for a user. Returns the token string.
 */
export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify and decode a JWT. Returns the payload or null on failure.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Decode without verification (for reading exp/iat only — do not trust data).
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
