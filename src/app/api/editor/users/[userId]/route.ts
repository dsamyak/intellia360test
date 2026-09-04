/**
 * PATCH  /api/editor/users/[userId]  — update role or name
 * DELETE /api/editor/users/[userId]  — delete a user
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import type { AuthResponse } from "@/types/auth";

type Params = { params: Promise<{ userId: string }> };

const PatchSchema = z.object({
  name: z.string().min(2).optional(),
  // Role changes are NOT allowed here — only ADMIN can change roles via
  // PATCH /api/admin/users/[userId]/role
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { errorResponse, session } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { userId } = await params;
  const body = await req.json().catch(() => ({}));
  const result = PatchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed",
        errors: result.error.flatten().fieldErrors as Record<string,string[]> },
      { status: 422 }
    );
  }

  const before = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!before) {
    return NextResponse.json<AuthResponse>({ success: false, message: "User not found" }, { status: 404 });
  }

  const updated = await db.user.update({
    where: { id: userId },
    data:  result.data,
    select: { id: true, name: true, email: true, role: true },
  });

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "user.update",
    entityType: "User",
    entityId: userId,
    summary: `Renamed ${before.email} to "${updated.name}"`,
    before: { name: before.name },
    after:  { name: updated.name },
    request: req,
  });

  return NextResponse.json<AuthResponse<typeof updated>>(
    { success: true, message: "User updated", data: updated },
    { status: 200 }
  );
}

/**
 * Deactivates an account rather than deleting it.
 *
 * The previous implementation issued a hard delete, which cascades through
 * every progress, quiz, badge and notification row the user owns — permanent
 * data loss available to a non-ADMIN role with no trace left behind.
 * Permanent erasure remains an ADMIN-only operation
 * (DELETE /api/admin/users/[userId]?permanent=true).
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { errorResponse, session } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { userId } = await params;

  // Don't let editors deactivate themselves
  if (session.userId === userId) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, deletedAt: true },
  });

  if (!target) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  if (target.deletedAt !== null) {
    return NextResponse.json<AuthResponse>(
      { success: true, message: "User is already deactivated" },
      { status: 200 }
    );
  }

  await db.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "user.deactivate",
    entityType: "User",
    entityId: userId,
    summary: `Deactivated ${target.email} (${target.role})`,
    request: req,
  });

  return NextResponse.json<AuthResponse>(
    {
      success: true,
      message: "User deactivated — their history is retained and an admin can restore the account.",
    },
    { status: 200 }
  );
}
