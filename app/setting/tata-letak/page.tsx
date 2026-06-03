"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FaDesktop, FaMobileAlt, FaSave, FaTimes, FaCheck } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { getLayoutSetting, setLayoutSettingAction } from "@/lib/actions/layout";
import { useSetting } from "@/components/SettingContext";

export default function TataLetakPage() {
  const { layoutMode, setLayoutMode } = useSetting();
  const [defaultMode, setDefaultMode] = useState<"classic" | "zen">("classic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const res = await getLayoutSetting();
      if (res.success && res.data) {
        setDefaultMode(res.data.layoutMode);
      }
      setIsLoading(false);
    };
    fetch();
  }, []);

  const handleApply = async () => {
    setIsSaving(true);
    const res = await setLayoutSettingAction(layoutMode);
    if (res.success) {
      setDefaultMode(layoutMode);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  const handlePreview = (mode: "classic" | "zen") => {
    setLayoutMode(mode);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-brand-500">
        <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 px-4 py-1 border-b border-brand-100 dark:border-slate-700 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="text-brand-800 dark:text-slate-100 font-bold text-sm flex items-center gap-2 tracking-wide">
          <FaDesktop className="text-brand-600 dark:text-slate-300" />
          Tata Letak Aplikasi
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <div className="bg-brand-50/40 dark:bg-slate-800/50 p-4 rounded-lg border border-brand-100/50 dark:border-slate-700">
            <h3 className="text-[13px] font-bold text-brand-700 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-brand-100 dark:border-slate-700 pb-2">
              <FaDesktop className="text-brand-500 dark:text-slate-300" />
              Pilih Tata Letak Default
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Pengaturan ini akan menjadi tampilan default untuk seluruh pengguna. 
              Setiap pengguna tetap dapat mengganti preferensi tampilan mereka masing-masing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Classic Card */}
              <button
                onClick={() => handlePreview("classic")}
                className={`relative rounded-xl border-2 p-5 text-left transition-all cursor-pointer ${
                  layoutMode === "classic"
                    ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 dark:border-brand-600 shadow-md"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm"
                }`}
              >
                {layoutMode === "classic" && (
                  <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[10px]" />
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-sm">
                    <FaDesktop className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Classic</h4>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Tampilan lama</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full rounded bg-gradient-to-r from-brand-600 to-brand-500 opacity-80" />
                  <div className="h-2 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-8 rounded bg-slate-100 dark:bg-slate-700/50" />
                    <div className="h-8 rounded bg-slate-100 dark:bg-slate-700/50" />
                    <div className="h-8 rounded bg-slate-100 dark:bg-slate-700/50" />
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" />
                    Toolbar atas dengan shortcut
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" />
                    Wallpaper latar belakang
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" />
                    Tampilan vertikal (flex-col)
                  </li>
                </ul>
              </button>

              {/* Zen Card */}
              <button
                onClick={() => handlePreview("zen")}
                className={`relative rounded-xl border-2 p-5 text-left transition-all cursor-pointer ${
                  layoutMode === "zen"
                    ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 dark:border-teal-600 shadow-md"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-sm"
                }`}
              >
                {layoutMode === "zen" && (
                  <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[10px]" />
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm">
                    <FaMobileAlt className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Zen</h4>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Tampilan baru</span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <div className="w-10 shrink-0">
                    <div className="h-2 w-full rounded bg-teal-400 mb-1" />
                    <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-700 mb-1" />
                    <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-700 mb-1" />
                    <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700 mb-1" />
                    <div className="grid grid-cols-4 gap-1">
                      <div className="h-8 rounded bg-slate-100 dark:bg-slate-700/50" />
                      <div className="h-8 rounded bg-slate-100 dark:bg-slate-700/50" />
                      <div className="h-8 rounded bg-slate-100 dark:bg-slate-700/50" />
                      <div className="h-8 rounded bg-slate-100 dark:bg-slate-700/50" />
                    </div>
                    <div className="h-10 rounded bg-slate-50 dark:bg-slate-700/30 mt-1" />
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0" />
                    Sidebar kiri dengan grup menu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0" />
                    Topbar minimalis + pencarian
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0" />
                    Tampilan horizontal (flex-row)
                  </li>
                </ul>
              </button>
            </div>

            <div className="mt-5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <FaDesktop className="text-brand-500 dark:text-slate-400 text-sm" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Pratinjau:</span>{" "}
                  Tampilan Anda saat ini:{" "}
                  <span className="font-extrabold text-brand-700 dark:text-brand-400 uppercase">
                    {layoutMode}
                  </span>
                  {" — "}
                  <span className="font-bold">Default global:</span>{" "}
                  <span className="font-extrabold text-teal-700 dark:text-teal-400 uppercase">
                    {defaultMode}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Link href="/setting">
              <Button type="button" variant="outline" size="sm"
                className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-600 dark:border-red-800 dark:hover:border-red-600 dark:hover:bg-red-900/30 dark:text-red-400 shadow-sm transition-all font-bold text-[11px]">
                <FaTimes />
                Keluar
              </Button>
            </Link>
            <Button type="button" size="sm" disabled={isSaving} onClick={handleApply}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm text-[11px]">
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaSave />
              )}
              {isSaving ? "Menyimpan..." : "Terapkan Default"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
