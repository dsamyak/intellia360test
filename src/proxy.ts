import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AREA_ROLES, areaForPath, dashboardFor } from "@/lib/auth/roles";
import type { UserRole } from "@/types/auth";

const rawSecret = process.env.AUTH_JWT_SECRET;
if (!rawSecret || rawSecret.trim().length < 32) {
  throw new Error(
    "[proxy] AUTH_JWT_SECRET is not set or too short. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('base64'))\""
  );
}
const secret = new TextEncoder().encode(rawSecret);

const SESSION_COOKIE = "intellia_session";

interface JWTPayload {
  sub:   string;
  email: string;
  role:  UserRole;
  name:  string;
}

// ── Route categories ──────────────────────────────────────────────────────────
// Auth pages a signed-in user is sent away from. The protected areas, and the
// roles allowed into each, live in AREA_ROLES (lib/auth/roles.ts) so the
// browser-side SessionGuard applies exactly the same rules.
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/resend-verification",
];

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token   = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await getPayload(token) : null;
  const authed  = payload !== null;
  const role    = payload?.role;

  // ── Authenticated users → redirect off auth pages ─────────────────────────
  if (authed && matches(pathname, PUBLIC_ROUTES)) {
    return NextResponse.redirect(new URL(dashboardFor(role!), request.url));
  }

  const area = areaForPath(pathname);

  // ── Unauthenticated → redirect to /login?next=<path> ─────────────────────
  if (area && !authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role guards ───────────────────────────────────────────────────────────
  if (area && role && !AREA_ROLES[area].includes(role)) {
    return NextResponse.redirect(new URL(dashboardFor(role), request.url));
  }

  // Header override for EduNotes PDF content API to allow same‑origin iframe embedding
  if (pathname.startsWith("/api/student/edunotes/content")) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|api/).*)",
  ],
};
