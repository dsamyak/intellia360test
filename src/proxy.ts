import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_JWT_SECRET ?? "change-this-to-a-very-long-random-secret-key-at-least-64-chars"
);

const SESSION_COOKIE = "intellia_session";

// ── Route Categories ──────────────────────────────────────────────────────────
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const STUDENT_ROUTES = ["/student"];
const TEACHER_ROUTES = ["/teacher"];
const ADMIN_ROUTES = ["/admin"];

type Role = "ADMIN" | "STUDENT" | "PARENT" | "TEACHER" | "SCHOOL";

interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
}

async function getPayload(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await getPayload(token) : null;
  const isAuthenticated = payload !== null;

  // ── Authenticated users → redirect away from auth pages ──────────────────
  if (isAuthenticated && matchesAny(pathname, PUBLIC_ROUTES)) {
    const role = payload!.role;
    const dest =
      role === "TEACHER" || role === "SCHOOL" || role === "ADMIN"
        ? "/teacher/dashboard"
        : "/student/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Protect student routes ────────────────────────────────────────────────
  if (matchesAny(pathname, STUDENT_ROUTES)) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
    const role = payload!.role;
    if (role !== "STUDENT" && role !== "PARENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Protect teacher routes ────────────────────────────────────────────────
  if (matchesAny(pathname, TEACHER_ROUTES)) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
    const role = payload!.role;
    if (role !== "TEACHER" && role !== "SCHOOL" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Protect admin routes ──────────────────────────────────────────────────
  if (matchesAny(pathname, ADMIN_ROUTES)) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
    if (payload!.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|api/).*)",
  ],
};
