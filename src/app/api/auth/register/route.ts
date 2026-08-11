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

    const { name, email, password, role } = result.data;

    // ── Check for duplicate email ───────────────────────────────────────────
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "An account with this email already exists",
          errors: { email: ["An account with this email already exists"] },
        },
        { status: 409 }
      );
    }

    // ── Hash password and create user + profile in a transaction ────────────
    const hashedPassword = await hashPassword(password);

    const dbUser = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashedPassword, role },
      });

      // Auto-create the appropriate profile
      if (role === "TEACHER" || role === "SCHOOL") {
        await tx.teacherProfile.create({ data: { userId: newUser.id } });
      } else if (role === "ADMIN" || role === "EDITOR") {
        // Admin and Editor don't need a student/teacher profile
      } else {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            grade: "grade1",
            xpPoints: 0,
            learningGems: 0,
            streakDays: 1,
            lastActiveDate: new Date(),
          },
        });
      }

      return newUser;
    });

    // ── Issue JWT ───────────────────────────────────────────────────────────
    const user: AuthUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
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
