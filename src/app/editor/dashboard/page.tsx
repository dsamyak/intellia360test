"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Stats {
  totalGrades: number;
  totalLessons: number;
  totalUsers: number;
  usersByRole: Record<string, number>;
  gradesWithNoLessons: string[];
}

const QUICK_ACTIONS = [
  { icon: "🎓", label: "Manage Grades",     href: "/editor/grades",     color: "#f97316" },
  { icon: "📝", label: "Edit Lessons",      href: "/editor/lessons",    color: "#7c3aed" },
  { icon: "🗂", label: "Curriculum JSON",   href: "/editor/curriculum", color: "#3b82f6" },
  { icon: "📚", label: "Courses",           href: "/editor/courses",    color: "#10b981" },
  { icon: "👥", label: "Manage Users",      href: "/editor/users",      color: "#ec4899" },
  { icon: "👁", label: "Preview Student",   href: "/student/dashboard", color: "#f59e0b" },
];

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "#3b82f6",
  TEACHER: "#10b981",
  EDITOR:  "#7c3aed",
  ADMIN:   "#f97316",
  PARENT:  "#06b6d4",
  SCHOOL:  "#ec4899",
};

export default function EditorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/editor/stats")
      .then((r) => r.json())
      .then((j) => { if (j.success) setStats(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="ed-page">
      {/* Welcome banner */}
      <div className="ed-welcome-banner">
        <div className="ed-welcome-text">
          <h1 className="ed-welcome-title">
            {greeting}, {user?.name?.split(" ")[0] ?? "Editor"} 👋
          </h1>
          <p className="ed-welcome-sub">
            Manage grades, lessons, and curriculum content for the Intellia360 platform.
          </p>
        </div>
        <div className="ed-welcome-badge">
          <span>✏️</span>
          <span>Content Editor</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="ed-stat-grid">
        {[
          { icon: "🎓", label: "Grades",   value: loading ? "…" : stats?.totalGrades  ?? 0, color: "#f97316", href: "/editor/grades" },
          { icon: "📝", label: "Lessons",  value: loading ? "…" : stats?.totalLessons ?? 0, color: "#7c3aed", href: "/editor/lessons" },
          { icon: "👥", label: "Users",    value: loading ? "…" : stats?.totalUsers   ?? 0, color: "#3b82f6", href: "/editor/users" },
          { icon: "⚠️", label: "Empty Grades", value: loading ? "…" : stats?.gradesWithNoLessons?.length ?? 0, color: "#ef4444", href: "/editor/grades" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="ed-stat-card" style={{ textDecoration: "none" }}>
            <div className="ed-stat-icon" style={{ background: `${s.color}18` }}>
              <span>{s.icon}</span>
            </div>
            <div className="ed-stat-value">{String(s.value)}</div>
            <div className="ed-stat-label">{s.label}</div>
            <div className="ed-stat-arrow" style={{ color: s.color }}>→</div>
          </Link>
        ))}
      </div>

      {/* Two-column row */}
      <div className="ed-mid-row">
        {/* Quick actions */}
        <div className="ed-panel">
          <div className="ed-panel-header">
            <span className="ed-panel-title">⚡ Quick Actions</span>
          </div>
          <div className="ed-panel-body">
            <div className="ed-action-grid">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.href} href={a.href} className="ed-action-btn" style={{ textDecoration: "none" }}>
                  <div className="ed-action-icon" style={{ background: `${a.color}18`, color: a.color }}>
                    {a.icon}
                  </div>
                  <span className="ed-action-label">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Users by role */}
        <div className="ed-panel">
          <div className="ed-panel-header">
            <span className="ed-panel-title">👥 Users by Role</span>
            <Link href="/editor/users" className="ed-panel-link">Manage →</Link>
          </div>
          <div className="ed-panel-body">
            {loading ? (
              <div className="ed-empty">Loading…</div>
            ) : stats?.usersByRole ? (
              <div className="ed-role-list">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="ed-role-row">
                    <div className="ed-role-dot" style={{ background: ROLE_COLORS[role] ?? "#9ca3af" }} />
                    <span className="ed-role-name">{role}</span>
                    <span className="ed-role-count">{count}</span>
                    <div className="ed-role-bar-wrap">
                      <div
                        className="ed-role-bar"
                        style={{
                          width: `${Math.min(100, Math.round((count / (stats.totalUsers || 1)) * 100))}%`,
                          background: ROLE_COLORS[role] ?? "#9ca3af",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ed-empty">No data</div>
            )}
          </div>
        </div>

        {/* Grades needing content */}
        <div className="ed-panel">
          <div className="ed-panel-header">
            <span className="ed-panel-title">⚠️ Grades Needing Lessons</span>
            <Link href="/editor/grades" className="ed-panel-link">Fix →</Link>
          </div>
          <div className="ed-panel-body">
            {loading ? (
              <div className="ed-empty">Loading…</div>
            ) : (stats?.gradesWithNoLessons?.length ?? 0) === 0 ? (
              <div className="ed-success-msg">✅ All grades have lesson content</div>
            ) : (
              <div className="ed-warn-list">
                {stats!.gradesWithNoLessons.map((g) => (
                  <Link key={g} href={`/editor/lessons?grade=${g}`} className="ed-warn-item">
                    <span className="ed-warn-icon">📂</span>
                    <span>{g.replace("grade", "Grade ")}</span>
                    <span className="ed-warn-badge">0 lessons</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
