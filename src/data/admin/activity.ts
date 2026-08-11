// src/data/admin/activities.ts

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  iconBg: string;
}

/* ============================================================
   ZERO STATE
   No fake activities on initial load.
============================================================ */

export const recentActivities: ActivityItem[] = [];

/* ============================================================
   FETCH LIVE ACTIVITIES
   Replace endpoint with your actual backend API.
============================================================ */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchRecentActivities(): Promise<ActivityItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/activities`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(
        `Failed to fetch activities: ${response.status}`
      );

      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((activity) => ({
      id: String(activity.id ?? ""),
      title: String(activity.title ?? ""),
      subtitle: String(activity.subtitle ?? ""),
      timestamp: String(activity.timestamp ?? ""),
      icon: String(activity.icon ?? "Activity"),
      iconBg: String(activity.iconBg ?? "#f1f5f9"),
    }));
  } catch (error) {
    console.warn(
      "Admin activities API unavailable:",
      error
    );

    return [];
  }
}