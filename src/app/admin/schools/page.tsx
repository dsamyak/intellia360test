"use client";

import React, { useMemo, useState } from "react";
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

/* ─── Onboard School Modal ─────────────────────────────────────────────────── */
function OnboardSchoolModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", location: "", adminName: "", adminEmail: "", plan: "Basic" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const PLANS = ["Basic", "Standard", "Premium", "Enterprise"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.adminEmail.trim()) { setError("School name and admin email are required."); return; }
    setSaving(true); setError("");
    // In production: POST to /api/admin/schools — for now we simulate success
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
  }

  const f = (k: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:12, fontWeight:600, color:"#475569" }}>{label}</label>
      <input type={type} style={{ padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none" }}
        placeholder={placeholder} value={form[k]}
        onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:20, padding:32, width:500, maxWidth:"calc(100vw - 32px)", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }} onClick={e => e.stopPropagation()}>
        {!saved ? (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#1e1b4b", margin:0 }}>Onboard New School</h2>
              <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#94a3b8" }}>✕</button>
            </div>
            {error && <p style={{ fontSize:12, color:"#dc2626", marginBottom:12 }}>⚠️ {error}</p>}
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {f("name",       "School Name *",         "text",  "e.g. Greenwood High School")}
              {f("location",   "Location",              "text",  "City, State")}
              {f("adminName",  "School Admin Name",     "text",  "Full name")}
              {f("adminEmail", "School Admin Email *",  "email", "admin@school.com")}
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#475569" }}>Subscription Plan</label>
                <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
                  style={{ padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", background:"#fff" }}>
                  {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
                <button type="button" onClick={onClose} style={{ padding:"9px 18px", border:"1.5px solid #e2e8f0", borderRadius:10, background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", color:"#475569" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:"9px 20px", border:"none", borderRadius:10, background:"linear-gradient(135deg,#f97316,#ea580c)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", opacity:saving ? .6 : 1 }}>
                  {saving ? "Saving…" : "Onboard School"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏫</div>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#1e1b4b", marginBottom:8 }}>School Onboarded!</h2>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:20 }}><strong>{form.name}</strong> has been added to the platform. The admin will receive setup instructions at <strong>{form.adminEmail}</strong>.</p>
            <button onClick={onClose} style={{ padding:"10px 24px", border:"none", borderRadius:10, background:"linear-gradient(135deg,#f97316,#ea580c)", color:"#fff", fontWeight:700, cursor:"pointer" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSchoolsPage() {
  const [showOnboardModal, setShowOnboardModal] = useState(false);
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
      {showOnboardModal && <OnboardSchoolModal onClose={() => setShowOnboardModal(false)} />}
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
          onPrimaryAction={() => setShowOnboardModal(true)}
        />

      </div>
    </AdminLayout>
  );
}