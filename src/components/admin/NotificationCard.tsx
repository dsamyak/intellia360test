"use client";

import React from "react";
import Link from "next/link";
import { adminNotifications } from "@/data/admin/notifications";
import { Bell, ArrowRight, Building, UserCheck, ShieldCheck, BadgeCheck } from "@/components/admin/icons";

const iconMap: Record<string, React.ReactNode> = {
  Building: <Building className="w-3 h-3 text-amber-600" />,
  UserCheck: <UserCheck className="w-3 h-3 text-rose-600" />,
  ShieldCheck: <ShieldCheck className="w-3 h-3 text-emerald-600" />,
  BadgeCheck: <BadgeCheck className="w-3 h-3 text-blue-600" />,
};

// Clean styling overrides for different alert types
const alertStyles: Record<string, { bg: string; border: string }> = {
  warning: { bg: "#fef3c7", border: "#fde68a" },
  alert: { bg: "#fee2e2", border: "#fecaca" },
  success: { bg: "#dcfce7", border: "#bbf7d0" },
  info: { bg: "#e0f2fe", border: "#bae6fd" },
};

export default function NotificationCard() {
  return (
    <div className="admin-card">
      <div className="admin-card-header mb-3">
        <h3 className="admin-card-title">
          <Bell className="w-4 h-4 text-orange-500 inline" /> Alerts & Alerts
        </h3>
        <Link href="/admin/settings" className="admin-link-action">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {adminNotifications.map((notif) => {
          const styles = alertStyles[notif.type] || { bg: "#f1f5f9", border: "#e2e8f0" };
          return (
            <div 
              key={notif.id} 
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div 
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: styles.bg, borderColor: styles.border }}
              >
                {iconMap[notif.icon] || <Bell className="w-3 h-3 text-orange-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-slate-700 truncate leading-tight">{notif.title}</div>
              </div>
              <div className="text-[9px] font-semibold text-slate-400 shrink-0">
                {notif.timestamp}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
