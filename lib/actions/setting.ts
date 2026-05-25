"use server";

import { db } from "@/lib/db";

export async function getSettingRs() {
  try {
    const [rows]: any = await db.execute(
      "select nama_instansi, alamat_instansi, kabupaten, propinsi, kontak, email from setting limit 1"
    );
    if (rows.length > 0) {
      return {
        success: true,
        data: {
          namaInstansi: rows[0].nama_instansi || "",
          alamatInstansi: rows[0].alamat_instansi || "",
          kabupaten: rows[0].kabupaten || "",
          propinsi: rows[0].propinsi || "",
          kontak: rows[0].kontak || "",
          email: rows[0].email || "",
        },
      };
    }
    return { success: false, message: "Setting RS tidak ditemukan" };
  } catch (error: any) {
    console.error("Error fetching setting RS:", error);
    return { success: false, message: "Gagal mengambil data setting RS", error: error.message };
  }
}
