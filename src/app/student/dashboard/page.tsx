"use client";

import HeroSectionContainer from "@/components/student/HeroSectionContainer";
import LearningGridContainer from "@/components/student/LearningGridContainer";
import BottomNavigationContainer from "@/components/student/BottomNavigationContainer";
import { useStudentContext } from "@/context/StudentContext";

interface HeroSlideWithActivity {
  tag?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  visualizerKey?: string;
  visualizerData?: Record<string, unknown>;
  activityType?: string;
  xpReward?: number;
  gemsReward?: number;
}

interface ExtendedActionCard {
  id?: string;
  activityType?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  buttonColor?: "purple" | "blue" | "orange" | "accent";
  targetUrl?: string;
  enabled?: boolean;
  isCompleted?: boolean;
  xpReward?: number;
  gemsReward?: number;
}

export default function StudentDashboardPage() {
  const {
    activeLessonData,
    goToNextLesson,
    goToPrevLesson,
    completeActivity,
    isActivityCompleted,
    xpPoints,
    learningGems,
    completedLessons,
  } = useStudentContext();

  if (!activeLessonData) {
    return <div style={{ padding: "2rem" }}>Loading dashboard...</div>;
  }

  const actionCards = activeLessonData.actionCards || {};
  const architectureUrl = actionCards.architecture || activeLessonData.vercelLink || "#";
  const videoUrl = actionCards.video || "";
  const edunotesUrl = actionCards.edunotes || "/student/lesson/edunotes";
  const practiceUrl = actionCards.practice || "/student/quiz/practice-1";

  const isArchCompleted = isActivityCompleted(activeLessonData.id, "architecture");
  const isPracticeCompleted = isActivityCompleted(activeLessonData.id, "practice");
  const isEdunotesCompleted = isActivityCompleted(activeLessonData.id, "edunotes");
  const isVideoCompleted = isActivityCompleted(activeLessonData.id, "video");
  const isReflectionCompleted = isActivityCompleted(activeLessonData.id, "reflection");
  const isLessonCompleted = completedLessons.includes(activeLessonData.id);

  const xpAwardForArch = activeLessonData.xpReward || 50;
  // Architecture awards +5 Gems per the requirement
  const gemsAwardForArch = activeLessonData.gemsReward || 5;

  // Count completed activities for this lesson
  const completedCount = [isArchCompleted, isPracticeCompleted, isEdunotesCompleted, isVideoCompleted].filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 4) * 100);

  // ──────────────────────────────────────────────────────────────
  // 1. Dynamic Hero Slider — 4 Slides
  // ──────────────────────────────────────────────────────────────
  const heroSlides = [
    // Dot 1 — Today's Adventure (Lesson Overview)
    {
      tag: activeLessonData.heroSlide?.tag || "Today's Adventure",
      title: activeLessonData.title,
      subtitle: activeLessonData.heroSlide?.subtitle || `Dive into ${activeLessonData.title}! Discover core concepts through interactive visuals and step-by-step guided learning designed just for you.`,
      ctaText: "Start Learning →",
      ctaUrl: architectureUrl,
      visualizerKey: activeLessonData.heroSlide?.visualizerKey || activeLessonData.id,
      visualizerData: activeLessonData.heroSlide?.visualizerData || { number: 123 },
      activityType: "architecture",
      xpReward: xpAwardForArch,
      gemsReward: gemsAwardForArch,
    },
    // Dot 2 — Story & Interactive Simulation
    {
      tag: "Story & Interactive Simulation",
      title: `Story & Simulation`,
      subtitle: `✦ Understand the concept visually ✦ Learn through real-life examples ✦ Improve logical thinking ✦ Interactive exploration ✦ Better concept retention`,
      ctaText: isArchCompleted ? "Launch Simulation ✓ (Completed)" : `Launch Story & Simulation`,
      ctaUrl: architectureUrl,
      visualizerKey: "symmetry",
      visualizerData: activeLessonData.heroSlide?.visualizerData || { number: 246 },
      activityType: "architecture",
      xpReward: xpAwardForArch,
      gemsReward: gemsAwardForArch,
    },
    // Dot 3 — Practice Challenge
    {
      tag: "Practice Challenge",
      title: `Practice: ${activeLessonData.title}`,
      subtitle: `Put your knowledge to the test! ✦ Interactive questions ✦ Instant feedback ✦ Accuracy improvement ✦ Confidence building`,
      ctaText: isPracticeCompleted ? "Practice Again ✓ (Completed)" : "Start Practice (+30 XP) 🏆",
      ctaUrl: practiceUrl,
      visualizerKey: "fraction",
      visualizerData: { number: 456 },
      activityType: "practice",
      xpReward: 30,
      gemsReward: 0,
    },
    // Dot 4 — Reflection & Achievement
    {
      tag: "Reflection & Achievement",
      title: `Reflection & Achievement`,
      subtitle: `Lesson: ${isLessonCompleted ? "Completed ✓" : "In Progress"} | Earned XP: ${xpPoints} | Gems: ${learningGems} | Completion: ${completionPercentage}% | Activities Done: ${completedCount}/4`,
      ctaText: isReflectionCompleted ? "Review Reflection ✓ (Completed)" : "Review Reflection (+20 XP) 📖",
      ctaUrl: edunotesUrl,
      visualizerKey: "time",
      visualizerData: { number: 789 },
      activityType: "reflection",
      xpReward: 20,
      gemsReward: 0,
    },
  ];

  const handleHeroCtaClick = (slide: HeroSlideWithActivity, _slideIndex?: number) => {
    if (slide.activityType) {
      completeActivity(
        activeLessonData.id,
        slide.activityType,
        slide.xpReward || 0,
        slide.gemsReward || 0
      );
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Learning Grid Action Cards
  // ──────────────────────────────────────────────────────────────
  const mappedCards = [
    {
      id: "card_edunotes",
      activityType: "edunotes",
      title: "EduNotes",
      subtitle: "Learn, Practice, Win!",
      description: `Clear, concise notes for ${activeLessonData.title}. Designed to simplify concepts and boost confidence.`,
      icon: "📖",
      buttonColor: "purple" as const,
      targetUrl: edunotesUrl,
      enabled: true,
      isCompleted: isEdunotesCompleted,
      xpReward: 20,
      gemsReward: 0,
    },
    {
      id: "card_architecture",
      activityType: "architecture",
      title: `The Architecture of ${activeLessonData.title}`,
      subtitle: "Visual Concepts",
      description: `Interactive breakdown and 3D architectural representation of ${activeLessonData.title}. Earn +${xpAwardForArch} XP & +${gemsAwardForArch} Gems!`,
      icon: "🧊",
      buttonColor: "blue" as const,
      targetUrl: architectureUrl,
      enabled: true,
      isCompleted: isArchCompleted,
      xpReward: xpAwardForArch,
      gemsReward: gemsAwardForArch,
    },
    {
      id: "card_video",
      activityType: "video",
      title: `Video: ${activeLessonData.title}`,
      subtitle: "Watch & Learn",
      description: `Engaging video lesson explaining ${activeLessonData.title} step-by-step.`,
      icon: "▶",
      buttonColor: "orange" as const,
      targetUrl: videoUrl,
      enabled: true,
      isCompleted: isVideoCompleted,
      xpReward: 10,
      gemsReward: 0,
    },
    {
      id: "card_practice",
      activityType: "practice",
      title: `Practice: ${activeLessonData.title}`,
      subtitle: "Interactive Exercises",
      description: `Fun exercises to test your understanding of ${activeLessonData.title} with instant rewards!`,
      icon: "🏆",
      buttonColor: "accent" as const,
      targetUrl: practiceUrl,
      enabled: true,
      isCompleted: isPracticeCompleted,
      xpReward: 30,
      gemsReward: 0,
    },
  ];

  const handleCardClick = (card: ExtendedActionCard) => {
    if (card.activityType) {
      completeActivity(
        activeLessonData.id,
        card.activityType,
        card.xpReward || 0,
        card.gemsReward || 0
      );
    }
  };

  return (
    <div className="student-dashboard-page">
      <HeroSectionContainer
        slides={heroSlides}
        activeLessonId={activeLessonData.id}
        onCtaClick={handleHeroCtaClick}
      />
      <LearningGridContainer
        cards={mappedCards}
        onCardClick={handleCardClick}
      />
      <BottomNavigationContainer
        onPrevious={goToPrevLesson}
        onNext={goToNextLesson}
      />
    </div>
  );
}
