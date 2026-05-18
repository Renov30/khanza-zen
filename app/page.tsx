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
        {/* Efek 3D Logo */}
        <div
          className="w-14 h-14 sm:w-20 sm:h-20 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center p-2 sm:p-3 shadow-2xl border border-white/50 relative overflow-hidden group shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <FaLaptopMedical className="text-4xl sm:text-6xl text-sky-600 drop-shadow-md z-10" />
          <div className="absolute bottom-1 right-1">
            <FaCubes className="text-sm sm:text-xl text-brand-500 opacity-80" />
          </div>
        </div>

        <div className="flex flex-col drop-shadow-lg bg-white/40 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-white/40">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight italic flex items-center gap-2">
            <span className="text-brand-700">RS</span> SUKACITA BANTUL
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500 inline-block animate-pulse"></span>
            GUWOSARI, Pajangan, Bantul
          </p>
        </div>
      </motion.div>
    </div>
  );
}
