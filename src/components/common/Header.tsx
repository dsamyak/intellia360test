"use client";

import React from "react";
import { useStudentContext } from "@/context/StudentContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { currentGrade } = useStudentContext();
  const { user } = useAuth();

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });

  const gradeLabel = currentGrade.replace("grade", "Grade ").trim();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-path">
            {user?.name ?? "Student"} / Dashboard
          </span>
          <span className="header-breadcrumb-title">Dashboard</span>
        </div>
      </div>

      <div className="header-right">
        {/* Date pill */}
        <div className="header-date-pill">
          📅 {dateLabel} ▾
        </div>

        {/* Theme toggle placeholder */}
        <button className="header-icon-btn" aria-label="Toggle theme" title="Toggle theme">
          🌙
        </button>

        {/* Notifications */}
        <button className="header-icon-btn" aria-label="Notifications" title="Notifications">
          🔔
          <span className="header-notif-dot" />
        </button>

        {/* Grade badge */}
        <div
          style={{
            padding:      "5px 12px",
            background:   "rgba(249,115,22,.10)",
            border:       "1px solid rgba(249,115,22,.30)",
            borderRadius: "var(--radius-pill)",
            fontSize:     "12px",
            fontWeight:   600,
            color:        "#f97316",
          }}
        >
          {gradeLabel}
        </div>

        {/* Avatar */}
        <div className="header-avatar" title={user?.name ?? "Profile"}>
          {initials}
        </div>
      </div>
    </header>
  );
}
