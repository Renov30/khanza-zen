"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaPalette,
  FaSave,
  FaTimes,
  FaCheck,
  FaPaintBrush,
  FaEye,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  getThemePalettes,
  getActiveTheme,
  setActiveThemeAction,
} from "@/lib/actions/theme";
import { useTheme, applyThemeColors } from "@/components/ThemeProvider";
import type { ThemePalette } from "@/lib/actions/theme";

export default function TemaAplikasiPage() {
  const { activeTheme, refresh: refreshTheme } = useTheme();
  const [palettes, setPalettes] = useState<ThemePalette[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const [palettesRes, activeRes] = await Promise.all([
        getThemePalettes(),
        getActiveTheme(),
      ]);
      if (palettesRes.success && palettesRes.data) {
        setPalettes(palettesRes.data);
      }
      if (activeRes.success && activeRes.data) {
        setSelectedId(activeRes.data.theme.themePaletteId);
      }
      setIsLoading(false);
    };
    fetch();
  }, [activeTheme]);

  const handleApply = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    setMessage("");

    const res = await setActiveThemeAction(selectedId);

    setMessage(res.message);
    setMessageType(res.success ? "success" : "error");

    if (res.success) {
      const palette = palettes.find((p) => p.id === selectedId);
      if (palette) {
        applyThemeColors(palette.warna);
      }
      refreshTheme();
    }

    setIsSaving(false);
  };

  const handlePreview = (palette: ThemePalette) => {
    applyThemeColors(palette.warna);
    setSelectedId(palette.id);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-brand-500">
        <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1 border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
          <FaPalette className="text-brand-600" />
          Tema Aplikasi
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {message && (
            <div
              className={`px-4 py-2.5 rounded-lg text-xs font-bold border ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
            <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
              <FaPaintBrush className="text-brand-500" />
              Pilih Tema Warna
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih tema warna yang Anda inginkan. Tema akan diterapkan ke
              seluruh tampilan aplikasi secara langsung.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palettes.map((palette) => {
                const isSelected = selectedId === palette.id;
                const w = palette.warna;

                return (
                  <motion.button
                    key={palette.id}
                    onClick={() => handlePreview(palette)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand-500 shadow-lg shadow-brand-100/50 bg-white"
                        : "border-slate-200 hover:border-brand-200 bg-white/80 hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md">
                        <FaCheck className="text-[10px]" />
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                          style={{ backgroundColor: w["500"] || "#0ea5e9" }}
                        />
                        <span className="text-sm font-bold text-slate-700">
                          {palette.nama}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {[
                          "50",
                          "100",
                          "200",
                          "300",
                          "400",
                          "500",
                          "600",
                          "700",
                          "800",
                          "900",
                          "950",
                        ].map((shade) => (
                          <div
                            key={shade}
                            className="flex-1 h-5 rounded-sm first:rounded-l-md last:rounded-r-md"
                            style={{
                              backgroundColor: w[shade] || "#e0f2fe",
                            }}
                            title={`${shade}: ${w[shade] || ""}`}
                          />
                        ))}
                      </div>

                      {palette.deskripsi && (
                        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                          {palette.deskripsi}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Preview Tema */}
          <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
            <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
              <FaEye className="text-brand-500" />
              Preview Tema
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lihat bagaimana tampilan tema dalam mode terang dan mode gelap.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Light Mode */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <div className="px-4 py-2 border-b border-slate-100 font-bold text-sm flex items-center gap-2 bg-slate-50">
                  <FaSun className="text-amber-400" />
                  Mode Terang
                </div>
                <div className="p-4 space-y-3">
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Judul Card
                    </h4>
                    <p className="text-xs text-slate-500">
                      Contoh konten untuk melihat bagaimana tema terlihat dalam
                      mode terang.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors">
                        Simpan
                      </button>
                      <button className="border border-slate-300 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
                        Batal
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Contoh Input
                    </label>
                    <input
                      className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                      placeholder="Ketik sesuatu..."
                      readOnly
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                      Pending
                    </span>
                    <span className="bg-red-100 text-red-600 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                      Error
                    </span>
                  </div>
                </div>
              </div>

              {/* Dark Mode */}
              <div
                className="rounded-xl border border-slate-600/50 overflow-hidden"
                style={{ backgroundColor: "#0f172a", color: "#e2e8f0" }}
              >
                <div
                  className="px-4 py-2 border-b font-bold text-sm flex items-center gap-2"
                  style={{ borderColor: "#1e293b", backgroundColor: "#1e293b" }}
                >
                  <FaMoon className="text-indigo-400" />
                  Mode Gelap
                </div>
                <div className="p-4 space-y-3">
                  <div
                    className="border rounded-lg p-3 space-y-2"
                    style={{
                      borderColor: "#334155",
                      backgroundColor: "#1e293b",
                    }}
                  >
                    <h4 className="font-bold text-slate-100 text-sm">
                      Judul Card
                    </h4>
                    <p className="text-xs text-slate-400">
                      Contoh konten untuk melihat bagaimana tema terlihat dalam
                      mode gelap.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors">
                        Simpan
                      </button>
                      <button
                        className="border text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
                        style={{ borderColor: "#475569", color: "#94a3b8" }}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-medium"
                      style={{ color: "#94a3b8" }}
                    >
                      Contoh Input
                    </label>
                    <input
                      className="w-full border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400"
                      style={{
                        borderColor: "#475569",
                        backgroundColor: "#0f172a",
                        color: "#e2e8f0",
                      }}
                      placeholder="Ketik sesuatu..."
                      readOnly
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-brand-600 text-brand-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                    <span
                      className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "#334155", color: "#94a3b8" }}
                    >
                      Pending
                    </span>
                    <span
                      className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "#7f1d1d", color: "#fca5a5" }}
                    >
                      Error
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 shadow-sm transition-all font-bold text-[11px]"
            >
              <FaTimes />
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSaving || !selectedId}
              onClick={handleApply}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm text-[11px]"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaSave />
              )}
              {isSaving ? "Menyimpan..." : "Terapkan"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
