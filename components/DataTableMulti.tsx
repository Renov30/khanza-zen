"use client";

import React from "react";
import { FaSync, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import { TableColumn } from "./TableTypes";

interface DataTableMultiProps {
  title?: string;
  icon?: React.ReactNode;
  onRefresh?: () => void;
  onTitleClick?: () => void;
  titleChevronOpen?: boolean;
  columns: TableColumn[];
  data: any[];
  idKey: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}

export default function DataTableMulti({
  title,
  icon,
  onRefresh,
  onTitleClick,
  titleChevronOpen,
  columns,
  data,
  idKey,
  selectedIds,
  onSelectionChange,
  isLoading = false,
  emptyMessage = "Tidak ada data ditemukan.",
  onRowClick,
}: DataTableMultiProps) {
  const allIds = data.map((item) => String(item[idKey]));
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  };

  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {title && (
        <div className={`bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1 border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0 dark:from-slate-700 dark:to-slate-800 dark:border-slate-600 ${onTitleClick ? 'cursor-pointer select-none' : ''}`}
          onClick={onTitleClick}>
          <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
            {icon && <span className="text-brand-600">{icon}</span>}
            {title}
            {onTitleClick && (
              <motion.span
                animate={{ rotate: titleChevronOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <FaChevronDown className="text-xs text-brand-800" />
              </motion.span>
            )}
          </h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-brand-200 rounded-full transition-colors text-brand-700"
              title="Refresh Data"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-auto bg-slate-50/50 border-t border-slate-300 relative h-full custom-scrollbar dark:bg-slate-900/50 dark:border-slate-600">
      <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
        <thead className="sticky top-0 z-10 text-slate-600 shadow-sm backdrop-blur-md bg-white/95 border-b-2 border-brand-500 dark:text-slate-300 dark:bg-slate-800/95">
          <tr>
            <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center w-10 dark:border-slate-600">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 accent-brand-600 cursor-pointer"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
            </th>
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
              <td colSpan={columns.length + 2} className="py-20 text-center text-slate-400 italic dark:text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <FaSync className="animate-spin text-3xl text-brand-500" />
                  <span>Mengambil data dari server...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className="py-20 text-center text-slate-400 italic dark:text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const id = String(row[idKey]);
              const isSelected = selectedIds.includes(id);
              return (
                <tr
                  key={id}
                  onClick={() => { toggleRow(id); if (onRowClick) onRowClick(row); }}
                  className={`border-b border-slate-100 cursor-pointer transition-all duration-200 dark:border-slate-700
                    ${isSelected ? "bg-brand-50 shadow-[inset_4px_0_0_0_var(--color-brand-500)] text-slate-700 dark:bg-slate-700 dark:text-slate-100" : i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50/80 dark:bg-slate-900"} 
                    hover:bg-brand-50 hover:shadow-[inset_4px_0_0_0_var(--color-brand-500)] dark:hover:bg-slate-700`}
                >
                    <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 accent-brand-600 cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                    />
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-center border-r border-slate-100 dark:border-slate-700 dark:text-slate-400 font-medium">
                    {i + 1}
                  </td>
                  {columns.map((col, idx) => (
                    <td key={idx} className={`py-2 px-3 border-r border-slate-100 dark:border-slate-700 ${col.className || ""}`}>
                      {col.render ? col.render(row, i) : (row[col.key] instanceof Date ? row[col.key].toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) : row[col.key])}
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
