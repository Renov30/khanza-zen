"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getSettingRs } from "@/lib/actions/setting";

interface InstansiData {
  namaInstansi: string;
  alamatInstansi: string;
  kabupaten: string;
  propinsi: string;
  kontak: string;
  email: string;
  kodePpk: string;
  kodePpkInhealth: string;
  kodePpkKemenkes: string;
  aktifkan: string;
}

interface SettingContextValue {
  instansi: InstansiData | null;
  logoUrl: string;
  wallpaperUrl: string;
  version: number;
  refresh: () => void;
}

const SettingContext = createContext<SettingContextValue>({
  instansi: null,
  logoUrl: "/img/logo-rs.svg",
  wallpaperUrl: "/img/background.png",
  version: 0,
  refresh: () => {},
});

export function useSetting() {
  return useContext(SettingContext);
}

export function SettingProvider({ children }: { children: React.ReactNode }) {
  const [instansi, setInstansi] = useState<InstansiData | null>(null);
  const [logoUrl, setLogoUrl] = useState("/img/logo-rs.svg");
  const [wallpaperUrl, setWallpaperUrl] = useState("/img/background.png");
  const [version, setVersion] = useState(0);
  const logoBlobRef = useRef<string | null>(null);
  const wallpaperBlobRef = useRef<string | null>(null);
  const fetchIdRef = useRef(0);
  const mountedRef = useRef(false);

  const doFetch = useCallback(async (fetchId: number) => {
    const res = await getSettingRs();
    if (!mountedRef.current || fetchId !== fetchIdRef.current) return;

    if (res.success && res.data) {
      setInstansi({
        namaInstansi: res.data.namaInstansi || "",
        alamatInstansi: res.data.alamatInstansi || "",
        kabupaten: res.data.kabupaten || "",
        propinsi: res.data.propinsi || "",
        kontak: res.data.kontak || "",
        email: res.data.email || "",
        kodePpk: res.data.kodePpk || "",
        kodePpkInhealth: res.data.kodePpkInhealth || "",
        kodePpkKemenkes: res.data.kodePpkKemenkes || "",
        aktifkan: res.data.aktifkan || "No",
      });

      // Initial load (fetchId=1) → browser cache 1 tahun berlaku
      // Refresh (fetchId>1) → ?v=... bypass cache ambil gambar baru
      const cacheBust = fetchId > 1 ? "?v=" + fetchId : "";
      try {
        const logoResp = await fetch("/api/setting/logo" + cacheBust);
        if (logoResp.ok) {
          const blob = await logoResp.blob();
          const oldLogo = logoBlobRef.current;
          logoBlobRef.current = URL.createObjectURL(blob);
          if (mountedRef.current && fetchId === fetchIdRef.current) {
            setLogoUrl(logoBlobRef.current);
          }
          if (oldLogo) URL.revokeObjectURL(oldLogo);
        }
      } catch {}

      // Fetch wallpaper blob (only if aktifkan=Yes)
      if (res.data.aktifkan === "Yes") {
        try {
          const wallResp = await fetch("/api/setting/wallpaper" + cacheBust);
          if (wallResp.ok) {
            const blob = await wallResp.blob();
            const oldWall = wallpaperBlobRef.current;
            wallpaperBlobRef.current = URL.createObjectURL(blob);
            if (mountedRef.current && fetchId === fetchIdRef.current) {
              setWallpaperUrl(wallpaperBlobRef.current);
            }
            if (oldWall) URL.revokeObjectURL(oldWall);
          }
        } catch {}
      }
    }
  }, []);

  const refresh = useCallback(() => {
    const id = ++fetchIdRef.current;
    setVersion(v => v + 1);
    doFetch(id);
  }, [doFetch]);

  useEffect(() => {
    mountedRef.current = true;
    const id = ++fetchIdRef.current;
    doFetch(id);

    return () => {
      mountedRef.current = false;
      if (logoBlobRef.current) URL.revokeObjectURL(logoBlobRef.current);
      if (wallpaperBlobRef.current) URL.revokeObjectURL(wallpaperBlobRef.current);
    };
  }, [doFetch]);

  return (
    <SettingContext.Provider value={{ instansi, logoUrl, wallpaperUrl, version, refresh }}>
      {children}
    </SettingContext.Provider>
  );
}
