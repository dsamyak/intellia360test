/**
 * POST /api/admin/seed-admin
 *
 * ONE-TIME bootstrap route. Creates the first admin account if no admin
 * exists yet. Self-destructs by returning 410 Gone once an admin exists.
 *
 * DELETE THIS FILE after the first admin has been created.
 */
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/hash";
import { db } from "@/lib/db";

export async function POST(_req: NextRequest) {
  // If any admin already exists, refuse
  const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "An admin already exists. Remove this endpoint." },
      { status: 410 }
    );
  }

  const password = await hashPassword("Admin@Intellia360!");

  const admin = await db.user.create({
    data: {
      email:         "admin@intellia.dev",
      name:          "Platform Admin",
      password,
      role:          "ADMIN",
      emailVerified: true,
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(
    {
      success: true,
      message: "✅ Admin created. Login with admin@intellia.dev / Admin@Intellia360! — then DELETE this file.",
      data:    admin,
    },
    { status: 201 }
  );
}
