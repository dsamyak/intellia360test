"use client";

import React, { useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ReusableTable, {
  ColumnDef,
} from "@/components/admin/ReusableTable";
import { mockTeachers, TeacherRow } from "@/data/admin/tables";
import {
  GraduationCap,
  UserCheck,
  Clock,
} from "@/components/admin/icons";

export default function AdminTeachersPage() {
  // =========================
  // Dynamic Teacher Statistics
  // =========================
  const teacherStats = useMemo(() => {
    const totalTeachers = mockTeachers.length;

    const activeTeachers = mockTeachers.filter(
      (teacher) => teacher.status === "Active"
    ).length;

    const pendingTeachers = mockTeachers.filter(
      (teacher) => teacher.status === "Pending"
    ).length;

    // Handles any status other than Active/Pending
    const inactiveTeachers = mockTeachers.filter(
      (teacher) =>
        teacher.status !== "Active" &&
        teacher.status !== "Pending"
    ).length;

    const totalClasses = mockTeachers.reduce(
      (total, teacher) =>
        total + Number(teacher.classesCount || 0),
      0
    );

    const activeRate =
      totalTeachers > 0
        ? Math.round((activeTeachers / totalTeachers) * 100)
        : 0;

    return {
      totalTeachers,
      activeTeachers,
      pendingTeachers,
      inactiveTeachers,
      totalClasses,
      activeRate,
    };
  }, []);

  // =========================
  // Table Columns
  // =========================
  const teacherColumns: ColumnDef<TeacherRow>[] = [
    {
      header: "Teacher Name",
      accessor: (row: TeacherRow) => (
        <div className="flex items-center gap-3">
          <div className="teacher-avatar">
            <GraduationCap className="w-5 h-5" />
          </div>

          <div>
            <div className="font-semibold text-slate-900">
              {row.name}
            </div>

            <div className="text-xs text-slate-500">
              {row.email}
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
      header: "Subject",
      accessor: "subject",
    },

    {
      header: "Active Classes",
      accessor: (row: TeacherRow) => (
        <span className="font-semibold text-slate-700">
          {row.classesCount ?? 0}
        </span>
      ),
    },

    {
      header: "Status",
      accessor: (row: TeacherRow) => {
        const statusClass =
          row.status === "Active"
            ? "active"
            : row.status === "Pending"
              ? "pending"
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
      <div className="admin-teachers-page">

        {/* =========================
            Page Header
        ========================= */}
        <div className="admin-page-header">
          <div>
            <div className="admin-breadcrumb">
              Admin / Teachers
            </div>

            <h1 className="admin-page-title">
              Teachers
            </h1>

            <p className="admin-page-subtitle">
              Manage teacher accounts, subjects, classes and
              approval status across the platform.
            </p>
          </div>

          <button
            className="admin-primary-button"
            onClick={() =>
              alert("Invite Teacher modal will open here.")
            }
          >
            + Invite Teacher
          </button>
        </div>

        {/* =========================
            Statistics
        ========================= */}
        <div className="teacher-stats-grid">

          {/* Total Teachers */}
          <div className="teacher-stat-card">
            <div className="teacher-stat-icon purple">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div className="teacher-stat-content">
              <span>Total Teachers</span>
              <strong>
                {teacherStats.totalTeachers.toLocaleString()}
              </strong>
              <small>
                Registered educators
              </small>
            </div>
          </div>

          {/* Active Teachers */}
          <div className="teacher-stat-card">
            <div className="teacher-stat-icon green">
              <UserCheck className="w-6 h-6" />
            </div>

            <div className="teacher-stat-content">
              <span>Active Educators</span>
              <strong>
                {teacherStats.activeTeachers.toLocaleString()}
              </strong>
              <small className="success-text">
                {teacherStats.activeRate}% active rate
              </small>
            </div>
          </div>

          {/* Pending Teachers */}
          <div className="teacher-stat-card">
            <div className="teacher-stat-icon orange">
              <Clock className="w-6 h-6" />
            </div>

            <div className="teacher-stat-content">
              <span>Awaiting Approval</span>
              <strong>
                {teacherStats.pendingTeachers.toLocaleString()}
              </strong>
              <small>
                Pending verification
              </small>
            </div>
          </div>

          {/* Classes */}
          <div className="teacher-stat-card">
            <div className="teacher-stat-icon blue">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div className="teacher-stat-content">
              <span>Active Classes</span>
              <strong>
                {teacherStats.totalClasses.toLocaleString()}
              </strong>
              <small>
                Across all teachers
              </small>
            </div>
          </div>
        </div>

        {/* =========================
            Teacher Directory
        ========================= */}
        <div className="teacher-directory-card">

          <ReusableTable
            title="Teacher Roster & Approvals"
            subtitle="Manage educator accounts, class assignments, subject specializations and approval status."
            data={mockTeachers}
            columns={teacherColumns}
            searchPlaceholder="Search teacher by name, email or school..."
            primaryActionLabel="Invite Teacher"
            onPrimaryAction={() =>
              alert("Invite Teacher modal will open here.")
            }
          />

        </div>
      </div>
    </AdminLayout>
  );
}