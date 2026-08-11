"use client";

import React, { useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ReusableTable, {
  ColumnDef,
} from "@/components/admin/ReusableTable";
import { mockCourses, CourseRow } from "@/data/admin/tables";
import {
  BookOpen,
  Star,
  Users,
} from "@/components/admin/icons";

export default function AdminCoursesPage() {
  /* =========================================
     Dynamic Course Statistics
  ========================================= */

  const courseStats = useMemo(() => {
    const totalCourses = mockCourses.length;

    const publishedCourses = mockCourses.filter(
      (course) => course.status === "Published"
    ).length;

    const draftCourses = mockCourses.filter(
      (course) => course.status !== "Published"
    ).length;

    const totalLessons = mockCourses.reduce(
      (total, course) =>
        total + Number(course.lessonsCount || 0),
      0
    );

    const totalEnrollments = mockCourses.reduce(
      (total, course) =>
        total + Number(course.enrolledStudents || 0),
      0
    );

    const averageRating =
      totalCourses > 0
        ? mockCourses.reduce(
          (total, course) =>
            total + Number(course.rating || 0),
          0
        ) / totalCourses
        : 0;

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalLessons,
      totalEnrollments,
      averageRating,
    };
  }, []);

  /* =========================================
     Course Table Columns
  ========================================= */

  const courseColumns: ColumnDef<CourseRow>[] = [
    {
      header: "Course Title",
      accessor: (row: CourseRow) => (
        <div className="flex items-center gap-3">
          {/* Course Icon */}
          <div className="course-avatar">
            <BookOpen className="h-5 w-5" />
          </div>

          {/* Course Details */}
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-900">
              {row.title}
            </div>

            <div className="text-xs text-slate-500">
              {row.grade} • {row.subject}
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "Lessons",
      accessor: (row: CourseRow) => (
        <span className="course-lessons-badge">
          {Number(row.lessonsCount || 0)} Interactive Modules
        </span>
      ),
    },

    {
      header: "Enrolled Students",
      accessor: (row: CourseRow) => (
        <span className="course-enrollment">
          <Users className="h-4 w-4" />
          {Number(row.enrolledStudents || 0).toLocaleString()}
        </span>
      ),
    },

    {
      header: "Rating",
      accessor: (row: CourseRow) => (
        <span className="course-rating">
          <Star className="h-4 w-4" />
          {Number(row.rating || 0).toFixed(1)}
        </span>
      ),
    },

    {
      header: "Status",
      accessor: (row: CourseRow) => {
        const statusClass =
          row.status === "Published"
            ? "published"
            : "draft";

        return (
          <span
            className={`status-badge ${statusClass}`}
          >
            <span className="status-dot" />
            {row.status}
          </span>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-courses-page">

        {/* =====================================
            Page Header
        ===================================== */}

        <div className="admin-page-header">
          <div>
            <div className="admin-breadcrumb">
              Admin / Courses
            </div>

            <h1 className="admin-page-title">
              Courses
            </h1>

            <p className="admin-page-subtitle">
              Manage curriculum, interactive modules,
              grade levels, enrollments and course performance.
            </p>
          </div>

          <button
            className="admin-primary-button"
            onClick={() =>
              console.log("Create New Course clicked")
            }
          >
            + Create New Course
          </button>
        </div>

        {/* =====================================
            Dynamic Statistics
        ===================================== */}

        <div className="course-stats-grid">

          {/* Total Courses */}
          <div className="course-stat-card">
            <div className="course-stat-icon orange">
              <BookOpen className="h-6 w-6" />
            </div>

            <div className="course-stat-content">
              <span>Total Courses</span>

              <strong>
                {courseStats.totalCourses.toLocaleString()}
              </strong>

              <small>
                All curriculum courses
              </small>
            </div>
          </div>

          {/* Published Courses */}
          <div className="course-stat-card">
            <div className="course-stat-icon green">
              <BookOpen className="h-6 w-6" />
            </div>

            <div className="course-stat-content">
              <span>Published Courses</span>

              <strong>
                {courseStats.publishedCourses.toLocaleString()}
              </strong>

              <small className="course-success-text">
                Live on platform
              </small>
            </div>
          </div>

          {/* Enrollments */}
          <div className="course-stat-card">
            <div className="course-stat-icon blue">
              <Users className="h-6 w-6" />
            </div>

            <div className="course-stat-content">
              <span>Total Enrollments</span>

              <strong>
                {courseStats.totalEnrollments.toLocaleString()}
              </strong>

              <small>
                Student enrollments
              </small>
            </div>
          </div>

          {/* Average Rating */}
          <div className="course-stat-card">
            <div className="course-stat-icon amber">
              <Star className="h-6 w-6" />
            </div>

            <div className="course-stat-content">
              <span>Average Rating</span>

              <strong>
                {courseStats.averageRating.toFixed(1)}
                <small className="rating-scale">
                  {" "}
                  / 5.0
                </small>
              </strong>

              <small>
                Student course rating
              </small>
            </div>
          </div>
        </div>

        {/* =====================================
            Course Overview
        ===================================== */}

        <div className="course-overview-grid">

          {/* Interactive Modules */}
          <div className="course-overview-card">

            <div className="course-overview-header">
              <div>
                <span>Interactive Modules</span>

                <strong>
                  {courseStats.totalLessons.toLocaleString()}
                </strong>
              </div>

              <div className="course-overview-icon orange">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            <p>
              Total interactive lessons available
              across all courses.
            </p>
          </div>

          {/* Published Rate */}
          <div className="course-overview-card">

            <div className="course-overview-header">
              <div>
                <span>Published Rate</span>

                <strong>
                  {courseStats.totalCourses > 0
                    ? Math.round(
                      (courseStats.publishedCourses /
                        courseStats.totalCourses) *
                      100
                    )
                    : 0}
                  %
                </strong>
              </div>

              <div className="course-overview-icon green">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            <div className="course-progress">
              <div
                className="course-progress-fill"
                style={{
                  width: `${courseStats.totalCourses > 0
                      ? (courseStats.publishedCourses /
                        courseStats.totalCourses) *
                      100
                      : 0
                    }%`,
                }}
              />
            </div>

            <p>
              {courseStats.publishedCourses} published out of{" "}
              {courseStats.totalCourses} total courses.
            </p>
          </div>

          {/* Draft Courses */}
          <div className="course-overview-card">

            <div className="course-overview-header">
              <div>
                <span>Draft Courses</span>

                <strong>
                  {courseStats.draftCourses.toLocaleString()}
                </strong>
              </div>

              <div className="course-overview-icon purple">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            <p>
              Courses currently being prepared or
              awaiting publication.
            </p>
          </div>
        </div>

        {/* =====================================
            Course Directory
        ===================================== */}

        <div className="course-directory-card">
          <ReusableTable
            title="Curriculum & Course Catalog"
            subtitle="Manage learning paths, grade levels, interactive modules, enrollments and published courses."
            data={mockCourses}
            columns={courseColumns}
            searchPlaceholder="Search courses by title, subject or grade..."
            primaryActionLabel="Create New Course"
            onPrimaryAction={() =>
              console.log("Create New Course clicked")
            }
          />
        </div>
      </div>
    </AdminLayout>
  );
}