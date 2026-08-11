"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface HeroSlide {
  tag?: string;
  subtitle?: string;
  visualizerKey?: string;
  visualizerData?: Record<string, unknown>;
}

interface ActionCards {
  architecture?: string;
  video?: string;
  edunotes?: string;
  practice?: string;
  [key: string]: string | undefined;
}

interface CurriculumTopic {
  id: string;
  title: string;
  status: string;
  icon?: string;
  vercelLink?: string;
  estimatedTime?: string;
  difficulty?: string;
  xpReward?: number;
  gemsReward?: number;
  heroSlide?: HeroSlide;
  actionCards?: ActionCards;
  aiContext?: string;
}

interface CurriculumChapter {
  id: string;
  chapterNumber: number;
  title: string;
  topicsCount: number;
  topics: CurriculumTopic[];
}

interface Curriculum {
  activeTopic: CurriculumTopic | null;
  standaloneTopics: CurriculumTopic[];
  chapters: CurriculumChapter[];
}

interface StudentContextType {
  currentGrade: string;
  setCurrentGrade: (grade: string) => void;
  curriculum: Curriculum | null;
  activeLessonId: string;
  activeLessonData: CurriculumTopic | null;
  setActiveLessonId: (id: string) => void;
  goToNextLesson: () => void;
  goToPrevLesson: () => void;
  xpPoints: number;
  addXp: (points: number) => void;
  learningGems: number;
  addGems: (points: number) => void;
  streakDays: number;
  completedLessons: string[];
  completeLesson: (id: string) => void;
  completedActivities: string[];
  completeActivity: (lessonId: string, activityType: string, xpReward?: number, gemsReward?: number) => void;
  isActivityCompleted: (lessonId: string, activityType: string) => boolean;
  unlockedBadges: string[];
  unlockBadge: (badgeId: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [currentGrade, setCurrentGradeState] = useState<string>("grade1");
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  
  const [activeLessonId, setActiveLessonIdState] = useState<string>("");
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [learningGems, setLearningGems] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [lastActiveDate, setLastActiveDate] = useState<string>("");
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper for real daily streak tracking
  const checkDailyStreak = (storedStreak?: number, storedDate?: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (!storedDate) {
      return { streak: 1, date: todayStr };
    }
    if (storedDate === todayStr) {
      return { streak: storedStreak || 1, date: todayStr };
    }
    const last = new Date(storedDate);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - last.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      // Returned within 24h / next consecutive day -> streak +1
      return { streak: (storedStreak || 1) + 1, date: todayStr };
    } else if (diffDays > 1) {
      // Missed more than 24 hours -> reset to Day 1
      return { streak: 1, date: todayStr };
    }
    return { streak: storedStreak || 1, date: todayStr };
  };

  // Load curriculum dynamically based on grade
  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const data = await import(`../data/grades/${currentGrade}/curriculum.json`);
        setCurriculum(data.default || data);
        
        // If we don't have an active lesson, or if the current active lesson doesn't exist in the new curriculum, reset it
        const allTopics = (data.default || data).chapters.flatMap((c: CurriculumChapter) => c.topics);
        if (allTopics.length > 0) {
           setActiveLessonIdState((prev) => {
               if (!prev || !allTopics.find((t: CurriculumTopic) => t.id === prev)) {
                   return allTopics[0].id;
               }
               return prev;
           });
        }
      } catch (err) {
        console.error(`Failed to load curriculum for ${currentGrade}`, err);
        setCurriculum(null);
      }
    };
    loadCurriculum();
  }, [currentGrade]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("studentProgress");
      let savedStreak = 1;
      let savedDate = "";

      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.currentGrade) setCurrentGradeState(parsed.currentGrade);
        if (parsed.activeLessonId) setActiveLessonIdState(parsed.activeLessonId);
        if (typeof parsed.xpPoints === "number") setXpPoints(parsed.xpPoints);
        if (typeof parsed.learningGems === "number") setLearningGems(parsed.learningGems);
        if (typeof parsed.streakDays === "number") savedStreak = parsed.streakDays;
        if (parsed.lastActiveDate) savedDate = parsed.lastActiveDate;
        if (Array.isArray(parsed.completedLessons)) setCompletedLessons(parsed.completedLessons);
        if (Array.isArray(parsed.completedActivities)) setCompletedActivities(parsed.completedActivities);
        if (Array.isArray(parsed.unlockedBadges)) setUnlockedBadges(parsed.unlockedBadges);
      }

      const streakResult = checkDailyStreak(savedStreak, savedDate);
      setStreakDays(streakResult.streak);
      setLastActiveDate(streakResult.date);
    } catch (e) {
      console.error("Failed to parse student progress from localStorage", e);
      const todayStr = new Date().toISOString().split("T")[0];
      setStreakDays(1);
      setLastActiveDate(todayStr);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        currentGrade,
        activeLessonId,
        xpPoints,
        learningGems,
        streakDays,
        lastActiveDate,
        completedLessons,
        completedActivities,
        unlockedBadges,
      };
      localStorage.setItem("studentProgress", JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save student progress to localStorage", e);
    }
  }, [currentGrade, activeLessonId, xpPoints, learningGems, streakDays, lastActiveDate, completedLessons, completedActivities, unlockedBadges, isLoaded]);

  const setCurrentGrade = (grade: string) => {
    setCurrentGradeState(grade);
  };

  const setActiveLessonId = (id: string) => {
    setActiveLessonIdState(id);
  };

  const addXp = (points: number) => {
    setXpPoints((prev) => prev + points);
  };
  
  const addGems = (points: number) => {
    setLearningGems((prev) => prev + points);
  };

  const completeLesson = (id: string) => {
    setCompletedLessons((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const completeActivity = (
    lessonId: string,
    activityType: string,
    xpReward: number = 0,
    gemsReward: number = 0
  ) => {
    if (!lessonId) return;
    const key = `${lessonId}_${activityType}`;

    setCompletedActivities((prev) => {
      if (prev.includes(key)) {
        // Prevent duplicate rewards! Rewards are granted only once per activity.
        return prev;
      }

      if (xpReward > 0) {
        setXpPoints((currentXp) => currentXp + xpReward);
      }
      if (gemsReward > 0) {
        setLearningGems((currentGems) => currentGems + gemsReward);
      }

      const updated = [...prev, key];

      // Mark lesson as completed if core activities (architecture or practice) are completed
      if (activityType === "architecture" || activityType === "practice") {
        setCompletedLessons((prevLessons) =>
          prevLessons.includes(lessonId) ? prevLessons : [...prevLessons, lessonId]
        );
      }

      return updated;
    });
  };

  const isActivityCompleted = (lessonId: string, activityType: string) => {
    return completedActivities.includes(`${lessonId}_${activityType}`);
  };

  const unlockBadge = (badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (!prev.includes(badgeId)) {
        return [...prev, badgeId];
      }
      return prev;
    });
  };

  // Compute active lesson data
  const allTopics = curriculum ? curriculum.chapters.flatMap(c => c.topics) : [];
  const activeLessonData = allTopics.find(t => t.id === activeLessonId) || (allTopics.length > 0 ? allTopics[0] : null);

  const goToNextLesson = () => {
    if (!activeLessonId || allTopics.length === 0) return;
    const currentIndex = allTopics.findIndex(t => t.id === activeLessonId);
    if (currentIndex >= 0 && currentIndex < allTopics.length - 1) {
      setActiveLessonId(allTopics[currentIndex + 1].id);
    }
  };

  const goToPrevLesson = () => {
    if (!activeLessonId || allTopics.length === 0) return;
    const currentIndex = allTopics.findIndex(t => t.id === activeLessonId);
    if (currentIndex > 0) {
      setActiveLessonId(allTopics[currentIndex - 1].id);
    }
  };

  return (
    <StudentContext.Provider
      value={{
        currentGrade,
        setCurrentGrade,
        curriculum,
        activeLessonId,
        activeLessonData,
        setActiveLessonId,
        goToNextLesson,
        goToPrevLesson,
        xpPoints,
        addXp,
        learningGems,
        addGems,
        streakDays,
        completedLessons,
        completeLesson,
        completedActivities,
        completeActivity,
        isActivityCompleted,
        unlockedBadges,
        unlockBadge,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudentContext must be used within a StudentProvider");
  }
  return context;
};
