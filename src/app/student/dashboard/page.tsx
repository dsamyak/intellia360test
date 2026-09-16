"use client";

import Link from "next/link";
import { useStudentContext } from "@/context/StudentContext";
import HeroSectionContainer from "@/components/student/HeroSectionContainer";
import type { DashboardHeroSlide } from "@/types/student";
import BottomNavigationContainer from "@/components/student/BottomNavigationContainer";
import "./dashboard.css";

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon,
  label,
  value,
  change,
  iconBg,
}: {
  icon: string;
  label: string;
  value: string;
  change: string;
  iconBg: string;
}) {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-top">
        <div
          className="dashboard-stat-icon"
          style={{ background: iconBg }}
        >
          {icon}
        </div>

        <div className="dashboard-stat-content">
          <span className="dashboard-stat-label">{label}</span>
          <strong className="dashboard-stat-value">{value}</strong>
        </div>
      </div>

      <div className="dashboard-stat-change">
        ↑ {change}
      </div>
    </div>
  );
}


/* =========================================================
   RESOURCE CARD
   ========================================================= */

function ResourceCard({
  icon,
  title,
  description,
  buttonText,
  href,
  background,
  iconBackground,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  background: string;
  iconBackground: string;
  onClick: () => void;
}) {
  return (
    <div
      className="dashboard-resource-card"
      style={{ background }}
    >
      <div className="dashboard-resource-orb" />

      <div className="dashboard-resource-content">
        <div
          className="dashboard-resource-icon"
          style={{ background: iconBackground }}
        >
          {icon}
        </div>

        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <Link
        href={href}
        onClick={onClick}
        className="dashboard-resource-button"
      >
        {buttonText} <span>→</span>
      </Link>
    </div>
  );
}


/* =========================================================
   PROGRESS RING
   ========================================================= */

function ProgressRing({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.min(
    100,
    Math.round((completed / safeTotal) * 100)
  );

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circumference;

  return (
    <div className="dashboard-progress-ring">
      <svg
        width="125"
        height="125"
        viewBox="0 0 125 125"
        aria-label={`${percentage}% completed`}
      >
        <circle
          cx="62.5"
          cy="62.5"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="13"
        />

        <circle
          cx="62.5"
          cy="62.5"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 62.5 62.5)"
        />

        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      <div className="dashboard-progress-ring-content">
        <strong>{completed}</strong>
        <span>Completed</span>
      </div>
    </div>
  );
}


/* =========================================================
   MAIN DASHBOARD
   ========================================================= */

export default function StudentDashboardPage() {
  const {
    activeLessonData,
    goToNextLesson,
    goToPrevLesson,
    completeActivity,
    isActivityCompleted,
    xpPoints,
    learningGems,
    streakDays,
    completedLessons,
    curriculum,
  } = useStudentContext();

  if (!activeLessonData) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-icon">✨</div>
        <span>Loading your adventure…</span>
      </div>
    );
  }

  const actionCards = activeLessonData.actionCards ?? {};

  const architectureUrl = `/student/lesson/${encodeURIComponent(
    activeLessonData.id
  )}`;

  const edunotesUrl =
    `/student/lesson/edunotes?lessonId=${encodeURIComponent(
      activeLessonData.id
    )}`;

  const practiceUrl =
    actionCards.practice ?? "/student/quiz/practice-1";

  const videoUrl =
    "/student/lesson/video?lessonId=" +
    encodeURIComponent(activeLessonData.id);

  /* ---------------------------------------------------------
     Activity completion
     --------------------------------------------------------- */

  const isArchCompleted = isActivityCompleted(
    activeLessonData.id,
    "architecture"
  );

  const isPracticeCompleted = isActivityCompleted(
    activeLessonData.id,
    "practice"
  );

  const isEdunotesCompleted = isActivityCompleted(
    activeLessonData.id,
    "edunotes"
  );

  const isVideoCompleted = isActivityCompleted(
    activeLessonData.id,
    "video"
  );

  const isLessonCompleted = completedLessons.includes(
    activeLessonData.id
  );

  const xpAward = activeLessonData.xpReward ?? 50;
  const gemAward = activeLessonData.gemsReward ?? 5;

  const completedCount = [
    isArchCompleted,
    isPracticeCompleted,
    isEdunotesCompleted,
    isVideoCompleted,
  ].filter(Boolean).length;

  const completionPct = Math.round(
    (completedCount / 4) * 100
  );

  /* ---------------------------------------------------------
     Curriculum progress
     --------------------------------------------------------- */

  const totalTopics =
    curriculum?.chapters.reduce(
      (total, chapter) =>
        total + chapter.topics.length,
      0
    ) ?? 0;

  const currentLessonCompletedTopics =
    curriculum?.chapters.reduce(
      (total, chapter) =>
        total +
        chapter.topics.filter((topic) =>
          completedLessons.includes(topic.id)
        ).length,
      0
    ) ?? completedLessons.length;

  const curriculumPercentage = totalTopics
    ? Math.min(
      100,
      Math.round(
        (currentLessonCompletedTopics / totalTopics) * 100
      )
    )
    : 0;

  /* ---------------------------------------------------------
     Hero slides
     --------------------------------------------------------- */

  const heroSlides: DashboardHeroSlide[] = [
    {
      tag:
        activeLessonData.heroSlide?.tag ||
        "Today's Adventure",

      title: activeLessonData.title,

      subtitle:
        activeLessonData.heroSlide?.subtitle ||
        `Dive into ${activeLessonData.title}! Discover core concepts through interactive visuals and step-by-step guided learning designed just for you.`,

      ctaText: isArchCompleted
        ? "Continue Learning →"
        : "Start Learning →",

      ctaUrl: architectureUrl,

      visualizerKey:
        activeLessonData.heroSlide?.visualizerKey ||
        activeLessonData.id,

      visualizerData:
        activeLessonData.heroSlide?.visualizerData || {
          number: 123,
        },

      activityType: "architecture",
      xpReward: xpAward,
      gemsReward: gemAward,
    },

    {
      tag: "Story & Interactive Simulation",

      title: "Learn Visually",

      subtitle:
        "Understand concepts through interactive 3D models, stories, examples and guided exploration.",

      ctaText: isArchCompleted
        ? "Open 3D Architecture ✓"
        : "Explore Architecture 3D",

      ctaUrl: architectureUrl,

      visualizerKey: "symmetry",

      visualizerData:
        activeLessonData.heroSlide?.visualizerData || {
          number: 246,
        },

      activityType: "architecture",
      xpReward: xpAward,
      gemsReward: gemAward,
    },

    {
      tag: "Practice Challenge",

      title: "Practice & Improve",

      subtitle:
        "Test your knowledge with interactive questions, instant feedback and reward-based practice.",

      ctaText: isPracticeCompleted
        ? "Practice Again ✓"
        : "Start Practice (+30 XP)",

      ctaUrl: practiceUrl,

      visualizerKey: "fraction",

      visualizerData: {
        number: 456,
      },

      activityType: "practice",
      xpReward: 30,
      gemsReward: 0,
    },

    {
      tag: "Reflection & Achievement",

      title: "Review Your Learning",

      subtitle:
        `You have completed ${completedCount} of 4 activities for this lesson. Keep learning and build your streak!`,

      ctaText: isEdunotesCompleted
        ? "Open EduNotes ✓"
        : "Open EduNotes",

      ctaUrl: edunotesUrl,

      visualizerKey: "time",

      visualizerData: {
        number: 789,
      },

      activityType: "edunotes",
      xpReward: 20,
      gemsReward: 0,
    },
  ];

  /* ---------------------------------------------------------
     Actions
     --------------------------------------------------------- */

  const handleHeroCtaClick = (
    slide: DashboardHeroSlide
  ) => {
    if (!slide.activityType) return;

    completeActivity(
      activeLessonData.id,
      slide.activityType,
      slide.xpReward || 0,
      slide.gemsReward || 0
    );
  };

  const handleResourceClick = (
    activityType: string,
    xpReward: number,
    gemsReward: number
  ) => {
    completeActivity(
      activeLessonData.id,
      activityType,
      xpReward,
      gemsReward
    );
  };

  /* ---------------------------------------------------------
     Upcoming activities
     --------------------------------------------------------- */

  const upcomingActivities = [
    {
      icon: "⭐",
      title: `Complete ${activeLessonData.title}`,
      subtitle: isLessonCompleted
        ? "Lesson completed"
        : `${completedCount}/4 activities completed`,
      href: architectureUrl,
      action: isLessonCompleted ? "Review" : "Start",
    },
    {
      icon: "🎯",
      title: "Practice Challenge",
      subtitle: isPracticeCompleted
        ? "Completed"
        : "Interactive exercises",
      href: practiceUrl,
      action: isPracticeCompleted
        ? "Retry"
        : "Start",
    },
    {
      icon: "▶️",
      title: "Watch Lesson Video",
      subtitle: isVideoCompleted
        ? "Completed"
        : "Learn with video",
      href: videoUrl,
      action: "Watch",
    },
  ];

  /* ---------------------------------------------------------
     Achievements
     --------------------------------------------------------- */

  const achievements = [
    {
      icon: "🔥",
      title: `${streakDays}-Day Streak`,
      subtitle:
        streakDays > 0
          ? "Keep the streak alive!"
          : "Start your streak today",
    },
    {
      icon: "⭐",
      title: `${xpPoints.toLocaleString()} XP`,
      subtitle: "Total learning XP",
    },
    {
      icon: "💎",
      title: `${learningGems} Gems`,
      subtitle: "Learning rewards collected",
    },
  ];

  return (
    <div className="student-dashboard-page">

      {/* =====================================================
          1. HERO
          ===================================================== */}

      <HeroSectionContainer
        slides={heroSlides}
        activeLessonId={activeLessonData.id}
        onCtaClick={handleHeroCtaClick}
      />


      {/* =====================================================
          2. PLAYER STATS
          ===================================================== */}

      <section className="student-dashboard-stats-grid">

        <StatCard
          icon="⭐"
          label="XP Points"
          value={xpPoints.toLocaleString()}
          change="Keep learning"
          iconBg="#fff3c4"
        />

        <StatCard
          icon="💎"
          label="Learning Gems"
          value={String(learningGems)}
          change="Rewards collected"
          iconBg="#efe4ff"
        />

        <StatCard
          icon="🔥"
          label="Day Streak"
          value={String(streakDays)}
          change="Consecutive days"
          iconBg="#ffe8dc"
        />

        <StatCard
          icon="✓"
          label="Lessons Completed"
          value={String(completedLessons.length)}
          change={`${totalTopics} topics available`}
          iconBg="#dcfce7"
        />

      </section>


      {/* =====================================================
          3. CONTINUE LEARNING + PROGRESS
          ===================================================== */}

      <section className="student-dashboard-progress-grid">

        {/* Current Lesson */}

        <div className="dashboard-panel continue-learning-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-section-eyebrow">
                CURRENT QUEST
              </span>

              <h2>Continue Learning</h2>
            </div>

            <span className="dashboard-completion-pill">
              {completionPct}% complete
            </span>

          </div>


          <div className="continue-learning-content">

            <div className="lesson-visual">
              <div className="lesson-visual-glow" />
              <span>🪐</span>
            </div>


            <div className="continue-learning-info">

              <span className="dashboard-mini-label">
                Current Lesson
              </span>

              <h3>{activeLessonData.title}</h3>

              <p>
                {isLessonCompleted
                  ? "Great work! You completed this lesson."
                  : "Continue your adventure and explore the learning resources."}
              </p>


              <div className="dashboard-progress-track">

                <div
                  className="dashboard-progress-fill"
                  style={{
                    width: `${completionPct}%`,
                  }}
                />

              </div>


              <div className="continue-learning-footer">

                <span>
                  {completedCount}/4 activities
                </span>

                <Link
                  href={architectureUrl}
                  onClick={() =>
                    handleResourceClick(
                      "architecture",
                      xpAward,
                      gemAward
                    )
                  }
                  className="dashboard-primary-button"
                >
                  Continue Lesson →
                </Link>

              </div>

            </div>

          </div>

        </div>


        {/* Learning Progress */}

        <div className="dashboard-panel learning-progress-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-section-eyebrow">
                YOUR JOURNEY
              </span>

              <h2>Learning Progress</h2>
            </div>

            <Link
              href="/student/courses"
              className="dashboard-view-link"
            >
              View All
            </Link>

          </div>


          <div className="learning-progress-content">

            <ProgressRing
              completed={currentLessonCompletedTopics}
              total={totalTopics}
            />


            <div className="learning-progress-details">

              <div className="progress-detail-item">

                <div className="progress-detail-header">
                  <span>Curriculum</span>
                  <strong>{curriculumPercentage}%</strong>
                </div>

                <div className="small-progress-track">

                  <div
                    className="small-progress-fill"
                    style={{
                      width: `${curriculumPercentage}%`,
                    }}
                  />

                </div>

              </div>


              <div className="progress-stat-row">
                <span>Topics completed</span>
                <strong>
                  {currentLessonCompletedTopics}
                </strong>
              </div>

              <div className="progress-stat-row">
                <span>Topics remaining</span>
                <strong>
                  {Math.max(
                    0,
                    totalTopics -
                    currentLessonCompletedTopics
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          4. LEARNING HUB
          ===================================================== */}

      <section className="student-dashboard-learning-hub">

        <div className="learning-hub-header">

          <div>

            <span className="dashboard-section-eyebrow">
              POWER UP YOUR LEARNING
            </span>

            <h2>Learning Tools & Resources</h2>

            <p>
              Everything you need for{" "}
              <strong>{activeLessonData.title}</strong>{" "}
              in one place.
            </p>

          </div>

          <span className="learning-hub-counter">
            {completedCount}/4 completed
          </span>

        </div>


        <div className="learning-hub-grid">

          <ResourceCard
            icon="🧊"
            title="Architecture 3D"
            description="Explore interactive 3D models and visual concept breakdowns."
            buttonText={
              isArchCompleted
                ? "Open 3D Viewer ✓"
                : "Open 3D Viewer"
            }
            href={architectureUrl}
            background="linear-gradient(135deg, #1687f7 0%, #2563eb 55%, #4f46e5 100%)"
            iconBackground="rgba(255,255,255,.16)"
            onClick={() =>
              handleResourceClick(
                "architecture",
                xpAward,
                gemAward
              )
            }
          />


          <ResourceCard
            icon="▶️"
            title="Video Lessons"
            description="Watch engaging concept videos and learn through visual examples."
            buttonText="Watch Video"
            href={videoUrl}
            background="linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)"
            iconBackground="rgba(255,255,255,.16)"
            onClick={() =>
              handleResourceClick("video", 20, 5)
            }
          />


          <ResourceCard
            icon="📖"
            title="EduNotes"
            description="Read clear notes, key points, summaries and lesson explanations."
            buttonText={
              isEdunotesCompleted
                ? "Open EduNotes ✓"
                : "Open EduNotes"
            }
            href={edunotesUrl}
            background="linear-gradient(135deg, #0f9f7a 0%, #10b981 50%, #14b8a6 100%)"
            iconBackground="rgba(255,255,255,.16)"
            onClick={() =>
              handleResourceClick(
                "edunotes",
                20,
                0
              )
            }
          />


          <ResourceCard
            icon="🎯"
            title="Practice"
            description="Solve interactive questions, get instant feedback and improve skills."
            buttonText={
              isPracticeCompleted
                ? "Practice Again ✓"
                : "Start Practice"
            }
            href={practiceUrl}
            background="linear-gradient(135deg, #f97316 0%, #fb923c 55%, #f59e0b 100%)"
            iconBackground="rgba(255,255,255,.16)"
            onClick={() =>
              handleResourceClick(
                "practice",
                30,
                0
              )
            }
          />

        </div>

      </section>


      {/* =====================================================
          5. BOTTOM DASHBOARD
          ===================================================== */}

      <section className="student-dashboard-bottom-grid">

        {/* Upcoming Activities */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-section-eyebrow">
                NEXT UP
              </span>

              <h2>Upcoming Activities</h2>
            </div>

            <Link
              href="/student/assignments"
              className="dashboard-view-link"
            >
              View All
            </Link>

          </div>


          <div className="dashboard-activity-list">

            {upcomingActivities.map((activity) => (
              <Link
                key={activity.title}
                href={activity.href}
                className="dashboard-activity-item"
              >

                <div className="activity-icon">
                  {activity.icon}
                </div>

                <div className="activity-info">

                  <strong>{activity.title}</strong>

                  <span>{activity.subtitle}</span>

                </div>

                <span className="activity-action">
                  {activity.action}
                </span>

              </Link>
            ))}

          </div>

        </div>


        {/* Achievements */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-section-eyebrow">
                REWARDS
              </span>

              <h2>Recent Achievements</h2>
            </div>

            <Link
              href="/student/rewards"
              className="dashboard-view-link"
            >
              View All
            </Link>

          </div>


          <div className="dashboard-achievement-list">

            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className="dashboard-achievement-item"
              >

                <div className="achievement-icon">
                  {achievement.icon}
                </div>

                <div>
                  <strong>
                    {achievement.title}
                  </strong>

                  <span>
                    {achievement.subtitle}
                  </span>
                </div>

              </div>
            ))}

          </div>

        </div>


        {/* Summary */}

        <div className="dashboard-panel dashboard-summary-panel">

          <span className="dashboard-section-eyebrow">
            PLAYER STATS
          </span>

          <h2>Your Learning Summary</h2>

          <p>
            A quick snapshot of your current learning
            journey.
          </p>


          <div className="summary-stats">

            <div className="summary-row">
              <span>Current lesson</span>

              <strong title={activeLessonData.title}>
                {activeLessonData.title}
              </strong>
            </div>


            <div className="summary-row">
              <span>Activities</span>

              <strong>
                {completedCount}/4
              </strong>
            </div>


            <div className="summary-row">
              <span>XP earned</span>

              <strong>
                {xpPoints.toLocaleString()}
              </strong>
            </div>


            <div className="summary-row">
              <span>Learning gems</span>

              <strong>
                💎 {learningGems}
              </strong>
            </div>

          </div>


          <Link
            href="/student/courses"
            className="summary-button"
          >
            Open Full Progress →
          </Link>

        </div>

      </section>


      {/* =====================================================
          6. LESSON NAVIGATION
          ===================================================== */}

      <div className="dashboard-bottom-navigation">

        <BottomNavigationContainer
          onPrevious={goToPrevLesson}
          onNext={goToNextLesson}
        />

      </div>

    </div>
  );
}