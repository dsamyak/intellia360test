/**
 * student-data.ts
 *
 * Centralized data access layer for the student dashboard.
 * All data is loaded from grade-scoped JSON files.
 *
 * MOCK: currentGrade is hardcoded here. In production, replace with
 * the authenticated student's grade from the auth context/session.
 */

import type {
  GradeCurriculum,
  DashboardConfig,
  DashboardHeroSlide,
  GradeActionCard,
  CurriculumTopicGrade,
  LessonMetadata,
} from "@/types/student";

// MOCK: Replace with auth-provided grade when authentication is added
export const CURRENT_GRADE = "grade1" as const;

// ─── Static imports keyed by grade ────────────────────────────────────────
// Next.js requires static paths for JSON imports. We import all grades
// statically and select at runtime via the grade key.

import grade1Curriculum from "@/data/grades/grade1/curriculum.json";
import grade1Dashboard from "@/data/grades/grade1/dashboard.json";
import grade1Counting100 from "@/data/grades/grade1/lessons/counting-up-to-100.json";
import grade1ReadingWriting from "@/data/grades/grade1/lessons/reading-writing-numbers.json";
import grade1PlaceValueTens from "@/data/grades/grade1/lessons/place-value-tens-and-ones.json";
import grade1ComparingOrdering from "@/data/grades/grade1/lessons/comparing-and-ordering-numbers.json";
import grade1NumberPatterns from "@/data/grades/grade1/lessons/number-patterns.json";
import grade1OrdinalNumbers from "@/data/grades/grade1/lessons/ordinal-numbers.json";
import grade1TestSeries from "@/data/grades/grade1/lessons/numbers-and-counting-test-series.json";

import grade2Curriculum from "@/data/grades/grade2/curriculum.json";
import grade2Dashboard from "@/data/grades/grade2/dashboard.json";
import grade2LessonPlaceValue from "@/data/grades/grade2/lessons/place-value-hundreds-tens-ones.json";

const GRADE_CURRICULUM_MAP: Record<string, GradeCurriculum> = {
  grade1: (grade1Curriculum as unknown) as GradeCurriculum,
  grade2: (grade2Curriculum as unknown) as GradeCurriculum,
};

const GRADE_DASHBOARD_MAP: Record<string, DashboardConfig> = {
  grade1: grade1Dashboard as DashboardConfig,
  grade2: grade2Dashboard as DashboardConfig,
};

const LESSON_METADATA_MAP: Record<
  string,
  Record<string, LessonMetadata>
> = {
  grade1: {
    "counting-up-to-100": grade1Counting100 as LessonMetadata,
    "reading-writing-numbers": grade1ReadingWriting as LessonMetadata,
    "place-value-tens-and-ones": grade1PlaceValueTens as LessonMetadata,
    "comparing-and-ordering-numbers": grade1ComparingOrdering as LessonMetadata,
    "number-patterns": grade1NumberPatterns as LessonMetadata,
    "ordinal-numbers": grade1OrdinalNumbers as LessonMetadata,
    "numbers-and-counting-test-series": grade1TestSeries as LessonMetadata,
  },
  grade2: {
    "place-value-hundreds-tens-ones":
      grade2LessonPlaceValue as LessonMetadata,
  },
};

// ─── Module key to card ID mapping ────────────────────────────────────────
// Maps lesson module keys to the action card IDs in dashboard.json
const MODULE_TO_CARD_MAP: Record<string, string> = {
  eduNotes: "card_edunotes",
  architectureModule: "card_architecture",
  videoLesson: "card_video",
  practiceModule: "card_practice",
};

// ─── Curriculum ───────────────────────────────────────────────────────────

/** Returns the full curriculum for a given grade. */
export function getCurriculum(grade: string = CURRENT_GRADE): GradeCurriculum {
  const data = GRADE_CURRICULUM_MAP[grade];
  if (!data) throw new Error(`No curriculum data found for grade: ${grade}`);
  return data;
}

/** Returns a flat ordered list of all lessons across all chapters. */
export function getAllLessonsOrdered(
  grade: string = CURRENT_GRADE
): CurriculumTopicGrade[] {
  const curriculum = getCurriculum(grade);
  return curriculum.chapters.flatMap((chapter) => chapter.topics);
}

/** Computes previous and next lesson relative to a given lessonId. */
export function getPrevNextLesson(
  lessonId: string,
  grade: string = CURRENT_GRADE
): {
  previous: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
} {
  const lessons = getAllLessonsOrdered(grade);
  const currentIndex = lessons.findIndex((l) => l.lessonId === lessonId);
  if (currentIndex === -1) return { previous: null, next: null };

  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return {
    previous: prev ? { id: prev.lessonId, title: prev.title } : null,
    next: next ? { id: next.lessonId, title: next.title } : null,
  };
}

// ─── Lesson Metadata ──────────────────────────────────────────────────────

/**
 * Returns the lesson metadata for a given lessonId and grade.
 * Returns null if the lesson metadata is not yet available.
 */
export function getLessonMetadata(
  lessonId: string,
  grade: string = CURRENT_GRADE
): LessonMetadata | null {
  const gradeLessons = LESSON_METADATA_MAP[grade];
  if (!gradeLessons) return null;
  return gradeLessons[lessonId] ?? null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────

/** Returns the base dashboard config (hero slide + action cards) for a grade. */
export function getDashboardConfig(
  grade: string = CURRENT_GRADE
): DashboardConfig {
  const data = GRADE_DASHBOARD_MAP[grade];
  if (!data) throw new Error(`No dashboard data found for grade: ${grade}`);
  return data;
}

/**
 * Builds a fully resolved hero slide by merging the dashboard config
 * with the active lesson's metadata. Falls back to dashboard defaults
 * when lesson metadata is unavailable.
 */
export function getResolvedHeroSlide(
  activeLessonId: string,
  grade: string = CURRENT_GRADE
): DashboardHeroSlide {
  const dashboard = getDashboardConfig(grade);
  const lesson = getLessonMetadata(activeLessonId, grade);

  if (!lesson) return dashboard.heroSlide;

  return {
    ...dashboard.heroSlide,
    title: lesson.title,
    subtitle: lesson.description,
    visualizerKey: lesson.heroVisualizer,
    visualizerData: lesson.heroVisualizerData,
  };
}

/**
 * Returns the action cards with their enabled state driven by lesson metadata.
 * If the active lesson has module-level enabled/disabled flags, those override
 * the dashboard defaults. If metadata is unavailable, cards fall back gracefully.
 */
export function getResolvedActionCards(
  activeLessonId: string,
  grade: string = CURRENT_GRADE
): GradeActionCard[] {
  const dashboard = getDashboardConfig(grade);
  const lesson = getLessonMetadata(activeLessonId, grade);

  if (!lesson) return dashboard.actionCards;

  return dashboard.actionCards.map((card) => {
    // Find which module key corresponds to this card
    const moduleKey = Object.entries(MODULE_TO_CARD_MAP).find(
      ([, cardId]) => cardId === card.id
    )?.[0] as keyof typeof lesson.modules | undefined;

    if (!moduleKey || !lesson.modules[moduleKey]) return card;

    const moduleConfig = lesson.modules[moduleKey];

    return {
      ...card,
      enabled: moduleConfig.enabled,
      targetUrl: moduleConfig.url || card.targetUrl,
    };
  });
}

/**
 * Returns the prev/next navigation resolved from lesson metadata first,
 * falling back to curriculum-computed navigation.
 */
export function getResolvedPrevNext(
  activeLessonId: string,
  grade: string = CURRENT_GRADE
): {
  previous: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
} {
  const lesson = getLessonMetadata(activeLessonId, grade);

  // Use lesson metadata prev/next if available
  if (lesson) {
    return {
      previous: lesson.previousLesson,
      next: lesson.nextLesson,
    };
  }

  // Fall back to curriculum-computed prev/next
  return getPrevNextLesson(activeLessonId, grade);
}
