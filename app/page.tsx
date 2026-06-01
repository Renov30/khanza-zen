"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSetting } from "@/components/SettingContext";

export default function Home() {
  const { instansi, logoUrl, wallpaperUrl } = useSetting();

  const namaInstansi = instansi?.namaInstansi || "";
  const alamatInstansi = [
    instansi?.alamatInstansi,
    instansi?.kabupaten,
    instansi?.propinsi,
  ]
    .filter(Boolean)
    .join(", ");

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
