"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FaSearch,
  FaTimes,
  FaBars,
  FaIdCard,
  FaBed,
  FaCalendarAlt,
  FaAddressBook,
  FaXRay,
  FaSyringe,
  FaFlask,
  FaUserMd,
  FaAmbulance,
  FaBoxOpen,
  FaCar,
  FaBuilding,
  FaUserTie,
  FaPills,
  FaHospital,
  FaCog,
  FaPalette,
  FaHistory,
  FaUtensils,
} from "react-icons/fa";

// Constants for Mock Data
const CATEGORIES = [
  "Registrasi, Tagihan Ranap & Jalan, Pelayanan & Billing Pasien",
  "Tindakan & Obat & BHP",
  "Presensi, Manajemen & Penggajian Pegawai",
  "Transaksi Inventory Obat",
  "Transaksi Inventory Barang Non Medis",
  "Transaksi Inventory Barang Dapur",
  "Aset, Inventaris Barang & Instalasi",
  "Manajemen Parkir Kendaraan Pasien",
  "Pengaturan Aplikasi",
];

const CATEGORY_ICONS = [
  FaHospital,
  FaSyringe,
  FaUserTie,
  FaPills,
  FaBoxOpen,
  FaUtensils,
  FaBuilding,
  FaCar,
  FaCog,
];

const MOCK_MENU_ITEMS = [
  {
    id: 1,
    label: "Informasi Kamar",
    icon: FaBed,
    link: "/rawat-inap",
    color: "text-amber-500",
    category: 0,
  },
  {
    id: 2,
    label: "Jadwal Praktek",
    icon: FaUserMd,
    link: "/",
    color: "text-indigo-500",
    category: 0,
  },
  {
    id: 3,
    label: "Registrasi",
    icon: FaIdCard,
    link: "/registrasi",
    color: "text-brand-500",
    category: 0,
  },
  {
    id: 4,
    label: "Booking Periksa",
    icon: FaAddressBook,
    link: "/",
    color: "text-teal-500",
    category: 0,
  },
  {
    id: 5,
    label: "Booking Registrasi",
    icon: FaAddressBook,
    link: "/",
    color: "text-rose-500",
    category: 0,
  },
  {
    id: 6,
    label: "IGD/UGD",
    icon: FaAmbulance,
    link: "/",
    color: "text-red-500",
    category: 0,
  },
  {
    id: 7,
    label: "Tindakan Ralan",
    icon: FaSyringe,
    link: "/",
    color: "text-purple-500",
    category: 0,
  },
  {
    id: 8,
    label: "Permintaan Rawat Inap",
    icon: FaHospital,
    link: "/rawat-inap",
    color: "text-sky-500",
    category: 0,
  },
  {
    id: 9,
    label: "Rawat Inap",
    icon: FaBed,
    link: "/rawat-inap",
    color: "text-blue-500",
    category: 0,
  },
  {
    id: 10,
    label: "Jadwal Operasi",
    icon: FaBuilding,
    link: "/",
    color: "text-slate-500",
    category: 0,
  },
  {
    id: 11,
    label: "Permintaan Lab PK",
    icon: FaFlask,
    link: "/",
    color: "text-pink-500",
    category: 0,
  },
  {
    id: 12,
    label: "Permintaan Lab PA",
    icon: FaFlask,
    link: "/",
    color: "text-fuchsia-500",
    category: 0,
  },
  {
    id: 13,
    label: "Permintaan Lab MB",
    icon: FaFlask,
    link: "/",
    color: "text-violet-500",
    category: 0,
  },
  {
    id: 14,
    label: "Permintaan Radiologi",
    icon: FaXRay,
    link: "/",
    color: "text-orange-500",
    category: 0,
  },

  // Some dummy data for category B
  {
    id: 15,
    label: "Daftar Resep Obat",
    icon: FaPills,
    link: "/",
    color: "text-brand-500",
    category: 1,
  },
  {
    id: 16,
    label: "Gudang Farmasi",
    icon: FaBoxOpen,
    link: "/",
    color: "text-amber-600",
    category: 1,
  },

  // Some dummy data for category C
  {
    id: 17,
    label: "Presensi Pegawai",
    icon: FaUserTie,
    link: "/",
    color: "text-slate-600",
    category: 2,
  },

  // Some dummy data for category H
  {
    id: 18,
    label: "Daftar Parkir",
    icon: FaCar,
    link: "/",
    color: "text-slate-800",
    category: 7,
  },

  // Category I - Pengaturan Aplikasi
  {
    id: 19,
    label: "Pengaturan Aplikasi",
    icon: FaCog,
    link: "/setting",
    color: "text-brand-500",
    category: 8,
  },
  {
    id: 20,
    label: "Tema Aplikasi",
    icon: FaPalette,
    link: "/setting/tema-aplikasi",
    color: "text-brand-500",
    category: 8,
  },
  {
    id: 21,
    label: "Log CPPT Ranap",
    icon: FaHistory,
    link: "/rawat-inap/audit-trail",
    color: "text-amber-600",
    category: 8,
  },
];

export default function DaftarMenuPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  // Filter items based on category and search query
  const filteredItems = MOCK_MENU_ITEMS.filter((item) => {
    // If there's a search query, search across all categories
    if (searchQuery.trim() !== "") {
      return item.label.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // Otherwise, just show the active category
    return item.category === activeCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex h-full w-full bg-slate-50/50 dark:bg-slate-900 overflow-hidden relative rounded-tl-xl shadow-inner border-t border-l border-white dark:border-t-white/5 dark:border-l-white/5"
    >
      {/* Sidebar — selalu dirender, lebarnya berubah */}  
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 48 }}
        transition={{ duration: 0.15, ease: "linear" }}
        className="h-full border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col z-10 shrink-0 overflow-hidden"
      >
        {/* Header Sidebar & Pencarian */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-brand-50/50 dark:bg-slate-800/50 flex items-center gap-2 h-12">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-brand-100 rounded transition-colors text-brand-700 shrink-0 focus:outline-none dark:hover:bg-slate-700"
            title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            <FaBars />
          </button>
          {isSidebarOpen && (
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Cari fitur aplikasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
              />
              <FaSearch className="absolute left-2.5 top-2 text-slate-400 dark:text-slate-500 text-xs" />
            </div>
          )}
        </div>

        {/* Daftar Kategori */}
        <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin] p-2 space-y-1">
          {CATEGORIES.map((cat, idx) => {
            const Icon = CATEGORY_ICONS[idx];
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveCategory(idx);
                  setSearchQuery("");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors ${
                  activeCategory === idx && searchQuery === ""
                    ? "bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400 font-bold border border-brand-200/50 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent font-medium"
                }`}
              >
                <Icon className={`text-sm shrink-0 ${activeCategory === idx && searchQuery === "" ? "text-brand-600 dark:text-brand-400" : "text-brand-500 dark:text-brand-400"}`} />
                {isSidebarOpen && (
                  <span className="line-clamp-2 leading-relaxed text-left">{cat}</span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Area Grid Utama */}
      <div className="flex-1 flex flex-col h-full relative transition-all duration-300">
        {/* Header Konten dengan Divider Lebar Penuh */}
        <div className="pt-5 pb-4 px-8 border-b border-brand-100/70 dark:border-slate-700 bg-white/40 dark:bg-slate-800/60 backdrop-blur-sm z-10 shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
            {searchQuery ? (
              `Hasil Pencarian: "${searchQuery}"`
            ) : (
              <span className="text-brand-700 dark:text-brand-400 text-lg sm:text-xl">
                {CATEGORIES[activeCategory]}
              </span>
            )}
          </h2>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 shadow-sm transition-all font-bold"
            >
              <FaTimes />
              <span>Keluar</span>
            </Button>
          </Link>
        </div>

        {/* Grid Ikon - Flex Wrap Terpusat dengan ukuran vertikal standar */}
        <div className="flex-1 overflow-y-auto p-8 pt-8 align-top bg-gradient-to-br from-slate-50/50 to-white/20 dark:from-slate-900 dark:to-slate-800">
          {filteredItems.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 max-w-[1400px] mx-auto">
              {filteredItems.map((item, idx) => (
                <Link href={item.link} key={item.id}>
                  <div className="flex flex-col items-center justify-start p-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer group text-center gap-4 w-36 h-40">
                    <div
                      className={`w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-700 group-hover:bg-brand-50 border border-slate-100 dark:border-slate-600 group-hover:border-brand-200 shadow-sm transition-colors ${item.color}`}
                    >
                      <item.icon className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 group-hover:text-brand-800 transition-colors leading-tight px-1">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 gap-3">
              <FaSearch className="text-4xl opacity-20" />
              <p className="text-sm font-medium">Modul tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
