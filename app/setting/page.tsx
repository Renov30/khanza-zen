"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCog, FaSave, FaImage, FaTrash, FaTimes, FaPalette } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { getSettingRs, updateSetting } from "@/lib/actions/setting";
import { useSetting } from "@/components/SettingContext";

export default function SettingPage() {
  const { instansi, refresh: refreshSettings } = useSetting();
  const [form, setForm] = useState({
    namaInstansi: instansi?.namaInstansi || "",
    alamatInstansi: instansi?.alamatInstansi || "",
    kabupaten: instansi?.kabupaten || "",
    propinsi: instansi?.propinsi || "",
    kontak: instansi?.kontak || "",
    email: instansi?.email || "",
    kodePpk: instansi?.kodePpk || "",
    kodePpkInhealth: instansi?.kodePpkInhealth || "",
    kodePpkKemenkes: instansi?.kodePpkKemenkes || "",
    aktifkan: instansi?.aktifkan || "No",
  });
  const [isLoading, setIsLoading] = useState(!instansi);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [wallpaperPreview, setWallpaperPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await getSettingRs();
    if (res.success && res.data) {
      setForm((prev) => ({ ...prev, ...res.data }));
    }
    setLogoPreview("/api/setting/logo");
    setWallpaperPreview("/api/setting/wallpaper");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!instansi) {
      fetchData();
    } else {
      setIsLoading(false);
      setLogoPreview("/api/setting/logo");
      setWallpaperPreview("/api/setting/wallpaper");
    }
  }, [instansi, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile) fd.append("logo", logoFile);
    if (wallpaperFile) fd.append("wallpaper", wallpaperFile);

    const res = await updateSetting(fd);
    setMessage(res.message);
    setMessageType(res.success ? "success" : "error");
    setIsSaving(false);

    if (res.success) {
      refreshSettings();
      if (!logoFile) setLogoPreview("/api/setting/logo?" + Date.now());
      if (!wallpaperFile) setWallpaperPreview("/api/setting/wallpaper?" + Date.now());
      setLogoFile(null);
      setWallpaperFile(null);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-brand-500">
        <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Page Header — standar UI_STANDARDS 8 */}
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1 border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
          <FaCog className="text-brand-600" />
          Pengaturan Aplikasi
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          {/* Notifikasi */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section Identitas RS — standar UI_STANDARDS 2.2 */}
            <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
              <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                Identitas Rumah Sakit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nama Instansi">
                  <input value={form.namaInstansi} onChange={set("namaInstansi")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" required />
                </Field>
                <Field label="Alamat Instansi">
                  <input value={form.alamatInstansi} onChange={set("alamatInstansi")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kabupaten">
                  <input value={form.kabupaten} onChange={set("kabupaten")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Propinsi">
                  <input value={form.propinsi} onChange={set("propinsi")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kontak">
                  <input value={form.kontak} onChange={set("kontak")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Email">
                  <input value={form.email} onChange={set("email")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
              </div>
            </div>

            {/* Section Kode PPK */}
            <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
              <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                Kode PPK
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Kode PPK">
                  <input value={form.kodePpk} onChange={set("kodePpk")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kode PPK Inhealth">
                  <input value={form.kodePpkInhealth} onChange={set("kodePpkInhealth")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kode PPK Kemenkes">
                  <input value={form.kodePpkKemenkes} onChange={set("kodePpkKemenkes")} className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-full" />
                </Field>
              </div>
            </div>

            {/* Section Logo & Wallpaper */}
            <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
              <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                <FaImage className="text-brand-500" /> Logo & Wallpaper
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Logo</label>
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-brand-200 flex items-center justify-center overflow-hidden bg-white mb-2">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    ) : (
                      <FaImage className="text-brand-300 text-3xl" />
                    )}
                  </div>
                  <input type="file" accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                    }}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-brand-200 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                  {logoFile && (
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview("/api/setting/logo?" + Date.now()); }}
                      className="text-xs text-red-600 mt-1 flex items-center gap-1 hover:underline">
                      <FaTrash /> Batal
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Wallpaper</label>
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-brand-200 flex items-center justify-center overflow-hidden bg-white mb-2">
                    {wallpaperPreview ? (
                      <img src={wallpaperPreview} alt="Wallpaper" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    ) : (
                      <FaImage className="text-brand-300 text-3xl" />
                    )}
                  </div>
                  <input type="file" accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setWallpaperFile(f); setWallpaperPreview(URL.createObjectURL(f)); }
                    }}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-brand-200 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                  {wallpaperFile && (
                    <button type="button" onClick={() => { setWallpaperFile(null); setWallpaperPreview("/api/setting/wallpaper?" + Date.now()); }}
                      className="text-xs text-red-600 mt-1 flex items-center gap-1 hover:underline">
                      <FaTrash /> Batal
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-brand-100 mt-4">
                <label className="text-xs font-semibold text-slate-600">Tampilkan Wallpaper</label>
                <select value={form.aktifkan} onChange={set("aktifkan")}
                  className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500">
                  <option value="Yes">Ya</option>
                  <option value="No">Tidak</option>
                </select>
              </div>
            </div>

            {/* Tombol Aksi — standar UI_STANDARDS 5.1, 5.4 */}
            <div className="flex justify-end gap-2">
              <Link href="/daftar-menu">
                <Button type="button" variant="outline" size="sm"
                  className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-600 shadow-sm transition-all font-bold text-[11px]">
                  <FaTimes />
                  Keluar
                </Button>
              </Link>
              <Link href="/setting/tema-aplikasi">
                <Button type="button" variant="outline" size="sm"
                  className="border-brand-200 hover:border-brand-400 hover:bg-brand-50 text-brand-600 shadow-sm transition-all font-bold text-[11px]">
                  <FaPalette />
                  Terapkan Tema
                </Button>
              </Link>
              <Button type="submit" size="sm" disabled={isSaving}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm text-[11px]">
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaSave />
                )}
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}
