import { NextRequest, NextResponse } from "next/server";
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

/**
 * PUBLIC LEADERBOARD
 *
 * Login is NOT required.
 *
 * Example:
 * GET /api/student/leaderboard
 * GET /api/student/leaderboard?limit=6
 * GET /api/student/leaderboard?grade=grade1&limit=6
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional grade filter
    const grade = searchParams.get("grade") ?? undefined;

    // Limit
    const limitParam = parseInt(
      searchParams.get("limit") ?? String(DEFAULT_LIMIT),
      10
    );

    const limit = Number.isNaN(limitParam)
      ? DEFAULT_LIMIT
      : Math.min(
        Math.max(1, limitParam),
        MAX_LIMIT
      );

    /**
     * ---------------------------------------------------------
     * FETCH STUDENTS FROM DATABASE
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     * There is NO requireStudentSession() here.
     *
     * Therefore this API can be accessed even when the user
     * is not logged in.
     */

    const profiles = await db.studentProfile.findMany({
      where: {
        ...(grade ? { grade } : {}),

        user: {
          role: "STUDENT",
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },

      /**
       * Highest XP first.
       * Learning gems are used as a secondary tie-breaker.
       */
      orderBy: [
        {
          xpPoints: "desc",
        },
        {
          learningGems: "desc",
        },
      ],
    });

    /**
     * Total students matching the filter
     */
    const total = profiles.length;

    /**
     * ---------------------------------------------------------
     * CREATE LEADERBOARD ENTRIES
     * ---------------------------------------------------------
     */

    const entries: LeaderboardEntry[] = profiles
      .slice(0, limit)
      .map((profile, index) => {
        return {
          rank: index + 1,

          userId: profile.userId,

          name: profile.user.name,

          avatar: profile.avatar,

          grade: profile.grade,

          xpPoints: profile.xpPoints,

          learningGems: profile.learningGems,

          streakDays: profile.streakDays,

          /**
           * Since this is a PUBLIC endpoint and there is no
           * required login/session, we don't mark a current user.
           */
          isCurrentUser: false,
        };
      });

    /**
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return NextResponse.json<AuthResponse<LeaderboardResponse>>(
      {
        success: true,

        message: "OK",

        data: {
          entries,

          total,

          currentUserRank: null,

          currentUserStats: null,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[student/leaderboard] Error:",
      error
    );

    return NextResponse.json<AuthResponse>(
      {
        success: false,

        message: "An unexpected error occurred",
      },
      {
        status: 500,
      }
    );
  }
}