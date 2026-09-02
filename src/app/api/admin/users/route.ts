/**
 * GET /api/admin/users
 *
 * ADMIN-only: list all users with pagination, search, and role filter.
 * Returns requestedRole alongside current role so admins can action pending
 * role upgrade requests.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

export interface AdminUserRow {
  id:            string;
  name:          string;
  email:         string;
  role:          string;
  requestedRole: string | null;
  emailVerified: boolean;
  createdAt:     string;
  /** True when requestedRole differs from current role — needs admin review. */
  pendingUpgrade: boolean;
  // Role-scoped profile fields (present when the row's role matches)
  grade?:        string;
  school?:       string | null;
  subject?:      string | null;
  xpPoints?:     number;
  learningGems?: number;
  lastActiveDate?: string | null;
  classesCount?: number;
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const role   = searchParams.get("role")   ?? undefined;
  const q      = searchParams.get("q")      ?? "";
  const pending = searchParams.get("pending") === "true"; // filter for pending upgrades

  const where = {
    ...(role ? { role: role as never } : {}),
    ...(q ? {
      OR: [
        { name:  { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      select: {
        id:            true,
        name:          true,
        email:         true,
        role:          true,
        requestedRole: true,
        emailVerified: true,
        createdAt:     true,
        studentProfile: {
          select: { grade: true, school: true, xpPoints: true, learningGems: true, lastActiveDate: true },
        },
        teacherProfile: {
          select: { schoolName: true, subject: true, _count: { select: { classes: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
  ]);

  let rows: AdminUserRow[] = users.map((u) => ({
    id:            u.id,
    name:          u.name,
    email:         u.email,
    role:          u.role,
    requestedRole: u.requestedRole,
    emailVerified: u.emailVerified,
    createdAt:     u.createdAt.toISOString(),
    pendingUpgrade: u.requestedRole !== null && u.requestedRole !== u.role,
    grade:          u.studentProfile?.grade,
    school:         u.studentProfile?.school ?? u.teacherProfile?.schoolName ?? null,
    subject:        u.teacherProfile?.subject ?? null,
    xpPoints:       u.studentProfile?.xpPoints,
    learningGems:   u.studentProfile?.learningGems,
    lastActiveDate: u.studentProfile?.lastActiveDate?.toISOString() ?? null,
    classesCount:   u.teacherProfile?._count.classes,
  }));

  if (pending) {
    rows = rows.filter((r) => r.pendingUpgrade);
  }

  return NextResponse.json(
    {
      success: true,
      message: "OK",
      data:    rows,
      meta:    { total, page, limit, pages: Math.ceil(total / limit) },
    },
    { status: 200 }
  );
}
