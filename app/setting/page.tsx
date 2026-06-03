"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FaArrowLeft, FaCog, FaSave, FaImage, FaTrash, FaTimes, FaPalette } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { getSettingRs, updateSetting } from "@/lib/actions/setting";
import { useSetting } from "@/components/SettingContext";

export default function SettingPage() {
  const router = useRouter();
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
    setLogoPreview("/api/setting/logo?t=" + Date.now());
    setWallpaperPreview("/api/setting/wallpaper?preview=1&t=" + Date.now());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!instansi) {
      fetchData();
    } else {
      setIsLoading(false);
      setLogoPreview("/api/setting/logo?t=" + Date.now());
      setWallpaperPreview("/api/setting/wallpaper?preview=1&t=" + Date.now());
    }
  }, [instansi, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile) fd.append("logo", logoFile);
    if (wallpaperFile) fd.append("wallpaper", wallpaperFile);

    const res = await updateSetting(fd);
    if (res.success) {
      toast.success(res.message);
      refreshSettings();
      if (!logoFile) setLogoPreview("/api/setting/logo?" + Date.now());
      if (!wallpaperFile) setWallpaperPreview("/api/setting/wallpaper?preview=1&t=" + Date.now());
      setLogoFile(null);
      setWallpaperFile(null);

      // Preload wallpaper baru ke browser cache, replace cache lama
      if (wallpaperFile) {
        new window.Image().src = "/api/setting/wallpaper?t=" + Date.now();
      }
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
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
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      {/* Page Header — standar UI_STANDARDS 8 */}
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 px-4 py-1 border-b border-brand-100 dark:border-slate-700 flex items-center gap-3 shadow-sm z-10 shrink-0">
        <button onClick={() => router.back()}
          className="text-brand-600 dark:text-slate-300 hover:text-brand-800 dark:hover:text-slate-100 transition-colors p-1 -ml-1 cursor-pointer">
          <FaArrowLeft className="text-sm" />
        </button>
        <h2 className="text-brand-800 dark:text-slate-100 font-bold text-sm flex items-center gap-2 tracking-wide">
          Pengaturan Aplikasi
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section Identitas RS — standar UI_STANDARDS 2.2 */}
            <div className="bg-brand-50/40 dark:bg-slate-800/50 p-4 rounded-lg border border-brand-100/50 dark:border-slate-700">
              <h3 className="text-[13px] font-bold text-brand-700 dark:text-slate-200 mb-3 flex items-center gap-2 border-b border-brand-100 dark:border-slate-700 pb-2">
                Identitas Rumah Sakit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nama Instansi">
                  <input value={form.namaInstansi} onChange={set("namaInstansi")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" required />
                </Field>
                <Field label="Alamat Instansi">
                  <input value={form.alamatInstansi} onChange={set("alamatInstansi")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kabupaten">
                  <input value={form.kabupaten} onChange={set("kabupaten")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Propinsi">
                  <input value={form.propinsi} onChange={set("propinsi")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kontak">
                  <input value={form.kontak} onChange={set("kontak")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Email">
                  <input value={form.email} onChange={set("email")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
              </div>
            </div>

            {/* Section Kode PPK */}
            <div className="bg-brand-50/40 dark:bg-slate-800/50 p-4 rounded-lg border border-brand-100/50 dark:border-slate-700">
              <h3 className="text-[13px] font-bold text-brand-700 dark:text-slate-200 mb-3 flex items-center gap-2 border-b border-brand-100 dark:border-slate-700 pb-2">
                Kode PPK
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Kode PPK">
                  <input value={form.kodePpk} onChange={set("kodePpk")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kode PPK Inhealth">
                  <input value={form.kodePpkInhealth} onChange={set("kodePpkInhealth")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
                <Field label="Kode PPK Kemenkes">
                  <input value={form.kodePpkKemenkes} onChange={set("kodePpkKemenkes")} className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full" />
                </Field>
              </div>
            </div>

            {/* Section Logo & Wallpaper */}
            <div className="bg-brand-50/40 dark:bg-slate-800/50 p-4 rounded-lg border border-brand-100/50 dark:border-slate-700">
              <h3 className="text-[13px] font-bold text-brand-700 dark:text-slate-200 mb-3 flex items-center gap-2 border-b border-brand-100 dark:border-slate-700 pb-2">
                <FaImage className="text-brand-500 dark:text-slate-300" /> Logo & Wallpaper
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Logo</label>
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-brand-200 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 mb-2">
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
                    className="text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-brand-200 dark:file:border-slate-600 file:text-xs file:font-semibold file:bg-brand-50 dark:file:bg-slate-700 file:text-brand-700 dark:file:text-slate-200 hover:file:bg-brand-100 dark:hover:file:bg-slate-600" />
                  {logoFile && (
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview("/api/setting/logo?" + Date.now()); }}
                      className="text-xs text-red-600 mt-1 flex items-center gap-1 hover:underline">
                      <FaTrash /> Batal
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Wallpaper</label>
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-brand-200 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 mb-2">
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
                    className="text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-brand-200 dark:file:border-slate-600 file:text-xs file:font-semibold file:bg-brand-50 dark:file:bg-slate-700 file:text-brand-700 dark:file:text-slate-200 hover:file:bg-brand-100 dark:hover:file:bg-slate-600" />
                  {wallpaperFile && (
                    <button type="button" onClick={() => { setWallpaperFile(null); setWallpaperPreview("/api/setting/wallpaper?preview=1&t=" + Date.now()); }}
                      className="text-xs text-red-600 mt-1 flex items-center gap-1 hover:underline">
                      <FaTrash /> Batal
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-brand-100 dark:border-slate-700 mt-4">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tampilkan Wallpaper</label>
                <select value={form.aktifkan} onChange={set("aktifkan")}
                  className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500">
                  <option value="Yes">Ya</option>
                  <option value="No">Tidak</option>
                </select>
              </div>
            </div>

            {/* Tombol Aksi — standar UI_STANDARDS 5.1, 5.4 */}
            <div className="flex justify-end gap-2">
              <Link href="/daftar-menu">
                <Button type="button" variant="outline" size="sm"
                  className="border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-600 dark:border-red-800 dark:hover:border-red-600 dark:hover:bg-red-900/30 dark:text-red-400 shadow-sm transition-all font-bold text-[11px]">
                  <FaTimes />
                  Keluar
                </Button>
              </Link>
              <Link href="/setting/tema-aplikasi">
                <Button type="button" variant="outline" size="sm"
                  className="border-brand-200 hover:border-brand-400 hover:bg-brand-50 text-brand-600 dark:border-slate-600 dark:hover:border-brand-400 dark:hover:bg-slate-800 dark:text-brand-400 shadow-sm transition-all font-bold text-[11px]">
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
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
