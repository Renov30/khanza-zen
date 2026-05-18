"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
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
} from "react-icons/fa";

// Constants for Mock Data
const CATEGORIES = [
  "[A] Registrasi, Tagihan Ranap & Jalan, Pelayanan & Billing Pasien",
  "[B] Tindakan & Obat & BHP Wa Barcode...",
  "[C] Presensi, Manajemen & Penggajian Pegawai...",
  "[D] Transaksi Inventory Obat, BHP Medis...",
  "[E] Transaksi Inventory Barang Non Medis...",
  "[F] Transaksi Inventory Barang Dapur...",
  "[G] Aset, Inventaris Barang & Instalasi...",
  "[H] Manajemen Parkir Kendaraan Pasien...",
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
      className="flex h-full w-full bg-slate-50/50 overflow-hidden relative rounded-tl-xl shadow-inner border-t border-l border-white"
    >
      {/* Kontrol Sidebar / Animasi */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "linear" }}
            className="h-full border-r border-slate-200 bg-white shadow-sm flex flex-col z-10 shrink-0"
          >
            {/* Header Sidebar & Pencarian */}
            <div className="p-4 border-b border-slate-100 bg-brand-50/50">
              <h3 className="font-bold text-brand-800 text-sm mb-3">
                Navigasi Menu
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari fitur aplikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                />
                <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Daftar Kategori */}
            <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin] p-2 space-y-1">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveCategory(idx);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                    activeCategory === idx && searchQuery === ""
                      ? "bg-brand-50 text-brand-700 font-bold border border-brand-200/50 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 border border-transparent font-medium"
                  }`}
                >
                  <span className="line-clamp-2 leading-relaxed">{cat}</span>
                </button>
              ))}
            </div>

            {/* Footer info Sidebar */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-medium text-center">
              Total {MOCK_MENU_ITEMS.length} Menu Modul Tersedia
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Area Grid Utama */}
      <div className="flex-1 flex flex-col h-full relative transition-all duration-300">
        {/* Tombol Toggle Terapung Atas */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`cursor-pointer absolute top-6 ${isSidebarOpen ? "-left-4" : "left-4"} w-8 h-8 flex items-center justify-center z-20 bg-white border border-slate-200 rounded-full shadow-md hover:bg-brand-50 hover:text-brand-600 transition-all duration-300 text-slate-500`}
        >
          {isSidebarOpen ? (
            <FaChevronLeft className="text-[10px]" />
          ) : (
            <FaChevronRight className="text-[10px]" />
          )}
        </button>

        {/* Header Konten dengan Divider Lebar Penuh */}
        <div className="pt-5 pb-4 px-8 pl-16 border-b border-brand-100/70 bg-white/40 backdrop-blur-sm z-10 shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-700 font-serif tracking-tight">
            {searchQuery ? (
              `Hasil Pencarian: "${searchQuery}"`
            ) : (
              <span className="text-brand-700 text-lg sm:text-xl drop-shadow-sm">
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
        <div className="flex-1 overflow-y-auto p-8 pt-8 align-top bg-gradient-to-br from-slate-50/50 to-white/20">
          {filteredItems.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 max-w-[1400px] mx-auto">
              {filteredItems.map((item, idx) => (
                <Link href={item.link} key={item.id}>
                  <div className="flex flex-col items-center justify-start p-4 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-lg transition-all cursor-pointer group text-center gap-4 w-36 h-40">
                    <div
                      className={`w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl bg-white group-hover:bg-brand-50 border border-slate-100 group-hover:border-brand-200 shadow-sm transition-colors ${item.color}`}
                    >
                      <item.icon className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 group-hover:text-brand-800 transition-colors leading-tight px-1">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
              <FaSearch className="text-4xl opacity-20" />
              <p className="text-sm font-medium">Modul tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
