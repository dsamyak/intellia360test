"use client";

import React from "react";
import Link from "next/link";
import { topSchoolsLeaderboard } from "@/data/admin/charts";
import { ArrowRight, Trophy } from "@/components/admin/icons";

export default function Leaderboard() {
  return (
    <div className="admin-card">
      <div className="admin-card-header mb-3">
        <h3 className="admin-card-title">
          <Trophy className="w-4 h-4 text-amber-500 inline" /> Top Schools
        </h3>
        <Link href="/admin/schools" className="admin-link-action">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {topSchoolsLeaderboard.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 py-1.5 border-b border-slate-100/50 last:border-b-0">
            {/* Rank badge */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] shrink-0 ${
                item.rank === 1
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : item.rank === 2
                  ? "bg-slate-50 text-slate-700 border border-slate-200"
                  : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}
            >
              #{item.rank}
            </div>

            {/* School details */}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">{item.name}</div>
              <div className="text-[9px] font-semibold text-slate-400">{item.students}</div>
            </div>

            {/* Compact Progress Bar */}
            <div className="flex items-center gap-1.5 w-20 shrink-0">
              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full"
                  style={{ width: `${item.completion}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700">{item.completion}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
