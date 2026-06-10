"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSetting } from "@/components/SettingContext";
import { getDashboardMetrics, getChartData, getChartLegendByDate, getJadwalDokterHariIni } from "@/lib/actions/dashboard";
import {
  FaUsers, FaBed, FaAmbulance,
  FaClipboard, FaArrowRight, FaBullhorn, FaCalendarAlt,
  FaInfoCircle, FaArrowUp, FaArrowDown, FaCheckCircle,
  FaWalking, FaClock, FaUserMd, FaImage, FaChartBar,
} from "react-icons/fa";

export default function Home() {
  const { instansi, logoUrl, wallpaperUrl } = useSetting();
  const [showWallpaper, setShowWallpaper] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("showWallpaper") === "true";
    }
    return false;
  });
  const [username, setUsername] = useState("Supervisor");
  const [metrics, setMetrics] = useState<{
    pasienHariIni: number; rawatInap: number; igdUgd: number; rawatJalan: number; pendaftaran: number;
    trends?: Record<string, { pct: string; isUp: boolean }>;
  }>({ pasienHariIni: 0, rawatInap: 0, igdUgd: 0, rawatJalan: 0, pendaftaran: 0 });
  const [chartData, setChartData] = useState<{ labels: string[]; values: number[]; total: number } | null>(null);
  const [chartLegend, setChartLegend] = useState({ pendaftaran: 0, igd: 0, ralan: 0, ranap: 0 });
  const [chartFilter, setChartFilter] = useState<"hari-ini" | "kemarin" | "tanggal">("hari-ini");
  const [chartTgl, setChartTgl] = useState(() => new Date().toISOString().split("T")[0]);
  const [chartJenis, setChartJenis] = useState<"pendaftaran" | "igd" | "ralan" | "ranap">("pendaftaran");
  const [jadwal, setJadwal] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.isLoggedIn && data.user) {
          setUsername(data.user.nama || data.user.id);
        }
      } catch (err) {}
    };
    fetchData();
  }, []);

  const fetchChart = useCallback(async (filter: string, tgl?: string, jenis?: string) => {
    let param: string | undefined;
    if (filter === "kemarin") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      param = d.toISOString().split("T")[0];
    } else if (filter === "tanggal" && tgl) {
      param = tgl;
    }
    const [chartRes, legendRes] = await Promise.all([
      getChartData(param, jenis),
      getChartLegendByDate(param),
    ]);
    if (chartRes.success && chartRes.data) setChartData(chartRes.data);
    if (legendRes.success && legendRes.data) setChartLegend(legendRes.data);
  }, []);

  useEffect(() => {
    getDashboardMetrics().then((res) => {
      if (res.success && res.data) setMetrics(res.data);
    });
    fetchChart("hari-ini", undefined, chartJenis);
    getJadwalDokterHariIni().then((res) => {
      if (res.success) setJadwal(res.data);
    });
  }, [fetchChart, chartJenis]);

  const toggleWallpaper = () => {
    setShowWallpaper((prev) => {
      const next = !prev;
      localStorage.setItem("showWallpaper", String(next));
      return next;
    });
  };

  const namaInstansi = instansi?.namaInstansi || "";
  const alamatInstansi = [instansi?.alamatInstansi, instansi?.kabupaten, instansi?.propinsi].filter(Boolean).join(", ");

  if (showWallpaper) {
    return (
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url('${wallpaperUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent z-0" />
        <div className="absolute inset-0 bg-black/0 dark:bg-black/35 z-0 transition-colors duration-300" />

        <button
          onClick={toggleWallpaper}
          className="absolute top-4 right-4 z-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-700 border border-white/50 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-md flex items-center gap-2 transition-all hover:shadow-lg"
        >
          <FaChartBar />
          Tampilkan Dashboard
        </button>

        <div className="absolute bottom-16 left-4 sm:bottom-8 sm:left-8 z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
          <div className="flex flex-row items-center gap-3 drop-shadow-lg bg-white/40 dark:bg-slate-800/60 backdrop-blur-sm px-4 sm:px-5 py-3 rounded-xl border border-white/70 dark:border-slate-700">
            <img
              src={logoUrl}
              alt="Logo RS"
              className="h-10 sm:h-14 w-10 sm:w-14 shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight italic flex items-center gap-2">
                {namaInstansi || "SIMRS KHANZA"}
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500 inline-block animate-pulse"></span>
                {alamatInstansi || "Sistem Informasi Manajemen Rumah Sakit"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Wallpaper Background */}
      <div className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center opacity-[0.1] dark:opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: `url('${wallpaperUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent dark:from-slate-900/50 z-0 pointer-events-none" />

      <div className="relative z-10 flex-1 w-full h-full overflow-y-auto p-6 space-y-6 [scrollbar-width:thin] select-none">
      {/* 1. WELCOME BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-brand-50/70 to-brand-100/20 dark:from-slate-800 dark:to-slate-700/60 rounded-3xl overflow-hidden border border-brand-100/30 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative shadow-sm min-h-[180px] w-full"
      >
        {/* Toggle Wallpaper */}
        <button
          onClick={toggleWallpaper}
          className="absolute top-3 right-3 z-20 bg-white/70 dark:bg-slate-700/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-600 border border-slate-200/50 dark:border-slate-600 rounded-xl px-2.5 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-1.5 transition-all hover:shadow-md"
        >
          <FaImage />
          Wallpaper
        </button>

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
          value={metrics.pasienHariIni}
          trend={metrics.trends?.pasienHariIni.pct ?? "Hari Ini"}
          isUp={metrics.trends?.pasienHariIni.isUp ?? true}
          icon={<FaUsers />}
          colorClass="bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border-brand-100/50"
        />
        <MetricCard
          title="Rawat Inap"
          value={metrics.rawatInap}
          trend={metrics.trends?.rawatInap.pct ?? "Aktif"}
          isUp={metrics.trends?.rawatInap.isUp ?? true}
          icon={<FaBed />}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100/50"
        />
        <MetricCard
          title="IGD/UGD"
          value={metrics.igdUgd}
          trend={metrics.trends?.igdUgd.pct ?? "Hari Ini"}
          isUp={metrics.trends?.igdUgd.isUp ?? false}
          icon={<FaAmbulance />}
          colorClass="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-100/50"
        />
        <MetricCard
          title="Rawat Jalan"
          value={metrics.rawatJalan}
          trend={metrics.trends?.rawatJalan.pct ?? "Hari Ini"}
          isUp={metrics.trends?.rawatJalan.isUp ?? true}
          icon={<FaWalking />}
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100/50"
        />
        <MetricCard
          title="Pendaftaran"
          value={metrics.pendaftaran}
          trend={metrics.trends?.pendaftaran.pct ?? "Hari Ini"}
          isUp={metrics.trends?.pendaftaran.isUp ?? true}
          icon={<FaClipboard />}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100/50"
        />
      </div>

      {/* 3. CHARTS & RECENT WORK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ringkasan Layanan (SVG Line Chart) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[460px] lg:col-span-6 relative group overflow-hidden">
          <div className="flex flex-col gap-3 z-10 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Ringkasan Layanan
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  {chartJenis === "pendaftaran" ? "Pasien daftar" :
                   chartJenis === "igd" ? "Pasien masuk IGD" :
                   chartJenis === "ralan" ? "Pasien rawat jalan" :
                   "Pasien masuk rawat inap"} berdasarkan jam
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={chartFilter}
                  onChange={(e) => {
                    const v = e.target.value as typeof chartFilter;
                    setChartFilter(v);
                    if (v !== "tanggal") fetchChart(v, undefined, chartJenis);
                  }}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="hari-ini">Hari Ini</option>
                  <option value="kemarin">Kemarin</option>
                  <option value="tanggal">Tanggal</option>
                </select>
                {chartFilter === "tanggal" && (
                  <input
                    type="date"
                    value={chartTgl}
                    onChange={(e) => {
                      setChartTgl(e.target.value);
                      fetchChart("tanggal", e.target.value, chartJenis);
                    }}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-brand-500"
                  />
                )}
              </div>
            </div>

            {/* Jenis filter pills */}
            <div className="flex items-center gap-1.5">
              {[
                { key: "pendaftaran", label: "Pendaftaran" },
                { key: "igd", label: "IGD/UGD" },
                { key: "ralan", label: "Rawat Jalan" },
                { key: "ranap", label: "Rawat Inap" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setChartJenis(item.key as typeof chartJenis);
                    fetchChart(chartFilter, chartFilter === "tanggal" ? chartTgl : undefined, item.key as typeof chartJenis);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                    chartJenis === item.key
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {chartData ? <ChartSVG data={chartData} /> : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Memuat data...
            </div>
          )}

          {/* Legend Items */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-2 z-10 shrink-0">
            <LegendBox label="Pendaftaran" value={chartLegend.pendaftaran} colorClass="bg-brand-500" />
            <LegendBox label="IGD/UGD" value={chartLegend.igd} colorClass="bg-red-500" />
            <LegendBox label="Rawat Jalan" value={chartLegend.ralan} colorClass="bg-purple-500" />
            <LegendBox label="Rawat Inap" value={chartLegend.ranap} colorClass="bg-blue-500" />
          </div>
        </div>

        {/* Jadwal Dokter Hari Ini */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[460px] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-3 shrink-0">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Jadwal Dokter Hari Ini
            </h3>
            <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
              Lihat Semua
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {jadwal.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Tidak ada jadwal hari ini
              </div>
            ) : (
              jadwal.map((d: any, i: number) => (
                <JadwalDokterItem
                  key={i}
                  nama={d.nm_dokter}
                  poli={d.nm_poli}
                  jamMulai={d.jam_mulai}
                  jamSelesai={d.jam_selesai}
                />
              ))
            )}
          </div>
        </div>

        {/* Pengumuman */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[460px] lg:col-span-3">
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
            <AnnouncementItem
              icon={<FaBullhorn />}
              iconColor="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
              title="Sosialisasi Program Baru"
              desc="Akan diadakan sosialisasi program Jaminan Kesehatan Nasional (JKN) pada hari Jumat mendatang."
              date="4 Juni 2024"
            />
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-start text-[10px] text-slate-400 dark:text-slate-500 pt-2 pb-0 border-t border-slate-100 dark:border-slate-700/50 mt-2 shrink-0">
        &copy; {new Date().getFullYear()} SIMRS-KHANZA. All rights reserved.
      </footer>
    </div>
    </>
  );
}

// ==========================================
// SUBCOMPONENTS
// ==========================================

function ChartSVG({ data }: { data: { labels: string[]; values: number[]; total: number } }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const w = 500;
  const h = 180;
  const padX = 32;
  const padY = 26;
  const chartW = w - padX * 2;
  const chartH = h - padY - 20;
  const n = data.labels.length;
  const maxVal = Math.max(...data.values, 1);

  const xPos = data.labels.map((_, i) => padX + (chartW / (n - 1)) * i);
  const yPos = data.values.map((v) => padY + chartH - (v / maxVal) * chartH);

  const lineD = xPos.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${yPos[i]}`).join(" ");
  const areaD = `${lineD} L ${xPos[n - 1]} ${padY + chartH} L ${xPos[0]} ${padY + chartH} Z`;

  const scaleTicks = [0, Math.round(maxVal / 2), maxVal];

  const togglePoint = (i: number) => {
    setSelectedIndex(selectedIndex === i ? null : i);
  };

  const showTooltip = (i: number) => selectedIndex === i || hoveredIndex === i;

  return (
    <div className="flex-1 w-full mt-4 flex items-center justify-center relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        <line x1={padX} y1={padY + chartH} x2={w - padX} y2={padY + chartH} stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-700/50" />
        <line x1={padX} y1={padY + chartH * 0.5} x2={w - padX} y2={padY + chartH * 0.5} stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-700/50" />
        <line x1={padX} y1={padY} x2={w - padX} y2={padY} stroke="#f1f5f9" strokeDasharray="3,3" className="dark:stroke-slate-700/50" />

        {scaleTicks.map((v, i) => {
          const y = padY + chartH - (v / maxVal) * chartH;
          return (
            <text key={i} x={padX - 8} y={y + 3} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">
              {v}
            </text>
          );
        })}

        <path d={areaD} fill="url(#chartGrad)" />
        <path d={lineD} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {xPos.map((x, i) => (
          <g
            key={i}
            onClick={() => togglePoint(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          >
            <circle cx={x} cy={yPos[i]} r="8" fill="transparent" />
            <circle
              cx={x}
              cy={yPos[i]}
              r="4"
              fill={showTooltip(i) ? "#0f766e" : "#0d9488"}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-colors"
            />
            {showTooltip(i) && (
              <>
                <rect
                  x={x - 16}
                  y={yPos[i] - 28}
                  width="32"
                  height="17"
                  rx="4"
                  fill="#0f766e"
                  className="dark:fill-teal-700"
                />
                <text
                  x={x}
                  y={yPos[i] - 16}
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {data.values[i]}
                </text>
              </>
            )}
          </g>
        ))}

        {xPos.map((x, i) => (
          <text key={i} x={x} y={padY + chartH + 14} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
            {data.labels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

function JadwalDokterItem({ nama, poli, jamMulai, jamSelesai }: { nama: string; poli: string; jamMulai: string; jamSelesai: string }) {
  const now = new Date();
  const curr = now.getHours() * 60 + now.getMinutes();
  const startParts = jamMulai?.split(":").map(Number) || [0, 0];
  const endParts = jamSelesai?.split(":").map(Number) || [0, 0];
  const startMin = startParts[0] * 60 + (startParts[1] || 0);
  const endMin = endParts[0] * 60 + (endParts[1] || 0);
  const isActive = curr >= startMin && curr < endMin;

  return (
    <div className={`flex items-center justify-between border p-2.5 rounded-xl transition-colors ${
      isActive
        ? "border-brand-300 dark:border-brand-700 bg-brand-50/80 dark:bg-brand-950/30"
        : "border-slate-50 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
    }`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
          isActive
            ? "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
            : "bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
        }`}>
          <FaUserMd />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold truncate block ${isActive ? "text-brand-800 dark:text-brand-300" : "text-slate-700 dark:text-slate-200"}`}>
              {nama}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse shrink-0" />
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-400 truncate block">{poli}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-bold flex items-center gap-1 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`}>
          <FaClock className="text-[8px]" />
          {jamMulai}-{jamSelesai}
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  isUp,
  icon,
  colorClass,
}: {
  title: string;
  value: number;
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
  value: number;
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
