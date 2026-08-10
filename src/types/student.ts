export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  level: number;
  levelTitle: string;
  levelProgress: number; // 0 to 100
  streakDays: number;
  xpPoints: number;
  learningGems: number;
}

export type TopicStatus = "completed" | "active" | "locked";

export interface CurriculumTopic {
  id: string;
  title: string;
  status: TopicStatus;
  questionsCount?: number;
  icon?: string;
}

export interface CurriculumChapter {
  id: string;
  title: string;
  chapterNumber: number;
  topicsCount: number;
  topics: CurriculumTopic[];
}

export interface AdventureSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  visualizerKey: "place-value" | "addition-grouping" | "comparing-numbers" | "numbers-to-1000";
  visualizerData: Record<string, any>;
}

export interface ActionCardItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText?: string;
  icon: string;
  buttonColor: "purple" | "blue" | "orange" | "accent";
  targetUrl: string;
}

export interface AITutorPrompt {
  id: string;
  label: string;
  icon?: string;
  promptText: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  explanation: string;
  aiHintText: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  grade: string;
  xp: number;
  gems: number;
  isCurrentUser?: boolean;
}

export interface CharacterItem {
  id: string;
  name: string;
  avatar: string;
  isUnlocked: boolean;
  unlockRequirement?: string;
}

export interface RewardMission {
  id: string;
  title: string;
  xpReward: number;
  gemReward: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

// ─── Grade-scoped data types (Sprint 1 – dynamic data layer) ───

export type VisualizerKey =
  | "place-value"
  | "addition-grouping"
  | "comparing-numbers"
  | "numbers-to-1000";

export interface CurriculumTopicGrade {
  id: string;
  lessonId: string;
  title: string;
  status: TopicStatus;
  icon: string | null;
  questionsCount: number | null;
}

export interface CurriculumChapterGrade {
  id: string;
  chapterNumber: number;
  title: string;
  topicsCount: number;
  topics: CurriculumTopicGrade[];
}

export interface GradeCurriculum {
  gradeId: string;
  gradeLabel: string;
  subject: string;
  activeLessonId: string;
  activeChapterId: string;
  chapters: CurriculumChapterGrade[];
}

export interface GradeActionCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  buttonColor: "purple" | "blue" | "orange" | "accent";
  targetUrl: string;
  enabled: boolean;
}

export interface DashboardHeroSlide {
  tag: string;
  lessonId: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  visualizerKey: VisualizerKey;
  visualizerData: Record<string, any>;
}

export interface DashboardConfig {
  gradeId: string;
  heroSlide: DashboardHeroSlide;
  actionCards: GradeActionCard[];
}

export interface LessonModuleConfig {
  enabled: boolean;
  url: string;
}

export interface LessonMetadata {
  id: string;
  title: string;
  description: string;
  chapterId: string;
  chapterTitle: string;
  grade: string;
  estimatedMinutes: number;
  completed: boolean;
  locked: boolean;
  heroVisualizer: VisualizerKey;
  heroVisualizerData: Record<string, any>;
  modules: {
    eduNotes: LessonModuleConfig;
    architectureModule: LessonModuleConfig;
    videoLesson: LessonModuleConfig;
    practiceModule: LessonModuleConfig;
  };
  previousLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
}
