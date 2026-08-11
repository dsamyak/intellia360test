// src/data/admin/quickActions.ts

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  link: string;
  enabled: boolean;
}

/* ============================================================
   ADMIN QUICK ACTIONS

   These are navigation/actions, not database records.
   They remain available on the frontend.
============================================================ */

export const quickActionCards: QuickAction[] = [
  {
    id: "add_school",
    label: "Add School",
    icon: "Building2",
    color: "#ea580c",
    bgColor: "#fff7ed",
    link: "/admin/schools",
    enabled: true,
  },

  {
    id: "add_teacher",
    label: "Add Teacher",
    icon: "UserPlus",
    color: "#d97706",
    bgColor: "#fef3c7",
    link: "/admin/teachers",
    enabled: true,
  },

  {
    id: "add_course",
    label: "Add Course",
    icon: "BookPlus",
    color: "#f59e0b",
    bgColor: "#fefce8",
    link: "/admin/courses",
    enabled: true,
  },

  {
    id: "create_lesson",
    label: "Create Lesson",
    icon: "FileEdit",
    color: "#10b981",
    bgColor: "#ecfdf5",
    link: "/admin/content",
    enabled: true,
  },

  {
    id: "generate_report",
    label: "Generate Report",
    icon: "FileText",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    link: "/admin/reports",
    enabled: true,
  },

  {
    id: "manage_users",
    label: "Manage Users",
    icon: "Users",
    color: "#8b5cf6",
    bgColor: "#f3e8ff",
    link: "/admin/students",
    enabled: true,
  },
];