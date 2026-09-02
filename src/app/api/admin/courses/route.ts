/**
 * GET  /api/admin/courses  — ADMIN-only: list courses
 * POST /api/admin/courses  — ADMIN-only: create a course (draft)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import { countLessonsByGrade } from "@/lib/content/lesson-count";
import type { AuthResponse } from "@/types/auth";

const CreateCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  subject: z.string().optional(),
  grade: z.string().default("grade1"),
  description: z.string().optional(),
});

export async function GET() {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const [courses, studentGrades] = await Promise.all([
    db.course.findMany({ orderBy: { createdAt: "desc" } }),
    db.studentProfile.groupBy({ by: ["grade"], _count: { _all: true } }),
  ]);

  const enrolledByGrade = new Map(studentGrades.map((g) => [g.grade, g._count._all]));
  const lessonsByGrade = countLessonsByGrade();

  const withLiveCounts = courses.map((c) => ({
    ...c,
    lessonsCount: lessonsByGrade[c.grade] ?? 0,
    enrolledStudents: enrolledByGrade.get(c.grade) ?? 0,
  }));

  return NextResponse.json<AuthResponse<typeof withLiveCounts>>(
    { success: true, message: "OK", data: withLiveCounts },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const result = CreateCourseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 422 }
    );
  }

  const course = await db.course.create({
    data: { ...result.data, status: "DRAFT" },
  });

  return NextResponse.json<AuthResponse<typeof course>>(
    { success: true, message: `${course.title} created as a draft.`, data: course },
    { status: 201 }
  );
}
