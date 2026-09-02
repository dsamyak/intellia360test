"use client";

import React from "react";
import Link from "next/link";

import {
  useAdminDashboardData,
  useCountUp,
} from "@/data/admin/useAdminDashboardData";
import { computeHealthSummary } from "@/data/admin/dashboard";

import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
} from "@/components/admin/icons";

export default function AdminHero() {
  const {
    heroData,
    kpiStats,
    platformHealth,
    isLoading,
  } = useAdminDashboardData();

  /* ============================================================
     DYNAMIC HERO VALUES
  ============================================================ */

  const shownActiveUsers = useCountUp(
    heroData.activeUsersCount
  );

  const schoolsStat = kpiStats.find(
    (item) => item.id === "schools"
  );

  const teachersStat = kpiStats.find(
    (item) => item.id === "teachers"
  );

  const studentsStat = kpiStats.find(
    (item) => item.id === "students"
  );

  const shownSchools = useCountUp(
    schoolsStat?.value ?? 0
  );

  const shownTeachers = useCountUp(
    teachersStat?.value ?? 0
  );

  const shownStudents = useCountUp(
    studentsStat?.value ?? 0
  );

  /* ============================================================
     PLATFORM HEALTH
  ============================================================ */

  const { percentage: healthPercentage, status: healthStatus } =
    computeHealthSummary(platformHealth);

  return (
    <section
      className="
        relative
        rounded-2xl
        border
        border-slate-800/20
        shadow-2xl
        mb-6
      "
    >
      {/* ========================================================
          BACKGROUND LAYER — clipped separately so it can never
          crop hero content (cards, shadows, numbers) that grows
          taller than the min-height at any viewport width.
      ======================================================== */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              #0f172a 0%,
              rgba(15, 23, 42, 0.96) 35%,
              rgba(15, 23, 42, 0.75) 55%,
              rgba(15, 23, 42, 0.35) 75%,
              rgba(15, 23, 42, 0.15) 100%
            ),
            url("/assets/image.png")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* ========================================================
          HERO CONTENT CONTAINER (2-COLUMN GRID)
      ======================================================== */}
      <div className="relative z-10 w-full min-h-[420px] p-6 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">

        {/* LEFT COLUMN: TAGLINE, BUTTONS, FEATURE BADGES */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Platform Tag */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                px-3.5
                py-1.5
                mb-4
                rounded-full
                border
                border-orange-500/30
                bg-slate-900/70
                backdrop-blur-md
                text-orange-400
                text-[11px]
                font-extrabold
                tracking-[0.05em]
                uppercase
              "
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              PLATFORM OVERVIEW
            </div>

            {/* Heading */}
            <h2
              className="
                text-[32px]
                md:text-[38px]
                font-[900]
                leading-[1.1]
                tracking-tight
                text-white
              "
            >
              {heroData.tagline || "Manage. Monitor. Grow."}
              <br />
              <span
                className="
                  bg-gradient-to-r
                  from-orange-400
                  via-pink-400
                  to-purple-400
                  bg-clip-text
                  text-transparent
                  font-[900]
                "
              >
                Empowering education for all.
              </span>
            </h2>

            {/* Description */}
            <p
              className="
                mt-3.5
                max-w-[480px]
                text-[14px]
                md:text-[15px]
                leading-[1.6]
                text-slate-300
                font-medium
              "
            >
              {heroData.description ||
                "Track platform performance, manage schools and users, analyze insights and make data-driven decisions."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mt-6">
              <Link
                href="/admin/analytics"
                className="
                  inline-flex
                  items-center
                  gap-2.5
                  px-5
                  py-2.5
                  rounded-xl
                  bg-gradient-to-r
                  from-orange-500
                  to-pink-500
                  text-white
                  font-extrabold
                  text-[14px]
                  shadow-lg
                  shadow-orange-500/25
                  hover:opacity-95
                  transition-all
                  duration-200
                  no-underline
                "
              >
                View Analytics
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/admin/settings"
                className="
                  inline-flex
                  items-center
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-white/20
                  bg-slate-900/60
                  backdrop-blur-md
                  text-white
                  font-bold
                  text-[14px]
                  hover:bg-slate-800/80
                  transition-all
                  duration-200
                  no-underline
                "
              >
                Manage Platform
              </Link>
            </div>
          </div>

          {/* Feature Cards Bottom Row */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            {/* Insights */}
            <div
              className="
                flex
                items-center
                gap-2.5
                px-3.5
                py-2
                rounded-xl
                border
                border-white/10
                bg-slate-900/70
                backdrop-blur-md
              "
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-tight">
                  Real-time Insights
                </p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Live platform analytics
                </p>
              </div>
            </div>

            {/* Security */}
            <div
              className="
                flex
                items-center
                gap-2.5
                px-3.5
                py-2
                rounded-xl
                border
                border-white/10
                bg-slate-900/70
                backdrop-blur-md
              "
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-tight">
                  Secure & Reliable
                </p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Enterprise-grade security
                </p>
              </div>
            </div>

            {/* Control */}
            <div
              className="
                flex
                items-center
                gap-2.5
                px-3.5
                py-2
                rounded-xl
                border
                border-white/10
                bg-slate-900/70
                backdrop-blur-md
              "
            >
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-tight">
                  All-in-One Control
                </p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Manage everything easily
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FLOATING PLATFORM HEALTH & STAT CARDS */}
        <div className="lg:col-span-5 flex flex-col justify-between items-end space-y-6">
          
          {/* TOP RIGHT: PLATFORM HEALTH CARD */}
          <div className="w-full max-w-[290px] bg-white rounded-2xl p-4 shadow-xl border border-slate-100/80 backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-[12px] font-semibold text-slate-600 tracking-tight">
                  Platform Health
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-[32px] font-[900] text-slate-900 leading-none">
                {healthPercentage}%
              </div>
              
              {/* Green Sparkline Curve */}
              <div className="w-20 h-8">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 80 30" fill="none">
                  <path
                    d="M 0 25 Q 20 20, 35 15 T 60 10 T 80 5"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-500">
                {healthStatus}
              </span>
            </div>
          </div>

          {/* BOTTOM RIGHT: 3 STAT CARDS IN A ROW */}
          <div className="w-full grid grid-cols-3 gap-3">
            {/* SCHOOLS */}
            <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Schools
                </span>
              </div>

              <div className="mt-2 text-[20px] font-[800] text-slate-900 leading-tight">
                {shownSchools.toLocaleString("en-IN")}
              </div>
            </div>

            {/* TEACHERS */}
            <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Teachers
                </span>
              </div>

              <div className="mt-2 text-[20px] font-[800] text-slate-900 leading-tight">
                {shownTeachers.toLocaleString("en-IN")}
              </div>
            </div>

            {/* STUDENTS */}
            <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Students
                </span>
              </div>

              <div className="mt-2 text-[20px] font-[800] text-slate-900 leading-tight">
                {shownStudents.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}