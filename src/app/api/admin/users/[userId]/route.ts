/**
 * GET   /api/admin/users/[userId]   — fetch a single user (ADMIN only)
 * PATCH /api/admin/users/[userId]   — update name (ADMIN only; role changes go to /role sub-route)
 * DELETE /api/admin/users/[userId]  — delete a user (ADMIN only; cannot delete self)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

type Params = { params: Promise<{ userId: string }> };

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { userId } = await params;

  const user = await db.user.findUnique({
    where:  { id: userId },
    select: {
      id:            true,
      name:          true,
      email:         true,
      role:          true,
      requestedRole: true,
      emailVerified: true,
      createdAt:     true,
      updatedAt:     true,
    },
  });

  if (!user) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "OK",
      data: {
        ...user,
        createdAt:      user.createdAt.toISOString(),
        updatedAt:      user.updatedAt.toISOString(),
        pendingUpgrade: user.requestedRole !== null && user.requestedRole !== user.role,
      },
    },
    { status: 200 }
  );
}

// ── PATCH (name only) ─────────────────────────────────────────────────────────
const PatchSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { userId } = await params;
  const body   = await req.json().catch(() => ({}));
  const result = PatchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Validation failed",
        errors:  result.error.flatten().fieldErrors as Record<string, string[]>,
      },
      { status: 422 }
    );
  }

  const updated = await db.user.update({
    where:  { id: userId },
    data:   { name: result.data.name },
    select: { id: true, name: true, email: true, role: true },
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<AuthResponse<typeof updated>>(
    { success: true, message: "User updated", data: updated },
    { status: 200 }
  );
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { errorResponse, session } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { userId } = await params;

  if (session.userId === userId) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  await db.user.delete({ where: { id: userId } }).catch(() => null);
  return NextResponse.json<AuthResponse>(
    { success: true, message: "User deleted" },
    { status: 200 }
  );
}
