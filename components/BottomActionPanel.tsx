"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaSave,
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaPrint,
  FaList,
  FaTimes,
  FaSearch,
  FaCheck,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomActionPanelProps {
  onSave?: () => void;
  onNew?: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onAll?: () => void;
  onExit?: () => void;
  recordCount?: number;
  extraFilters?: React.ReactNode;
  leftFilters?: React.ReactNode;
  customButtons?: React.ReactNode;
  hideStandardButtons?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  dateStart?: string;
  dateEnd?: string;
  onDateStartChange?: (value: string) => void;
  onDateEndChange?: (value: string) => void;
  buttonsAlign?: "center" | "left";
}

export default function BottomActionPanel({
  onSave,
  onNew,
  onReplace,
  onDelete,
  onPrint,
  onAll,
  onExit,
  recordCount = 0,
  extraFilters,
  leftFilters,
  customButtons,
  hideStandardButtons = false,
  searchValue = "",
  onSearchChange,
  onSearch,
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
  buttonsAlign = "center",
}: BottomActionPanelProps) {
  const router = useRouter();

  const onSaveRef = useRef(onSave);
  const onNewRef = useRef(onNew);
  const onReplaceRef = useRef(onReplace);
  const onDeleteRef = useRef(onDelete);
  const onPrintRef = useRef(onPrint);
  const onAllRef = useRef(onAll);
  const onExitRef = useRef(onExit);
  const onSearchRef = useRef(onSearch);
  onSaveRef.current = onSave;
  onNewRef.current = onNew;
  onReplaceRef.current = onReplace;
  onDeleteRef.current = onDelete;
  onPrintRef.current = onPrint;
  onAllRef.current = onAll;
  onExitRef.current = onExit;
  onSearchRef.current = onSearch;

  const handleExit = () => {
    if (onExitRef.current) {
      onExitRef.current();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      switch (e.key.toLowerCase()) {
        case 's': e.preventDefault(); onSaveRef.current?.(); break;
        case 'n': e.preventDefault(); onNewRef.current?.(); break;
        case 'e': e.preventDefault(); onReplaceRef.current?.(); break;
        case 'd': e.preventDefault(); onDeleteRef.current?.(); break;
        case 'p': e.preventDefault(); onPrintRef.current?.(); break;
        case 'l': e.preventDefault(); onAllRef.current?.(); break;
        case 'q': e.preventDefault(); handleExit(); break;
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearchRef.current) {
      onSearchRef.current();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/60 text-xs shrink-0 flex flex-col gap-3 bg-white">
      {extraFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 border-b border-brand-50 pb-2 mb-1 dark:border-slate-700">
          {extraFilters}
        </div>
      )}
      {/* Baris Filter */}
      <div className={`flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-700 ${buttonsAlign === "center" ? "justify-center" : "justify-start"}`}>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {leftFilters}
          <span className="font-semibold text-slate-600 dark:text-slate-300">Periode :</span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              className="border border-slate-200 rounded text-slate-600 px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white shadow-sm dark:border-slate-600 dark:text-slate-200 dark:bg-slate-700"
              value={dateStart}
              onChange={(e) => onDateStartChange?.(e.target.value)}
            />
            <span className="text-slate-400 font-bold dark:text-slate-500">s.d.</span>
            <input
              type="date"
              className="border border-slate-200 rounded text-slate-600 px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white shadow-sm dark:border-slate-600 dark:text-slate-200 dark:bg-slate-700"
              value={dateEnd}
              onChange={(e) => onDateEndChange?.(e.target.value)}
            />
          </div>
          <span className="font-semibold text-slate-600 hidden sm:inline dark:text-slate-300 ml-2">Pencarian :</span>
          <div className="flex items-center gap-2">
          <div className="flex bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-brand-500 w-full sm:w-[250px] dark:bg-slate-700 dark:border-slate-600">
            <input
              type="text"
              className="w-full bg-transparent outline-none px-2 py-1 text-slate-700 dark:text-slate-200"
              placeholder="Cari data di sini..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex border-l border-slate-200 dark:border-slate-600">
              <button
                onClick={onSearch}
                title="Cari"
                className="px-2 text-brand-500 hover:bg-brand-50 transition-colors dark:hover:bg-slate-700"
              >
                <FaCheck className="text-[10px]" />
              </button>
              <button
                onClick={onSearch}
                title="Cari (Enter)"
                className="px-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors border-l border-slate-100 dark:text-slate-500 dark:hover:text-brand-400 dark:hover:bg-slate-700 dark:border-slate-700"
              >
                <FaSearch className="text-[10px]" />
              </button>
            </div>
          </div>
          <div className="flex items-center text-slate-500 font-semibold text-[11px] dark:text-slate-400 shrink-0">
            Record :{" "}
            <span className="text-slate-800 ml-1 dark:text-slate-100">{recordCount}</span>
          </div>
        </div>
        </div>
      </div>

      {/* Baris Tombol */}
      <div className={`flex items-center flex-wrap gap-1.5 ${buttonsAlign === "center" ? "justify-center" : "justify-start"}`}>
        {customButtons}
        {!hideStandardButtons && (
          <>
            <ActionButton
              onClick={onSave}
              icon={<FaSave className="text-white drop-shadow-sm" />}
              label="Simpan"
              variant="primary"
              title="Simpan (Ctrl+S)"
            />
            <ActionButton
              onClick={onNew}
              icon={<FaFileAlt className="text-brand-600 drop-shadow-sm" />}
              label="Baru"
              title="Baru (Ctrl+N)"
            />
            <ActionButton
              onClick={onReplace}
              icon={<FaEdit className="text-orange-500 drop-shadow-sm" />}
              label="Ganti"
              title="Ganti (Ctrl+E)"
            />
            <ActionButton
              onClick={onDelete}
              icon={<FaTrash className="text-red-500 drop-shadow-sm" />}
              label="Hapus"
              variant="danger"
              title="Hapus (Ctrl+D)"
            />
            <ActionButton
              onClick={onPrint}
              icon={<FaPrint className="text-indigo-600 drop-shadow-sm" />}
              label="Cetak"
              title="Cetak (Ctrl+P)"
            />
            <ActionButton
              onClick={onAll}
              icon={<FaList className="text-slate-600 drop-shadow-sm" />}
              label="Semua"
              title="Semua (Ctrl+L)"
            />
          </>
        )}
        <ActionButton
          icon={<FaTimes className="text-red-500 drop-shadow-sm" />}
          label="Keluar"
          isExit
          title="Keluar (Ctrl+Q)"
          onClick={handleExit}
        />
      </div>
    </div>
  );
}

// Exportable Button Component
export function ActionButton({
  icon,
  label,
  title,
  isExit,
  variant,
  className = "",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  title?: string;
  isExit?: boolean;
  variant?: "primary" | "danger";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant={variant === "primary" ? "default" : "outline"}
      size="sm"
      title={title}
      onClick={onClick}
      className={cn(
        "h-7.5 font-bold text-[11px] transition-all active:scale-95",
        variant === "primary"
          ? "bg-brand-600 hover:bg-brand-700 text-white border-brand-600 shadow-sm"
          : variant === "danger"
            ? "bg-white border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 dark:bg-slate-700 dark:border-red-800 dark:hover:border-red-400 dark:hover:bg-red-900/30 dark:text-red-300"
            : isExit
              ? "bg-white border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 dark:bg-slate-700 dark:border-red-800 dark:hover:border-red-400 dark:hover:bg-red-900/30 dark:text-red-300"
              : "bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-brand-400 dark:hover:bg-slate-700 dark:text-slate-200",
        className,
      )}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </Button>
  );
}
