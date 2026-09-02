/**
 * GET  /api/admin/content  — ADMIN-only: list content resources
 * POST /api/admin/content  — ADMIN-only: add a content resource
 *
 * No object-storage provider is configured for this project, so resources
 * are metadata + an optional external URL rather than uploaded file bytes.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

const CreateContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(["edunotes", "visual-models", "videos", "ai-prompts"]),
  url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export async function GET() {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const items = await db.contentResource.findMany({ orderBy: { createdAt: "desc" } });

  return NextResponse.json<AuthResponse<typeof items>>(
    { success: true, message: "OK", data: items },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const result = CreateContentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 422 }
    );
  }

  const { title, description, category, url } = result.data;
  const item = await db.contentResource.create({
    data: { title, description, category, url: url || undefined },
  });

  return NextResponse.json<AuthResponse<typeof item>>(
    { success: true, message: "Resource added.", data: item },
    { status: 201 }
  );
}
