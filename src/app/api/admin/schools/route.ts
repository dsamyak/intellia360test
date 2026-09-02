/**
 * GET  /api/admin/schools  — ADMIN-only: list schools
 * POST /api/admin/schools  — ADMIN-only: onboard a new school
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import { computeSchoolCounts, normSchoolKey } from "@/lib/admin/school-stats";
import type { AuthResponse } from "@/types/auth";

const CreateSchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  location: z.string().optional(),
  adminName: z.string().optional(),
  adminEmail: z.string().email("Enter a valid admin email"),
  plan: z.enum(["Basic", "Standard", "Premium", "Enterprise"]).default("Basic"),
});

export async function GET() {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const [schools, counts] = await Promise.all([
    db.school.findMany({ orderBy: { createdAt: "desc" } }),
    computeSchoolCounts(),
  ]);

  const withLiveCounts = schools.map((s) => {
    const c = counts.get(normSchoolKey(s.name));
    return { ...s, teachersCount: c?.teachers ?? 0, studentsCount: c?.students ?? 0 };
  });

  return NextResponse.json<AuthResponse<typeof withLiveCounts>>(
    { success: true, message: "OK", data: withLiveCounts },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const result = CreateSchoolSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 422 }
    );
  }

  const { name, location, adminName, adminEmail, plan } = result.data;
  const code = `SCH-${Date.now().toString(36).toUpperCase()}`;

  const school = await db.school.create({
    data: { name, location, adminName, adminEmail, plan, code, status: "PENDING" },
  });

  return NextResponse.json<AuthResponse<typeof school>>(
    { success: true, message: `${name} onboarded successfully.`, data: school },
    { status: 201 }
  );
}
