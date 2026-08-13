/**
 * GET   /api/editor/curriculum/[gradeId]  — read curriculum.json
 * PUT   /api/editor/curriculum/[gradeId]  — overwrite curriculum.json
 * PATCH /api/editor/curriculum/[gradeId]  — merge-update curriculum.json
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import type { AuthResponse } from "@/types/auth";

const DATA_ROOT = path.join(process.cwd(), "src", "data", "grades");

function curriculumPath(gradeId: string) {
  return path.join(DATA_ROOT, gradeId, "curriculum.json");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { gradeId } = await params;
  const filePath = curriculumPath(gradeId);

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
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { gradeId } = await params;
  const filePath = curriculumPath(gradeId);
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

  fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

  return NextResponse.json<AuthResponse>(
    { success: true, message: "curriculum.json saved" },
    { status: 200 }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { gradeId } = await params;
  const filePath = curriculumPath(gradeId);

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

  return NextResponse.json<AuthResponse<unknown>>(
    { success: true, message: "curriculum.json updated", data: merged },
    { status: 200 }
  );
}
