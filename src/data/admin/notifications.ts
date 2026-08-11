// src/data/admin/notifications.ts

export interface NotificationItem {
  id: string;
  title: string;
  timestamp: string;
  type: "warning" | "info" | "success" | "alert";
  icon: string;
}

/* ============================================================
   ZERO / EMPTY STATE

   No static or fake notifications.
   Notifications will appear only when real data is available.
============================================================ */

export const adminNotifications: NotificationItem[] = [];

/* ============================================================
   FRONTEND DATA FETCHER

   Backend can be connected here later.
   Currently returns an empty array.
============================================================ */

export async function fetchAdminNotifications(): Promise<
  NotificationItem[]
> {
  return [];
}