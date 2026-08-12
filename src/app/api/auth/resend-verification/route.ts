import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRawToken, hashToken, VERIFY_TOKEN_TTL_MS } from "@/lib/auth/token";
import { sendVerificationEmail } from "@/lib/auth/email";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

const ResendSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

// Simple in-memory rate-limit: one resend per email per 60 seconds.
const RESEND_COOLDOWN_MS = 60_000;
const lastResent = new Map<string, number>();

/**
 * POST /api/auth/resend-verification
 * Body: { email: string }
 *
 * Anti-enumeration: always returns a generic success message regardless
 * of whether the email exists or is already verified.
 */
export async function POST(request: NextRequest) {
  // Generic response — never reveal whether email exists
  const OK = NextResponse.json<AuthResponse>(
    {
      success: true,
      message:
        "If your email is registered and not yet verified, a new verification link has been sent.",
    },
    { status: 200 }
  );

  try {
    const body   = await request.json().catch(() => ({}));
    const result = ResendSchema.safeParse(body);
    if (!result.success) return OK; // silently ignore bad input

    const { email } = result.data;

    // ── Rate-limit ──────────────────────────────────────────────────────────
    const lastTime = lastResent.get(email) ?? 0;
    if (Date.now() - lastTime < RESEND_COOLDOWN_MS) {
      // Still return OK to avoid timing oracle
      return OK;
    }
    lastResent.set(email, Date.now());

    // ── Look up user ────────────────────────────────────────────────────────
    const user = await db.user.findUnique({
      where:  { email },
      select: { id: true, name: true, emailVerified: true },
    });

    // If no user, or already verified, return generic OK
    if (!user || user.emailVerified) return OK;

    // ── Invalidate old tokens ───────────────────────────────────────────────
    await db.emailVerificationToken.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    // ── Issue fresh token ───────────────────────────────────────────────────
    const rawToken  = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await db.emailVerificationToken.create({
      data: { tokenHash, userId: user.id, expiresAt, used: false },
    });

    // ── Send email (fire-and-forget) ────────────────────────────────────────
    sendVerificationEmail(email, user.name, rawToken).catch((err) => {
      console.error("[auth/resend-verification] email error:", err);
    });

    return OK;
  } catch (error) {
    console.error("[auth/resend-verification]", error);
    return OK; // never leak errors
  }
}
