"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getActiveTheme } from "@/lib/actions/theme";
import type { ActiveThemeData } from "@/lib/actions/theme";

interface ThemeContextValue {
  activeTheme: ActiveThemeData | null;
  refresh: () => void;
  version: number;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  activeTheme: null,
  refresh: () => {},
  version: 0,
  isDarkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ActiveThemeData | null>(null);
  const [version, setVersion] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fetchIdRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const dark = stored === "true";
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setMounted(true);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("darkMode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem("darkMode", String(dark));
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, refresh, version, isDarkMode, toggleDarkMode, setDarkMode }}>
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
