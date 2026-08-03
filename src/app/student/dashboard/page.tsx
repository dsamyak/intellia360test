"use client";

import HeroSectionContainer from "@/components/student/HeroSectionContainer";
import LearningGridContainer from "@/components/student/LearningGridContainer";
import BottomNavigationContainer from "@/components/student/BottomNavigationContainer";
import { useStudentContext } from "@/context/StudentContext";

export default function StudentDashboardPage() {
  const { activeLessonData, goToNextLesson, goToPrevLesson } = useStudentContext();

  if (!activeLessonData) {
    return <div style={{ padding: "2rem" }}>Loading dashboard...</div>;
  }

  const actionCards = activeLessonData.actionCards || {};
  const heroSlide = {
    tag: activeLessonData.heroSlide?.tag || "Today's Adventure",
    lessonId: activeLessonData.id,
    title: activeLessonData.title,
    subtitle: activeLessonData.heroSlide?.subtitle || activeLessonData.title,
    ctaText: activeLessonData.heroSlide?.ctaText || "Start Learning →",
    ctaUrl: activeLessonData.heroSlide?.ctaUrl || activeLessonData.vercelLink || actionCards.architecture || "#",
    visualizerKey: activeLessonData.heroSlide?.visualizerKey || activeLessonData.id,
    visualizerData: activeLessonData.heroSlide?.visualizerData || { number: 123 },
  };

  const architectureUrl = actionCards.architecture || activeLessonData.vercelLink || "#";
  const videoUrl = actionCards.video || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const edunotesUrl = actionCards.edunotes || "/student/lesson/edunotes";
  const practiceUrl = actionCards.practice || "/student/quiz/practice-1";

  const mappedCards = [
    {
      id: "card_edunotes",
      title: "EduNotes",
      subtitle: "Learn, Practice, Win!",
      description: `Clear, concise notes for ${activeLessonData.title}. Designed to simplify concepts and boost confidence.`,
      icon: "📖",
      buttonColor: "purple",
      targetUrl: edunotesUrl,
      enabled: true
    },
    {
      id: "card_architecture",
      title: `The Architecture of ${activeLessonData.title}`,
      subtitle: "Visual Concepts",
      description: `Interactive breakdown and 3D architectural representation of ${activeLessonData.title}.`,
      icon: "🧊",
      buttonColor: "blue",
      targetUrl: architectureUrl,
      enabled: true
    },
    {
      id: "card_video",
      title: `Video: ${activeLessonData.title}`,
      subtitle: "Watch & Learn",
      description: `Engaging video lesson explaining ${activeLessonData.title} step-by-step.`,
      icon: "▶",
      buttonColor: "orange",
      targetUrl: videoUrl,
      enabled: true
    },
    {
      id: "card_practice",
      title: `Practice: ${activeLessonData.title}`,
      subtitle: "Interactive Exercises",
      description: `Fun exercises to test your understanding of ${activeLessonData.title} with instant rewards!`,
      icon: "🏆",
      buttonColor: "accent",
      targetUrl: practiceUrl,
      enabled: true
    }
  ];

  return (
    <div className="student-dashboard-page">
      <HeroSectionContainer
        slide={heroSlide as any}
        totalSlides={4}
        activeSlideIndex={0}
      />
      <LearningGridContainer cards={mappedCards as any} />
      <BottomNavigationContainer
        onPrevious={goToPrevLesson}
        onNext={goToNextLesson}
      />
    </div>
  );
}
