/**
 * GET /api/editor/stats  — dashboard aggregate stats
 */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

const DATA_ROOT = path.join(process.cwd(), "src", "data", "grades");

export interface EditorStats {
  totalGrades: number;
  totalLessons: number;
  totalUsers: number;
  usersByRole: Record<string, number>;
  gradesWithNoLessons: string[];
}

export async function GET() {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  // File-system stats
  let totalGrades = 0;
  let totalLessons = 0;
  const gradesWithNoLessons: string[] = [];

  if (fs.existsSync(DATA_ROOT)) {
    const dirs = fs
      .readdirSync(DATA_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    totalGrades = dirs.length;

    for (const g of dirs) {
      const lDir = path.join(DATA_ROOT, g, "lessons");
      const count = fs.existsSync(lDir)
        ? fs.readdirSync(lDir).filter((f) => f.endsWith(".json")).length
        : 0;
      totalLessons += count;
      if (count === 0) gradesWithNoLessons.push(g);
    }
  }

  // DB stats
  const [totalUsers, roleCounts] = await Promise.all([
    db.user.count(),
    db.user.groupBy({ by: ["role"], _count: { role: true } }),
  ]);

  const usersByRole: Record<string, number> = {};
  for (const r of roleCounts) {
    usersByRole[r.role] = r._count.role;
  }

  const stats: EditorStats = {
    totalGrades,
    totalLessons,
    totalUsers,
    usersByRole,
    gradesWithNoLessons,
  };

  return NextResponse.json<AuthResponse<EditorStats>>(
    { success: true, message: "OK", data: stats },
    { status: 200 }
  );
}
