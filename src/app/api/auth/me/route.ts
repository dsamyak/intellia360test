import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { AuthResponse, AuthUser } from "@/types/auth";

export async function GET() {
  try {
    const payload = await getSession();
    if (!payload) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { id: payload.sub },
    });

    if (!dbUser) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    const user: AuthUser = {
      id:            dbUser.id,
      name:          dbUser.name,
      email:         dbUser.email,
      role:          dbUser.role,
      emailVerified: dbUser.emailVerified,
      createdAt:     dbUser.createdAt.toISOString(),
      updatedAt:     dbUser.updatedAt.toISOString(),
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
