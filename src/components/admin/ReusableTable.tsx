"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreVertical } from "@/components/admin/icons";

export interface ColumnDef<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  cell?: (row: T) => React.ReactNode;
}

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  danger?: boolean;
}

interface ReusableTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  rowActions?: RowAction<T>[];
}

const ROWS_PER_PAGE = 10;

export default function ReusableTable<T extends { id: string }>({
  title,
  subtitle,
  data,
  columns,
  searchPlaceholder = "Search records...",
  primaryActionLabel,
  onPrimaryAction,
  rowActions,
}: ReusableTableProps<T>) {
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * ROWS_PER_PAGE;
  const pagedData = filteredData.slice(pageStart, pageStart + ROWS_PER_PAGE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="admin-card">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-orange-500"
            />
          </div>

          {primaryActionLabel && (
            <button onClick={onPrimaryAction} className="admin-btn-primary text-xs py-2 px-3 shrink-0">
              + {primaryActionLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No records match your search query.
                </td>
              </tr>
            ) : (
              pagedData.map((row) => (
                <tr key={row.id}>
                  {columns.map((col, idx) => (
                    <td key={idx}>
                      {col.cell
                        ? col.cell(row)
                        : typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  <td style={{ position: "relative" }}>
                    {rowActions && rowActions.length > 0 ? (
                      <>
                        <button
                          className="text-slate-400 hover:text-slate-600 p-1"
                          onClick={() => setOpenMenuId((prev) => (prev === row.id ? null : row.id))}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === row.id && (
                          <>
                            <div
                              style={{ position: "fixed", inset: 0, zIndex: 40 }}
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div
                              style={{
                                position: "absolute", right: 0, top: "100%", zIndex: 50,
                                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                                boxShadow: "0 10px 30px rgba(0,0,0,.12)", minWidth: 140, overflow: "hidden",
                              }}
                            >
                              {rowActions.map((action) => (
                                <button
                                  key={action.label}
                                  onClick={() => { setOpenMenuId(null); action.onClick(row); }}
                                  style={{
                                    display: "block", width: "100%", textAlign: "left",
                                    padding: "9px 14px", fontSize: 12.5, fontWeight: 600, background: "none", border: "none",
                                    color: action.danger ? "#dc2626" : "#334155", cursor: "pointer",
                                  }}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Controls */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
        <span>
          {filteredData.length === 0
            ? "No entries"
            : `Showing ${pageStart + 1} to ${Math.min(pageStart + ROWS_PER_PAGE, filteredData.length)} of ${filteredData.length} entries`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-bold text-slate-900">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
