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
  layoutMode: "classic" | "zen";
  toggleLayoutMode: () => void;
  setLayoutMode: (mode: "classic" | "zen") => void;
}

const SettingContext = createContext<SettingContextValue>({
  instansi: null,
  logoUrl: "/img/logo-rs.svg",
  wallpaperUrl: "/img/background.png",
  version: 0,
  refresh: () => {},
  layoutMode: "classic",
  toggleLayoutMode: () => {},
  setLayoutMode: () => {},
});

export function useSetting() {
  return useContext(SettingContext);
}

export function SettingProvider({ children }: { children: React.ReactNode }) {
  const [instansi, setInstansi] = useState<InstansiData | null>(null);
  const [logoUrl, setLogoUrl] = useState("/img/logo-rs.svg");
  const [wallpaperUrl, setWallpaperUrl] = useState("/img/background.png");
  const [version, setVersion] = useState(0);
  const [layoutMode, setLayoutModeState] = useState<"classic" | "zen">("classic");
  const logoBlobRef = useRef<string | null>(null);
  const wallpaperBlobRef = useRef<string | null>(null);
  const fetchIdRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("layoutMode");
    if (stored === "zen" || stored === "classic") {
      setLayoutModeState(stored);
    }
  }, []);

  const setLayoutMode = useCallback((mode: "classic" | "zen") => {
    setLayoutModeState(mode);
    localStorage.setItem("layoutMode", mode);
  }, []);

  const toggleLayoutMode = useCallback(() => {
    setLayoutModeState((prev) => {
      const next = prev === "classic" ? "zen" : "classic";
      localStorage.setItem("layoutMode", next);
      return next;
    });
  }, []);

  const doFetch = useCallback(async (fetchId: number) => {
    const res = await getSettingRs();
    if (!mountedRef.current || fetchId !== fetchIdRef.current) {
      return;
    }

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

      const cacheBust = fetchId > 1 ? "?v=" + fetchId : "";
      const fetchOpts: RequestInit = fetchId > 1 ? { cache: "no-store" } : {};

      try {
        const logoResp = await fetch("/api/setting/logo" + cacheBust, fetchOpts);
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

      if (res.data.aktifkan === "Yes") {
        try {
          const url = "/api/setting/wallpaper" + cacheBust;
          const wallResp = await fetch(url, fetchOpts);
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
    <SettingContext.Provider
      value={{
        instansi,
        logoUrl,
        wallpaperUrl,
        version,
        refresh,
        layoutMode,
        toggleLayoutMode,
        setLayoutMode,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
}
