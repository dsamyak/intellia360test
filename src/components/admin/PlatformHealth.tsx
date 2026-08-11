"use client";

import React from "react";
import Link from "next/link";
import { useAdminDashboardData } from "@/data/admin/useAdminDashboardData";
import { ArrowRight, ShieldCheck } from "@/components/admin/icons";

export default function PlatformHealth() {
  const { platformHealth } = useAdminDashboardData();

  return (
    <div className="admin-card">
      <div className="admin-card-header mb-3">
        <h3 className="admin-card-title">
          <ShieldCheck className="w-4 h-4 text-emerald-500 inline" /> System Health
        </h3>
        <Link href="/admin/settings" className="admin-link-action">
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top compact dashboard gauge */}
      <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100/40 p-2.5 rounded-xl mb-3">
        <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#d1fae5" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="98 2" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">
            98%
          </div>
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-slate-800 leading-tight">System Status</h4>
          <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
            All Systems Operational
          </p>
        </div>
      </div>

      {/* Bottom compact 2x2 grid of service states */}
      <div className="grid grid-cols-2 gap-2">
        {platformHealth.map((item) => (
          <div key={item.id} className="flex flex-col justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/60">
            <div className="text-[10px] font-bold text-slate-500 truncate">{item.name}</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[9px] font-bold text-slate-400">{item.ping}ms ping</span>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
