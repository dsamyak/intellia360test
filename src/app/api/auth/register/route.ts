/**
 * POST /api/auth/register
 *
 * Role policy
 * ───────────
 * Every new account is created with role = STUDENT regardless of what the
 * user selected in the UI. The UI selection is stored as `requestedRole` so
 * an admin can review it and upgrade the account when appropriate.
 *
 * This prevents:
 *   • Self-assignment of privileged roles (ADMIN, EDITOR, TEACHER, etc.)
 *   • One email being used to register with multiple different roles
 *
 * Admin role can ONLY be granted by an existing ADMIN via
 * PATCH /api/admin/users/[userId]/role
 */
import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/hash";
import { sendVerificationEmail } from "@/lib/auth/email";
import { generateRawToken, hashToken, VERIFY_TOKEN_TTL_MS } from "@/lib/auth/token";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Validate ────────────────────────────────────────────────────────────
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

    const { name, email, password, requestedRole, grade, school, subject } = result.data;

    // ── Duplicate-email check ───────────────────────────────────────────────
    // One email → one account only. Re-registering with a different role
    // is not allowed — existing users must ask an admin to change their role.
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "An account with this email already exists. " +
            "If you need a different role, please contact an administrator.",
          errors: { email: ["An account with this email already exists"] },
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    // ── Transactional create ────────────────────────────────────────────────
    // role is ALWAYS STUDENT — requestedRole is stored for admin review.
    const createdUserId = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",           // ← always base plan
          requestedRole: requestedRole ?? "STUDENT",
          emailVerified: false,
        },
      });

      // Role-scoped profile
      if (requestedRole === "TEACHER" || requestedRole === "SCHOOL") {
        await tx.teacherProfile.create({ data: { userId: newUser.id, schoolName: school, subject } });
      } else if (requestedRole === "EDITOR") {
        // No profile required
      } else {
        // STUDENT / PARENT
        const studentGrade = grade || "grade1";

        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            grade: studentGrade,
            school,
            xpPoints: 0,
            learningGems: 0,
            streakDays: 1,
            lastActiveDate: new Date(),
          },
        });
      }

      await tx.emailVerificationToken.create({
        data: { tokenHash, userId: newUser.id, expiresAt, used: false },
      });

      return newUser.id;
    });

    // ── Send verification email (fire-and-forget style but still await) ─────
    // We do NOT issue a session cookie here — the user must verify first.
    try {
      await sendVerificationEmail(email, name, rawToken);
    } catch (emailErr) {
      // Log but don't fail the registration — the user can request a resend.
      console.error("[auth/register] verification email failed:", emailErr);
    }

    return NextResponse.json<AuthResponse<{ userId: string }>>(
      {
        success: true,
        message:
          "Account created! Check your inbox for a verification link. " +
          "Your account starts on the Student plan — an admin can upgrade your role once verified.",
        data: { userId: createdUserId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
