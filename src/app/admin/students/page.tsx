"use client";

import React, { useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ReusableTable, {
  ColumnDef,
} from "@/components/admin/ReusableTable";
import { mockStudents, StudentRow } from "@/data/admin/tables";
import {
  Users,
  Award,
  Zap,
} from "@/components/admin/icons";

export default function AdminStudentsPage() {
  /* =========================================
     Dynamic Student Statistics
  ========================================= */

  const studentStats = useMemo(() => {
    const totalStudents = mockStudents.length;

    const activeStudents = mockStudents.filter(
      (student) => student.status === "Active"
    ).length;

    const inactiveStudents = mockStudents.filter(
      (student) => student.status !== "Active"
    ).length;

    const totalXP = mockStudents.reduce(
      (total, student) =>
        total + Number(student.xpPoints || 0),
      0
    );

    const totalGems = mockStudents.reduce(
      (total, student) =>
        total + Number(student.gems || 0),
      0
    );

    const activeRate =
      totalStudents > 0
        ? Math.round((activeStudents / totalStudents) * 100)
        : 0;

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalXP,
      totalGems,
      activeRate,
    };
  }, []);

  /* =========================================
     Format Large Numbers
  ========================================= */

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const formatXP = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M XP`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K XP`;
    }

    return `${value.toLocaleString()} XP`;
  };

  /* =========================================
     Student Table Columns
  ========================================= */

  const studentColumns: ColumnDef<StudentRow>[] = [
    {
      header: "Student Name",
      accessor: (row: StudentRow) => (
        <div className="flex items-center gap-3">
          {/* Student Avatar */}
          <div className="student-avatar">
            <span>👦</span>
          </div>

          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-900">
              {row.name}
            </div>

            <div className="text-xs text-slate-500">
              {row.grade}
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "School",
      accessor: "school",
    },

    {
      header: "XP Earned",
      accessor: (row: StudentRow) => (
        <span className="student-xp-badge">
          <Zap className="h-3.5 w-3.5" />
          {Number(row.xpPoints || 0).toLocaleString()} XP
        </span>
      ),
    },

    {
      header: "Gems",
      accessor: (row: StudentRow) => (
        <span className="student-gems-badge">
          💎 {Number(row.gems || 0).toLocaleString()}
        </span>
      ),
    },

    {
      header: "Last Activity",
      accessor: "lastActive",
    },

    {
      header: "Status",
      accessor: (row: StudentRow) => {
        const statusClass =
          row.status === "Active"
            ? "active"
            : "inactive";

        return (
          <span className={`status-badge ${statusClass}`}>
            <span className="status-dot" />
            {row.status}
          </span>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-students-page">

        {/* =====================================
            Page Header
        ===================================== */}

        <div className="admin-page-header">
          <div>
            <div className="admin-breadcrumb">
              Admin / Students
            </div>

            <h1 className="admin-page-title">
              Students
            </h1>

            <p className="admin-page-subtitle">
              Monitor student engagement, XP, learning gems,
              activity and learning progress.
            </p>
          </div>

          <button
            className="admin-primary-button"
            onClick={() =>
              console.log("Add Student clicked")
            }
          >
            + Add Student
          </button>
        </div>

        {/* =====================================
            Dynamic Statistics
        ===================================== */}

        <div className="student-stats-grid">

          {/* Total Students */}
          <div className="student-stat-card">
            <div className="student-stat-icon orange">
              <Users className="h-6 w-6" />
            </div>

            <div className="student-stat-content">
              <span>Total Learners</span>

              <strong>
                {formatNumber(
                  studentStats.totalStudents
                )}
              </strong>

              <small>
                Registered students
              </small>
            </div>
          </div>

          {/* Active Students */}
          <div className="student-stat-card">
            <div className="student-stat-icon green">
              <Users className="h-6 w-6" />
            </div>

            <div className="student-stat-content">
              <span>Active Learners</span>

              <strong>
                {formatNumber(
                  studentStats.activeStudents
                )}
              </strong>

              <small className="success-text">
                {studentStats.activeRate}% active
              </small>
            </div>
          </div>

          {/* Total XP */}
          <div className="student-stat-card">
            <div className="student-stat-icon amber">
              <Zap className="h-6 w-6" />
            </div>

            <div className="student-stat-content">
              <span>Total XP Awarded</span>

              <strong>
                {formatXP(studentStats.totalXP)}
              </strong>

              <small>
                Learning experience points
              </small>
            </div>
          </div>

          {/* Total Gems */}
          <div className="student-stat-card">
            <div className="student-stat-icon purple">
              <Award className="h-6 w-6" />
            </div>

            <div className="student-stat-content">
              <span>Total Gems</span>

              <strong>
                {formatNumber(
                  studentStats.totalGems
                )}
              </strong>

              <small>
                Learning rewards
              </small>
            </div>
          </div>
        </div>

        {/* =====================================
            Student Overview
        ===================================== */}

        <div className="student-overview-grid">

          {/* Engagement */}
          <div className="student-overview-card">

            <div className="student-overview-header">
              <div>
                <span>Student Engagement</span>

                <strong>
                  {studentStats.activeRate}%
                </strong>
              </div>

              <div className="overview-icon green">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="student-progress">
              <div
                className="student-progress-fill"
                style={{
                  width: `${studentStats.activeRate}%`,
                }}
              />
            </div>

            <p>
              {studentStats.activeStudents.toLocaleString()}{" "}
              active learners out of{" "}
              {studentStats.totalStudents.toLocaleString()}
            </p>
          </div>

          {/* Gamification */}
          <div className="student-overview-card">

            <div className="student-overview-header">
              <div>
                <span>Gamification Activity</span>

                <strong>
                  {formatXP(studentStats.totalXP)}
                </strong>
              </div>

              <div className="overview-icon amber">
                <Zap className="h-5 w-5" />
              </div>
            </div>

            <p className="student-overview-description">
              Total XP earned by students across the
              platform.
            </p>
          </div>

          {/* Rewards */}
          <div className="student-overview-card">

            <div className="student-overview-header">
              <div>
                <span>Learning Rewards</span>

                <strong>
                  {formatNumber(
                    studentStats.totalGems
                  )}
                </strong>
              </div>

              <div className="overview-icon purple">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <p className="student-overview-description">
              Total learning gems earned by students.
            </p>
          </div>
        </div>

        {/* =====================================
            Student Directory
        ===================================== */}

        <div className="student-directory-card">
          <ReusableTable
            title="Student Directory & Gamification Records"
            subtitle="Monitor student engagement, XP points, learning gems, activity and course progression."
            data={mockStudents}
            columns={studentColumns}
            searchPlaceholder="Search student by name, grade or school..."
            primaryActionLabel="Add Student"
            onPrimaryAction={() =>
              console.log("Add Student clicked")
            }
          />
        </div>
      </div>
    </AdminLayout>
  );
}