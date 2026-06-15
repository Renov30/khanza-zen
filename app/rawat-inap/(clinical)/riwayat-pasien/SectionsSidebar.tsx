"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import {
  FaBars, FaTimes, FaSquare, FaCheckSquare, FaMinusSquare,
  FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaTimesCircle,
} from "react-icons/fa";
import { sectionGroups, allSectionIds } from "./section-groups";

type SortOrder = "a-z" | "z-a";

interface SectionsSidebarProps {
  checkedSections: Record<string, boolean>;
  setCheckedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SectionItem = memo(function SectionItem({
  section,
  checked,
  onToggle,
}: {
  section: { id: string; label: string };
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onToggle(section.id)}
      className={`
        flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[11px] transition-colors select-none
        ${checked
          ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
        }
      `}
    >
      {checked ? (
        <FaCheckSquare className="text-brand-500 text-xs shrink-0" />
      ) : (
        <FaSquare className="text-slate-300 dark:text-slate-600 text-xs shrink-0" />
      )}
      <span className="truncate">{section.label}</span>
    </div>
  );
});

export default function SectionsSidebar({
  checkedSections,
  setCheckedSections,
  sidebarOpen,
  setSidebarOpen,
}: SectionsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("a-z");

  const allSections = useMemo(() => sectionGroups.flatMap(g => g.sections), []);

  const allChecked = useMemo(
    () => allSectionIds.length > 0 && allSectionIds.every(id => checkedSections[id]),
    [checkedSections],
  );
  const someChecked = useMemo(
    () => allSectionIds.some(id => checkedSections[id]),
    [checkedSections],
  );

  const [filteredSections, totalFiltered] = useMemo(() => {
    let secs = allSections;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      secs = secs.filter(s => s.label.toLowerCase().includes(q));
    }
    if (sortOrder) {
      secs = [...secs].sort((a, b) =>
        sortOrder === "a-z"
          ? a.label.localeCompare(b.label)
          : b.label.localeCompare(a.label)
      );
    }
    return [secs, secs.length] as const;
  }, [searchQuery, sortOrder, allSections]);

  const toggleSort = useCallback(() => {
    setSortOrder(prev => prev === "a-z" ? "z-a" : "a-z");
  }, []);

  const handleToggleAll = useCallback(() => {
    if (allChecked) {
      setCheckedSections({});
    } else {
      const all: Record<string, boolean> = {};
      for (const id of allSectionIds) all[id] = true;
      setCheckedSections(all);
    }
  }, [allChecked, setCheckedSections]);

  const handleToggleSection = useCallback((id: string) => {
    setCheckedSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setCheckedSections]);

  return (
    <>
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-0 top-20 z-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 border-l-0 rounded-r-lg shadow-md px-2 py-3 text-slate-500 hover:text-brand-600 transition-colors"
          title="Buka Menu Section"
        >
          <FaBars className="text-sm" />
        </button>
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          shrink-0 relative z-40
          fixed lg:static inset-y-0 left-0
          shadow-lg lg:shadow-none
          custom-scrollbar
          ${sidebarOpen ? "w-[260px] overflow-y-auto" : "w-0 overflow-hidden"}
          transition-all duration-200 ease-in-out
        `}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full min-w-[260px]">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Menu Section
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes className="text-[11px]" />
              </button>
            </div>

            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 shrink-0 space-y-2">
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari section..."
                    className="w-full h-7 pl-6 pr-6 text-[11px] rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FaTimesCircle className="text-[10px]" />
                    </button>
                  )}
                </div>
                <button
                  onClick={toggleSort}
                  className={`h-7 px-1.5 rounded border text-[11px] transition-colors ${
                    sortOrder
                      ? "border-brand-400 text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-300"
                      : "border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-slate-700"
                  }`}
                  title={sortOrder === "a-z" ? "A-Z" : sortOrder === "z-a" ? "Z-A" : "Urutkan"}
                >
                  {sortOrder === "z-a" ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                </button>
              </div>

              {searchQuery && (
                <div className="text-[10px] text-slate-400">
                  Menampilkan {totalFiltered} dari {allSectionIds.length} section
                </div>
              )}
            </div>

            <div
              onClick={handleToggleAll}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors border-b border-slate-100 dark:border-slate-700/50 shrink-0"
            >
              {allChecked ? (
                <FaCheckSquare className="text-brand-500 text-sm shrink-0" />
              ) : someChecked ? (
                <FaMinusSquare className="text-brand-400 text-sm shrink-0" />
              ) : (
                <FaSquare className="text-slate-300 dark:text-slate-600 text-sm shrink-0" />
              )}
              <span>Semua</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
              {filteredSections.length === 0 ? (
                <div className="px-3 py-6 text-center text-[11px] text-slate-400">
                  Tidak ada section yang cocok dengan &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredSections.map((section) => (
                  <SectionItem
                    key={section.id}
                    section={section}
                    checked={!!checkedSections[section.id]}
                    onToggle={handleToggleSection}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
