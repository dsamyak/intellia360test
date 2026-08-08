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
const EDITOR_ROUTES = ["/editor"];
const ADMIN_ROUTES = ["/admin"];

type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "TEACHER" | "EDITOR" | "STUDENT" | "USER";

interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
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

  // ── Already authenticated → redirect away from auth pages ────────────────
  if (isAuthenticated && matchesAny(pathname, PUBLIC_ROUTES)) {
    const role = payload!.role;
    const dest =
      role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER"
        ? "/teacher/dashboard"
        : role === "EDITOR"
        ? "/editor/dashboard"
        : "/student/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Protect student routes ────────────────────────────────────────────────
  if (matchesAny(pathname, STUDENT_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = payload!.role;
    if (role !== "STUDENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Protect teacher routes ────────────────────────────────────────────────
  if (matchesAny(pathname, TEACHER_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = payload!.role;
    if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "MANAGER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Protect editor routes ─────────────────────────────────────────────────
  if (matchesAny(pathname, EDITOR_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = payload!.role;
    if (role !== "EDITOR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Protect admin routes ──────────────────────────────────────────────────
  if (matchesAny(pathname, ADMIN_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = payload!.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - public assets (images, svg, etc.)
     * - api routes (they handle their own auth checks)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|api/).*)",
  ],
};
