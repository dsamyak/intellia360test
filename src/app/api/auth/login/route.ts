import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/auth/validation";
import { verifyPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { AuthResponse, AuthUser } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Validate input ──────────────────────────────────────────────────────
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

    // ── Look up user by email ───────────────────────────────────────────────
    const dbUser = await db.user.findUnique({
      where: { email: emailOrUsername },
    });

    // Timing-safe: always run bcrypt even when user not found
    const DUMMY_HASH = "$2a$12$placeholder.hash.to.prevent.timing.attacks.xxxxxxxxxxxxxx";
    const passwordMatch = dbUser
      ? await verifyPassword(password, dbUser.password)
      : await verifyPassword(password, DUMMY_HASH).then(() => false);

    if (!dbUser || !passwordMatch) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Build response user (never expose password hash) ────────────────────
    const user: AuthUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };

    const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
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
