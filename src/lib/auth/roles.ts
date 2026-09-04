/**
 * Single source of truth for role values.
 *
 * Every layer that names a role imports from here so the strings can never
 * drift apart:
 *
 *   • Prisma  — `enum Role` in prisma/schema.prisma (must stay in sync)
 *   • Types   — `UserRole` in src/types/auth.ts
 *   • Zod     — RegisterSchema.requestedRole
 *   • UI      — the intent picker on the register page
 *   • Routing — proxy.ts role guards and the post-login redirect
 *
 * Values are the SCREAMING_CASE Prisma enum members. Nothing in the app
 * should ever send or compare a lowercase / display-cased role string.
 */
import type { UserRole } from "@/types/auth";

/** Every role the system knows about — mirrors the Prisma `Role` enum. */
export const ALL_ROLES = [
  "ADMIN",
  "STUDENT",
  "PARENT",
  "TEACHER",
  "SCHOOL",
  "EDITOR",
] as const satisfies readonly UserRole[];

/**
 * Roles a visitor may *request* at signup.
 *
 * ADMIN is deliberately absent: it can only be granted by an existing admin
 * via PATCH /api/admin/users/[userId]/role.
 */
export const REGISTRABLE_ROLES = [
  "STUDENT",
  "PARENT",
  "TEACHER",
  "SCHOOL",
  "EDITOR",
] as const satisfies readonly UserRole[];

export type RegistrableRole = (typeof REGISTRABLE_ROLES)[number];

/**
 * The role every new account is created with, regardless of the requested
 * role. An admin reviews `requestedRole` and upgrades the account.
 */
export const DEFAULT_ROLE = "STUDENT" as const satisfies UserRole;

/** Landing page for a role after login / verification. */
export function dashboardFor(role: UserRole): string {
  if (role === "TEACHER" || role === "SCHOOL") return "/teacher/dashboard";
  if (role === "EDITOR")                       return "/editor/dashboard";
  if (role === "ADMIN")                        return "/admin/dashboard";
  // STUDENT, PARENT and any unrecognised value land on the student dashboard.
  return "/student/dashboard";
}
