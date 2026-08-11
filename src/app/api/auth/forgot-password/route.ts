import { NextRequest, NextResponse } from "next/server";
import { ForgotPasswordSchema } from "@/lib/auth/validation";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import type { AuthResponse } from "@/types/auth";

// Token is valid for 1 hour
const EXPIRY_MS = 60 * 60 * 1000;

// Generic response — never reveals whether the email exists (anti-enumeration).
// Built fresh per call so each request gets its own Response instance; Response
// bodies are single-use streams and sharing one instance across concurrent
// requests would cause "body already read" failures.
function genericResponse() {
  return NextResponse.json<AuthResponse>(
    {
      success: true,
      message:
        "If an account with that email exists, you will receive a password reset link shortly.",
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = ForgotPasswordSchema.safeParse(body);
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

    const { email } = result.data;

    // ── Look up user ────────────────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Return the generic response immediately if no matching account
    if (!user) return genericResponse();

    // ── Invalidate any existing unused tokens for this user ─────────────────
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // ── Create a fresh token ────────────────────────────────────────────────
    const token = uuidv4();
    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + EXPIRY_MS),
        used: false,
      },
    });

    // ── Send email (fire-and-forget — don't let email failure block response) ─
    sendPasswordResetEmail(user.email, user.name, token).catch((err) => {
      console.error("[auth/forgot-password] email send failed:", err);
    });

    return genericResponse();
  } catch (error) {
    console.error("[auth/forgot-password]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
