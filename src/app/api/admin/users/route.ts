/**
 * GET /api/admin/users
 *
 * ADMIN-only: list users with pagination, search, and role filter.
 * Returns requestedRole alongside current role so admins can action pending
 * role upgrade requests.
 *
 * Deactivated accounts (`deletedAt` set) are excluded unless the caller asks
 * for them explicitly with `?includeDeleted=true`, which is how an admin finds
 * an account to restore.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import { notDeleted, hasRequestedRole } from "@/lib/db-filters";
import { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";

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
  /** ISO timestamp when the account was deactivated, null when active. */
  deletedAt:     string | null;
  // Role-scoped profile fields (present when the row's role matches)
  grade?:        string;
  school?:       string | null;
  subject?:      string | null;
  xpPoints?:     number;
  learningGems?: number;
  lastActiveDate?: string | null;
  classesCount?: number;
}

/** Only the fields the table renders — never the password hash. */
const ROW_SELECT = {
  id:            true,
  name:          true,
  email:         true,
  role:          true,
  requestedRole: true,
  emailVerified: true,
  createdAt:     true,
  deletedAt:     true,
  studentProfile: {
    select: { grade: true, school: true, xpPoints: true, learningGems: true, lastActiveDate: true },
  },
  teacherProfile: {
    select: { schoolName: true, subject: true, _count: { select: { classes: true } } },
  },
} satisfies Prisma.UserSelect;

type UserRecord = Prisma.UserGetPayload<{ select: typeof ROW_SELECT }>;

function toRow(u: UserRecord): AdminUserRow {
  return {
    id:            u.id,
    name:          u.name,
    email:         u.email,
    role:          u.role,
    requestedRole: u.requestedRole,
    emailVerified: u.emailVerified,
    createdAt:     u.createdAt.toISOString(),
    pendingUpgrade: u.requestedRole !== null && u.requestedRole !== u.role,
    deletedAt:     u.deletedAt?.toISOString() ?? null,
    grade:          u.studentProfile?.grade,
    school:         u.studentProfile?.school ?? u.teacherProfile?.schoolName ?? null,
    subject:        u.teacherProfile?.subject ?? null,
    xpPoints:       u.studentProfile?.xpPoints,
    learningGems:   u.studentProfile?.learningGems,
    lastActiveDate: u.studentProfile?.lastActiveDate?.toISOString() ?? null,
    classesCount:   u.teacherProfile?._count.classes,
  };
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const roleParam = searchParams.get("role");
  // Only a real Role member reaches the query — an unknown value would otherwise
  // be cast straight into the filter and match nothing silently.
  const role = roleParam && roleParam in Role ? (roleParam as Role) : undefined;
  const q      = searchParams.get("q")      ?? "";
  const pending = searchParams.get("pending") === "true";
  const includeDeleted = searchParams.get("includeDeleted") === "true";

  const where: Prisma.UserWhereInput = {
    // `notDeleted()` rather than `deletedAt: null` — see src/lib/db-filters.ts:
    // documents that never had the key written are not matched by a null filter,
    // which made this endpoint return an empty list for every real account.
    ...(includeDeleted ? {} : { AND: [notDeleted()] }),
    ...(role ? { role } : {}),
    ...(q ? {
      OR: [
        { name:  { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    } : {}),
  };

  // "Pending upgrade" compares two fields on the same document, which MongoDB
  // cannot express in a plain filter. The previous version paginated first and
  // filtered in JS afterwards, so ?pending=true returned only the pending users
  // that happened to fall on the requested page and reported a `total` for the
  // unfiltered set. Narrow in the database to rows that have a requestedRole at
  // all — a small subset — then compare and paginate over the true result set.
  if (pending) {
    const candidates = await db.user.findMany({
      where: { ...where, ...hasRequestedRole() },
      select: ROW_SELECT,
      orderBy: { createdAt: "desc" },
    });

    const matched = candidates.filter((u) => u.requestedRole !== u.role);
    const paged = matched.slice((page - 1) * limit, page * limit);

    return NextResponse.json(
      {
        success: true,
        message: "OK",
        data: paged.map(toRow),
        meta: {
          total: matched.length,
          page,
          limit,
          pages: Math.max(1, Math.ceil(matched.length / limit)),
        },
      },
      { status: 200 }
    );
  }

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      select: ROW_SELECT,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
  ]);

  return NextResponse.json(
    {
      success: true,
      message: "OK",
      data:    users.map(toRow),
      meta:    { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
    },
    { status: 200 }
  );
}
