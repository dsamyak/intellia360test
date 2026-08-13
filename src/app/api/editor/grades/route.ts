/**
 * GET  /api/editor/grades  — list all grade directories with metadata
 * POST /api/editor/grades  — create a new grade directory scaffold
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import type { AuthResponse } from "@/types/auth";

const DATA_ROOT = path.join(process.cwd(), "src", "data", "grades");

export interface GradeMeta {
  id: string;
  label: string;
  lessonCount: number;
  hasCurriculum: boolean;
  hasDashboard: boolean;
}

export async function GET() {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  if (!fs.existsSync(DATA_ROOT)) {
    return NextResponse.json<AuthResponse<GradeMeta[]>>(
      { success: true, message: "No grades found", data: [] },
      { status: 200 }
    );
  }

  const dirs = fs
    .readdirSync(DATA_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const grades: GradeMeta[] = dirs.map((id) => {
    const gradeDir = path.join(DATA_ROOT, id);
    const lessonsDir = path.join(gradeDir, "lessons");
    const lessonCount = fs.existsSync(lessonsDir)
      ? fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".json")).length
      : 0;
    return {
      id,
      label: id.replace("grade", "Grade "),
      lessonCount,
      hasCurriculum: fs.existsSync(path.join(gradeDir, "curriculum.json")),
      hasDashboard:  fs.existsSync(path.join(gradeDir, "dashboard.json")),
    };
  });

  return NextResponse.json<AuthResponse<GradeMeta[]>>(
    { success: true, message: "OK", data: grades },
    { status: 200 }
  );
}

const EMPTY_CURRICULUM = (gradeId: string) => ({
  activeTopic: null,
  standaloneTopics: [],
  chapters: [
    {
      id: "chap_1",
      chapterNumber: 1,
      title: "Chapter 1",
      topicsCount: 0,
      topics: [],
    },
  ],
});

export async function POST(request: NextRequest) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const gradeId: string = (body.gradeId ?? "").trim().toLowerCase().replace(/\s+/g, "");

  if (!gradeId || !/^grade\d+$/.test(gradeId)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "gradeId must match the pattern grade<number> (e.g. grade8)" },
      { status: 422 }
    );
  }

  const gradeDir   = path.join(DATA_ROOT, gradeId);
  const lessonsDir = path.join(gradeDir, "lessons");

  if (fs.existsSync(gradeDir)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: `${gradeId} already exists` },
      { status: 409 }
    );
  }

  fs.mkdirSync(lessonsDir, { recursive: true });
  fs.writeFileSync(
    path.join(gradeDir, "curriculum.json"),
    JSON.stringify(EMPTY_CURRICULUM(gradeId), null, 2)
  );

  return NextResponse.json<AuthResponse<{ id: string }>>(
    { success: true, message: `${gradeId} created`, data: { id: gradeId } },
    { status: 201 }
  );
}
