"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ChartCard from "@/components/admin/ChartCard";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Award,
} from "@/components/admin/icons";

// Same color tokens as the Admin Home KPI cards (see KPICard.tsx colorStyles).
const cardColors: Record<string, { bg: string; text: string }> = {
  blue: { bg: "rgba(59, 130, 246, 0.08)", text: "#2563eb" },
  emerald: { bg: "rgba(16, 185, 129, 0.08)", text: "#059669" },
  purple: { bg: "rgba(139, 92, 246, 0.08)", text: "#7c3aed" },
  amber: { bg: "rgba(245, 158, 11, 0.08)", text: "#d97706" },
};

export default function AdminAnalyticsPage() {
  // avgSessionTime / activeAIConversations have no tracking model yet —
  // stay at 0 (real absence of data) rather than a fabricated number.
  const [analytics, setAnalytics] = useState({
    avgSessionTime: 0,
    sessionChange: 0,

    lessonCompletion: 0,
    lessonChange: 0,

    activeAIConversations: 0,
    aiConversationChange: 0,

    quizAccuracy: 0,
    quizAccuracyChange: 0,
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setAnalytics((prev) => ({ ...prev, quizAccuracy: json.data.quizAccuracyPercent }));
        }
      })
      .catch(() => {});
  }, []);

  const summaryCards = [
    {
      title: "Avg. Session Time",
      value: `${analytics.avgSessionTime} mins`,
      change: analytics.sessionChange,
      icon: Clock,
      colors: cardColors.blue,
    },
    {
      title: "Lesson Completion",
      value: `${analytics.lessonCompletion}%`,
      change: analytics.lessonChange,
      icon: TrendingUp,
      colors: cardColors.emerald,
    },
    {
      title: "Active AI Conversations",
      value: analytics.activeAIConversations.toLocaleString(),
      change: analytics.aiConversationChange,
      icon: Users,
      colors: cardColors.purple,
    },
    {
      title: "Quiz Accuracy Score",
      value: `${analytics.quizAccuracy}%`,
      change: analytics.quizAccuracyChange,
      icon: Award,
      colors: cardColors.amber,
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-analytics-page">

        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <div className="admin-breadcrumb">
              Admin / Analytics
            </div>

            <h1 className="admin-page-title">
              Platform Analytics
            </h1>

            <p className="admin-page-subtitle">
              Track learner engagement, lesson performance,
              AI activity, and overall platform growth.
            </p>
          </div>
        </div>

        {/* KPI Summary — reuses the Admin Home stat-card design */}
        <div className="analytics-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const isUp = card.change >= 0;

            return (
              <div key={card.title} className="stat-card">
                <div className="stat-card-header">
                  <div
                    className="stat-icon-box"
                    style={{ backgroundColor: card.colors.bg, color: card.colors.text }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className="stat-card-growth"
                    style={{
                      color: isUp ? "#10b981" : "#ef4444",
                      backgroundColor: isUp ? "rgba(46, 98, 81, 0.08)" : "rgba(239, 68, 68, 0.08)",
                    }}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
                    <span className="ml-0.5">{isUp ? "+" : ""}{card.change}%</span>
                  </span>
                </div>

                <div className="stat-card-title">{card.title}</div>
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-timeframe">vs last month</div>
              </div>
            );
          })}
        </div>

        {/* User & Session Analytics */}
        <div className="admin-grid-2col analytics-chart-row">
          <ChartCard
            type="growth"
            title="Monthly User Traffic & Active Sessions"
          />

          <ChartCard
            type="distribution"
            title="Role-Based User Allocation"
          />
        </div>

        {/* Revenue Analytics */}
        <div className="analytics-revenue-card">
          <ChartCard
            type="revenue"
            title="Quarterly Platform Revenue Growth (₹ Lakhs)"
          />
        </div>

      </div>
    </AdminLayout>
  );
}
