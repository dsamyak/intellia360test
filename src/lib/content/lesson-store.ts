/**
 * Lesson storage for the editor.
 *
 * Lessons are JSON files under src/data/grades, mirrored into MongoDB on every
 * write (see curriculum-store.ts). Where those files are writable — local
 * development — they stay the source of truth, exactly as before.
 *
 * On a read-only deployment every file write throws EROFS, which reached the
 * editor as "Save failed (500)". There the mirrored database copy becomes the
 * store instead: saves go to the database, reads prefer it over the file that
 * shipped with the build, and a deletion is a tombstone that hides that file.
 *
 * Student pages import the bundled files, so a database-only edit reaches them
 * only after it is restored into the files (scripts/restore-curriculum.mjs)
 * and redeployed.
 */
import fs from "fs";
import path from "path";
import {
  findMirroredDocument,
  isStoreWritable,
  listMirroredDocuments,
  markStoreReadOnly,
  mirrorCurriculumDelete,
  mirrorCurriculumWrite,
  resolveInStore,
  storePath,
} from "@/lib/content/curriculum-store";

export type LessonContent = Record<string, unknown>;

export interface LessonRef {
  gradeId: string;
  lessonId: string;
}

/** A failure the API should report to the editor with this status and message. */
export class LessonStoreError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "LessonStoreError";
  }
}

/** Codes meaning "this host will not let us write here", as opposed to a transient fault. */
const READ_ONLY_CODES = new Set(["EROFS", "EACCES", "EPERM"]);

function errorCode(err: unknown): string | undefined {
  return (err as NodeJS.ErrnoException | null)?.code;
}

function lessonKey(ref: LessonRef): string {
  return storePath(ref.gradeId, "lessons", `${ref.lessonId}.json`);
}

function lessonFile(ref: LessonRef): string {
  return resolveInStore(ref.gradeId, "lessons", `${ref.lessonId}.json`);
}

function readLessonFile(fp: string): LessonContent | null {
  if (!fs.existsSync(fp)) return null;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8")) as LessonContent;
  } catch (err) {
    console.error("[lesson-store] could not read", fp, err);
    throw new LessonStoreError(
      err instanceof SyntaxError
        ? `The lesson file ${path.basename(fp)} is not valid JSON.`
        : `Could not read the lesson file (${errorCode(err) ?? "unknown error"}).`,
      500
    );
  }
}

/** The current lesson, or null when it does not exist or was deleted. */
export async function readLesson(ref: LessonRef): Promise<LessonContent | null> {
  if (!isStoreWritable()) {
    const doc = await findMirroredDocument(lessonKey(ref));
    if (doc) return doc.deletedAt ? null : (doc.content as LessonContent);
  }
  return readLessonFile(lessonFile(ref));
}

export interface SavedLesson {
  version: number | null;
  /** "database" when this host could not write the file and only the mirror holds the change. */
  storedIn: "file" | "database";
}

/** Stores a lesson, or throws LessonStoreError when nothing durable accepted it. */
export async function saveLesson(
  ref: LessonRef,
  content: LessonContent,
  updatedBy: string
): Promise<SavedLesson> {
  let wroteFile = false;

  if (isStoreWritable()) {
    const fp = lessonFile(ref);
    try {
      fs.mkdirSync(path.dirname(fp), { recursive: true });
      fs.writeFileSync(fp, JSON.stringify(content, null, 2));
      wroteFile = true;
    } catch (err) {
      const code = errorCode(err);
      if (!code || !READ_ONLY_CODES.has(code)) {
        console.error("[lesson-store] could not write", fp, err);
        throw new LessonStoreError(`Could not write the lesson file (${code ?? "unknown error"}).`, 500);
      }
      // Refused despite the probe — treat the host as read-only from now on.
      markStoreReadOnly();
    }
  }

  const version = await mirrorCurriculumWrite({
    path: lessonKey(ref),
    gradeId: ref.gradeId,
    kind: "lesson",
    lessonId: ref.lessonId,
    content,
    updatedBy,
  });

  if (!wroteFile && version === null) {
    throw new LessonStoreError(
      "The lesson was not saved: this server cannot write lesson files and the database could not be reached. Try again in a moment.",
      503
    );
  }

  return { version, storedIn: wroteFile ? "file" : "database" };
}

/** Deletes a lesson and returns what was removed, or null when there was nothing to delete. */
export async function deleteLesson(ref: LessonRef, updatedBy: string): Promise<LessonContent | null> {
  const removed = await readLesson(ref);
  if (!removed) return null;
  const key = lessonKey(ref);

  if (isStoreWritable()) {
    try {
      fs.unlinkSync(lessonFile(ref));
      await mirrorCurriculumDelete([key], updatedBy);
      return removed;
    } catch (err) {
      const code = errorCode(err);
      if (!code || !READ_ONLY_CODES.has(code)) {
        console.error("[lesson-store] could not delete", lessonFile(ref), err);
        throw new LessonStoreError(`Could not delete the lesson file (${code ?? "unknown error"}).`, 500);
      }
      markStoreReadOnly();
    }
  }

  // The bundled file cannot be removed, so a tombstone has to hide it. A lesson
  // that was never edited has no mirrored row yet to carry one — create it first.
  const version = await mirrorCurriculumWrite({
    path: key,
    gradeId: ref.gradeId,
    kind: "lesson",
    lessonId: ref.lessonId,
    content: removed,
    updatedBy,
  });
  const tombstoned = version !== null && (await mirrorCurriculumDelete([key], updatedBy));
  if (!tombstoned) {
    throw new LessonStoreError("The lesson was not deleted: the database could not be reached. Try again in a moment.", 503);
  }
  return removed;
}

/** Every lesson in a grade. `content` is null for a file that is not valid JSON. */
export async function listLessons(gradeId: string): Promise<{ lessonId: string; content: LessonContent | null }[]> {
  const lessons = new Map<string, LessonContent | null>();

  const dir = resolveInStore(gradeId, "lessons");
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const lessonId = file.replace(/\.json$/, "");
      try {
        lessons.set(lessonId, JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8")) as LessonContent);
      } catch {
        lessons.set(lessonId, null);
      }
    }
  }

  if (!isStoreWritable()) {
    for (const doc of await listMirroredDocuments(gradeId, "lesson")) {
      const lessonId = doc.lessonId ?? path.posix.basename(doc.path, ".json");
      if (doc.deletedAt) lessons.delete(lessonId);
      else lessons.set(lessonId, doc.content as LessonContent);
    }
  }

  return [...lessons].map(([lessonId, content]) => ({ lessonId, content }));
}
