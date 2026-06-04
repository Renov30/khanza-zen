"use client";

import React from "react";
import { FaSync } from "react-icons/fa";
import { TableColumn } from "./TableTypes";
import { type RowClassFn } from "@/lib/row-colors";

interface DataTableSingleProps {
  title?: string;
  icon?: React.ReactNode;
  onRefresh?: () => void;
  columns: TableColumn[];
  data: any[];
  idKey: string;
  selectedId: string | null;
  onSelectionChange: (id: string | null) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  getRowKey?: (row: any, index: number) => string;
  getRowClass?: RowClassFn;
}

export default function DataTableSingle({
  title,
  icon,
  onRefresh,
  columns,
  data,
  idKey,
  selectedId,
  onSelectionChange,
  isLoading = false,
  emptyMessage = "Tidak ada data ditemukan.",
  getRowKey,
  getRowClass,
}: DataTableSingleProps) {
  const handleRowClick = (id: string) => {
    if (selectedId === id) {
      onSelectionChange(null);
    } else {
      onSelectionChange(id);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {title && (
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between shrink-0">
          <h2 className="text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center gap-2 tracking-wide">
            {icon && <span className="text-brand-600">{icon}</span>}
            {title}
          </h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
              title="Refresh Data"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-auto relative h-full custom-scrollbar">
      <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
        <thead className="sticky top-0 z-10 text-slate-600 shadow-sm backdrop-blur-md bg-white/95 border-b-2 border-brand-500 dark:text-slate-300 dark:bg-slate-800/95">
          <tr>
            <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center w-10 dark:border-slate-600">
              No.
            </th>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-2.5 px-3 font-bold border-r border-slate-200 dark:border-slate-600 ${col.className || ""}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + 1} className="py-20 text-center text-slate-400 italic dark:text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <FaSync className="animate-spin text-3xl text-brand-500" />
                  <span>Mengambil data dari server...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="py-20 text-center text-slate-400 italic dark:text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const id = String(row[idKey]);
              const isSelected = selectedId === id;
              const rowKey = getRowKey ? getRowKey(row, i) : `${id}-${i}`;
              const rowClass = getRowClass
                ? getRowClass(row, i, isSelected)
                : isSelected
                  ? "bg-brand-50 shadow-[inset_4px_0_0_0_var(--color-brand-500)] text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-700 dark:text-slate-200";
              return (
                <tr
                  key={rowKey}
                  onClick={() => handleRowClick(id)}
                  className={`border-b border-slate-100 cursor-pointer transition-all duration-200 dark:border-slate-700 ${rowClass}
                    hover:bg-brand-50 hover:shadow-[inset_4px_0_0_0_var(--color-brand-500)] dark:hover:bg-slate-700`}
                >
                  <td className="py-2 px-3 text-slate-500 text-center border-r border-slate-100 dark:text-slate-400 dark:border-slate-700 font-medium">
                    {i + 1}
                  </td>
                  {columns.map((col, idx) => (
                    <td key={idx} className={`py-2 px-3 border-r border-slate-100 dark:border-slate-700 ${col.className || ""}`}>
                      {col.render ? col.render(row, i) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
