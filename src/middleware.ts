import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_JWT_SECRET ??
    "change-this-to-a-very-long-random-secret-key-at-least-64-chars"
);

const SESSION_COOKIE = "intellia_session";

type Role = "ADMIN" | "STUDENT" | "PARENT" | "TEACHER" | "SCHOOL" | "EDITOR";

interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
}

// ── Route categories ──────────────────────────────────────────────────────────
const PUBLIC_ROUTES   = ["/login", "/register", "/forgot-password", "/reset-password"];
const STUDENT_ROUTES  = ["/student"];
const TEACHER_ROUTES  = ["/teacher"];
const EDITOR_ROUTES   = ["/editor"];
const ADMIN_ROUTES    = ["/admin"];

async function getPayload(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function dashboardFor(role: Role): string {
  if (role === "TEACHER" || role === "SCHOOL") return "/teacher/dashboard";
  if (role === "ADMIN")                        return "/editor/dashboard";
  if (role === "EDITOR")                       return "/editor/dashboard";
  return "/student/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token   = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await getPayload(token) : null;
  const authed  = payload !== null;
  const role    = payload?.role;

  // ── Authenticated → redirect off auth pages ──────────────────────────────
  if (authed && matches(pathname, PUBLIC_ROUTES)) {
    return NextResponse.redirect(new URL(dashboardFor(role!), request.url));
  }

  // ── Unauthenticated → redirect to login ──────────────────────────────────
  const isProtected =
    matches(pathname, STUDENT_ROUTES) ||
    matches(pathname, TEACHER_ROUTES) ||
    matches(pathname, EDITOR_ROUTES)  ||
    matches(pathname, ADMIN_ROUTES);

  if (isProtected && !authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role guards ───────────────────────────────────────────────────────────
  if (authed && role) {
    if (matches(pathname, STUDENT_ROUTES)) {
      if (role !== "STUDENT" && role !== "PARENT" && role !== "ADMIN") {
        return NextResponse.redirect(new URL(dashboardFor(role), request.url));
      }
    }

    if (matches(pathname, TEACHER_ROUTES)) {
      if (role !== "TEACHER" && role !== "SCHOOL" && role !== "ADMIN") {
        return NextResponse.redirect(new URL(dashboardFor(role), request.url));
      }
    }

    if (matches(pathname, EDITOR_ROUTES)) {
      if (role !== "EDITOR" && role !== "ADMIN") {
        return NextResponse.redirect(new URL(dashboardFor(role), request.url));
      }
    }

    if (matches(pathname, ADMIN_ROUTES)) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL(dashboardFor(role), request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|api/).*)",
  ],
};
