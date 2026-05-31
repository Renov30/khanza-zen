"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getActiveTheme } from "@/lib/actions/theme";
import type { ActiveThemeData } from "@/lib/actions/theme";

interface ThemeContextValue {
  activeTheme: ActiveThemeData | null;
  refresh: () => void;
  version: number;
}

const ThemeContext = createContext<ThemeContextValue>({
  activeTheme: null,
  refresh: () => {},
  version: 0,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ActiveThemeData | null>(null);
  const [version, setVersion] = useState(0);
  const fetchIdRef = useRef(0);
  const mountedRef = useRef(false);

  const doFetch = useCallback(async (fetchId: number) => {
    const res = await getActiveTheme();
    if (!mountedRef.current || fetchId !== fetchIdRef.current) return;

    if (res.success && res.data) {
      setActiveTheme(res.data);
      applyTheme(res.data.palette.warna);
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
    };
  }, [doFetch]);

  return (
    <ThemeContext.Provider value={{ activeTheme, refresh, version }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(warna: Record<string, string>) {
  const root = document.documentElement;
  const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
  for (const shade of shades) {
    if (warna[shade]) {
      root.style.setProperty(`--brand-${shade}`, warna[shade]);
    }
  }
}

export function applyThemeColors(warna: Record<string, string>) {
  applyTheme(warna);
}
