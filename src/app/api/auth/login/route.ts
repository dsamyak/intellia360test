import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/auth/validation";
import { verifyPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders, getClientIp } from "@/lib/auth/rate-limit";
import { db } from "@/lib/db";
import type { AuthResponse, AuthUser } from "@/types/auth";

// Pre-computed bcrypt hash of a fixed dummy string.
// Using a real bcrypt hash ensures the full Blowfish key-schedule runs even
// when the email is not found, making the response time indistinguishable
// from a real password comparison (timing-oracle prevention).
//
// Generated once with: bcrypt.hash("__dummy_intellia360_timing_guard__", 12)
const TIMING_GUARD_HASH =
  "$2b$12$.YdZj6pg0sawy3cr.nmHWuzXNK1JGdw7hXywGMt6Pu1A6q.X0yfLO";

export async function POST(request: NextRequest) {
  // ── 1. IP-based rate limit ─────────────────────────────────────────────────
  // 10 attempts per 15-minute window per IP address.
  // This runs before any DB user lookup so it can't be bypassed.
  const ip = getClientIp(request);
  const ipLimit = await checkRateLimit({
    identifier: ip,
    action: "login",
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  });

  if (ipLimit.limited) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: `Too many login attempts. Please try again in ${ipLimit.retryAfter} seconds.`,
      },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfter, 10) }
    );
  }

  try {
    const body = await request.json();

    // ── 2. Schema validation ───────────────────────────────────────────────
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors as Record<string, string[]>,
        },
        { status: 422 }
      );
    }

    const { emailOrUsername, password, rememberMe } = result.data;

    // ── 3. Per-email rate limit (secondary, account-level) ─────────────────
    // 5 failed attempts per 15-minute window per email address.
    const emailLimit = await checkRateLimit({
      identifier: emailOrUsername,
      action: "login_email",
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (emailLimit.limited) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: `Too many attempts for this account. Try again in ${emailLimit.retryAfter} seconds.`,
        },
        { status: 429, headers: rateLimitHeaders(emailLimit.retryAfter, 5) }
      );
    }

    // ── 4. User lookup ─────────────────────────────────────────────────────
    const dbUser = await db.user.findUnique({
      where: { email: emailOrUsername },
    });

    // ── 5. Timing-safe password comparison ────────────────────────────────
    // ALWAYS run bcrypt.compare, whether or not the user was found.
    // This makes both code-paths take the same ~100ms, preventing an attacker
    // from enumerating valid emails by observing response times.
    const passwordMatch = await verifyPassword(
      password,
      dbUser?.password ?? TIMING_GUARD_HASH
    );

    if (!dbUser || !passwordMatch) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── 6. Deactivated-account gate ────────────────────────────────────────
    // Placed after the password comparison so a wrong password and a
    // deactivated account are indistinguishable to an unauthenticated caller.
    if (dbUser.deletedAt !== null) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "This account has been deactivated. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    // ── 7. Email verification gate ─────────────────────────────────────────
    if (!dbUser.emailVerified) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message:
            "Your email address has not been verified. " +
            "Check your inbox for the verification link.",
          errors: { email: ["unverified"] },
        },
        { status: 403 }
      );
    }

    // ── 8. Issue session ───────────────────────────────────────────────────
    const user: AuthUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      emailVerified: dbUser.emailVerified,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setSessionCookie(token, rememberMe);

    return NextResponse.json<AuthResponse<AuthUser>>(
      { success: true, message: "Logged in successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
