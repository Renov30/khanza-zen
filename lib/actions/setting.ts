"use server";

import { db } from "@/lib/db";

export async function getSettingRs() {
  try {
    const [rows]: any = await db.execute(
      "select nama_instansi, alamat_instansi, kabupaten, propinsi, kontak, email, kode_ppk, kode_ppkinhealth, kode_ppkkemenkes, aktifkan from setting limit 1"
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
          kodePpk: rows[0].kode_ppk || "",
          kodePpkInhealth: rows[0].kode_ppkinhealth || "",
          kodePpkKemenkes: rows[0].kode_ppkkemenkes || "",
          aktifkan: rows[0].aktifkan || "No",
        },
      };
    }
    return { success: false, message: "Setting RS tidak ditemukan" };
  } catch (error: any) {
    console.error("Error fetching setting RS:", error);
    return { success: false, message: "Gagal mengambil data setting RS", error: error.message };
  }
}

export async function updateSetting(formData: FormData) {
  try {
    const namaInstansi = formData.get("namaInstansi") as string;
    const alamatInstansi = formData.get("alamatInstansi") as string;
    const kabupaten = formData.get("kabupaten") as string;
    const propinsi = formData.get("propinsi") as string;
    const kontak = formData.get("kontak") as string;
    const email = formData.get("email") as string;
    const kodePpk = formData.get("kodePpk") as string;
    const kodePpkInhealth = formData.get("kodePpkInhealth") as string;
    const kodePpkKemenkes = formData.get("kodePpkKemenkes") as string;
    const aktifkan = formData.get("aktifkan") as string || "No";

    const logoFile = formData.get("logo") as File | null;
    const wallpaperFile = formData.get("wallpaper") as File | null;

    const logoBuffer = logoFile && logoFile.size > 0
      ? Buffer.from(await logoFile.arrayBuffer())
      : null;
    const wallpaperBuffer = wallpaperFile && wallpaperFile.size > 0
      ? Buffer.from(await wallpaperFile.arrayBuffer())
      : null;

    const hasLogo = logoBuffer !== null;
    const hasWallpaper = wallpaperBuffer !== null;

    let sql: string;
    let params: any[];

    if (hasLogo && hasWallpaper) {
      sql = `UPDATE setting SET nama_instansi=?, alamat_instansi=?, kabupaten=?, propinsi=?,
             kontak=?, email=?, aktifkan=?, kode_ppk=?, kode_ppkinhealth=?, kode_ppkkemenkes=?,
             wallpaper=?, logo=? WHERE nama_instansi=?`;
      params = [namaInstansi, alamatInstansi, kabupaten, propinsi, kontak, email,
                aktifkan, kodePpk, kodePpkInhealth, kodePpkKemenkes,
                wallpaperBuffer, logoBuffer, namaInstansi];
    } else if (hasLogo) {
      sql = `UPDATE setting SET nama_instansi=?, alamat_instansi=?, kabupaten=?, propinsi=?,
             kontak=?, email=?, aktifkan=?, kode_ppk=?, kode_ppkinhealth=?, kode_ppkkemenkes=?,
             logo=? WHERE nama_instansi=?`;
      params = [namaInstansi, alamatInstansi, kabupaten, propinsi, kontak, email,
                aktifkan, kodePpk, kodePpkInhealth, kodePpkKemenkes,
                logoBuffer, namaInstansi];
    } else if (hasWallpaper) {
      sql = `UPDATE setting SET nama_instansi=?, alamat_instansi=?, kabupaten=?, propinsi=?,
             kontak=?, email=?, aktifkan=?, kode_ppk=?, kode_ppkinhealth=?, kode_ppkkemenkes=?,
             wallpaper=? WHERE nama_instansi=?`;
      params = [namaInstansi, alamatInstansi, kabupaten, propinsi, kontak, email,
                aktifkan, kodePpk, kodePpkInhealth, kodePpkKemenkes,
                wallpaperBuffer, namaInstansi];
    } else {
      sql = `UPDATE setting SET nama_instansi=?, alamat_instansi=?, kabupaten=?, propinsi=?,
             kontak=?, email=?, aktifkan=?, kode_ppk=?, kode_ppkinhealth=?, kode_ppkkemenkes=?
             WHERE nama_instansi=?`;
      params = [namaInstansi, alamatInstansi, kabupaten, propinsi, kontak, email,
                aktifkan, kodePpk, kodePpkInhealth, kodePpkKemenkes, namaInstansi];
    }

    await db.execute(sql, params);

    return { success: true, message: "Pengaturan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error updating setting:", error);
    return { success: false, message: "Gagal menyimpan pengaturan", error: error.message };
  }
}
