/**
 * GET   /api/editor/curriculum/[gradeId]  — read curriculum.json
 * PUT   /api/editor/curriculum/[gradeId]  — overwrite curriculum.json
 * PATCH /api/editor/curriculum/[gradeId]  — merge-update curriculum.json
 *
 * `gradeId` arrives from the URL and is interpolated into a filesystem path, so
 * every handler validates it through assertGradeId before touching the disk.
 *
 * Writes are mirrored into MongoDB (see lib/content/curriculum-store) because
 * src/data/grades lives inside the deploy artifact and is not covered by any
 * database backup — without the mirror an editor's saved work is lost at the
 * next deploy and cannot be recovered.
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import {
  assertGradeId,
  mirrorCurriculumWrite,
  resolveInStore,
  storePath,
  UnsafePathError,
} from "@/lib/content/curriculum-store";
import { recordAudit } from "@/lib/audit";
import type { AuthResponse } from "@/types/auth";

function curriculumPath(gradeId: string) {
  return resolveInStore(gradeId, "curriculum.json");
}

function badPath(err: unknown) {
  return NextResponse.json<AuthResponse>(
    { success: false, message: err instanceof UnsafePathError ? err.message : "Invalid path" },
    { status: 400 }
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let gradeId: string;
  let filePath: string;
  try {
    gradeId = assertGradeId((await params).gradeId);
    filePath = curriculumPath(gradeId);
  } catch (err) {
    return badPath(err);
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: `curriculum.json not found for ${gradeId}` },
      { status: 404 }
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return NextResponse.json<AuthResponse<unknown>>(
    { success: true, message: "OK", data: JSON.parse(raw) },
    { status: 200 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { session, errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let gradeId: string;
  let filePath: string;
  try {
    gradeId = assertGradeId((await params).gradeId);
    filePath = curriculumPath(gradeId);
  } catch (err) {
    return badPath(err);
  }

  const gradeDir = path.dirname(filePath);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Request body must be a valid JSON object" },
      { status: 422 }
    );
  }

  if (!fs.existsSync(gradeDir)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: `Grade directory not found: ${gradeId}` },
      { status: 404 }
    );
  }

  const previous = fs.existsSync(filePath)
    ? (JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown)
    : null;

  fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

  const version = await mirrorCurriculumWrite({
    path: storePath(gradeId, "curriculum.json"),
    gradeId,
    kind: "curriculum",
    content: body,
    updatedBy: session.userId,
  });

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "curriculum.replace",
    entityType: "CurriculumDocument",
    entityId: storePath(gradeId, "curriculum.json"),
    summary: `Replaced curriculum.json for ${gradeId}`,
    before: previous,
    after: body,
    request,
  });

  return NextResponse.json<AuthResponse<{ version: number | null }>>(
    { success: true, message: "curriculum.json saved", data: { version } },
    { status: 200 }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { session, errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let gradeId: string;
  let filePath: string;
  try {
    gradeId = assertGradeId((await params).gradeId);
    filePath = curriculumPath(gradeId);
  } catch (err) {
    return badPath(err);
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: `curriculum.json not found for ${gradeId}` },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Request body must be a valid JSON object" },
      { status: 422 }
    );
  }

  const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const merged = { ...existing, ...body };
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));

  await mirrorCurriculumWrite({
    path: storePath(gradeId, "curriculum.json"),
    gradeId,
    kind: "curriculum",
    content: merged,
    updatedBy: session.userId,
  });

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "curriculum.update",
    entityType: "CurriculumDocument",
    entityId: storePath(gradeId, "curriculum.json"),
    summary: `Updated curriculum.json for ${gradeId}`,
    before: existing,
    after: merged,
    request,
  });

  return NextResponse.json<AuthResponse<unknown>>(
    { success: true, message: "curriculum.json updated", data: merged },
    { status: 200 }
  );
}
