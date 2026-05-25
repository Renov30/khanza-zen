"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  FaCog,
} from "react-icons/fa";

const menuItems = [
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
    path: "/rawat-inap/asuhan-gizi",
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
      const saved = localStorage.getItem("khanza_clinical_sidebar_open");
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredMenu = searchTerm
    ? menuItems.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    : menuItems;

  const handleNavigate = (item: (typeof menuItems)[0]) => {
    if (!item.path) return; // No path = not implemented yet
    const params = new URLSearchParams();
    if (noRawat) params.set("noRawat", noRawat);
    if (item.path.includes("riwayat-pasien")) {
      params.set("noRM", noRM);
      params.set("nama", namaPasien);
    }
    router.push(`${item.path}?${params.toString()}`);
  };

  const isActive = (path: string) => path && pathname.startsWith(path);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Clinical Sidebar Bersama */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? 224 : 48 }}
        transition={{ duration: 0.15, ease: "linear" }}
        className="bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0"
      >
        {/* Toggle + Pencarian */}
        <div className="p-2 border-b border-slate-100 flex items-center gap-2 h-12">
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-brand-50 rounded transition-colors text-brand-700 shrink-0 focus:outline-none"
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
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Cari menu..."
              />
              <FaSearch className="absolute left-2.5 top-2 text-slate-400 text-xs" />
            </div>
          )}
        </div>

        {/* Item Menu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleNavigate(item)}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer text-xs border-b border-slate-50 transition-colors whitespace-nowrap ${isActive(item.path)
                ? "bg-brand-50 text-brand-700 font-bold border-l-[3px] border-l-brand-500"
                : item.path
                  ? "text-slate-700 hover:bg-brand-50"
                  : "text-slate-400 cursor-default"
                }`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <span
                className={`text-sm shrink-0 ${isActive(item.path) ? "text-brand-600" : item.path ? "text-brand-500" : "text-slate-300"}`}
              >
                {item.icon}
              </span>
              {isSidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Konten Utama */}
      <motion.div
        key={pathname} // use pathname to trigger animation on route change
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative"
      >
        {children}
      </motion.div>
    </div>
  );
}
