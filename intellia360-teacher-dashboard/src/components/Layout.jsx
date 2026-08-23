import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Toast from "./Toast";

const PAGE_META = {
  "/": ["Dashboard", "Here's what's happening in your classroom today."],
  "/classes": ["My Classes", "Manage rosters, schedules, and class-level progress."],
  "/students": ["Students", "Search, filter, and drill into every learner's profile."],
  "/lessons": ["Lessons", "Browse and publish curriculum content by grade."],
  "/assignments": ["Assignments", "Create, assign, and track homework and worksheets."],
  "/reports": ["Reports & Analytics", "Engagement, completion, and at-risk trends."],
  "/attendance": ["Attendance", "Mark daily attendance for each class."],
  "/rewards": ["Rewards", "Badges, XP rules, and the class leaderboard."],
  "/messages": ["Messages", "Conversations with parents, students, and staff."],
  "/ai-assistant": ["AI Teaching Assistant", "Ask for insights, weak topics, and quick actions."],
  "/resources": ["Resources", "Shared teaching materials and downloads."],
  "/settings": ["Settings", "Your profile, notifications, and preferences."],
};

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const base = "/" + (pathname.split("/")[1] || "");
  const [title, subtitle] = PAGE_META[base] || PAGE_META[pathname] || ["Intellia360", ""];

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-[248px]">
        <Topbar title={title} subtitle={subtitle} onMenu={() => setOpen(true)} />
        <main className="px-4 sm:px-6 py-5 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
