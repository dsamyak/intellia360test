/**
 * PATCH  /api/editor/users/[userId]  — update role or name
 * DELETE /api/editor/users/[userId]  — delete a user
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

type Params = { params: Promise<{ userId: string }> };

const PatchSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN","STUDENT","PARENT","TEACHER","SCHOOL","EDITOR"]).optional(),
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

  const updated = await db.user.update({
    where: { id: userId },
    data:  result.data as never,
    select: { id: true, name: true, email: true, role: true },
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json<AuthResponse>({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json<AuthResponse<typeof updated>>(
    { success: true, message: "User updated", data: updated },
    { status: 200 }
  );
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { errorResponse, session } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { userId } = await params;

  // Don't let editors delete themselves
  if (session!.userId === userId) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  await db.user.delete({ where: { id: userId } }).catch(() => null);
  return NextResponse.json<AuthResponse>({ success: true, message: "User deleted" }, { status: 200 });
}
