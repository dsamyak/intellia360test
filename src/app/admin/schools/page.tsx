"use client";

import React, { useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ReusableTable, {
  ColumnDef,
} from "@/components/admin/ReusableTable";
import { mockSchools, SchoolRow } from "@/data/admin/tables";
import {
  Building2,
  CheckCircle2,
  Clock,
} from "@/components/admin/icons";

export default function AdminSchoolsPage() {
  /* =========================================
     Dynamic School Statistics
  ========================================= */

  const schoolStats = useMemo(() => {
    const totalSchools = mockSchools.length;

    const activeSchools = mockSchools.filter(
      (school) => school.status === "Active"
    ).length;

    const pendingSchools = mockSchools.filter(
      (school) => school.status === "Pending"
    ).length;

    const inactiveSchools = mockSchools.filter(
      (school) => school.status === "Inactive"
    ).length;

    const totalTeachers = mockSchools.reduce(
      (total, school) =>
        total + Number(school.teachersCount || 0),
      0
    );

    const totalStudents = mockSchools.reduce(
      (total, school) =>
        total + Number(school.studentsCount || 0),
      0
    );

    const activeRate =
      totalSchools > 0
        ? Math.round((activeSchools / totalSchools) * 100)
        : 0;

    return {
      totalSchools,
      activeSchools,
      pendingSchools,
      inactiveSchools,
      totalTeachers,
      totalStudents,
      activeRate,
    };
  }, []);

  /* =========================================
     Schools Table Columns
  ========================================= */

  const schoolColumns: ColumnDef<SchoolRow>[] = [
    {
      header: "School Name",
      accessor: (row: SchoolRow) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <div className="font-semibold text-slate-900">
              {row.name}
            </div>

            <div className="text-xs text-slate-500">
              ID: {row.code}
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "Location",
      accessor: "location",
    },

    {
      header: "Teachers",
      accessor: (row: SchoolRow) => (
        <span className="font-medium text-slate-700">
          {Number(row.teachersCount || 0).toLocaleString()}
        </span>
      ),
    },

    {
      header: "Students",
      accessor: (row: SchoolRow) => (
        <span className="font-medium text-slate-700">
          {Number(row.studentsCount || 0).toLocaleString()}
        </span>
      ),
    },

    {
      header: "Subscription Plan",
      accessor: (row: SchoolRow) => (
        <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          {row.plan}
        </span>
      ),
    },

    {
      header: "Status",
      accessor: (row: SchoolRow) => {
        const statusClass =
          row.status === "Active"
            ? "bg-emerald-50 text-emerald-700"
            : row.status === "Pending"
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-600";

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
          >
            {row.status}
          </span>
        );
      },
    },
  ];

  /* =========================================
     Page
  ========================================= */

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* =====================================
            Page Header
        ===================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-orange-500">
              Admin / Schools
            </div>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Schools
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage registered schools, subscriptions and
              verification status.
            </p>
          </div>
        </div>

        {/* =====================================
            Statistics Cards
        ===================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Schools */}
          <div className="admin-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Building2 className="h-6 w-6" />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">
                Total Schools
              </div>

              <div className="text-2xl font-extrabold text-slate-900">
                {schoolStats.totalSchools.toLocaleString()}
              </div>

              <div className="text-xs text-slate-500">
                Registered institutions
              </div>
            </div>
          </div>

          {/* Active Schools */}
          <div className="admin-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">
                Active Schools
              </div>

              <div className="text-2xl font-extrabold text-slate-900">
                {schoolStats.activeSchools.toLocaleString()}
              </div>

              <div className="text-xs text-emerald-600">
                Currently active
              </div>
            </div>
          </div>

          {/* Pending Verification */}
          <div className="admin-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">
                Pending Verification
              </div>

              <div className="text-2xl font-extrabold text-slate-900">
                {schoolStats.pendingSchools.toLocaleString()}
              </div>

              <div className="text-xs text-amber-600">
                Needs review
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="admin-card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <span className="text-xl">🎓</span>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500">
                Total Students
              </div>

              <div className="text-2xl font-extrabold text-slate-900">
                {schoolStats.totalStudents.toLocaleString()}
              </div>

              <div className="text-xs text-slate-500">
                Across all schools
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            Additional Overview
        ===================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Teachers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              Total Teachers
            </div>

            <div className="mt-2 text-2xl font-bold text-slate-900">
              {schoolStats.totalTeachers.toLocaleString()}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Across registered schools
            </div>
          </div>

          {/* Inactive */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              Inactive Schools
            </div>

            <div className="mt-2 text-2xl font-bold text-slate-900">
              {schoolStats.inactiveSchools.toLocaleString()}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Currently inactive
            </div>
          </div>

          {/* Active Rate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">
              Active Rate
            </div>

            <div className="mt-2 text-2xl font-bold text-emerald-600">
              {schoolStats.activeRate}%
            </div>

            <div className="mt-1 text-xs text-slate-500">
              School activation rate
            </div>
          </div>
        </div>

        {/* =====================================
            Schools Directory
        ===================================== */}

        <ReusableTable
          title="Registered Schools Directory"
          subtitle="Manage and view operational status for all onboarded institutions."
          data={mockSchools}
          columns={schoolColumns}
          searchPlaceholder="Search school by name, code or city..."
          primaryActionLabel="Onboard New School"
          onPrimaryAction={() => {
            console.log("Onboard New School clicked");
          }}
        />

      </div>
    </AdminLayout>
  );
}