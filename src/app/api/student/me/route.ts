import { NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/student/require-student-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

export interface StudentProfileResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  grade: string;
  xpPoints: number;
  learningGems: number;
  streakDays: number;
  lastActiveDate: string | null;
  classId: string | null;
}

export async function GET() {
  try {
    const { session, errorResponse } = await requireStudentSession();
    if (errorResponse) return errorResponse;

    // Fetch user + profile in one query
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { studentProfile: true },
    });

    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let profile = user.studentProfile;

    // Auto-create profile if missing (e.g. user registered before this code existed)
    if (!profile) {
      profile = await db.studentProfile.create({
        data: {
          userId: user.id,
          grade: "grade1",
          xpPoints: 0,
          learningGems: 0,
          streakDays: 1,
          lastActiveDate: new Date(),
        },
      });
    }

    const data: StudentProfileResponse = {
      id: profile.id,
      userId: profile.userId,
      name: user.name,
      email: user.email,
      avatar: profile.avatar,
      grade: profile.grade,
      xpPoints: profile.xpPoints,
      learningGems: profile.learningGems,
      streakDays: profile.streakDays,
      lastActiveDate: profile.lastActiveDate?.toISOString() ?? null,
      classId: profile.classId,
    };

    return NextResponse.json<AuthResponse<StudentProfileResponse>>(
      { success: true, message: "OK", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("[student/me]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
