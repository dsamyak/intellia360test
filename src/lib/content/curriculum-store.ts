/**
 * Durable mirror for the filesystem-backed curriculum store.
 *
 * The editor module writes lesson/curriculum JSON into `src/data/grades`. That
 * directory is part of the build artifact, which means on any immutable or
 * serverless host (Vercel, containers, an autoscaling group) an editor's saved
 * work is discarded at the next deploy — and it is never captured by a database
 * backup, because it never reaches the database.
 *
 * Rather than rewrite the read path (every student route reads these files
 * synchronously), each write is mirrored into MongoDB:
 *
 *   file write  -> CurriculumDocument (current version, unique on `path`)
 *   overwrite   -> previous content copied into CurriculumRevision first
 *   file delete -> tombstone (`deletedAt` set), content retained
 *
 * The database therefore holds the recoverable source of truth, and
 * `scripts/restore-curriculum.mjs` can rehydrate the filesystem after a deploy
 * or an accidental overwrite.
 *
 * Mirroring is best-effort: a mirror failure logs but does not fail the editor's
 * save, so a briefly unreachable database cannot block content work.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export const CURRICULUM_ROOT = path.join(process.cwd(), "src", "data", "grades");

/* ── Path safety ──────────────────────────────────────────────────────────── */

/** Grade ids are always grade<number> — anything else is rejected outright. */
const GRADE_ID_RE = /^grade\d{1,2}$/;
/** Lesson ids are slugs; no dots, no separators, so they cannot escape the dir. */
const LESSON_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UnsafePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafePathError";
  }
}

/**
 * Validate a grade id taken from a route param.
 *
 * These ids are interpolated straight into filesystem paths, so an unchecked
 * value such as "../../.." turns a curriculum save into an arbitrary file write
 * and a grade delete into a recursive delete of an arbitrary directory.
 */
export function assertGradeId(gradeId: string): string {
  const id = (gradeId ?? "").trim().toLowerCase();
  if (!GRADE_ID_RE.test(id)) {
    throw new UnsafePathError(
      `Invalid gradeId "${gradeId}" — expected grade<number>, e.g. grade8`
    );
  }
  return id;
}

/** Validate a lesson id from a route param. Same rationale as assertGradeId. */
export function assertLessonId(lessonId: string): string {
  const id = (lessonId ?? "").trim().toLowerCase();
  if (!LESSON_ID_RE.test(id) || id.length > 128) {
    throw new UnsafePathError(`Invalid lessonId "${lessonId}" — expected a lowercase slug`);
  }
  return id;
}

/**
 * Resolve a store-relative path to an absolute one, asserting the result is
 * still inside CURRICULUM_ROOT. Belt-and-braces behind the id validators: even
 * if a future caller forgets to validate, traversal cannot leave the store.
 */
export function resolveInStore(...segments: string[]): string {
  const root = path.resolve(CURRICULUM_ROOT);
  const abs = path.resolve(root, ...segments);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    throw new UnsafePathError("Resolved path escapes the curriculum store");
  }
  return abs;
}

/** Store-relative POSIX path used as the CurriculumDocument key. */
export function storePath(...segments: string[]): string {
  return segments.join("/");
}

/* ── Mirroring ────────────────────────────────────────────────────────────── */

export type CurriculumKind = "curriculum" | "dashboard" | "lesson";

function checksum(content: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(content)).digest("hex");
}

export interface MirrorArgs {
  path: string;
  gradeId: string;
  kind: CurriculumKind;
  lessonId?: string | null;
  content: unknown;
  updatedBy?: string | null;
}

/**
 * Upsert the current version of one curriculum file and archive the version it
 * replaced. Returns the new version number, or null when the mirror failed.
 *
 * The read-then-write runs in a transaction so two concurrent saves cannot
 * interleave and produce two revisions claiming the same version number.
 */
export async function mirrorCurriculumWrite(args: MirrorArgs): Promise<number | null> {
  const sum = checksum(args.content);

  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.curriculumDocument.findUnique({
        where: { path: args.path },
        select: {
          id: true,
          version: true,
          content: true,
          checksum: true,
          updatedBy: true,
          deletedAt: true,
        },
      });

      // Identical content — record nothing rather than inflating the history
      // with a no-op revision every time the editor re-saves an unchanged file.
      if (existing && existing.checksum === sum && existing.deletedAt === null) {
        return existing.version;
      }

      if (!existing) {
        const created = await tx.curriculumDocument.create({
          data: {
            path: args.path,
            gradeId: args.gradeId,
            kind: args.kind,
            lessonId: args.lessonId ?? null,
            content: args.content as never,
            checksum: sum,
            version: 1,
            updatedBy: args.updatedBy ?? null,
          },
          select: { version: true },
        });
        return created.version;
      }

      // Keep the outgoing version before overwriting it.
      await tx.curriculumRevision.create({
        data: {
          documentId: existing.id,
          version: existing.version,
          content: existing.content as never,
          checksum: existing.checksum,
          updatedBy: existing.updatedBy,
        },
      });

      const updated = await tx.curriculumDocument.update({
        where: { id: existing.id },
        data: {
          content: args.content as never,
          checksum: sum,
          version: existing.version + 1,
          kind: args.kind,
          gradeId: args.gradeId,
          lessonId: args.lessonId ?? null,
          updatedBy: args.updatedBy ?? null,
          deletedAt: null, // a re-save resurrects a tombstoned file
        },
        select: { version: true },
      });
      return updated.version;
    });
  } catch (err) {
    console.error("[curriculum-store] mirror write failed for", args.path, err);
    return null;
  }
}

/**
 * Tombstone mirrored files. Content is deliberately retained so a deletion made
 * in the editor can still be undone from the database.
 */
export async function mirrorCurriculumDelete(
  paths: string[],
  updatedBy?: string | null
): Promise<void> {
  if (paths.length === 0) return;
  try {
    await db.curriculumDocument.updateMany({
      where: { path: { in: paths }, deletedAt: null },
      data: { deletedAt: new Date(), updatedBy: updatedBy ?? null },
    });
  } catch (err) {
    console.error("[curriculum-store] mirror delete failed", err);
  }
}

/** Every store-relative file path currently present under a grade directory. */
export function listGradeFiles(gradeId: string): string[] {
  const gradeDir = resolveInStore(gradeId);
  if (!fs.existsSync(gradeDir)) return [];

  const out: string[] = [];
  for (const name of ["curriculum.json", "dashboard.json"]) {
    if (fs.existsSync(path.join(gradeDir, name))) out.push(storePath(gradeId, name));
  }

  const lessonsDir = path.join(gradeDir, "lessons");
  if (fs.existsSync(lessonsDir)) {
    for (const f of fs.readdirSync(lessonsDir)) {
      if (f.endsWith(".json")) out.push(storePath(gradeId, "lessons", f));
    }
  }
  return out;
}

/** Classify a store-relative path into the kind/lessonId the mirror records. */
export function classifyPath(relPath: string): {
  kind: CurriculumKind;
  lessonId: string | null;
} {
  const parts = relPath.split("/");
  if (parts[1] === "lessons") {
    return { kind: "lesson", lessonId: (parts[2] ?? "").replace(/\.json$/, "") };
  }
  return { kind: parts[1] === "dashboard.json" ? "dashboard" : "curriculum", lessonId: null };
}
