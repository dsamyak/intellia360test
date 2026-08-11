/**
 * GET  /api/editor/lessons/[gradeId]       — list all lesson JSON files for a grade
 * POST /api/editor/lessons/[gradeId]       — create a new lesson JSON file
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import type { AuthResponse } from "@/types/auth";

const DATA_ROOT = path.join(process.cwd(), "src", "data", "grades");

function lessonsDir(gradeId: string) {
  return path.join(DATA_ROOT, gradeId, "lessons");
}

export interface LessonSummary {
  id: string;
  title: string;
  grade: string;
  chapterId: string;
  estimatedMinutes: number;
  locked: boolean;
  completed: boolean;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { gradeId } = await params;
  const dir = lessonsDir(gradeId);

  if (!fs.existsSync(dir)) {
    return NextResponse.json<AuthResponse<LessonSummary[]>>(
      { success: true, message: "No lessons found", data: [] },
      { status: 200 }
    );
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const lessons: LessonSummary[] = files.map((f) => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
      return {
        id:               raw.id ?? f.replace(".json", ""),
        title:            raw.title ?? f,
        grade:            raw.grade ?? gradeId,
        chapterId:        raw.chapterId ?? "",
        estimatedMinutes: raw.estimatedMinutes ?? 0,
        locked:           raw.locked ?? false,
        completed:        raw.completed ?? false,
      };
    } catch {
      return { id: f.replace(".json", ""), title: f, grade: gradeId,
               chapterId: "", estimatedMinutes: 0, locked: false, completed: false };
    }
  });

  return NextResponse.json<AuthResponse<LessonSummary[]>>(
    { success: true, message: "OK", data: lessons },
    { status: 200 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { gradeId } = await params;
  const dir = lessonsDir(gradeId);

  const body = await request.json().catch(() => ({}));
  const lessonId: string = (body.id ?? "").trim().toLowerCase().replace(/\s+/g, "-");

  if (!lessonId) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "id is required" },
      { status: 422 }
    );
  }

  const filePath = path.join(dir, `${lessonId}.json`);
  if (fs.existsSync(filePath)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: `Lesson ${lessonId} already exists` },
      { status: 409 }
    );
  }

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const lesson = {
    id:           lessonId,
    title:        body.title ?? lessonId,
    description:  body.description ?? "",
    chapterId:    body.chapterId ?? "chap_1",
    chapterTitle: body.chapterTitle ?? "Chapter 1",
    grade:        gradeId,
    estimatedMinutes: body.estimatedMinutes ?? 20,
    completed:    false,
    locked:       body.locked ?? false,
    heroVisualizer: body.heroVisualizer ?? "place-value",
    heroVisualizerData: body.heroVisualizerData ?? { number: 123 },
    modules: {
      eduNotes:          { enabled: true,  url: body.eduNotesUrl ?? "" },
      architectureModule:{ enabled: true,  url: body.architectureUrl ?? "" },
      videoLesson:       { enabled: !!body.videoUrl, url: body.videoUrl ?? "" },
      practiceModule:    { enabled: true,  url: body.practiceUrl ?? "" },
    },
    previousLesson: null,
    nextLesson:     null,
  };

  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2));

  return NextResponse.json<AuthResponse<typeof lesson>>(
    { success: true, message: "Lesson created", data: lesson },
    { status: 201 }
  );
}
