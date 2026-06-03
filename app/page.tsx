"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSetting } from "@/components/SettingContext";
import {
  FaUser,
  FaUsers,
  FaBed,
  FaAmbulance,
  FaWheelchair,
  FaClipboard,
  FaArrowRight,
  FaBullhorn,
  FaCalendarAlt,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaWalking,
} from "react-icons/fa";

export default function Home() {
  const { instansi, logoUrl, wallpaperUrl, layoutMode } = useSetting();
  const [username, setUsername] = useState("Supervisor");

  const namaInstansi = instansi?.namaInstansi || "";
  const alamatInstansi = [
    instansi?.alamatInstansi,
    instansi?.kabupaten,
    instansi?.propinsi,
  ]
    .filter(Boolean)
    .join(", ");

  // Fetch logged-in user name
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.isLoggedIn && data.user) {
          setUsername(data.user.nama || data.user.id);
        }
      } catch (err) {}
    };
    fetchSession();
  }, []);

  // RENDER CLASSIC MODE
  if (layoutMode === "classic") {
    return (
      <div className="flex-1 relative w-full h-full overflow-hidden bg-brand-50/30 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url('${wallpaperUrl}')` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent z-0"></div>
        <div className="absolute inset-0 bg-black/0 dark:bg-black/35 z-0 transition-colors duration-300"></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-16 left-4 sm:bottom-8 sm:left-8 z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5"
        >
          <div className="flex flex-row items-center gap-3 drop-shadow-lg bg-white/40 dark:bg-slate-800/60 backdrop-blur-sm px-4 sm:px-5 py-3 rounded-xl border border-white/70 dark:border-slate-700">
            <img
              src={logoUrl}
              alt="Logo RS"
              className="h-10 sm:h-14 w-10 sm:w-14 shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight italic flex items-center gap-2">
                {namaInstansi || "KHANZA ZEN"}
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500 inline-block animate-pulse"></span>
                {alamatInstansi || "SIMRS Lightweight Berbasis Web"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // RENDER ZEN MODE (PREMIUM REDESIGNED DASHBOARD)
  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#f8fafc] dark:bg-slate-900 p-6 space-y-6 [scrollbar-width:thin] select-none">
      {/* 1. WELCOME BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-brand-50/70 to-brand-100/20 dark:from-slate-800 dark:to-slate-700/60 rounded-3xl overflow-hidden border border-brand-100/30 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative shadow-sm min-h-[180px] w-full"
      >
        {/* Hospital Glass image on the right with a gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 hidden md:block z-0 pointer-events-none rounded-r-3xl overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-brand-50/90 dark:from-slate-800 to-transparent z-10" />
          <img
            src="/img/hospital_banner.png"
            alt="Hospital Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text content on the left */}
        <div className="relative z-10 flex flex-col items-start max-w-lg">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            Selamat Datang, <br className="sm:hidden" />
            <span className="text-brand-600 dark:text-brand-400">{username}</span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-300 mt-1 max-w-sm sm:max-w-md leading-relaxed">
            Kelola data dan layanan rumah sakit dengan cepat, akurat, dan terintegrasi.
          </p>
          <button className="mt-5 px-4.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer">
            <span>Lihat Dashboard</span>
            <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* 2. FIVE METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Pasien Hari Ini"
          value="256"
          trend="12% dari kemarin"
          isUp={true}
          icon={<FaUsers />}
          colorClass="bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border-brand-100/50"
        />
        <MetricCard
          title="Rawat Inap"
          value="128"
          trend="8% dari kemarin"
          isUp={true}
          icon={<FaBed />}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100/50"
        />
        <MetricCard
          title="IGD/UGD"
          value="32"
          trend="4% dari kemarin"
          isUp={false}
          icon={<FaAmbulance />}
          colorClass="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-100/50"
        />
        <MetricCard
          title="Rawat Jalan"
          value="96"
          trend="10% dari kemarin"
          isUp={true}
          icon={<FaWalking />}
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100/50"
        />
        <MetricCard
          title="Pendaftaran"
          value="362"
          trend="15% dari kemarin"
          isUp={true}
          icon={<FaClipboard />}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100/50"
        />
      </div>

      {/* 3. CHARTS & RECENT WORK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ringkasan Layanan (SVG Line Chart) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[360px] lg:col-span-6 relative group overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Ringkasan Layanan
            </h3>
            <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-brand-500">
              <option>Hari Ini</option>
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
            </select>
          </div>

          {/* SVG Pure Chart */}
          <div className="flex-1 w-full mt-4 flex items-center justify-center relative">
            <svg
              viewBox="0 0 500 160"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              <line x1="15" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-700/50" />
              <line x1="15" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-700/50" />
              <line x1="15" y1="26" x2="480" y2="26" stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-700/50" />

              {/* Peak Indicator Vertical Line */}
              <line x1="246" y1="26" x2="246" y2="140" stroke="#0d9488" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

              {/* Gradient Area under Curve */}
              <path
                d="M 15 124 C 50 120, 70 112, 92 108 C 120 102, 145 95, 169 88 C 195 80, 220 40, 246 26 C 272 12, 300 48, 323 52 C 345 56, 375 44, 400 48 C 425 52, 450 70, 477 84 L 477 140 L 15 140 Z"
                fill="url(#chartGradient)"
              />

              {/* Styled Glowing Curve Line */}
              <path
                d="M 15 124 C 50 120, 70 112, 92 108 C 120 102, 145 95, 169 88 C 195 80, 220 40, 246 26 C 272 12, 300 48, 323 52 C 345 56, 375 44, 400 48 C 425 52, 450 70, 477 84"
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Points Dots */}
              <circle cx="15" cy="124" r="3" fill="#0d9488" />
              <circle cx="92" cy="108" r="3" fill="#0d9488" />
              <circle cx="169" cy="88" r="3" fill="#0d9488" />
              <circle cx="323" cy="52" r="3" fill="#0d9488" />
              <circle cx="400" cy="48" r="3" fill="#0d9488" />
              <circle cx="477" cy="84" r="3" fill="#0d9488" />

              {/* Active Dot with pulse at 12:00 */}
              <circle cx="246" cy="26" r="6" fill="#0d9488" fillOpacity="0.3" className="animate-ping" style={{ transformOrigin: "246px 26px" }} />
              <circle cx="246" cy="26" r="4.5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />

              {/* X Axis Labels */}
              <text x="15" y="154" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">00:00</text>
              <text x="92" y="154" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">04:00</text>
              <text x="169" y="154" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">08:00</text>
              <text x="246" y="154" fill="#0d9488" fontSize="8" fontWeight="black" textAnchor="middle">12:00</text>
              <text x="323" y="154" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">16:00</text>
              <text x="400" y="154" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">20:00</text>
              <text x="477" y="154" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">24:00</text>

              {/* Custom Tooltip popup bubble on peak */}
              <g transform="translate(210, -3)">
                <rect width="72" height="22" rx="6" fill="#1e293b" />
                <text x="36" y="9" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">12:00</text>
                <text x="36" y="17" fill="#ffffff" fontSize="7.5" fontWeight="black" textAnchor="middle">Total: 142</text>
              </g>
            </svg>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-2 z-10 shrink-0">
            <LegendBox label="Pendaftaran" value="142" colorClass="bg-brand-500" />
            <LegendBox label="IGD/UGD" value="32" colorClass="bg-red-500" />
            <LegendBox label="Rawat Jalan" value="96" colorClass="bg-purple-500" />
            <LegendBox label="Rawat Inap" value="128" colorClass="bg-blue-500" />
          </div>
        </div>

        {/* Antrian Terbaru */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[360px] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-3 shrink-0">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Antrian Terbaru
            </h3>
            <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
              Lihat Semua
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <QueueItem queueNo="A-023" poliName="Poli Umum" time="09:45" status="Menunggu" statusColor="text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-100" />
            <QueueItem queueNo="B-015" poliName="Poli Anak" time="09:42" status="Dipanggil" statusColor="text-brand-600 bg-brand-50 dark:bg-brand-950/30 border-brand-100 animate-pulse font-black" />
            <QueueItem queueNo="C-008" poliName="Poli Gigi" time="09:40" status="Menunggu" statusColor="text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-100" />
            <QueueItem queueNo="D-012" poliName="Poli Kandungan" time="09:37" status="Selesai" statusColor="text-slate-500 bg-slate-100 dark:bg-slate-700/50 border-slate-200" />
            <QueueItem queueNo="E-006" poliName="Poli Jantung" time="09:35" status="Menunggu" statusColor="text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-100" />
          </div>
        </div>

        {/* Pengumuman */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[360px] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-3 shrink-0">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Pengumuman
            </h3>
            <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
              Lihat Semua
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AnnouncementItem
              icon={<FaInfoCircle />}
              iconColor="bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400"
              title="Jadwal Maintenance Sistem"
              desc="Sistem akan menjalani maintenance pada 25 Mei 2024 pukul 22:00 - 02:00 WIB."
              date="22 Mei 2024"
            />
            <AnnouncementItem
              icon={<FaCalendarAlt />}
              iconColor="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
              title="Libur Hari Raya"
              desc="Pelayanan rawat jalan tutup pada hari Rabu, 29 Mei 2024."
              date="20 Mei 2024"
            />
            <AnnouncementItem
              icon={<FaCheckCircle />}
              iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              title="Update Fitur Baru"
              desc="Fitur laporan keuangan telah diperbarui. Silakan cek modul laporan."
              date="18 Mei 2024"
            />
          </div>
        </div>
      </div>

      {/* 4. FOOTER ROW */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 shrink-0">
        <span>&copy; 2024 RS SIMRS Khanza. All rights reserved.</span>
        <span>Versi 2.5.0</span>
      </footer>
    </div>
  );
}

// ==========================================
// SUBCOMPONENTS
// ==========================================

function MetricCard({
  title,
  value,
  trend,
  isUp,
  icon,
  colorClass,
}: {
  title: string;
  value: string;
  trend: string;
  isUp: boolean;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-4 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">
          {value}
        </span>
        <span
          className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 leading-none ${
            isUp ? "text-brand-600 dark:text-brand-400" : "text-red-500"
          }`}
        >
          {isUp ? <FaArrowUp /> : <FaArrowDown />}
          <span>{trend}</span>
        </span>
      </div>

      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base border shrink-0 ${colorClass}`}
      >
        {icon}
      </div>
    </motion.div>
  );
}

function LegendBox({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="flex flex-col items-start bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate max-w-full">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorClass}`} />
        {label}
      </span>
      <span className="text-sm font-black text-slate-700 dark:text-slate-100 mt-1 leading-none">
        {value}
      </span>
    </div>
  );
}

function QueueItem({
  queueNo,
  poliName,
  time,
  status,
  statusColor,
}: {
  queueNo: string;
  poliName: string;
  time: string;
  status: string;
  statusColor: string;
}) {
  // Color code based on alphabet
  const getBadgeColor = (char: string) => {
    switch (char) {
      case "A": return "bg-brand-50 border-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-900/40";
      case "B": return "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40";
      case "C": return "bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40";
      case "D": return "bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40";
      default: return "bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800";
    }
  };

  return (
    <div className="flex items-center justify-between border border-slate-50 dark:border-slate-800/80 p-2.5 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-12 h-6 rounded flex items-center justify-center text-[10px] font-black tracking-wide border shrink-0 ${getBadgeColor(
            queueNo[0]
          )}`}
        >
          {queueNo}
        </span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
          {poliName}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[10px] font-bold text-slate-400">{time}</span>
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border tracking-wider uppercase ${statusColor}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function AnnouncementItem({
  icon,
  iconColor,
  title,
  desc,
  date,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  desc: string;
  date: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 border border-slate-50 dark:border-slate-800/80 rounded-xl bg-slate-50/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${iconColor}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 leading-tight">
          {title}
        </h4>
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
          {desc}
        </p>
        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 mt-2 block tracking-wide">
          {date}
        </span>
      </div>
    </div>
  );
}
