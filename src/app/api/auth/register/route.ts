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

    const { name, email, password, role, grade } = result.data;

    // ── Duplicate-email check ───────────────────────────────────────────────
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Anti-enumeration: same message whether the account is verified or not
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "An account with this email already exists",
          errors: { email: ["An account with this email already exists"] },
        },
        { status: 409 }
      );
    }

    // ── Hash password ───────────────────────────────────────────────────────
    const hashedPassword = await hashPassword(password);

    // ── Generate verification token ─────────────────────────────────────────
    // Only the SHA-256 hash of the raw token is persisted.
    const rawToken   = generateRawToken();
    const tokenHash  = hashToken(rawToken);
    const expiresAt  = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    // ── Create user + profile + verification token in one transaction ───────
    await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          emailVerified: false,        // must verify before login
        },
      });

      // Role-scoped profile
      if (role === "TEACHER" || role === "SCHOOL") {
        await tx.teacherProfile.create({ data: { userId: newUser.id } });
      } else if (role === "ADMIN" || role === "EDITOR") {
        // No profile required
      } else {
        // STUDENT / PARENT
        const studentGrade = grade || "grade1";

        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            grade: studentGrade,
            xpPoints: 0,
            learningGems: 0,
            streakDays: 1,
            lastActiveDate: new Date(),
          },
        });
      }

      // Verification token (hashed)
      await tx.emailVerificationToken.create({
        data: {
          tokenHash,
          userId:    newUser.id,
          expiresAt,
          used:      false,
        },
      });
    });

    // ── Send verification email ─────────────────────────────────────────────
    // We do NOT issue a session cookie here — the user must verify first.
    try {
      await sendVerificationEmail(email, name, rawToken);
    } catch (emailErr: unknown) {
      const errorMessage =
        emailErr instanceof Error ? emailErr.message : "Failed to send verification email";
      console.error("[auth/register] verification email failed:", errorMessage);

      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: `Account created, but verification email failed to send: ${errorMessage}`,
          errors: { email: [errorMessage] },
        },
        { status: 500 }
      );
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message:
          "Account created! We've sent a verification link to your email address. " +
          "Please check your inbox (and spam folder) and click the link to activate your account.",
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
