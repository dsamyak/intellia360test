"use client";

import React from "react";
import { KpiStat } from "@/data/admin/dashboard";
import { useCountUp } from "@/data/admin/useAdminDashboardData";
import { formatKpiValue } from "@/data/admin/dashboard";
import {
  Building2,
  GraduationCap,
  Users,
  BookOpenCheck,
  ClipboardCheck,
  IndianRupee,
  TrendingUp,
  TrendingDown,
} from "@/components/admin/icons";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2: Building2,
  GraduationCap: GraduationCap,
  Users: Users,
  BookOpenCheck: BookOpenCheck,
  ClipboardCheck: ClipboardCheck,
  IndianRupee: IndianRupee,
};

// Clean custom mappings for colors to guarantee correctness in plain CSS environment
const colorStyles: Record<string, { bg: string; text: string }> = {
  orange: { bg: "rgba(249, 115, 22, 0.08)", text: "#ea580c" },
  amber: { bg: "rgba(245, 158, 11, 0.08)", text: "#d97706" },
  blue: { bg: "rgba(59, 130, 246, 0.08)", text: "#2563eb" },
  purple: { bg: "rgba(139, 92, 246, 0.08)", text: "#7c3aed" },
  emerald: { bg: "rgba(16, 185, 129, 0.08)", text: "#059669" },
  rose: { bg: "rgba(244, 63, 94, 0.08)", text: "#e11d48" },
};

interface KPICardProps {
  stat: KpiStat;
}

export default function KPICard({ stat }: KPICardProps) {
  const shownValue = useCountUp(stat.value);
  const isUp = stat.trend === "up";
  const colors = colorStyles[stat.color] || colorStyles.orange;
  const IconComponent = iconMap[stat.icon] || Building2;

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div
          className="stat-icon-box"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <span
          className="stat-card-growth"
          style={{
            color: isUp ? "#10b981" : "#ef4444",
            backgroundColor: isUp ? "rgba(46, 98, 81, 0.08)" : "rgba(239, 68, 68, 0.08)",
          }}
        >
          {isUp ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
          <span className="ml-0.5">{stat.growth.toFixed(1)}%</span>
        </span>
      </div>
      <div className="stat-card-title">{stat.title}</div>
      <div className="stat-card-value">
        {formatKpiValue({ value: shownValue, prefix: stat.prefix, suffix: stat.suffix })}
      </div>
      <div className="stat-card-timeframe">{stat.timeframe}</div>
    </div>
  );
}
