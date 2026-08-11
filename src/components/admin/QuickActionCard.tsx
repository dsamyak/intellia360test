"use client";

import React from "react";
import Link from "next/link";
import { quickActionCards, QuickAction } from "@/data/admin/quickActions";
import { Building2, UserPlus, BookPlus, FileEdit, FileText, Users } from "@/components/admin/icons";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-3.5 h-3.5" />,
  UserPlus: <UserPlus className="w-3.5 h-3.5" />,
  BookPlus: <BookPlus className="w-3.5 h-3.5" />,
  FileEdit: <FileEdit className="w-3.5 h-3.5" />,
  FileText: <FileText className="w-3.5 h-3.5" />,
  Users: <Users className="w-3.5 h-3.5" />,
};

export default function QuickActionCard() {
  return (
    <div className="admin-card">
      <div className="admin-card-header mb-3">
        <h3 className="admin-card-title">Quick Actions</h3>
      </div>

      <div className="flex flex-col gap-2">
        {quickActionCards.map((act: QuickAction) => (
          <Link
            key={act.id}
            href={act.link}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-100/50 no-underline transition-all duration-200 hover:translate-x-1 hover:border-orange-200"
            style={{ backgroundColor: act.bgColor }}
          >
            <div 
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-sm" 
              style={{ color: act.color, backgroundColor: "rgba(255, 255, 255, 0.75)" }}
            >
              {iconMap[act.icon] || <Building2 className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              {act.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
