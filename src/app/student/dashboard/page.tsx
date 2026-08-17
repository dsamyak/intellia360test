"use client";

import { useStudentContext } from "@/context/StudentContext";
import HeroSectionContainer from "@/components/student/HeroSectionContainer";
import type { DashboardHeroSlide } from "@/types/student";
import LearningGridContainer from "@/components/student/LearningGridContainer";
import BottomNavigationContainer from "@/components/student/BottomNavigationContainer";

// ─── Tiny inline helpers (no extra deps) ────────────────────────────────────

function StatCard({
  icon, label, value, change, changeDir, vs, barColor, bars,
}: {
  icon: string; label: string; value: string;
  change: string; changeDir: "up" | "down"; vs: string;
  barColor: string; bars: number[];
}) {
  const max = Math.max(...bars);
  return (
    <div className="db-stat-card">
      <div className="db-stat-card-header">
        <div className="db-stat-card-icon" style={{ background: `${barColor}18` }}>
          <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        </div>
        <span className="db-stat-card-label">{label}</span>
      </div>
      <div className="db-stat-card-value">{value}</div>
      <div className="db-stat-card-footer">
        <span className={`db-stat-card-change ${changeDir}`}>
          {changeDir === "up" ? "↑" : "↓"} {change}
        </span>
        <span className="db-stat-card-vs">{vs}</span>
      </div>
      <div className="db-sparkline">
        {bars.map((h, i) => (
          <div
            key={i}
            className="db-sparkline-bar"
            style={{
              height: `${Math.round((h / max) * 100)}%`,
              background: barColor,
              minHeight: "4px",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DonutChart({
  segments,
}: {
  segments: { label: string; pct: number; count: number; color: string }[];
}) {
  const r = 54;
  const cx = 65;
  const cy = 65;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.pct / 100) * circumference;
    const arc = { dash, gap: circumference - dash, offset, color: s.color };
    offset += dash;
    return arc;
  });

  const total = segments.reduce((a, s) => a + s.count, 0);

  return (
    <>
      <div className="db-donut-wrap">
        <svg className="db-donut-svg" viewBox="0 0 130 130">
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth="18"
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.offset}
            />
          ))}
        </svg>
        <div className="db-donut-center">
          <span className="db-donut-center-value">{total.toLocaleString()}</span>
          <span className="db-donut-center-label">Total</span>
        </div>
      </div>
      <div className="db-donut-legend">
        {segments.map((s) => (
          <div key={s.label} className="db-donut-legend-item">
            <div className="db-donut-legend-left">
              <div className="db-donut-dot" style={{ background: s.color }} />
              <span>{s.label}</span>
            </div>
            <span className="db-donut-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          color: "var(--color-text-muted)",
          fontSize: "0.95rem",
        }}
      >
        Loading dashboard…
      </div>
    );
  }

  const actionCards = activeLessonData.actionCards ?? {};
  const architectureUrl = actionCards.architecture ?? activeLessonData.vercelLink ?? "#";
  const videoUrl = actionCards.video ?? "";
  const edunotesUrl = actionCards.edunotes ?? "/student/lesson/edunotes";
  const practiceUrl = actionCards.practice ?? "/student/quiz/practice-1";

  const isArchCompleted = isActivityCompleted(activeLessonData.id, "architecture");
  const isPracticeCompleted = isActivityCompleted(activeLessonData.id, "practice");
  const isEdunotesCompleted = isActivityCompleted(activeLessonData.id, "edunotes");
  const isVideoCompleted = isActivityCompleted(activeLessonData.id, "video");
  const isLessonCompleted = completedLessons.includes(activeLessonData.id);
  const xpAward = activeLessonData.xpReward ?? 50;
  const gemAward = activeLessonData.gemsReward ?? 5;
  const completedCount = [isArchCompleted, isPracticeCompleted, isEdunotesCompleted, isVideoCompleted].filter(Boolean).length;
  const completionPct = Math.round((completedCount / 4) * 100);

  // ──────────────────────────────────────────────────────────────
  // 1. Dynamic Hero Slider — 4 Slides
  // ──────────────────────────────────────────────────────────────
  const heroSlides = [
    // Dot 1 — Today's Adventure (Lesson Overview)
    {
      tag: activeLessonData.heroSlide?.tag || "Today's Adventure",
      title: activeLessonData.title,
      subtitle:
        activeLessonData.heroSlide?.subtitle ||
        `Dive into ${activeLessonData.title}! Discover core concepts through interactive visuals and step-by-step guided learning designed just for you.`,
      ctaText: "Start Learning →",
      ctaUrl: architectureUrl,
      visualizerKey:
        activeLessonData.heroSlide?.visualizerKey || activeLessonData.id,
      visualizerData:
        activeLessonData.heroSlide?.visualizerData || { number: 123 },
      activityType: "architecture",
      xpReward: xpAward,
      gemsReward: gemAward,
    },

    // Dot 2 — Story & Interactive Simulation
    {
      tag: "Story & Interactive Simulation",
      title: `Story & Simulation`,
      subtitle: `✦ Understand the concept visually ✦ Learn through real-life examples ✦ Improve logical thinking ✦ Interactive exploration ✦ Better concept retention`,
      ctaText: isArchCompleted
        ? "Launch Simulation ✓ (Completed)"
        : `Launch Story & Simulation`,
      ctaUrl: architectureUrl,
      visualizerKey: "symmetry",
      visualizerData:
        activeLessonData.heroSlide?.visualizerData || { number: 246 },
      activityType: "architecture",
      xpReward: xpAward,
      gemsReward: gemAward,
    },

    // Dot 3 — Practice Challenge
    {
      tag: "Practice Challenge",
      title: "Practice Challenge",
      subtitle: `Put your knowledge to the test! ✦ Interactive questions ✦ Instant feedback ✦ Accuracy improvement ✦ Confidence building`,
      ctaText: isPracticeCompleted
        ? "Practice Again ✓ (Completed)"
        : "Start Practice (+30 XP) 🏆",
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
      subtitle: `Lesson: ${isLessonCompleted ? "Completed ✓" : "In Progress"} | Earned XP: ${xpPoints} | Gems: ${learningGems} | Completion: ${completionPct}% | Activities Done: ${completedCount}/4`,
      ctaText: isEdunotesCompleted
        ? "Review Reflection ✓ (Completed)"
        : "Review Reflection (+20 XP) 📖",
      ctaUrl: edunotesUrl,
      visualizerKey: "time",
      visualizerData: { number: 789 },
      activityType: "reflection",
      xpReward: 20,
      gemsReward: 0,
    },
  ];

  const handleHeroCtaClick = (
    slide: DashboardHeroSlide,
    _slideIndex?: number
  ) => {
    if (slide.activityType) {
      completeActivity(
        activeLessonData.id,
        slide.activityType,
        slide.xpReward || 0,
        slide.gemsReward || 0
      );
    }
  };

  const totalTopics = curriculum
    ? curriculum.chapters.reduce((a, c) => a + c.topics.length, 0)
    : 0;
  // ── action cards for learning grid ─────────────────────────────────────────
  const mappedCards = [
    {
      id: "card_edunotes", activityType: "edunotes",
      title: "EduNotes", subtitle: "Learn, Practice, Win!",
      description: `Clear, concise notes for ${activeLessonData.title}.`,
      icon: "📖", buttonColor: "purple" as const,
      targetUrl: edunotesUrl, enabled: true, isCompleted: isEdunotesCompleted,
      xpReward: 20, gemsReward: 0,
    },
    {
      id: "card_architecture", activityType: "architecture",
      title: `Architecture of ${activeLessonData.title}`, subtitle: "Visual Concepts",
      description: `Interactive 3D breakdown. Earn +${xpAward} XP & +${gemAward} Gems!`,
      icon: "🧊", buttonColor: "blue" as const,
      targetUrl: architectureUrl, enabled: true, isCompleted: isArchCompleted,
      xpReward: xpAward, gemsReward: gemAward,
    },
    {
      id: "card_video", activityType: "video",
      title: `Video: ${activeLessonData.title}`, subtitle: "Watch & Learn",
      description: `Step-by-step video lesson on ${activeLessonData.title}.`,
      icon: "▶", buttonColor: "orange" as const,
      targetUrl: videoUrl, enabled: true, isCompleted: isVideoCompleted,
      xpReward: 10, gemsReward: 0,
    },
    {
      id: "card_practice", activityType: "practice",
      title: `Practice: ${activeLessonData.title}`, subtitle: "Interactive Exercises",
      description: "Fun exercises with instant rewards!",
      icon: "🏆", buttonColor: "accent" as const,
      targetUrl: practiceUrl, enabled: true, isCompleted: isPracticeCompleted,
      xpReward: 30, gemsReward: 0,
    },
  ];

  const handleCardClick = (card: { activityType?: string; xpReward?: number; gemsReward?: number }) => {
    if (card.activityType) {
      completeActivity(activeLessonData.id, card.activityType, card.xpReward ?? 0, card.gemsReward ?? 0);
    }
  };

  // ── fake chart bars driven by completedLessons count ───────────────────────
  const base = Math.max(completedLessons.length, 1);
  const chartBars = [
    Math.round(base * 0.5), Math.round(base * 0.7), Math.round(base * 0.6),
    Math.round(base * 0.9), Math.round(base * 0.8), Math.round(base * 1.1),
    Math.round(base * 1.0), Math.round(base * 1.3), Math.round(base * 1.2),
    Math.round(base * 1.5), Math.round(base * 1.4), Math.round(base * 1.8),
    Math.round(base * 1.6), Math.round(base * 2.0), Math.round(base * 1.9),
    Math.round(base * 2.2), Math.round(base * 2.1), Math.round(base * 2.4),
    Math.round(base * 2.3), Math.round(base * 2.6), Math.round(base * 2.5),
    Math.round(base * 2.8), Math.round(base * 2.7), Math.round(base * 3.0),
    Math.round(base * 2.9), Math.round(base * 3.2), Math.round(base * 3.1),
    Math.round(base * 3.5), Math.round(base * 3.4), Math.round(base * 3.7),
    Math.round(base * 3.6),
  ];
  const maxBar = Math.max(...chartBars);
  const peakIdx = chartBars.indexOf(maxBar);

  // ── donut distribution ──────────────────────────────────────────────────────
  const donutSegments = [
    { label: "Completed", pct: completionPct || 5, count: completedLessons.length, color: "#f97316" },
    { label: "In Progress", pct: Math.max(20, 100 - completionPct - 15), count: Math.max(1, totalTopics - completedLessons.length - 2), color: "#7c3aed" },
    { label: "Locked", pct: Math.min(15, 100 - completionPct), count: Math.max(2, totalTopics - completedLessons.length), color: "#e5e7eb" },
    { label: "Skipped", pct: 5, count: 0, color: "#fb923c" },
  ];
  // normalise so they sum to 100
  const sumPct = donutSegments.reduce((a, s) => a + s.pct, 0);
  const normSegments = donutSegments.map((s) => ({ ...s, pct: Math.round((s.pct / sumPct) * 100) }));

  // ── health items ────────────────────────────────────────────────────────────
  const healthItems = [
    { label: "Lessons Completed", status: "Operational", ms: completedLessons.length + " done", color: "#10b981" },
    { label: "XP Earned", status: "Operational", ms: xpPoints + " XP", color: "#10b981" },
    { label: "Learning Gems", status: "Operational", ms: learningGems + " 💎", color: "#10b981" },
    { label: "Day Streak", status: "Operational", ms: streakDays + " days", color: "#10b981" },
    { label: "Current Lesson", status: "Active", ms: activeLessonData.title.slice(0, 18), color: "#f97316" },
    { label: "AI Tutor", status: "Operational", ms: "Ready", color: "#10b981" },
  ];

  // ── top performing topics (by chapter) ─────────────────────────────────────
  const topChapters = (curriculum?.chapters ?? []).slice(0, 4).map((ch, i) => ({
    rank: i + 1,
    name: ch.title,
    sub: `${ch.topicsCount} topics`,
    value: `${ch.topics.filter((t) => completedLessons.includes(t.id)).length} done`,
    emoji: ["🥇", "🥈", "🥉", "4️⃣"][i],
  }));

  // ── recent activity feed ────────────────────────────────────────────────────
  const recentActivity = [
    { text: <>Lesson <strong>{activeLessonData.title}</strong> is your current focus</>, time: "Now" },
    { text: <><strong>{completedLessons.length} lesson{completedLessons.length !== 1 ? "s" : ""}</strong> completed so far</>, time: "Today" },
    { text: <><strong>{xpPoints} XP</strong> earned across all activities</>, time: "Session" },
    { text: <><strong>{streakDays}-day streak</strong> — keep it going!</>, time: "Daily" },
    { text: <><strong>{learningGems} Gems</strong> unlocked through activities</>, time: "Total" },
  ];

  // ── quick actions ───────────────────────────────────────────────────────────
  const quickActions = [
    { icon: "📖", label: "EduNotes", color: "#7c3aed", bg: "rgba(124,58,237,.12)", href: edunotesUrl },
    { icon: "🧊", label: "Start Lesson", color: "#f97316", bg: "rgba(249,115,22,.12)", href: architectureUrl },
    { icon: "▶", label: "Watch Video", color: "#3b82f6", bg: "rgba(59,130,246,.12)", href: videoUrl || "#" },
    { icon: "🏆", label: "Practice", color: "#10b981", bg: "rgba(16,185,129,.12)", href: practiceUrl },
    { icon: "🎖", label: "Badges", color: "#f59e0b", bg: "rgba(245,158,11,.12)", href: "/student/rewards" },
    { icon: "📊", label: "Progress", color: "#ec4899", bg: "rgba(236,72,153,.12)", href: "/student/leaderboard" },
    { icon: "📝", label: "Worksheets", color: "#06b6d4", bg: "rgba(6,182,212,.12)", href: "/student/worksheets" },
    { icon: "👤", label: "Profile", color: "#64748b", bg: "rgba(100,116,139,.12)", href: "/student/profile" },
  ];

  const xAxisLabels = ["1 May", "6 May", "11 May", "16 May", "21 May", "26 May", "31 May"];

  return (
    <div className="student-dashboard-page">

      {/* ── Hero Banner / 4-Slide Hero Section ─────────────────────────────── */}
      <HeroSectionContainer
        slides={heroSlides}
        activeLessonId={activeLessonData.id}
        onCtaClick={handleHeroCtaClick}
      />

      {/* ── Stat Cards Row ──────────────────────────────────────────────────── */}
      <div className="db-stat-row">
        <StatCard icon="📚" label="Lessons Done" value={String(completedLessons.length)}
          change="vs last week" changeDir="up" vs="Total Topics"
          barColor="#f97316"
          bars={[2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, completedLessons.length || 1]} />
        <StatCard icon="⭐" label="XP Points" value={xpPoints.toLocaleString()}
          change="earning" changeDir="up" vs="This session"
          barColor="#7c3aed"
          bars={[10, 20, 15, 30, 25, 40, 35, 50, 45, 60, 55, 70, xpPoints || 1]} />
        <StatCard icon="💎" label="Learning Gems" value={String(learningGems)}
          change="collected" changeDir="up" vs="All time"
          barColor="#3b82f6"
          bars={[1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, learningGems || 1]} />
        <StatCard icon="🔥" label="Day Streak" value={`${streakDays} days`}
          change="consecutive" changeDir="up" vs="Keep it going!"
          barColor="#f59e0b"
          bars={[1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, streakDays || 1]} />
        <StatCard icon="📖" label="Activities Done" value={`${completedCount}/4`}
          change={`${completionPct}%`} changeDir="up" vs="This lesson"
          barColor="#10b981"
          bars={[0, 0, 1, 1, 2, 2, 3, 3, completedCount || 0]} />
        <StatCard icon="🗂" label="Total Topics" value={String(totalTopics)}
          change="curriculum" changeDir="up" vs="Available"
          barColor="#ec4899"
          bars={[2, 4, 6, 8, 10, 12, 14, 16, totalTopics || 1]} />
      </div>

      {/* ── Middle Row: chart + donut + health ──────────────────────────────── */}
      <div className="db-mid-row">

        {/* Line chart */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">
              <span className="db-panel-title-icon">📈</span>
              Learning Progress
            </span>
            <select style={{ fontSize: 12, border: "1px solid var(--color-border)", borderRadius: 6, padding: "3px 8px", color: "var(--color-text-secondary)", background: "#fff", cursor: "pointer" }}>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="db-panel-body">
            <div className="db-chart-summary">
              <span className="db-chart-total">{xpPoints.toLocaleString()}</span>
              <span className="db-chart-sub">Total XP Earned</span>
              <span className="db-chart-change">↑ Keep it up!</span>
            </div>
            <div className="db-chart-canvas">
              {chartBars.map((h, i) => (
                <div
                  key={i}
                  className={`db-chart-bar${i === peakIdx ? " highlight" : ""}`}
                  style={{ height: `${Math.max(8, Math.round((h / maxBar) * 90))}%` }}
                  title={`Day ${i + 1}: ${h} XP`}
                />
              ))}
            </div>
            <div className="db-chart-x-labels">
              {xAxisLabels.map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">
              <span className="db-panel-title-icon">🍩</span>
              Lesson Distribution
            </span>
            <button className="db-panel-action">View All</button>
          </div>
          <div className="db-panel-body">
            <DonutChart segments={normSegments} />
          </div>
        </div>

        {/* Health / Status */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">
              <span className="db-panel-title-icon">💚</span>
              Progress Health
            </span>
            <button className="db-panel-action">View All</button>
          </div>
          <div className="db-panel-body" style={{ padding: "8px 20px 16px" }}>
            <div className="db-health-list">
              {healthItems.map((item) => (
                <div key={item.label} className="db-health-item">
                  <div className="db-health-left">
                    <div className="db-health-dot" style={{ background: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="db-health-status" style={{ color: item.color }}>{item.status}</span>
                  <span className="db-health-ms">{item.ms}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ──────────────────────────────────────────────────────── */}
      <div className="db-bottom-row">

        {/* Top chapters */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">
              <span className="db-panel-title-icon">🏆</span>
              Chapter Progress
            </span>
            <button className="db-panel-action">View All</button>
          </div>
          <div className="db-panel-body" style={{ padding: "8px 20px 16px" }}>
            <div className="db-top-list">
              {topChapters.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>No chapters loaded.</p>
              ) : (
                topChapters.map((ch, i) => (
                  <div key={ch.name} className="db-top-list-item">
                    <div className={`db-top-list-rank ${["gold", "silver", "bronze", ""][i] || ""}`}>
                      {ch.emoji}
                    </div>
                    <div className="db-top-list-avatar">{ch.name[0]}</div>
                    <div className="db-top-list-info">
                      <div className="db-top-list-name">{ch.name}</div>
                      <div className="db-top-list-sub">{ch.sub}</div>
                    </div>
                    <div className="db-top-list-value">{ch.value}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">
              <span className="db-panel-title-icon">🕐</span>
              Recent Activity
            </span>
            <button className="db-panel-action">View All</button>
          </div>
          <div className="db-panel-body" style={{ padding: "8px 20px 16px" }}>
            <div className="db-activity-feed">
              {recentActivity.map((a, i) => (
                <div key={i} className="db-activity-item">
                  <div className="db-activity-dot" style={{ background: i === 0 ? "#f97316" : "#7c3aed" }} />
                  <div className="db-activity-text">{a.text}</div>
                  <span className="db-activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">
              <span className="db-panel-title-icon">⚡</span>
              Quick Actions
            </span>
          </div>
          <div className="db-panel-body">
            <div className="db-quick-actions">
              {quickActions.map((qa) => (
                <a key={qa.label} className="db-quick-action-btn" href={qa.href} style={{ textDecoration: "none" }}>
                  <div className="db-quick-action-icon" style={{ background: qa.bg }}>
                    <span style={{ fontSize: "1.1rem" }}>{qa.icon}</span>
                  </div>
                  <span className="db-quick-action-label">{qa.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lesson Activity Cards ────────────────────────────────────────────── */}
      <div className="db-panel">
        <div className="db-panel-header">
          <span className="db-panel-title">
            <span className="db-panel-title-icon">🎯</span>
            Today&apos;s Activities — {activeLessonData.title}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {completedCount}/4 completed ({completionPct}%)
          </span>
        </div>
        <div className="db-panel-body">
          <LearningGridContainer cards={mappedCards} onCardClick={handleCardClick} />
        </div>
      </div>

      {/* ── Lesson Navigation ───────────────────────────────────────────────── */}
      <BottomNavigationContainer onPrevious={goToPrevLesson} onNext={goToNextLesson} />

    </div>
  );
}