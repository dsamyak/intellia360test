"use client";

import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ReusableTable, {
  ColumnDef,
} from "@/components/admin/ReusableTable";
import ChartCard from "@/components/admin/ChartCard";
import {
  IndianRupee,
  CreditCard,
  Clock,
  CheckCircle2,
} from "@/components/admin/icons";

type PaymentStatus = "Completed" | "Pending" | "Failed";

type Payment = {
  id: string;
  transactionId: string;
  payerName: string;
  schoolOrUser: string;
  amount: number;
  date: string;
  method: string;
  status: PaymentStatus;
};

export default function AdminPaymentsPage() {
  // Starts completely empty.
  // Data can later come from API/backend.
  const [payments, setPayments] = useState<Payment[]>([]);

  /* =========================
     DYNAMIC PAYMENT STATISTICS
  ========================= */

  const paymentStats = useMemo(() => {
    const revenue = payments
      .filter((payment) => payment.status === "Completed")
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    const completedTransactions = payments.filter(
      (payment) => payment.status === "Completed"
    ).length;

    const pendingInvoices = payments
      .filter((payment) => payment.status === "Pending")
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    const activeSubscriptions = payments.filter(
      (payment) => payment.status === "Completed"
    ).length;

    return {
      revenue,
      completedTransactions,
      pendingInvoices,
      activeSubscriptions,
    };
  }, [payments]);

  /* =========================
     TABLE COLUMNS
  ========================= */

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      header: "Transaction ID",
      accessor: (row) => (
        <span className="font-bold text-slate-700">
          {row.transactionId}
        </span>
      ),
    },

    {
      header: "Payer / School",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">
            {row.payerName}
          </div>

          <div className="text-xs text-slate-500">
            {row.schoolOrUser}
          </div>
        </div>
      ),
    },

    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-bold text-slate-900">
          ₹{Number(row.amount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      header: "Payment Date",
      accessor: "date",
    },

    {
      header: "Method",
      accessor: "method",
    },

    {
      header: "Status",
      accessor: (row) => {
        const statusClass =
          row.status === "Completed"
            ? "completed"
            : row.status === "Pending"
              ? "pending"
              : "inactive";

        return (
          <span className={`status-badge ${statusClass}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  /* =========================
     GENERATE INVOICE
  ========================= */

  const handleGenerateInvoice = () => {
    console.log("Generate Invoice");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wide text-orange-600">
                Finance & Billing
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Payments & Subscriptions
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage school subscriptions, transactions, invoices and
              payment activity.
            </p>
          </div>

          <button
            onClick={handleGenerateInvoice}
            className="admin-btn-primary"
          >
            + Generate Invoice
          </button>
        </div>

        {/* =========================
            KPI CARDS
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Revenue */}
          <div className="admin-card payment-kpi-card">
            <div className="payment-kpi-icon orange">
              <IndianRupee className="w-6 h-6" />
            </div>

            <div>
              <p className="payment-kpi-label">
                Revenue (MTD)
              </p>

              <h2 className="payment-kpi-value">
                ₹{paymentStats.revenue.toLocaleString("en-IN")}
              </h2>

              <p className="payment-kpi-subtitle">
                From completed payments
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="admin-card payment-kpi-card">
            <div className="payment-kpi-icon green">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <p className="payment-kpi-label">
                Completed Transactions
              </p>

              <h2 className="payment-kpi-value">
                {paymentStats.completedTransactions.toLocaleString("en-IN")}
              </h2>

              <p className="payment-kpi-subtitle">
                Successful payments
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="admin-card payment-kpi-card">
            <div className="payment-kpi-icon amber">
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <p className="payment-kpi-label">
                Pending Invoices
              </p>

              <h2 className="payment-kpi-value">
                ₹{paymentStats.pendingInvoices.toLocaleString("en-IN")}
              </h2>

              <p className="payment-kpi-subtitle">
                Awaiting payment
              </p>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="admin-card payment-kpi-card">
            <div className="payment-kpi-icon blue">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <p className="payment-kpi-label">
                Active Subscriptions
              </p>

              <h2 className="payment-kpi-value">
                {paymentStats.activeSubscriptions.toLocaleString("en-IN")}
              </h2>

              <p className="payment-kpi-subtitle">
                Active paid accounts
              </p>
            </div>
          </div>

        </div>

        {/* =========================
            REVENUE CHART
        ========================= */}

        <div className="admin-card payment-chart-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Monthly Billing & Revenue
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Revenue generated from completed transactions.
              </p>
            </div>

            <span className="payment-live-badge">
              Live Data
            </span>
          </div>

          {payments.length > 0 ? (
            <ChartCard
              type="revenue"
              title="Revenue Breakdown"
            />
          ) : (
            <div className="payment-empty-chart">
              <div className="payment-empty-icon">
                <IndianRupee className="w-7 h-7" />
              </div>

              <h3>
                No payment data yet
              </h3>

              <p>
                Revenue analytics will appear here once payment
                transactions are added.
              </p>
            </div>
          )}
        </div>

        {/* =========================
            TRANSACTION TABLE
        ========================= */}

        <div className="admin-card payment-table-wrapper">

          <ReusableTable
            title="Transaction History & Billing Logs"
            subtitle="View payments, invoice status, UPI transactions and school subscription renewals."
            data={payments}
            columns={paymentColumns}
            searchPlaceholder="Search by transaction ID, school or method..."
            primaryActionLabel="Generate Invoice"
            onPrimaryAction={handleGenerateInvoice}
          />

          {/* Empty State */}
          {payments.length === 0 && (
            <div className="payment-empty-state">

              <div className="payment-empty-circle">
                <CreditCard className="w-8 h-8" />
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Payment records will appear here when transactions
                are added to the platform.
              </p>

              <button
                onClick={handleGenerateInvoice}
                className="admin-btn-primary mt-4"
              >
                + Generate First Invoice
              </button>

            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}