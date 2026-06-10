"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaDesktop } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function TataLetakPage() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 px-4 py-1 border-b border-brand-100 dark:border-slate-700 flex items-center gap-3 shadow-sm z-10 shrink-0">
        <button onClick={() => router.back()}
          className="text-brand-600 dark:text-slate-300 hover:text-brand-800 dark:hover:text-slate-100 transition-colors p-1 -ml-1 cursor-pointer">
          <FaArrowLeft className="text-sm" />
        </button>
        <h2 className="text-brand-800 dark:text-slate-100 font-bold text-sm flex items-center gap-2 tracking-wide">
          Tata Letak Aplikasi
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto space-y-4"
        >
          <div className="bg-brand-50/40 dark:bg-slate-800/50 p-6 rounded-lg border border-brand-100/50 dark:border-slate-700 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg mx-auto mb-4">
              <FaDesktop className="text-2xl" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              Mode Classic
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Aplikasi menggunakan tata letak <strong className="text-slate-700 dark:text-slate-300">Classic</strong> dengan toolbar atas, shortcut bar, dan dashboard informasi.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/daftar-menu">
                <Button type="button" variant="outline" size="sm"
                  className="border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 shadow-sm font-bold text-[11px]">
                  Kembali
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
