/* ============================================================
   ADMIN TABLE DATA
   Frontend-only / Dynamic-ready version

   Initial state:
   - No fake records
   - No hardcoded schools
   - No hardcoded teachers
   - No hardcoded students
   - No hardcoded courses
   - No hardcoded payments

   Backend/API connect hone ke baad arrays me actual records
   populate kiye ja sakte hain.
============================================================ */

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

export const mockSchools: SchoolRow[] = [];

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

export const mockTeachers: TeacherRow[] = [];

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

export const mockStudents: StudentRow[] = [];

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

export const mockCourses: CourseRow[] = [];

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

export const mockPayments: PaymentRow[] = [];

/* ============================================================
   FUTURE API HELPERS
   ------------------------------------------------------------
   These functions are intentionally empty for now because
   backend is not connected yet.
============================================================ */

export async function fetchSchools(): Promise<SchoolRow[]> {
  return [];
}

export async function fetchTeachers(): Promise<TeacherRow[]> {
  return [];
}

export async function fetchStudents(): Promise<StudentRow[]> {
  return [];
}

export async function fetchCourses(): Promise<CourseRow[]> {
  return [];
}

export async function fetchPayments(): Promise<PaymentRow[]> {
  return [];
}