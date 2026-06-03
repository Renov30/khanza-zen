"use server";

import { db } from "@/lib/db";

export async function getLayoutSetting(): Promise<{
  success: boolean;
  data?: { layoutMode: "classic" | "zen" };
  message?: string;
}> {
  try {
    const [rows]: any = await db.execute(
      "SELECT id, layout_mode FROM app_layout WHERE id = 1 LIMIT 1"
    );

    if (rows.length === 0) {
      return { success: false, message: "Pengaturan tata letak tidak ditemukan" };
    }

    const mode = rows[0].layout_mode === "zen" ? "zen" : "classic";
    return { success: true, data: { layoutMode: mode } };
  } catch (error: any) {
    console.error("Error fetching layout setting:", error);
    return { success: false, message: "Gagal mengambil pengaturan tata letak" };
  }
}

export async function setLayoutSettingAction(
  layoutMode: "classic" | "zen"
): Promise<{ success: boolean; message: string }> {
  try {
    const [existing]: any = await db.execute(
      "SELECT id FROM app_layout WHERE id = 1"
    );

    if (existing.length === 0) {
      await db.execute(
        "INSERT INTO app_layout (id, layout_mode) VALUES (1, ?)",
        [layoutMode]
      );
    } else {
      await db.execute(
        "UPDATE app_layout SET layout_mode = ? WHERE id = 1",
        [layoutMode]
      );
    }

    return { success: true, message: "Tata letak berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error setting layout:", error);
    return { success: false, message: "Gagal menyimpan pengaturan tata letak" };
  }
}
