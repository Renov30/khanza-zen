"use server";

import { db } from "@/lib/db";

export interface ThemePalette {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string | null;
  warna: Record<string, string>;
  is_default: boolean;
  is_active: boolean;
  urutan: number;
}

export interface AppTheme {
  id: number;
  themePaletteId: number;
  isDarkMode: boolean;
}

export interface ActiveThemeData {
  theme: AppTheme;
  palette: ThemePalette;
}

export async function getThemePalettes(): Promise<{
  success: boolean;
  data?: ThemePalette[];
  message?: string;
}> {
  try {
    const [rows]: any = await db.execute(
      "SELECT id, nama, slug, deskripsi, warna, is_default, is_active, urutan FROM theme_palettes WHERE is_active = TRUE ORDER BY urutan ASC"
    );
    const palettes: ThemePalette[] = rows.map((r: any) => ({
      id: r.id,
      nama: r.nama,
      slug: r.slug,
      deskripsi: r.deskripsi,
      warna: typeof r.warna === "string" ? JSON.parse(r.warna) : r.warna,
      is_default: !!r.is_default,
      is_active: !!r.is_active,
      urutan: r.urutan,
    }));
    return { success: true, data: palettes };
  } catch (error: any) {
    console.error("Error fetching theme palettes:", error);
    return { success: false, message: "Gagal mengambil daftar tema" };
  }
}

export async function getActiveTheme(): Promise<{
  success: boolean;
  data?: ActiveThemeData;
  message?: string;
}> {
  try {
    const [rows]: any = await db.execute(
      `SELECT 
        a.id, a.theme_palette_id, a.is_dark_mode,
        p.id as p_id, p.nama, p.slug, p.deskripsi, p.warna,
        p.is_default, p.is_active, p.urutan
      FROM app_theme a
      JOIN theme_palettes p ON a.theme_palette_id = p.id
      WHERE a.id = 1
      LIMIT 1`
    );

    if (rows.length === 0) {
      return { success: false, message: "Tema aktif tidak ditemukan" };
    }

    const r = rows[0];
    const palette: ThemePalette = {
      id: r.p_id,
      nama: r.nama,
      slug: r.slug,
      deskripsi: r.deskripsi,
      warna: typeof r.warna === "string" ? JSON.parse(r.warna) : r.warna,
      is_default: !!r.is_default,
      is_active: !!r.is_active,
      urutan: r.urutan,
    };

    return {
      success: true,
      data: {
        theme: {
          id: r.id,
          themePaletteId: r.theme_palette_id,
          isDarkMode: !!r.is_dark_mode,
        },
        palette,
      },
    };
  } catch (error: any) {
    console.error("Error fetching active theme:", error);
    return { success: false, message: "Gagal mengambil tema aktif" };
  }
}

export async function setActiveThemeAction(
  themePaletteId: number,
  isDarkMode: boolean = false
): Promise<{ success: boolean; message: string }> {
  try {
    const [existing]: any = await db.execute(
      "SELECT id FROM app_theme WHERE id = 1"
    );

    if (existing.length === 0) {
      await db.execute(
        "INSERT INTO app_theme (id, theme_palette_id, is_dark_mode) VALUES (1, ?, ?)",
        [themePaletteId, isDarkMode]
      );
    } else {
      await db.execute(
        "UPDATE app_theme SET theme_palette_id = ?, is_dark_mode = ? WHERE id = 1",
        [themePaletteId, isDarkMode]
      );
    }

    return { success: true, message: "Tema berhasil diterapkan" };
  } catch (error: any) {
    console.error("Error setting active theme:", error);
    return { success: false, message: "Gagal menyimpan tema" };
  }
}
