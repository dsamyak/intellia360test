/**
 * PUBLIC LEADERBOARD — GET /api/student/leaderboard
 *
 * Login is deliberately NOT required: the marketing homepage renders a top-six
 * board for anonymous visitors.
 *
 * Because it is public and polled, this route is the cheapest endpoint to
 * abuse and the most expensive to serve naively, so two things matter:
 *
 *  1. It fetches only `limit` rows. The previous version loaded *every* student
 *     profile plus its joined user row, then threw all but `limit` away in JS —
 *     an unbounded scan on every anonymous request, and an in-memory sort that
 *     MongoDB aborts once it exceeds the 32MB sort limit. The matching index is
 *     `@@index([xpPoints(sort: Desc), learningGems(sort: Desc)])`.
 *  2. Responses carry Cache-Control so a CDN and the browser can absorb the
 *     repeat traffic instead of the database.
 *
 * Only display fields are returned. `userId` is deliberately omitted: nothing
 * consumes it (`isCurrentUser` is always false here) and exposing internal
 * identifiers for minors on an unauthenticated endpoint has no upside.
 *
 * Examples:
 *   GET /api/student/leaderboard
 *   GET /api/student/leaderboard?limit=6
 *   GET /api/student/leaderboard?grade=grade1&limit=6
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notDeleted } from "@/lib/db-filters";
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

    const limitParam = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
    const limit = Number.isNaN(limitParam)
      ? DEFAULT_LIMIT
      : Math.min(Math.max(1, limitParam), MAX_LIMIT);

    // Deactivated accounts drop off the board; their profile rows are retained.
    const where = {
      ...(grade ? { grade } : {}),
      user: { role: "STUDENT" as const, AND: [notDeleted()] },
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
          user: { select: { name: true } },
        },
        orderBy: [{ xpPoints: "desc" }, { learningGems: "desc" }],
        take: limit,
      }),
      // A count aggregate rather than the length of a fully materialised list.
      db.studentProfile.count({ where }),
    ]);

    const entries: LeaderboardEntry[] = profiles.map((profile, index) => ({
      rank: index + 1,
      name: profile.user.name,
      avatar: profile.avatar,
      grade: profile.grade,
      xpPoints: profile.xpPoints,
      learningGems: profile.learningGems,
      streakDays: profile.streakDays,
      // No session is read on this public route, so no row is "the current user".
      isCurrentUser: false,
    }));

    return NextResponse.json<AuthResponse<LeaderboardResponse>>(
      {
        success: true,
        message: "OK",
        data: { entries, total, currentUserRank: null, currentUserStats: null },
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
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
