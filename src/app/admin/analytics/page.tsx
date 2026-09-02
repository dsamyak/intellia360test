"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ChartCard from "@/components/admin/ChartCard";
import {
  TrendingUp,
  Users,
  Clock,
  Award,
} from "@/components/admin/icons";

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
      iconClass: "text-blue-500",
    },
    {
      title: "Lesson Completion",
      value: `${analytics.lessonCompletion}%`,
      change: analytics.lessonChange,
      icon: TrendingUp,
      iconClass: "text-emerald-500",
    },
    {
      title: "Active AI Conversations",
      value: analytics.activeAIConversations.toLocaleString(),
      change: analytics.aiConversationChange,
      icon: Users,
      iconClass: "text-purple-500",
    },
    {
      title: "Quiz Accuracy Score",
      value: `${analytics.quizAccuracy}%`,
      change: analytics.quizAccuracyChange,
      icon: Award,
      iconClass: "text-amber-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-analytics-page">

        {/* Header */}
        <div className="analytics-header">
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

          <div className="analytics-period">
            <span>Period</span>

            <select defaultValue="month">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="analytics-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="analytics-summary-card"
              >
                <div className="analytics-card-top">
                  <span className="analytics-card-title">
                    {card.title}
                  </span>

                  <Icon
                    className={`w-5 h-5 ${card.iconClass}`}
                  />
                </div>

                <div className="analytics-card-value">
                  {card.value}
                </div>

                <div className="analytics-card-change">
                  <TrendingUp className="w-3.5 h-3.5" />

                  <span>
                    +{card.change}% vs last month
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* User & Session Analytics */}
        <div className="admin-grid-2col analytics-chart-row">
          <div className="analytics-empty-chart">
            <ChartCard
              type="growth"
              title="Monthly User Traffic & Active Sessions"
            />

            <div className="analytics-empty-overlay">
              <div className="analytics-empty-icon">
                <Users className="w-6 h-6" />
              </div>

              <strong>No analytics data yet</strong>

              <span>
                Data will appear as users start using the platform.
              </span>
            </div>
          </div>

          <div className="analytics-empty-chart">
            <ChartCard
              type="distribution"
              title="Role-Based User Allocation"
            />

            <div className="analytics-empty-overlay">
              <div className="analytics-empty-icon">
                <Users className="w-6 h-6" />
              </div>

              <strong>No user data yet</strong>

              <span>
                Student, teacher and admin distribution will appear here.
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="analytics-revenue-card">
          <div className="analytics-empty-chart">
            <ChartCard
              type="revenue"
              title="Quarterly Platform Revenue Growth (₹ Lakhs)"
            />

            <div className="analytics-empty-overlay">
              <div className="analytics-empty-icon">
                <TrendingUp className="w-6 h-6" />
              </div>

              <strong>No revenue data yet</strong>

              <span>
                Revenue analytics will appear after transactions are recorded.
              </span>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}