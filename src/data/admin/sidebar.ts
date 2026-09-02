export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: {
    text: string;
    color: string;
  };
  children?: { label: string; path: string }[];
}

export const sidebarMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/admin/dashboard",
  },
  {
    id: "schools",
    label: "Schools",
    icon: "Building2",
    path: "/admin/schools",
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: "GraduationCap",
    path: "/admin/teachers",
  },
  {
    id: "students",
    label: "Students",
    icon: "Users",
    path: "/admin/students",
  },
  {
    id: "courses",
    label: "Courses",
    icon: "BookOpen",
    path: "/admin/courses",
  },
  {
    id: "content",
    label: "Content Library",
    icon: "FolderKanban",
    path: "/admin/content",
  },
  {
    id: "analytics",
    label: "Reports & Analytics",
    icon: "TrendingUp",
    path: "/admin/analytics",
  },
  {
    id: "payments",
    label: "Payments",
    icon: "CreditCard",
    path: "/admin/payments",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "FileText",
    path: "/admin/reports",
  },
  {
    id: "settings",
    label: "System Settings",
    icon: "Settings",
    path: "/admin/settings",
  },
];
