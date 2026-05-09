"use client";

import React from "react";
import { FaSync } from "react-icons/fa";
import { TableColumn } from "./TableTypes";

interface DataTableSingleProps {
  columns: TableColumn[];
  data: any[];
  idKey: string;
  selectedId: string | null;
  onSelectionChange: (id: string | null) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTableSingle({
  columns,
  data,
  idKey,
  selectedId,
  onSelectionChange,
  isLoading = false,
  emptyMessage = "Tidak ada data ditemukan.",
}: DataTableSingleProps) {
  const handleRowClick = (id: string) => {
    if (selectedId === id) {
      onSelectionChange(null);
    } else {
      onSelectionChange(id);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 border-t border-slate-300 relative h-full custom-scrollbar">
      <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
        <thead className="sticky top-0 z-10 text-slate-600 shadow-sm backdrop-blur-md bg-white/95 border-b-2 border-brand-500">
          <tr>
            <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center w-10">
              No.
            </th>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-2.5 px-3 font-bold border-r border-slate-200 ${col.className || ""}`}
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
              <td colSpan={columns.length + 1} className="py-20 text-center text-slate-400 italic">
                <div className="flex flex-col items-center gap-3">
                  <FaSync className="animate-spin text-3xl text-brand-500" />
                  <span>Mengambil data dari server...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="py-20 text-center text-slate-400 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const id = String(row[idKey]);
              const isSelected = selectedId === id;
              return (
                <tr
                  key={id}
                  onClick={() => handleRowClick(id)}
                  className={`border-b border-slate-100 cursor-pointer transition-all duration-200
                    ${isSelected ? "bg-brand-50 shadow-[inset_4px_0_0_0_var(--color-brand-500)]" : i % 2 === 0 ? "bg-white" : "bg-slate-50/80"} 
                    hover:bg-brand-50 hover:shadow-[inset_4px_0_0_0_var(--color-brand-500)]`}
                >
                  <td className="py-2 px-3 text-slate-500 text-center border-r border-slate-100 font-medium">
                    {i + 1}
                  </td>
                  {columns.map((col, idx) => (
                    <td key={idx} className={`py-2 px-3 border-r border-slate-100 ${col.className || ""}`}>
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
  );
}
