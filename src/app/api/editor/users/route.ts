/**
 * GET   /api/editor/users          — list all users (paginated)
 * POST  /api/editor/users          — create a user directly (admin tool)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireEditorSession } from "@/lib/editor/require-editor-session";
import { hashPassword } from "@/lib/auth/hash";
import { PasswordSchema } from "@/lib/auth/validation";
import { ALL_ROLES } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const role  = searchParams.get("role") ?? undefined;
  const q     = searchParams.get("q")    ?? "";

  const where = {
    ...(role ? { role: role as never } : {}),
    ...(q ? {
      OR: [
        { name:  { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
  ]);

  const data: UserRow[] = users.map((u) => ({
    id:        u.id,
    name:      u.name,
    email:     u.email,
    role:      u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  return NextResponse.json(
    { success: true, message: "OK", data, meta: { total, page, limit, pages: Math.ceil(total / limit) } },
    { status: 200 }
  );
}

// Accounts created here go through the same rules as self-registration, so an
// editor-created account cannot end up with a weaker password or a
// non-normalised email that its owner can then never log in with.
const CreateUserSchema = z.object({
  name:     z.string().trim().min(2),
  email:    z.string().trim().toLowerCase().email(),
  password: PasswordSchema,
  role:     z.enum(ALL_ROLES),
});

export async function POST(request: NextRequest) {
  const { errorResponse } = await requireEditorSession();
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const result = CreateUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed",
        errors: result.error.flatten().fieldErrors as Record<string,string[]> },
      { status: 422 }
    );
  }

  const { name, email, password, role } = result.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Email already exists" },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email, password: hashed, role: role as never },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json<AuthResponse<UserRow>>(
    { success: true, message: "User created",
      data: { ...user, createdAt: user.createdAt.toISOString() } },
    { status: 201 }
  );
}
