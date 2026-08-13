/**
 * DB-backed rate limiter — works in serverless / multi-instance deployments.
 *
 * Uses MongoDB via Prisma rather than in-memory Maps, so limits are shared
 * across every function instance (Vercel, AWS Lambda, etc.).
 *
 * The `key` stored in the DB is always SHA-256(raw_identifier) — never raw
 * IP addresses or emails (reduces PII stored in the rate-limit table).
 *
 * Usage:
 *   const { limited, remaining, retryAfter } = await checkRateLimit({
 *     identifier: ip,
 *     action:     "login",
 *     maxAttempts: 10,
 *     windowMs:    15 * 60 * 1000,   // 15 minutes
 *   });
 *   if (limited) return NextResponse.json({ ... }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
 */

import crypto from "crypto";
import { db } from "@/lib/db";

export interface RateLimitOptions {
  /** Raw identifier — IP address, email address, userId, etc. */
  identifier: string;
  /** Logical action name — "login", "forgot_password", "resend_verification" */
  action: string;
  /** Maximum allowed attempts within the window. */
  maxAttempts: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  /** True when the caller has exceeded the limit and should be blocked. */
  limited: boolean;
  /** How many attempts remain in the current window (0 when limited). */
  remaining: number;
  /** Seconds until the window resets (only meaningful when limited). */
  retryAfter: number;
}

/** One-way hash of a raw identifier so we never store PII in the rate-limit table. */
function hashKey(raw: string): string {
  return crypto.createHash("sha256").update(raw.toLowerCase().trim()).digest("hex");
}

export async function checkRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const { identifier, action, maxAttempts, windowMs } = opts;
  const key       = hashKey(identifier);
  const now       = Date.now();

  try {
    // Upsert: atomically increment count, reset window if expired.
    const record = await db.rateLimitRecord.upsert({
      where:  { key_action: { key, action } },
      create: {
        key,
        action,
        count:       1,
        windowStart: new Date(now),
      },
      update: {
        // If the current window has expired, reset it.
        count: {
          increment: 1,
        },
        // windowStart is only updated when we reset — handled below via a
        // two-step operation because Prisma doesn't support conditional updates.
      },
    });

    const windowExpired =
      record.windowStart.getTime() + windowMs < now;

    if (windowExpired) {
      // Reset the window
      await db.rateLimitRecord.update({
        where:  { key_action: { key, action } },
        data:   { count: 1, windowStart: new Date(now) },
      });
      return { limited: false, remaining: maxAttempts - 1, retryAfter: 0 };
    }

    const count     = record.count;
    const limited   = count > maxAttempts;
    const remaining = Math.max(0, maxAttempts - count);
    const resetAt   = record.windowStart.getTime() + windowMs;
    const retryAfter = limited ? Math.ceil((resetAt - now) / 1000) : 0;

    return { limited, remaining, retryAfter };
  } catch (err) {
    // If the rate-limit DB call fails (e.g. transient network error),
    // fail OPEN — don't block legitimate users for an infrastructure blip.
    console.error("[rate-limit] DB error, failing open:", err);
    return { limited: false, remaining: maxAttempts, retryAfter: 0 };
  }
}

/** Helper: build the standard 429 headers for rate-limited responses. */
export function rateLimitHeaders(retryAfter: number): Record<string, string> {
  return {
    "Retry-After":       String(retryAfter),
    "X-RateLimit-Limit": "0",
    "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + retryAfter),
  };
}

/** Extract the best available client IP from a Next.js request. */
export function getClientIp(request: { headers: { get(k: string): string | null } }): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
