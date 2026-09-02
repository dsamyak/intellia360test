/**
 * GET  /api/admin/payments  — ADMIN-only: list payments/invoices
 * POST /api/admin/payments  — ADMIN-only: generate an invoice/payment record
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin-session";
import { db } from "@/lib/db";
import type { AuthResponse } from "@/types/auth";

const CreatePaymentSchema = z.object({
  payerName: z.string().min(1, "Payer name is required"),
  schoolOrUser: z.string().optional(),
  amount: z.coerce.number().int().nonnegative(),
  method: z.string().default("Manual"),
  status: z.enum(["COMPLETED", "PENDING", "REFUNDED"]).default("PENDING"),
});

export async function GET() {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const payments = await db.payment.findMany({ orderBy: { date: "desc" } });

  return NextResponse.json<AuthResponse<typeof payments>>(
    { success: true, message: "OK", data: payments },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminSession();
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const result = CreatePaymentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Validation failed", errors: result.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 422 }
    );
  }

  const transactionId = `INV-${Date.now().toString(36).toUpperCase()}`;
  const payment = await db.payment.create({
    data: { ...result.data, transactionId },
  });

  return NextResponse.json<AuthResponse<typeof payment>>(
    { success: true, message: `Invoice ${transactionId} generated.`, data: payment },
    { status: 201 }
  );
}
