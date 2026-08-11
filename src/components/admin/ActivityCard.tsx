"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { recentActivities, ActivityItem } from "@/data/admin/activity";
import { Building2, UserPlus, BookPlus, CreditCard, FileCheck, ArrowRight } from "@/components/admin/icons";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-2.5 h-2.5 text-orange-600" />,
  UserPlus: <UserPlus className="w-2.5 h-2.5 text-rose-600" />,
  BookPlus: <BookPlus className="w-2.5 h-2.5 text-purple-600" />,
  CreditCard: <CreditCard className="w-2.5 h-2.5 text-emerald-600" />,
  FileCheck: <FileCheck className="w-2.5 h-2.5 text-blue-600" />,
};

interface ActivityCardProps {
  initialActivities?: ActivityItem[];
  isLoading?: boolean;
}

export default function ActivityCard({ initialActivities = recentActivities, isLoading: externalLoading = false }: ActivityCardProps) {
  const [activities] = useState<ActivityItem[]>(initialActivities);
  const [isLoading] = useState<boolean>(externalLoading);

  return (
    <div className="admin-card">
      <div className="admin-card-header mb-3">
        <h3 className="admin-card-title">Recent Activities</h3>
        <Link href="/admin/analytics" className="admin-link-action">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          No recent activities found.
        </div>
      ) : (
        <div className="relative pl-3.5 border-l border-slate-100 flex flex-col gap-3.5 mt-2">
          {activities.map((act: ActivityItem) => (
            <div key={act.id} className="relative flex flex-col gap-0.5">
              {/* Timeline Dot Marker with Icon */}
              <div
                className="absolute -left-[24px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm"
                style={{ backgroundColor: act.iconBg }}
              >
                {iconMap[act.icon] || <Building2 className="w-2.5 h-2.5 text-orange-600" />}
              </div>

              {/* Context & Meta Row */}
              <div className="flex justify-between items-baseline gap-1.5">
                <span className="text-[11px] font-bold text-slate-800 truncate">{act.title}</span>
                <span className="text-[9px] font-semibold text-slate-400 shrink-0">{act.timestamp}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">{act.subtitle}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}