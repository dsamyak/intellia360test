/**
 * DELETE /api/editor/grades/[gradeId]  — remove a grade directory
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import type { AuthResponse } from "@/types/auth";

const DATA_ROOT = path.join(process.cwd(), "src", "data", "grades");

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { gradeId } = await params;
  const gradeDir = path.join(DATA_ROOT, gradeId);

  if (!fs.existsSync(gradeDir)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: `${gradeId} not found` },
      { status: 404 }
    );
  }

  fs.rmSync(gradeDir, { recursive: true, force: true });

  return NextResponse.json<AuthResponse>(
    { success: true, message: `${gradeId} deleted` },
    { status: 200 }
  );
}
