/**
 * GET    /api/editor/lessons/[gradeId]/[lessonId]  — read a lesson JSON
 * PUT    /api/editor/lessons/[gradeId]/[lessonId]  — full overwrite
 * PATCH  /api/editor/lessons/[gradeId]/[lessonId]  — partial update
 * DELETE /api/editor/lessons/[gradeId]/[lessonId]  — delete lesson file
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import type { AuthResponse } from "@/types/auth";

const DATA_ROOT = path.join(process.cwd(), "src", "data", "grades");

function lessonPath(gradeId: string, lessonId: string) {
  return path.join(DATA_ROOT, gradeId, "lessons", `${lessonId}.json`);
}

type Params = { params: Promise<{ gradeId: string; lessonId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;
  const { gradeId, lessonId } = await params;
  const fp = lessonPath(gradeId, lessonId);
  if (!fs.existsSync(fp)) {
    return NextResponse.json<AuthResponse>({ success: false, message: "Lesson not found" }, { status: 404 });
  }
  return NextResponse.json<AuthResponse<unknown>>(
    { success: true, message: "OK", data: JSON.parse(fs.readFileSync(fp, "utf-8")) },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;
  const { gradeId, lessonId } = await params;
  const fp = lessonPath(gradeId, lessonId);
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json<AuthResponse>({ success: false, message: "Invalid JSON body" }, { status: 422 });
  }
  fs.writeFileSync(fp, JSON.stringify(body, null, 2));
  return NextResponse.json<AuthResponse>({ success: true, message: "Lesson saved" }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;
  const { gradeId, lessonId } = await params;
  const fp = lessonPath(gradeId, lessonId);
  if (!fs.existsSync(fp)) {
    return NextResponse.json<AuthResponse>({ success: false, message: "Lesson not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json<AuthResponse>({ success: false, message: "Invalid JSON body" }, { status: 422 });
  }
  const existing = JSON.parse(fs.readFileSync(fp, "utf-8"));
  const merged = { ...existing, ...body };
  fs.writeFileSync(fp, JSON.stringify(merged, null, 2));
  return NextResponse.json<AuthResponse<unknown>>({ success: true, message: "Lesson updated", data: merged }, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;
  const { gradeId, lessonId } = await params;
  const fp = lessonPath(gradeId, lessonId);
  if (!fs.existsSync(fp)) {
    return NextResponse.json<AuthResponse>({ success: false, message: "Lesson not found" }, { status: 404 });
  }
  fs.unlinkSync(fp);
  return NextResponse.json<AuthResponse>({ success: true, message: "Lesson deleted" }, { status: 200 });
}
