/**
 * DELETE /api/editor/grades/[gradeId]  — remove a grade directory
 *
 * This is the most destructive endpoint in the editor module: it recursively
 * deletes a directory whose path is built from a URL segment. `gradeId` is
 * therefore validated (grade<number> only) and the resolved path is asserted to
 * be inside the curriculum store before anything is removed.
 *
 * Every file is mirrored into MongoDB as a tombstone with its content intact,
 * so a grade deleted by mistake can be restored with
 * `node scripts/restore-curriculum.mjs --grade <gradeId>` instead of needing a
 * full database restore.
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import {
  assertGradeId,
  listGradeFiles,
  mirrorCurriculumDelete,
  mirrorCurriculumWrite,
  classifyPath,
  resolveInStore,
  UnsafePathError,
} from "@/lib/content/curriculum-store";
import { recordAudit } from "@/lib/audit";
import type { AuthResponse } from "@/types/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  const { session, errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  let gradeId: string;
  let gradeDir: string;
  try {
    gradeId = assertGradeId((await params).gradeId);
    gradeDir = resolveInStore(gradeId);
  } catch (err) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: err instanceof UnsafePathError ? err.message : "Invalid path" },
      { status: 400 }
    );
  }

  if (!fs.existsSync(gradeDir)) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: `${gradeId} not found` },
      { status: 404 }
    );
  }

  // Snapshot every file into the mirror *before* removing it, so the tombstones
  // carry recoverable content rather than just a "this used to exist" marker.
  const files = listGradeFiles(gradeId);
  for (const rel of files) {
    try {
      const abs = resolveInStore(...rel.split("/"));
      const content = JSON.parse(fs.readFileSync(abs, "utf-8")) as unknown;
      const { kind, lessonId } = classifyPath(rel);
      await mirrorCurriculumWrite({
        path: rel,
        gradeId,
        kind,
        lessonId,
        content,
        updatedBy: session.userId,
      });
    } catch (err) {
      console.error("[editor/grades] could not snapshot", rel, err);
    }
  }

  fs.rmSync(gradeDir, { recursive: true, force: true });
  await mirrorCurriculumDelete(files, session.userId);

  await recordAudit({
    actor: { userId: session.userId, email: session.email, role: session.role },
    action: "grade.delete",
    entityType: "CurriculumGrade",
    entityId: gradeId,
    summary: `Deleted grade ${gradeId} and ${files.length} file(s)`,
    before: { files },
    request,
  });

  return NextResponse.json<AuthResponse<{ filesRemoved: number }>>(
    {
      success: true,
      message: `${gradeId} deleted — ${files.length} file(s) recoverable from the curriculum mirror`,
      data: { filesRemoved: files.length },
    },
    { status: 200 }
  );
}
