/**
 * Lesson module links — EduNotes, architecture, video and practice.
 *
 * Shared by the lesson editor form and the lesson API so both apply one rule:
 * a link is required only while its module is enabled, and any link given must
 * be a site path ("/student/lesson/video") or an absolute http(s) URL.
 *
 * No Node APIs here — this module is imported by client components.
 */
import type { LessonModuleConfig } from "@/types/student";

export const LESSON_MODULE_KEYS = [
  "architectureModule",
  "videoLesson",
  "practiceModule",
  "eduNotes",
] as const;

export type LessonModuleKey = (typeof LESSON_MODULE_KEYS)[number];
export type LessonModules = Record<LessonModuleKey, LessonModuleConfig>;
export type LessonModuleErrors = Partial<Record<LessonModuleKey, string>>;

export const LESSON_MODULE_LABELS: Record<LessonModuleKey, string> = {
  architectureModule: "Architecture module",
  videoLesson:        "Video lesson",
  practiceModule:     "Practice module",
  eduNotes:           "EduNotes",
};

/**
 * Every module present with a boolean `enabled` and a trimmed `url`.
 * Lesson files written by hand or by older code can omit a module entirely,
 * which previously crashed the editor form on `modules[key].url`.
 */
export function normalizeLessonModules(raw: unknown): LessonModules {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out = {} as LessonModules;
  for (const key of LESSON_MODULE_KEYS) {
    const entry = source[key] && typeof source[key] === "object"
      ? (source[key] as Partial<LessonModuleConfig>)
      : {};
    out[key] = {
      enabled: entry.enabled === true,
      url:     typeof entry.url === "string" ? entry.url.trim() : "",
    };
  }
  return out;
}

/** A same-site path or an absolute http(s) URL. */
export function isValidModuleUrl(url: string): boolean {
  // "//host" is protocol-relative — it leaves the site, so it is not a path.
  if (url.startsWith("/")) return !url.startsWith("//");
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** One message per invalid module; an empty object means the links are valid. */
export function validateLessonModules(modules: LessonModules): LessonModuleErrors {
  const errors: LessonModuleErrors = {};
  for (const key of LESSON_MODULE_KEYS) {
    const { enabled, url } = modules[key];
    if (!url) {
      if (enabled) errors[key] = "Add a link, or untick Enabled.";
      continue;
    }
    if (!isValidModuleUrl(url)) {
      errors[key] = "Use a site path like /student/lesson/video or a full https:// link.";
    }
  }
  return errors;
}
