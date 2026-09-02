/**
 * DELETE /api/admin/content/[id]  — ADMIN-only: remove a content resource
 */
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  await db.contentResource.delete({ where: { id } }).catch(() => null);

  return NextResponse.json<AuthResponse>(
    { success: true, message: "Resource deleted." },
    { status: 200 }
  );
}
