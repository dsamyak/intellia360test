"use client";

import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminHero from "@/components/admin/AdminHero";
import KPICard from "@/components/admin/KPICard";
import ChartCard from "@/components/admin/ChartCard";
import Leaderboard from "@/components/admin/Leaderboard";
import ActivityCard from "@/components/admin/ActivityCard";
import QuickActionCard from "@/components/admin/QuickActionCard";
import PlatformHealth from "@/components/admin/PlatformHealth";
import NotificationCard from "@/components/admin/NotificationCard";
import { useAdminDashboardData } from "@/data/admin/useAdminDashboardData";

export default function AdminDashboardPage() {
  const { kpiStats } = useAdminDashboardData();

  return (
    <AdminLayout>
      <main className="admin-dashboard-page">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="admin-dashboard-hero-section">
          <AdminHero />
        </section>

        {/* =====================================================
            PLATFORM OVERVIEW + KPI
        ====================================================== */}

        <section className="admin-dashboard-section admin-overview-section">
          <div className="admin-section-heading compact">
            <div>
              <h2>Platform Overview</h2>
              <p>
                Monitor schools, teachers, students and platform activity.
              </p>
            </div>
          </div>

          <div className="admin-stats-grid admin-dashboard-kpi-grid">
            {kpiStats.map((stat) => (
              <KPICard
                key={stat.id}
                stat={stat}
              />
            ))}
          </div>
        </section>

        {/* =====================================================
            PLATFORM ANALYTICS
        ====================================================== */}

        <section className="admin-dashboard-section admin-analytics-section">
          <div className="admin-section-heading compact">
            <div>
              <h2>Platform Analytics</h2>
              <p>
                Track platform growth and user distribution.
              </p>
            </div>
          </div>

          <div className="admin-dashboard-analytics-grid">

            {/* Platform Growth */}
            <div className="admin-dashboard-analytics-card growth-card">
              <ChartCard
                type="growth"
                title="Platform Growth"
              />
            </div>

            {/* User Distribution */}
            <div className="admin-dashboard-analytics-card distribution-card">
              <ChartCard
                type="distribution"
                title="User Distribution"
              />
            </div>

            {/* Platform Health */}
            <div className="admin-dashboard-analytics-card health-card">
              <PlatformHealth />
            </div>

          </div>
        </section>

        {/* =====================================================
            PLATFORM ACTIVITY
        ====================================================== */}

        <section className="admin-dashboard-section admin-activity-section">

          <div className="admin-section-heading compact">
            <div>
              <h2>Platform Activity</h2>
              <p>
                Recent activities, quick actions and important updates.
              </p>
            </div>
          </div>

          <div className="admin-dashboard-activity-grid">

            {/* Top Performing Schools */}
            <div className="admin-dashboard-bottom-card">
              <Leaderboard />
            </div>

            {/* Recent Activity */}
            <div className="admin-dashboard-bottom-card">
              <ActivityCard />
            </div>

            {/* Quick Actions */}
            <div className="admin-dashboard-bottom-card quick-actions-card">
              <QuickActionCard />
            </div>

          </div>

          {/* Notifications - compact secondary row */}
          <div className="admin-dashboard-notification-row">
            <NotificationCard />
          </div>

        </section>

      </main>
    </AdminLayout>
  );
}