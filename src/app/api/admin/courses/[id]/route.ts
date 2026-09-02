/**
 * PATCH  /api/admin/courses/[id]  — ADMIN-only: update a course
 * DELETE /api/admin/courses/[id]  — ADMIN-only: remove a course
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

type Params = { params: Promise<{ id: string }> };

const UpdateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  subject: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const result = UpdateCourseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 422 }
    );
  }

  const course = await db.course.update({ where: { id }, data: result.data }).catch(() => null);
  if (!course) {
    return NextResponse.json<AuthResponse>({ success: false, message: "Course not found" }, { status: 404 });
  }

  return NextResponse.json<AuthResponse<typeof course>>(
    { success: true, message: `${course.title} updated.`, data: course },
    { status: 200 }
  );
}

export async function DELETE(_req: Request, { params }: Params) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  await db.course.delete({ where: { id } }).catch(() => null);

  return NextResponse.json<AuthResponse>({ success: true, message: "Course deleted." }, { status: 200 });
}
