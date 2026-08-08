import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { AuthResponse, AuthUser } from "@/types/auth";

export async function GET() {
  try {
    // ── Verify session cookie ───────────────────────────────────────────────
    const payload = await getSession();
    if (!payload) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Fetch fresh user data from DB ───────────────────────────────────────
    // This catches deactivated accounts or role changes that occurred after
    // the JWT was issued.
    const dbUser = await db.user.findUnique({
      where: { id: payload.sub, isActive: true },
    });

    if (!dbUser) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found or account deactivated" },
        { status: 401 }
      );
    }

    const user: AuthUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      username: dbUser.username ?? undefined,
      dateOfBirth: dbUser.dateOfBirth ?? undefined,
      role: dbUser.role,
      isVerified: dbUser.isVerified,
      isActive: dbUser.isActive,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };

    return NextResponse.json<AuthResponse<AuthUser>>(
      { success: true, message: "OK", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/me]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
