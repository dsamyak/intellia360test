/* ============================================================
   ADMIN TABLE DATA
   Backed by real DB-backed Admin APIs.
============================================================ */

interface ApiSchool {
  id: string; name: string; code: string; location: string | null;
  teachersCount: number; studentsCount: number; plan: string; status: string;
}
interface ApiUser {
  id: string; name: string; email: string; emailVerified: boolean;
  school: string | null; subject: string | null; classesCount: number | null;
  grade: string | null; xpPoints: number | null; learningGems: number | null;
  lastActiveDate: string | null;
}
interface ApiCourse {
  id: string; title: string; subject: string | null; grade: string;
  lessonsCount: number; enrolledStudents: number; rating: number; status: string;
}
interface ApiPayment {
  id: string; transactionId: string; payerName: string; schoolOrUser: string | null;
  amount: number; date: string; method: string; status: string;
}

/* ============================================================
   SCHOOL
============================================================ */

export interface SchoolRow {
  id: string;
  name: string;
  code: string;
  location: string;
  teachersCount: number;
  studentsCount: number;
  plan: string;
  status: "Active" | "Pending" | "Inactive";
}

function titleCaseStatus(status: string): "Active" | "Pending" | "Inactive" {
  if (status === "ACTIVE") return "Active";
  if (status === "PENDING") return "Pending";
  return "Inactive";
}

export async function fetchSchools(): Promise<SchoolRow[]> {
  const res = await fetch("/api/admin/schools");
  const json = await res.json();
  if (!json.success) return [];
  return (json.data as ApiSchool[]).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    location: s.location ?? "—",
    teachersCount: s.teachersCount ?? 0,
    studentsCount: s.studentsCount ?? 0,
    plan: s.plan,
    status: titleCaseStatus(s.status),
  }));
}

export async function createSchool(input: {
  name: string;
  location?: string;
  adminName?: string;
  adminEmail: string;
  plan?: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/admin/schools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  return { success: !!json.success, message: json.message ?? "Failed to onboard school." };
}

export async function updateSchool(
  id: string,
  input: Partial<{ name: string; location: string; adminName: string; adminEmail: string; plan: string; status: "ACTIVE" | "PENDING" | "INACTIVE" }>
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/schools/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  return { success: !!json.success, message: json.message ?? "Failed to update school." };
}

export async function deleteSchool(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/schools/${id}`, { method: "DELETE" });
  const json = await res.json();
  return { success: !!json.success, message: json.message ?? "Failed to delete school." };
}

/* ============================================================
   TEACHER
============================================================ */

export interface TeacherRow {
  id: string;
  name: string;
  email: string;
  school: string;
  subject: string;
  classesCount: number;
  status: "Active" | "Pending" | "Suspended";
}

export async function fetchTeachers(): Promise<TeacherRow[]> {
  const res = await fetch("/api/admin/users?role=TEACHER&limit=100");
  const json = await res.json();
  if (!json.success) return [];
  return (json.data as ApiUser[]).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    school: u.school ?? "—",
    subject: u.subject ?? "—",
    classesCount: u.classesCount ?? 0,
    status: u.emailVerified ? "Active" as const : "Pending" as const,
  }));
}

/* ============================================================
   STUDENT
============================================================ */

export interface StudentRow {
  id: string;
  name: string;
  grade: string;
  school: string;
  xpPoints: number;
  gems: number;
  lastActive: string;
  status: "Active" | "Inactive";
}

export async function fetchStudents(): Promise<StudentRow[]> {
  const res = await fetch("/api/admin/users?role=STUDENT&limit=100");
  const json = await res.json();
  if (!json.success) return [];
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  return (json.data as ApiUser[]).map((u) => {
    const lastActiveDate = u.lastActiveDate ? new Date(u.lastActiveDate) : null;
    const isActive = !!lastActiveDate && Date.now() - lastActiveDate.getTime() < THIRTY_DAYS_MS;
    return {
      id: u.id,
      name: u.name,
      grade: u.grade ?? "—",
      school: u.school ?? "—",
      xpPoints: u.xpPoints ?? 0,
      gems: u.learningGems ?? 0,
      lastActive: lastActiveDate ? lastActiveDate.toLocaleDateString() : "—",
      status: (isActive ? "Active" : "Inactive") as "Active" | "Inactive",
    };
  });
}

/* ============================================================
   COURSE
============================================================ */

export interface CourseRow {
  id: string;
  title: string;
  subject: string;
  grade: string;
  lessonsCount: number;
  enrolledStudents: number;
  rating: number;
  status: "Published" | "Draft";
}

export async function fetchCourses(): Promise<CourseRow[]> {
  const res = await fetch("/api/admin/courses");
  const json = await res.json();
  if (!json.success) return [];
  return (json.data as ApiCourse[]).map((c) => ({
    id: c.id,
    title: c.title,
    subject: c.subject ?? "—",
    grade: c.grade,
    lessonsCount: c.lessonsCount ?? 0,
    enrolledStudents: c.enrolledStudents ?? 0,
    rating: c.rating ?? 0,
    status: (c.status === "PUBLISHED" ? "Published" : "Draft") as "Published" | "Draft",
  }));
}

export async function createCourse(input: {
  title: string;
  subject?: string;
  grade: string;
  description?: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/admin/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  return { success: !!json.success, message: json.message ?? "Failed to create course." };
}

export async function updateCourse(
  id: string,
  input: Partial<{ title: string; subject: string; grade: string; description: string; rating: number; status: "PUBLISHED" | "DRAFT" }>
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  return { success: !!json.success, message: json.message ?? "Failed to update course." };
}

export async function deleteCourse(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
  const json = await res.json();
  return { success: !!json.success, message: json.message ?? "Failed to delete course." };
}

/* ============================================================
   PAYMENT
============================================================ */

export interface PaymentRow {
  id: string;
  transactionId: string;
  payerName: string;
  schoolOrUser: string;
  amount: string;
  date: string;
  method: string;
  status: "Completed" | "Pending" | "Refunded";
}

export async function fetchPayments(): Promise<PaymentRow[]> {
  const res = await fetch("/api/admin/payments");
  const json = await res.json();
  if (!json.success) return [];
  return (json.data as ApiPayment[]).map((p) => ({
    id: p.id,
    transactionId: p.transactionId,
    payerName: p.payerName,
    schoolOrUser: p.schoolOrUser ?? "—",
    amount: String(p.amount),
    date: new Date(p.date).toLocaleDateString(),
    method: p.method,
    status: (p.status === "COMPLETED" ? "Completed" : p.status === "REFUNDED" ? "Refunded" : "Pending") as
      | "Completed"
      | "Pending"
      | "Refunded",
  }));
}

export async function createPayment(input: {
  payerName: string;
  schoolOrUser?: string;
  amount: number;
  method?: string;
  status?: "COMPLETED" | "PENDING" | "REFUNDED";
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/admin/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  return { success: !!json.success, message: json.message ?? "Failed to generate invoice." };
}
