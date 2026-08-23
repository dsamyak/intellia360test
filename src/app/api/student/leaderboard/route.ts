import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/student/require-student-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  grade: string;
  xpPoints: number;
  learningGems: number;
  streakDays: number;
  isCurrentUser: boolean;
}

export interface CurrentUserStats {
  rank: number | null;
  xpPoints: number;
  streakDays: number;
  learningGems: number;
  grade: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  currentUserRank: number | null;
  currentUserStats: CurrentUserStats | null;
}

// GET /api/student/leaderboard?grade=grade1&limit=50
export async function GET(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireStudentSession();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade") ?? undefined;
    const limitParam = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
    const limit = isNaN(limitParam)
      ? DEFAULT_LIMIT
      : Math.min(Math.max(1, limitParam), MAX_LIMIT);

    // Fetch all student profiles for ranking from real database
    const profiles = await db.studentProfile.findMany({
      where: {
        ...(grade ? { grade } : {}),
        user: { role: "STUDENT" },
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: [
        { xpPoints: "desc" },
        { learningGems: "desc" }, // real secondary tiebreaker
      ],
    });

    const total = profiles.length;

    // Find the current user's rank from real database records
    const currentUserProfile = profiles.find((p) => p.userId === session.userId);
    const currentUserRankIndex = profiles.findIndex((p) => p.userId === session.userId);
    const currentUserRank = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : null;

    const currentUserStats: CurrentUserStats | null = currentUserProfile
      ? {
          rank: currentUserRank,
          xpPoints: currentUserProfile.xpPoints,
          streakDays: currentUserProfile.streakDays,
          learningGems: currentUserProfile.learningGems,
          grade: currentUserProfile.grade,
        }
      : null;

    const entries: LeaderboardEntry[] = profiles
      .slice(0, limit)
      .map((p, index) => ({
        rank: index + 1,
        userId: p.userId,
        name: p.user.name,
        avatar: p.avatar,
        grade: p.grade,
        xpPoints: p.xpPoints,
        learningGems: p.learningGems,
        streakDays: p.streakDays,
        isCurrentUser: p.userId === session.userId,
      }));

    return NextResponse.json<AuthResponse<LeaderboardResponse>>(
      {
        success: true,
        message: "OK",
        data: {
          entries,
          total,
          currentUserRank,
          currentUserStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[student/leaderboard]", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

