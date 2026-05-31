"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FaBed,
  FaStethoscope,
  FaHistory,
  FaUtensils,
  FaSyringe,
  FaClipboardList,
  FaBars,
  FaSearch,
  FaChevronDown,
  FaCircle,
} from "react-icons/fa";
import { cekResumePasien } from "@/lib/actions/ranap";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: <FaBed />,
    label: "Pemeriksaan / CPPT",
    path: "/rawat-inap/pemeriksaan",
  },
  { icon: <FaStethoscope />, label: "Resume Pasien", path: "" },
  {
    icon: <FaHistory />,
    label: "Riwayat Pasien",
    path: "/rawat-inap/riwayat-pasien",
  },
  {
    icon: <FaUtensils />,
    label: "Modul Gizi",
    children: [
      { icon: <FaUtensils />, label: "Asesmen Gizi", path: "/rawat-inap/asuhan-gizi" },
      { icon: <FaClipboardList />, label: "Skrining Nutrisi", path: "/rawat-inap/skrining-nutrisi" },
      { icon: <FaUtensils />, label: "Diet Pasien", path: "/rawat-inap/diet-pasien" },
    ],
  },
  { icon: <FaSyringe />, label: "Bundle PPI", path: "" },
  { icon: <FaClipboardList />, label: "Rekapan HAIs", path: "" },
];

export default function ClinicalSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const noRawat = searchParams.get("noRawat") || "";
  const noRM = searchParams.get("noRM") || "";
  const namaPasien = searchParams.get("nama") || "";
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return false;
      const saved = localStorage.getItem("khanza_clinical_sidebar_open");
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setIsSidebarOpen(false);
      } else {
        const saved = localStorage.getItem("khanza_clinical_sidebar_open");
        if (saved !== null) {
          setIsSidebarOpen(JSON.parse(saved));
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [isResumeFilled, setIsResumeFilled] = useState(false);

  useEffect(() => {
    if (noRawat) {
      cekResumePasien(noRawat).then(res => {
        if (res.success) setIsResumeFilled(res.isFilled);
      }).catch(() => setIsResumeFilled(false));
    } else {
      setIsResumeFilled(false);
    }
  }, [noRawat]);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [popoverParent, setPopoverParent] = useState<string | null>(null);
  const [popoverTop, setPopoverTop] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
          sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setPopoverParent(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "khanza_clinical_sidebar_open",
        JSON.stringify(newState),
      );
    }
  };

  const toggleExpand = (label: string) => {
    const next = !expandedItems[label];
    setExpandedItems(prev => ({ ...prev, [label]: next }));
    if (!isSidebarOpen) {
      if (next) {
        const el = sidebarRef.current?.querySelector(`[data-parent="${label}"]`);
        if (el) setPopoverTop(el.getBoundingClientRect().top);
      }
      setPopoverParent(next ? label : null);
    }
  };

  const matchesSearch = (item: MenuItem) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (item.label.toLowerCase().includes(term)) return true;
    if (item.children) return item.children.some(c => c.label.toLowerCase().includes(term));
    return false;
  };

  const filteredMenu = searchTerm ? menuItems.filter(matchesSearch) : menuItems;

  const handleNavigate = (item: MenuItem) => {
    if (!item.path) return;
    const params = new URLSearchParams();
    if (noRawat) params.set("noRawat", noRawat);
    if (item.path.includes("riwayat-pasien")) {
      params.set("noRM", noRM);
      params.set("nama", namaPasien);
    }
    router.push(`${item.path}?${params.toString()}`);
  };

  const isActive = (path?: string) => path && pathname.startsWith(path);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Clinical Sidebar Bersama */}
      <motion.div
        ref={sidebarRef}
        initial={false}
        animate={{ width: isSidebarOpen ? 224 : 48 }}
        transition={{ duration: 0.15, ease: "linear" }}
        className="bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0 dark:bg-slate-800 dark:border-slate-700"
      >
        {/* Toggle + Pencarian */}
        <div className="p-2 border-b border-slate-100 flex items-center gap-2 h-12 dark:border-slate-700">
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-brand-50 rounded transition-colors text-brand-700 shrink-0 focus:outline-none dark:hover:bg-slate-700"
            title="Toggle Sidebar"
          >
            <FaBars />
          </button>
          {isSidebarOpen && (
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                placeholder="Cari menu..."
              />
              <FaSearch className="absolute left-2.5 top-2 text-slate-400 text-xs dark:text-slate-500" />
            </div>
          )}
        </div>

        {/* Item Menu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item, idx) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems[item.label] || !!searchTerm;

            if (hasChildren) {
              const anyChildActive = item.children!.some(c => isActive(c.path));
              return (
                <div key={idx}>
                  {/* Parent item (click to toggle) */}
                  <div
                    data-parent={item.label}
                    onClick={() => toggleExpand(item.label)}
                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer text-xs border-b border-slate-50 transition-colors whitespace-nowrap dark:border-slate-700 ${anyChildActive
                      ? "bg-brand-50 text-brand-700 font-bold dark:bg-slate-700 dark:text-brand-300"
                      : "text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <span className={`text-sm shrink-0 ${anyChildActive ? "text-brand-600 dark:text-brand-400" : "text-brand-500 dark:text-brand-400"}`}>
                      {item.icon}
                    </span>
                    {isSidebarOpen && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-[10px] text-slate-400 dark:text-slate-500"
                        >
                          <FaChevronDown />
                        </motion.span>
                      </>
                    )}
                  </div>

                  {/* Children */}
                  <AnimatePresence initial={false}>
                    {isExpanded && isSidebarOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {item.children!.map((child, ci) => (
                          <div
                            key={ci}
                            onClick={() => handleNavigate(child)}
                            className={`flex items-center gap-3 pl-9 pr-3 py-2.5 cursor-pointer text-xs transition-colors whitespace-nowrap ${isActive(child.path)
                              ? "bg-brand-50 text-brand-700 font-bold border-l-[3px] border-l-brand-500 dark:bg-slate-700 dark:text-brand-300"
                              : "text-slate-600 hover:bg-brand-50 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                              }`}
                          >
                            <span className={`text-sm shrink-0 ${isActive(child.path) ? "text-brand-600" : "text-slate-500 dark:text-slate-400"}`}>
                              {child.icon}
                            </span>
                            <span>{child.label}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <div
                key={idx}
                onClick={() => handleNavigate(item)}
                className={`flex items-center gap-3 px-3 py-3 cursor-pointer text-xs border-b border-slate-50 transition-colors whitespace-nowrap dark:border-slate-700 ${isActive(item.path)
                  ? "bg-brand-50 text-brand-700 font-bold border-l-[3px] border-l-brand-500 dark:bg-slate-700 dark:text-brand-300"
                  : item.path
                    ? "text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700"
                    : "text-slate-400 cursor-default dark:text-slate-500"
                  }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <span
                  className={`text-sm shrink-0 ${isActive(item.path) ? "text-brand-600" : item.path ? "text-brand-500 dark:text-brand-400" : "text-slate-300 dark:text-slate-600"}`}
                >
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.label === "Resume Pasien" && (
                      <FaCircle className={`text-[8px] ${isResumeFilled ? 'text-green-500' : 'text-red-500'}`} title={isResumeFilled ? 'Resume sudah diisi' : 'Resume belum diisi'} />
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Popover untuk collapsed mode */}
        {!isSidebarOpen && popoverParent && (
          <div
            ref={popoverRef}
            className="fixed left-12 z-50 bg-white border border-slate-200 shadow-xl rounded-lg py-1 min-w-[200px] dark:bg-slate-800 dark:border-slate-700"
            style={{ top: popoverTop }}
          >
            {(() => {
              const parent = menuItems.find(m => m.label === popoverParent);
              if (!parent?.children) return null;
              return parent.children.map((child, ci) => (
                <div
                  key={ci}
                  onClick={() => { handleNavigate(child); setPopoverParent(null); }}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-xs transition-colors ${isActive(child.path)
                    ? "bg-brand-50 text-brand-700 font-bold dark:bg-slate-700 dark:text-brand-300"
                    : "text-slate-600 hover:bg-brand-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                >
                  <span className={`text-sm shrink-0 ${isActive(child.path) ? "text-brand-600" : "text-slate-500 dark:text-slate-400"}`}>
                    {child.icon}
                  </span>
                  <span>{child.label}</span>
                </div>
              ));
            })()}
          </div>
        )}
      </motion.div>

      {/* Konten Utama */}
      <motion.div
        key={pathname} // use pathname to trigger animation on route change
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative dark:bg-slate-900"
      >
        {children}
      </motion.div>
    </div>
  );
}
