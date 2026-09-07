/**
 * GET    /api/editor/lessons/[gradeId]/[lessonId]  — read a lesson JSON
 * PUT    /api/editor/lessons/[gradeId]/[lessonId]  — full overwrite
 * PATCH  /api/editor/lessons/[gradeId]/[lessonId]  — partial update
 * DELETE /api/editor/lessons/[gradeId]/[lessonId]  — delete lesson file
 *
 * Both route params are interpolated into a filesystem path, so each is
 * validated before use. Writes and deletes are mirrored into MongoDB so the
 * content survives a redeploy and can be rolled back — src/data/grades ships
 * inside the build artifact and no database backup covers it.
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import {
  assertGradeId,
  assertLessonId,
  mirrorCurriculumDelete,
  mirrorCurriculumWrite,
  resolveInStore,
  storePath,
  UnsafePathError,
} from "@/lib/content/curriculum-store";
import { recordAudit } from "@/lib/audit";
import type { AuthResponse } from "@/types/auth";

type Params = { params: Promise<{ gradeId: string; lessonId: string }> };

/** Validate both ids and resolve the on-disk path in one step. */
async function resolveLesson(params: Params["params"]) {
  const raw = await params;
  const gradeId = assertGradeId(raw.gradeId);
  const lessonId = assertLessonId(raw.lessonId);
  return {
    gradeId,
    lessonId,
    fp: resolveInStore(gradeId, "lessons", `${lessonId}.json`),
    key: storePath(gradeId, "lessons", `${lessonId}.json`),
  };
}

function badPath(err: unknown) {
  return NextResponse.json<AuthResponse>(
    { success: false, message: err instanceof UnsafePathError ? err.message : "Invalid path" },
    { status: 400 }
  );
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let target;
  try {
    target = await resolveLesson(params);
  } catch (err) {
    return badPath(err);
  }

  if (!fs.existsSync(target.fp)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Lesson not found" },
      { status: 404 }
    );
  }
  return NextResponse.json<AuthResponse<unknown>>(
    { success: true, message: "OK", data: JSON.parse(fs.readFileSync(target.fp, "utf-8")) },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let target;
  try {
    target = await resolveLesson(params);
  } catch (err) {
    return badPath(err);
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Invalid JSON body" },
      { status: 422 }
    );
  }

  // The original wrote straight to the path; if the grade had no lessons dir yet
  // that threw an unhandled ENOENT and surfaced as a 500.
  const dir = path.dirname(target.fp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const previous = fs.existsSync(target.fp)
    ? (JSON.parse(fs.readFileSync(target.fp, "utf-8")) as unknown)
    : null;

  fs.writeFileSync(target.fp, JSON.stringify(body, null, 2));

  const version = await mirrorCurriculumWrite({
    path: target.key,
    gradeId: target.gradeId,
    kind: "lesson",
    lessonId: target.lessonId,
    content: body,
    updatedBy: session.userId,
  });

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "lesson.replace",
    entityType: "CurriculumDocument",
    entityId: target.key,
    summary: `Replaced lesson ${target.lessonId} (${target.gradeId})`,
    before: previous,
    after: body,
    request: req,
  });

  return NextResponse.json<AuthResponse<{ version: number | null }>>(
    { success: true, message: "Lesson saved", data: { version } },
    { status: 200 }
  );
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let target;
  try {
    target = await resolveLesson(params);
  } catch (err) {
    return badPath(err);
  }

  if (!fs.existsSync(target.fp)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Lesson not found" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Invalid JSON body" },
      { status: 422 }
    );
  }

  const existing = JSON.parse(fs.readFileSync(target.fp, "utf-8"));
  const merged = { ...existing, ...body };
  fs.writeFileSync(target.fp, JSON.stringify(merged, null, 2));

  await mirrorCurriculumWrite({
    path: target.key,
    gradeId: target.gradeId,
    kind: "lesson",
    lessonId: target.lessonId,
    content: merged,
    updatedBy: session.userId,
  });

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "lesson.update",
    entityType: "CurriculumDocument",
    entityId: target.key,
    summary: `Updated lesson ${target.lessonId} (${target.gradeId})`,
    before: existing,
    after: merged,
    request: req,
  });

  return NextResponse.json<AuthResponse<unknown>>(
    { success: true, message: "Lesson updated", data: merged },
    { status: 200 }
  );
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { session, errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let target;
  try {
    target = await resolveLesson(params);
  } catch (err) {
    return badPath(err);
  }

  if (!fs.existsSync(target.fp)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Lesson not found" },
      { status: 404 }
    );
  }

  // Capture the content before unlinking so the mirror keeps a recoverable copy
  // rather than only a tombstone.
  const removed = JSON.parse(fs.readFileSync(target.fp, "utf-8")) as unknown;
  fs.unlinkSync(target.fp);

  await mirrorCurriculumDelete([target.key], session.userId);

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "lesson.delete",
    entityType: "CurriculumDocument",
    entityId: target.key,
    summary: `Deleted lesson ${target.lessonId} (${target.gradeId})`,
    before: removed,
    request: req,
  });

  return NextResponse.json<AuthResponse>(
    { success: true, message: "Lesson deleted" },
    { status: 200 }
  );
}
