import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { AuthResponse, AuthUser } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Validate input ──────────────────────────────────────────────────────
    const result = RegisterSchema.safeParse(body);
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

    const { name, email, username, dateOfBirth, password, role } = result.data;

    // ── Check for duplicate email or username ───────────────────────────────
    const existing = await db.user.findFirst({
      where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
      select: { email: true, username: true },
    });

    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message:
            field === "email"
              ? "An account with this email already exists"
              : "That username is already taken",
          errors: {
            [field]: [
              field === "email"
                ? "An account with this email already exists"
                : "That username is already taken",
            ],
          },
        },
        { status: 409 }
      );
    }

    // ── Hash password and persist ───────────────────────────────────────────
    const passwordHash = await hashPassword(password);

    const dbUser = await db.user.create({
      data: {
        name,
        email,
        username,
        dateOfBirth,
        passwordHash,
        role,
        isVerified: false,
        isActive: true,
      },
    });

    // ── Issue JWT ───────────────────────────────────────────────────────────
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

    const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    await setSessionCookie(token);

    return NextResponse.json<AuthResponse<AuthUser>>(
      { success: true, message: "Account created successfully", data: user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
