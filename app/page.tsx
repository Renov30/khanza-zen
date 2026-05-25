"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLaptopMedical, FaCubes } from "react-icons/fa";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex-1 relative w-full h-full overflow-hidden bg-brand-50/30">
      {/* Gambar Latar dengan animasi ringan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url('/img/background.png')" }}
      />

            {/* Hamparan Konten */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent z-0"></div>

      {/* Area Logo Kiri Bawah */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-16 left-4 sm:bottom-8 sm:left-8 z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5"
      >

        <div className="flex flex-row items-center gap-3 drop-shadow-lg bg-white/40 backdrop-blur-sm px-4 sm:px-5 py-3 rounded-xl border border-white/70">
          <img
            src="/img/logo-rs.svg"
            alt="Logo RS"
            className="h-12 sm:h-16 w-auto shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight italic flex items-center gap-2">
              <span className="text-brand-700">RS</span> SUKACITA BANTUL
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500 inline-block animate-pulse"></span>
              GUWOSARI, Pajangan, Bantul
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
