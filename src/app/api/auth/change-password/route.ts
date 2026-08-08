import { NextRequest, NextResponse } from "next/server";
import { ChangePasswordSchema } from "@/lib/auth/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    // ── Require authenticated session ───────────────────────────────────────
    const payload = await getSession();
    if (!payload) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = ChangePasswordSchema.safeParse(body);
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

    const { currentPassword, newPassword } = result.data;

    // ── Fetch user with passwordHash ────────────────────────────────────────
    const dbUser = await db.user.findUnique({
      where: { id: payload.sub, isActive: true },
      select: { id: true, passwordHash: true },
    });

    if (!dbUser) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ── Verify current password ─────────────────────────────────────────────
    const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Current password is incorrect",
          errors: { currentPassword: ["Current password is incorrect"] },
        },
        { status: 401 }
      );
    }

    // ── Hash and persist new password ───────────────────────────────────────
    const passwordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: dbUser.id },
      data: { passwordHash },
    });

    return NextResponse.json<AuthResponse>(
      { success: true, message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/change-password]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
