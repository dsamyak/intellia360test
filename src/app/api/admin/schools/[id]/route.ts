/**
 * PATCH  /api/admin/schools/[id]  — ADMIN-only: update a school
 * DELETE /api/admin/schools/[id]  — ADMIN-only: remove a school
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

type Params = { params: Promise<{ id: string }> };

const UpdateSchoolSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
  adminName: z.string().optional(),
  adminEmail: z.string().email().optional(),
  plan: z.enum(["Basic", "Standard", "Premium", "Enterprise"]).optional(),
  status: z.enum(["ACTIVE", "PENDING", "INACTIVE"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const result = UpdateSchoolSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 422 }
    );
  }

  const school = await db.school.update({ where: { id }, data: result.data }).catch(() => null);
  if (!school) {
    return NextResponse.json<AuthResponse>({ success: false, message: "School not found" }, { status: 404 });
  }

  return NextResponse.json<AuthResponse<typeof school>>(
    { success: true, message: `${school.name} updated.`, data: school },
    { status: 200 }
  );
}

export async function DELETE(_req: Request, { params }: Params) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  await db.school.delete({ where: { id } }).catch(() => null);

  return NextResponse.json<AuthResponse>({ success: true, message: "School deleted." }, { status: 200 });
}
