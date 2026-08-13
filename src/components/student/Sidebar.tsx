"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudentContext } from "@/context/StudentContext";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "⊞",  label: "Dashboard",       href: "/student/dashboard" },
  { icon: "📚", label: "Courses",          href: "/student/courses" },
  { icon: "🧭", label: "Leaderboard",      href: "/student/leaderboard" },
  { icon: "📝", label: "Worksheets",       href: "/student/worksheets" },
  { icon: "🎯", label: "Quizzes",          href: "/student/quiz/practice-1" },
  { icon: "🎖", label: "Rewards",          href: "/student/rewards" },
  { icon: "👤", label: "Profile",          href: "/student/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentGrade, setCurrentGrade, xpPoints, streakDays } = useStudentContext();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  return (
    <aside
      className="student-sidebar-container"
      style={{ width: collapsed ? 64 : 240, minWidth: collapsed ? 64 : 240, transition: "width .2s ease" }}
    >
      {/* ── Logo area ─────────────────────────────────────────────────────── */}
      <div className="sidebar-logo-area">
        <div className="sidebar-logo-badge">360</div>
        {!collapsed && <span className="sidebar-logo-text">intellia<span>360</span></span>}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "rgba(255,255,255,.45)", cursor: "pointer", fontSize: "0.85rem",
            padding: "2px 4px",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="sidebar-nav">
        {!collapsed && (
          <span className="sidebar-section-label">Main Menu</span>
        )}

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item${active ? " active" : ""}`}
              title={collapsed ? item.label : undefined}
              style={{ justifyContent: collapsed ? "center" : undefined, padding: collapsed ? "9px 0" : undefined }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: 8 }}>
              Learning
            </span>

            {/* Grade selector inline */}
            <div style={{ padding: "4px 8px" }}>
              <label
                style={{ fontSize: "10px", color: "rgba(255,255,255,.4)", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 5 }}
              >
                Current Grade
              </label>
              <select
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value)}
                style={{
                  width: "100%", padding: "7px 10px",
                  background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 8, color: "#fff", fontSize: "12px", cursor: "pointer",
                  outline: "none", fontFamily: "inherit",
                }}
              >
                {["grade1","grade2","grade3","grade4","grade5","grade7","grade10"].map((g) => (
                  <option key={g} value={g} style={{ background: "#1e1b4b" }}>
                    {g.replace("grade","Grade ")}
                  </option>
                ))}
              </select>
            </div>

            {/* XP pill */}
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", background: "rgba(255,255,255,.05)",
                borderRadius: 8, margin: "4px 0",
              }}
            >
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,.55)" }}>⭐ XP Points</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#fb923c" }}>{xpPoints.toLocaleString()}</span>
            </div>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", background: "rgba(255,255,255,.05)",
                borderRadius: 8, margin: "4px 0",
              }}
            >
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,.55)" }}>🔥 Streak</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#fb923c" }}>{streakDays} days</span>
            </div>
          </>
        )}
      </nav>

      {/* ── Upgrade card ──────────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="sidebar-upgrade-card">
          <div style={{ fontSize: "1rem", marginBottom: 4 }}>⭐</div>
          <div className="sidebar-upgrade-title">Upgrade to Pro</div>
          <div className="sidebar-upgrade-desc">
            Unlock advanced AI tutoring and detailed analytics.
          </div>
          <button className="sidebar-upgrade-btn">Upgrade Now →</button>
        </div>
      )}

      {/* ── User footer ───────────────────────────────────────────────────── */}
      <div className="sidebar-user-footer">
        <div className="sidebar-user-avatar">{initials}</div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? "Student"}</div>
            <div className="sidebar-user-role">
              {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "Student"}
            </div>
          </div>
        )}
        <button
          className="sidebar-logout-btn"
          onClick={() => logout()}
          title="Logout"
          aria-label="Logout"
        >
          →
        </button>
      </div>
    </aside>
  );
}
