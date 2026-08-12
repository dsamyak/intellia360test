import { NextRequest, NextResponse } from "next/server";
import { ForgotPasswordSchema } from "@/lib/auth/validation";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { generateRawToken, hashToken, RESET_TOKEN_TTL_MS } from "@/lib/auth/token";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

// Generic — never reveals whether the email exists (anti-enumeration).
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
    const body   = await request.json();
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

    const user = await db.user.findUnique({
      where:  { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) return genericResponse();

    // Invalidate all existing unused reset tokens
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    // Generate new hashed token
    const rawToken  = generateRawToken();
    const tokenHash = hashToken(rawToken);

    await db.passwordResetToken.create({
      data: {
        tokenHash,
        userId:    user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        used:      false,
      },
    });

    // Fire-and-forget — email failure must not block the response
    sendPasswordResetEmail(user.email, user.name, rawToken).catch((err) => {
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
