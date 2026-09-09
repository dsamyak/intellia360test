import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** Seconds a CDN/browser may reuse a leaderboard response. */
const CACHE_SECONDS = 60;

/** Seconds a stale response may still be served while it revalidates. */
const STALE_SECONDS = 300;

export interface LeaderboardEntry {
  rank: number;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const grade = searchParams.get("grade") ?? undefined;

    const limitParam = parseInt(
      searchParams.get("limit") ?? String(DEFAULT_LIMIT),
      10
    );

    const limit = Number.isNaN(limitParam)
      ? DEFAULT_LIMIT
      : Math.min(Math.max(1, limitParam), MAX_LIMIT);

    // StudentProfile already represents student accounts.
    // No authentication or User role/deletedAt filter is required
    // for the public homepage leaderboard.
    const where = {
      ...(grade ? { grade } : {}),
    };

    const [profiles, total] = await Promise.all([
      db.studentProfile.findMany({
        where,
        select: {
          avatar: true,
          grade: true,
          xpPoints: true,
          learningGems: true,
          streakDays: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { xpPoints: "desc" },
          { learningGems: "desc" },
        ],
        take: limit,
      }),

      db.studentProfile.count({ where }),
    ]);
    const entries: LeaderboardEntry[] = profiles.map(
      (profile, index) => ({
        rank: index + 1,
        name: profile.user.name,
        avatar: profile.avatar,
        grade: profile.grade,
        xpPoints: profile.xpPoints,
        learningGems: profile.learningGems,
        streakDays: profile.streakDays,

        // This is a public homepage leaderboard,
        // so no current-user session is checked.
        isCurrentUser: false,
      })
    );

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
        headers: {
          "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
        },
      }
    );
  } catch (error) {
    console.error("[student/leaderboard] Error:", error);

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