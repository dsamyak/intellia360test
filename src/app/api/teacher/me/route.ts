/**
 * GET /api/teacher/me — teacher profile stub
 * Returns basic teacher stats from the DB.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

export async function GET() {
  const payload = await getSession();
  if (!payload) {
    return NextResponse.json<AuthResponse>({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: payload.sub },
    include: {
      classes: {
        include: { students: true, assignments: true },
      },
    },
  });

  if (!teacherProfile) {
    // Return zeros gracefully — profile may not exist yet
    return NextResponse.json(
      { success: true, message: "OK", data: { totalStudents: 0, assignedClasses: [], averageCompletion: 0, activeAssignments: 0 } },
      { status: 200 }
    );
  }

  const totalStudents     = teacherProfile.classes.reduce((s, c) => s + c.students.length, 0);
  const activeAssignments = teacherProfile.classes.reduce((s, c) => s + c.assignments.filter(a => a.status === "ACTIVE").length, 0);

  return NextResponse.json(
    {
      success: true,
      message: "OK",
      data: {
        id:                 teacherProfile.id,
        schoolName:         teacherProfile.schoolName,
        assignedClasses:    teacherProfile.classes.map(c => ({ id: c.id, className: c.className, grade: c.grade, studentCount: c.students.length })),
        totalStudents,
        activeAssignments,
        averageCompletion: 0, // would be computed from quiz attempts in a full implementation
      },
    },
    { status: 200 }
  );
}
