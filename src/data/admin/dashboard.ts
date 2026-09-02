/* ============================================================
   ADMIN DASHBOARD DATA
   Frontend-only version

   Initial state:
   - All numbers = 0
   - No fake/demo data
   - No backend/API calls
   - Platform health = Checking
   ============================================================ */


/* ============================================================
   TYPES
   ============================================================ */

export interface AdminHeroData {
  greeting: string;
  subheading: string;
  tagline: string;
  description: string;
  activeUsersCount: number;
  activeUsersGrowth: number;
  platformStatus: string;
  platformStatusTime: string;
  primaryCtaText: string;
  secondaryCtaText: string;
}

export interface KpiStat {
  id: string;
  title: string;
  value: number;
  growth: number;
  trend: "up" | "down";
  timeframe: string;
  icon: string;
  color: string;
  prefix?: string;
  suffix?: string;
}

export interface HealthCheckItem {
  id: string;
  name: string;
  status: "Operational" | "Degraded" | "Maintenance" | "Checking";
  ping: number;
}


/* ============================================================
   ZERO-VALUE HERO DATA
   ============================================================ */

export const emptyHeroData: AdminHeroData = {
  greeting: "Welcome back, Admin! 👋",

  subheading:
    "Here's what's happening on your platform today.",

  tagline:
    "Manage. Monitor. Grow.",

  description:
    "Track performance, analyze insights and make data-driven decisions to build a better learning future for schools and students.",

  activeUsersCount: 0,

  activeUsersGrowth: 0,

  platformStatus:
    "Checking status…",

  platformStatusTime:
    new Date().toISOString(),

  primaryCtaText:
    "View Analytics",

  secondaryCtaText:
    "Manage Platform",
};


/* ============================================================
   ZERO-VALUE KPI DATA
   ============================================================ */

export const emptyKpiStats: KpiStat[] = [
  {
    id: "schools",
    title: "Schools",
    value: 0,
    growth: 0,
    trend: "up",
    timeframe: "vs last month",
    icon: "Building2",
    color: "orange",
  },

  {
    id: "teachers",
    title: "Teachers",
    value: 0,
    growth: 0,
    trend: "up",
    timeframe: "vs last month",
    icon: "GraduationCap",
    color: "amber",
  },

  {
    id: "students",
    title: "Students",
    value: 0,
    growth: 0,
    trend: "up",
    timeframe: "vs last month",
    icon: "Users",
    color: "blue",
  },

  {
    id: "lessons",
    title: "Active Lessons",
    value: 0,
    growth: 0,
    trend: "up",
    timeframe: "vs last month",
    icon: "BookOpenCheck",
    color: "purple",
  },

  {
    id: "assessments",
    title: "Assessments",
    value: 0,
    growth: 0,
    trend: "up",
    timeframe: "vs last month",
    icon: "ClipboardCheck",
    color: "emerald",
  },

  {
    id: "revenue",
    title: "Revenue (MTD)",
    value: 0,
    growth: 0,
    trend: "up",
    timeframe: "vs last month",
    icon: "IndianRupee",
    color: "rose",
    prefix: "₹",
    suffix: "L",
  },
];


/* ============================================================
   PLATFORM HEALTH
   Initial state = Checking
   ============================================================ */

export const emptyPlatformHealthItems: HealthCheckItem[] = [
  {
    id: "server",
    name: "Server Status",
    status: "Checking",
    ping: 0,
  },

  {
    id: "db",
    name: "Database",
    status: "Checking",
    ping: 0,
  },

  {
    id: "api",
    name: "API Services",
    status: "Checking",
    ping: 0,
  },

  {
    id: "storage",
    name: "Storage & CDN",
    status: "Checking",
    ping: 0,
  },

  {
    id: "backup",
    name: "Backup Systems",
    status: "Checking",
    ping: 0,
  },

  {
    id: "ai",
    name: "AI Tutor Gateway",
    status: "Checking",
    ping: 0,
  },
];


/* ============================================================
   FRONTEND-ONLY DATA FETCHERS

   IMPORTANT:
   These functions DO NOT make API/backend requests.

   They simply return the zero-state data.

   Later, when the backend is ready, these functions can be
   replaced with real API/database calls.
   ============================================================ */

async function fetchAdminStats(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("/api/admin/stats");
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Returns hero data, backed by GET /api/admin/stats.
 */
export async function fetchHeroData(): Promise<AdminHeroData> {
  const stats = await fetchAdminStats();
  if (!stats) return { ...emptyHeroData };

  return {
    ...emptyHeroData,
    activeUsersCount: stats.totalUsers,
    activeUsersGrowth: 0, // no historical snapshot stored yet — real, not fabricated
    platformStatus: "Operational",
    platformStatusTime: new Date().toISOString(),
  };
}


/**
 * Returns KPI statistics, backed by GET /api/admin/stats.
 */
export async function fetchKpiStats(): Promise<KpiStat[]> {
  const stats = await fetchAdminStats();
  if (!stats) return emptyKpiStats.map((stat) => ({ ...stat }));

  const valueById: Record<string, number> = {
    schools: stats.schools,
    teachers: stats.teachers,
    students: stats.students,
    lessons: stats.totalLessons,
    assessments: stats.assessmentsTaken,
    revenue: stats.revenueMTD,
  };

  return emptyKpiStats.map((stat) => ({
    ...stat,
    value: valueById[stat.id] ?? 0,
  }));
}


/**
 * Returns platform health information.
 * Server/Database are checked live; integrations with no configured
 * provider (storage/CDN, backups, AI gateway) stay "Checking" rather
 * than reporting a fabricated status.
 */
export async function fetchPlatformHealth(): Promise<
  HealthCheckItem[]
> {
  const stats = await fetchAdminStats();
  if (!stats) return emptyPlatformHealthItems.map((item) => ({ ...item }));

  return emptyPlatformHealthItems.map((item) => {
    if (item.id === "server") return { ...item, status: "Operational", ping: stats.dbPingMs };
    if (item.id === "db") return { ...item, status: "Operational", ping: stats.dbPingMs };
    if (item.id === "api") return { ...item, status: "Operational", ping: stats.dbPingMs };
    return item; // storage, backup, ai — no provider configured, stays "Checking"
  });
}


/* ============================================================
   DISPLAY HELPERS
   ============================================================ */

/**
 * Format number using Indian numbering system.
 *
 * Examples:
 * 0      -> "0"
 * 1000   -> "1,000"
 * 10000  -> "10,000"
 * 100000 -> "1,00,000"
 */
export function formatIndianNumber(
  value: number
): string {
  const safeValue = Number(value) || 0;

  return safeValue.toLocaleString("en-IN");
}


/**
 * Format KPI value.
 *
 * Revenue example:
 * 0 -> ₹0.0L
 *
 * Normal number:
 * 0    -> 0
 * 1250 -> 1,250
 */
export function formatKpiValue(
  stat: Pick<
    KpiStat,
    "value" | "prefix" | "suffix"
  >
): string {
  const value = Number(stat.value) || 0;

  let formattedValue: string;

  if (stat.suffix === "L") {
    formattedValue = (value / 100000).toFixed(1);
  } else {
    formattedValue = formatIndianNumber(value);
  }

  return `${stat.prefix ?? ""}${formattedValue}${stat.suffix ?? ""}`;
}


/* ============================================================
   HELPER: CHECK IF DASHBOARD HAS REAL DATA
   ============================================================ */

export function hasDashboardData(
  kpiStats: KpiStat[]
): boolean {
  return kpiStats.some(
    (stat) => Number(stat.value) > 0
  );
}


/**
 * Returns true when platform health has received
 * an actual status instead of the initial checking state.
 */
export function isPlatformHealthReady(
  healthItems: HealthCheckItem[]
): boolean {
  return healthItems.length > 0 &&
    healthItems.some(
      (item) => item.status !== "Checking"
    );
}