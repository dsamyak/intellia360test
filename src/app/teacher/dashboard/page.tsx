"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ClassStats {
  className: string;
  grade: string;
  studentCount: number;
}

interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  averageCompletion: number;
  activeAssignments: number;
}

export default function TeacherDashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch teacher stats from the API
  useEffect(() => {
    fetch("/api/teacher/me")
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.success && j.data) {
          setStats({
            totalStudents:      j.data.totalStudents      ?? 0,
            totalClasses:       j.data.assignedClasses?.length ?? 0,
            averageCompletion:  j.data.averageCompletion  ?? 0,
            activeAssignments:  j.data.activeAssignments  ?? 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nav = [
    { icon: "⊞",  label: "Dashboard",    href: "/teacher/dashboard",   active: true  },
    { icon: "👥", label: "My Classes",    href: "/teacher/classes",     active: false },
    { icon: "📝", label: "Assignments",   href: "/teacher/assignments", active: false },
    { icon: "📊", label: "Analytics",     href: "/teacher/analytics",   active: false },
    { icon: "🤖", label: "AI Planner",    href: "/teacher/ai-planner",  active: false },
    { icon: "👤", label: "Profile",       href: "/teacher/profile",     active: false },
  ];

  const statCards = [
    { icon: "👥", label: "Total Students", value: loading ? "…" : String(stats?.totalStudents ?? 0),    color: "#f97316", bg: "rgba(249,115,22,.10)" },
    { icon: "🏫", label: "My Classes",     value: loading ? "…" : String(stats?.totalClasses ?? 0),     color: "#7c3aed", bg: "rgba(124,58,237,.10)" },
    { icon: "📈", label: "Avg Completion", value: loading ? "…" : `${stats?.averageCompletion ?? 0}%`, color: "#10b981", bg: "rgba(16,185,129,.10)" },
    { icon: "📝", label: "Assignments",    value: loading ? "…" : String(stats?.activeAssignments ?? 0), color: "#3b82f6", bg: "rgba(59,130,246,.10)" },
  ];

  const quickLinks = [
    { icon: "➕", label: "New Assignment",  href: "/teacher/assignments" },
    { icon: "👥", label: "View Classes",    href: "/teacher/classes"     },
    { icon: "📊", label: "Analytics",       href: "/teacher/analytics"   },
    { icon: "🤖", label: "AI Lesson Plan",  href: "/teacher/ai-planner"  },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa", fontFamily: "var(--font-family-primary, Inter, sans-serif)" }}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside style={{ width: 220, background: "#1e1b4b", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem", fontWeight: 900, color: "#fff", flexShrink: 0 }}>360</div>
          <span style={{ fontSize: ".9rem", fontWeight: 800, color: "#fff", letterSpacing: "-.3px" }}>
            intellia<span style={{ color: "#f97316" }}>360</span>
            <small style={{ display: "block", fontSize: ".63rem", fontWeight: 600, color: "rgba(255,255,255,.4)", letterSpacing: ".06em", textTransform: "uppercase" }}>Teacher</small>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8,
              fontSize: ".85rem", fontWeight: item.active ? 600 : 500, textDecoration: "none",
              background: item.active ? "rgba(249,115,22,.20)" : "none",
              color: item.active ? "#f97316" : "rgba(255,255,255,.70)",
            }}>
              <span style={{ width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() ?? "T"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name ?? "Teacher"}</div>
            <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.4)" }}>Teacher</div>
          </div>
          <button onClick={() => logout()} title="Logout"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: ".85rem" }}>→</button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ height: 64, background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Teacher / Dashboard</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e1b4b", lineHeight: 1.2 }}>Dashboard</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: "5px 12px", background: "rgba(249,115,22,.10)", border: "1px solid rgba(249,115,22,.25)", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#f97316" }}>
              Teacher
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".85rem", fontWeight: 700, color: "#fff" }}>
              {user?.name?.[0]?.toUpperCase() ?? "T"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Welcome */}
          <div style={{ background: "linear-gradient(120deg,#1e1b4b,#4c1d95)", borderRadius: 20, padding: "28px 32px", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,.10)" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-.02em" }}>
              Welcome back, {user?.name?.split(" ")[0] ?? "Teacher"} 👋
            </h1>
            <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.65)", margin: 0 }}>
              Here's a snapshot of your classes and student progress.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{s.icon}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1e1b4b", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: ".75rem", color: "#9ca3af", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick links + info row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Quick actions */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: ".88rem", fontWeight: 700, color: "#1e1b4b" }}>⚡ Quick Actions</span>
              </div>
              <div style={{ padding: "14px 18px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {quickLinks.map(q => (
                  <Link key={q.href} href={q.href} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "11px 12px",
                    borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none",
                    fontSize: ".82rem", fontWeight: 600, color: "#475569",
                    background: "#f9fafb", transition: "all .15s",
                  }}>
                    <span style={{ fontSize: "1rem" }}>{q.icon}</span> {q.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Getting started */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: ".88rem", fontWeight: 700, color: "#1e1b4b" }}>🚀 Getting Started</span>
              </div>
              <div style={{ padding: "14px 18px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { done: true,  text: "Account created & verified" },
                  { done: false, text: "Set up your first class",        href: "/teacher/classes"     },
                  { done: false, text: "Create an assignment",           href: "/teacher/assignments"  },
                  { done: false, text: "Review student progress",        href: "/teacher/analytics"    },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".82rem" }}>
                    <span style={{ fontSize: ".85rem" }}>{item.done ? "✅" : "⭕"}</span>
                    {item.href ? (
                      <Link href={item.href} style={{ color: item.done ? "#9ca3af" : "#f97316", fontWeight: 600, textDecoration: "none" }}>{item.text}</Link>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>{item.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Empty state for classes */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>👥</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e1b4b", margin: "0 0 6px" }}>No classes yet</h3>
            <p style={{ fontSize: ".85rem", color: "#9ca3af", margin: "0 0 16px" }}>
              Your classes and student activity will appear here once you have students enrolled.
            </p>
            <Link href="/teacher/classes" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: ".85rem", fontWeight: 700, boxShadow: "0 4px 12px rgba(249,115,22,.30)" }}>
              ➕ Set Up a Class
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
