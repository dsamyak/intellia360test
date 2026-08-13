/**
 * JWT utilities — Node.js runtime only (not Edge).
 *
 * The Edge middleware (proxy.ts) uses `jose` for JWT verification because
 * the Edge runtime does not support Node's `crypto` module directly.
 * Both libraries produce/verify HS256 tokens with the same secret, so
 * tokens are fully cross-compatible.
 *
 * Security contract
 * ─────────────────
 * • AUTH_JWT_SECRET MUST be set in every environment.
 *   Missing → hard crash at module load (development) or build time (production).
 *   Never use a fallback string — that would allow anyone who reads the source
 *   to forge valid session tokens.
 * • Minimum secret entropy: 256 bits (32 random bytes / 64-char hex).
 *   Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
 */

import jwt from "jsonwebtoken";
import type { JWTPayload } from "@/types/auth";

// ── Secret resolution — fail hard, never silently fall back ──────────────────
function resolveSecret(): string {
  const s = process.env.AUTH_JWT_SECRET;
  if (!s || s.trim().length === 0) {
    // Throw in every environment — a missing secret is always a misconfiguration.
    throw new Error(
      "[auth/jwt] AUTH_JWT_SECRET is not set. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('base64'))\""
    );
  }
  if (s.length < 32) {
    throw new Error(
      "[auth/jwt] AUTH_JWT_SECRET is too short (minimum 32 characters). " +
        "Use at least 64 characters of random data."
    );
  }
  return s;
}

// Module-level resolution — crashes the process at startup if misconfigured,
// not silently mid-request.
const secret = resolveSecret();

const expiresIn = (
  process.env.AUTH_JWT_EXPIRES_IN ?? "7d"
) as jwt.SignOptions["expiresIn"];

// ── Token operations ──────────────────────────────────────────────────────────

/** Sign a JWT for a user session. Returns the signed token string. */
export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, secret, { expiresIn, algorithm: "HS256" });
}

/**
 * Verify and decode a JWT.
 * Returns the payload on success, null on any failure (expired, tampered, etc.).
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, secret, { algorithms: ["HS256"] }) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Decode WITHOUT verification — only use this to read non-sensitive fields
 * like `exp` for UI display. Never trust decoded data for access decisions.
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
