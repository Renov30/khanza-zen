"use server";

import { db } from "@/lib/db";
import { logCppt } from "@/lib/file-log";

/**
 * Mengambil info pasien (no_rkm_medis, nm_pasien) berdasarkan no_rawat.
 * Meniru isRawat() + isPsien() dari Java DlgRawatInap.
 */
export async function getPatientInfoByNoRawat(noRawat: string) {
  try {
    const query = `
      SELECT reg_periksa.no_rkm_medis, pasien.nm_pasien, pasien.tgl_lahir
      FROM reg_periksa 
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis 
      WHERE reg_periksa.no_rawat = ?
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    if (rows.length > 0) {
      return {
        success: true,
        data: {
          no_rkm_medis: rows[0].no_rkm_medis,
          nm_pasien: rows[0].nm_pasien,
          tgl_lahir: rows[0].tgl_lahir instanceof Date
            ? rows[0].tgl_lahir.toISOString().split('T')[0]
            : rows[0].tgl_lahir,
        },
      };
    }
    return { success: false, message: "Pasien tidak ditemukan" };
  } catch (error: any) {
    console.error("Error fetching patient info:", error);
    return { success: false, message: "Gagal mengambil data pasien", error: error.message };
  }
}

/**
 * Mengambil data pemeriksaan/CPPT untuk rawat inap.
 * Meniru tampilPemeriksaan() dari Java DlgRawatInap (case 3).
 * JOIN tabel pemeriksaan_ranap, reg_periksa, pasien, pegawai
 * dengan filter audit trail (hanya status 'aktif' atau null).
 */
export async function getPemeriksaanRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [noRawat];

    if (tglAwal && tglAkhir) {
      params.push(tglAwal, tglAkhir);
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          pemeriksaan_ranap.no_rawat LIKE ? OR
          reg_periksa.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          pemeriksaan_ranap.alergi LIKE ? OR
          pemeriksaan_ranap.keluhan LIKE ? OR
          pemeriksaan_ranap.penilaian LIKE ? OR
          pemeriksaan_ranap.rtl LIKE ? OR
          pemeriksaan_ranap.pemeriksaan LIKE ? OR
          pegawai.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 9; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        pemeriksaan_ranap.no_rawat,
        reg_periksa.no_rkm_medis,
        pasien.nm_pasien,
        pemeriksaan_ranap.tgl_perawatan,
        pemeriksaan_ranap.jam_rawat,
        pemeriksaan_ranap.suhu_tubuh,
        pemeriksaan_ranap.tensi,
        pemeriksaan_ranap.nadi,
        pemeriksaan_ranap.respirasi,
        pemeriksaan_ranap.tinggi,
        pemeriksaan_ranap.berat,
        pemeriksaan_ranap.spo2,
        pemeriksaan_ranap.gcs,
        pemeriksaan_ranap.kesadaran,
        pemeriksaan_ranap.keluhan,
        pemeriksaan_ranap.pemeriksaan,
        pemeriksaan_ranap.alergi,
        pemeriksaan_ranap.penilaian,
        pemeriksaan_ranap.rtl,
        pemeriksaan_ranap.instruksi,
        pemeriksaan_ranap.evaluasi,
        pemeriksaan_ranap.nip,
        pegawai.nama AS nm_pegawai,
        pegawai.jbtn AS jabatan
      FROM pasien 
      INNER JOIN reg_periksa ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis 
      INNER JOIN pemeriksaan_ranap ON pemeriksaan_ranap.no_rawat = reg_periksa.no_rawat 
      LEFT JOIN (
        SELECT no_rawat, tgl_perawatan, jam_rawat, status
        FROM pemeriksaan_ranap_audit_trail
        WHERE status = 'aktif'
        GROUP BY no_rawat, tgl_perawatan, jam_rawat
      ) audit ON pemeriksaan_ranap.no_rawat = audit.no_rawat 
        AND pemeriksaan_ranap.tgl_perawatan = audit.tgl_perawatan 
        AND pemeriksaan_ranap.jam_rawat = audit.jam_rawat 
      LEFT JOIN pegawai ON pemeriksaan_ranap.nip = pegawai.nik 
      WHERE 
        (audit.status = 'aktif' OR NOT EXISTS (
          SELECT 1 FROM pemeriksaan_ranap_audit_trail at2
          WHERE at2.no_rawat = pemeriksaan_ranap.no_rawat
            AND at2.tgl_perawatan = pemeriksaan_ranap.tgl_perawatan
            AND at2.jam_rawat = pemeriksaan_ranap.jam_rawat
        ))
        AND pemeriksaan_ranap.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND pemeriksaan_ranap.tgl_perawatan BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY pemeriksaan_ranap.tgl_perawatan DESC, pemeriksaan_ranap.jam_rawat DESC
    `;

    const [rows]: any = await db.execute(query, params);

    // Format tanggal untuk menghindari masalah serialisasi
    const formattedRows = rows.map((row: any) => ({
      ...row,
      tgl_perawatan:
        row.tgl_perawatan instanceof Date
          ? row.tgl_perawatan.toISOString().split("T")[0]
          : row.tgl_perawatan,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching pemeriksaan ranap:", error);
    return {
      success: false,
      message: "Gagal mengambil data pemeriksaan",
      error: error.message,
      data: [],
    };
  }
}

/**
 * Mengambil info pegawai (nama, jabatan) untuk user yang sedang login.
 * Meniru Java: pegawai.tampil3(KdPeg) + pegawai.tampilJbatan(KdPeg)
 * di mana KdPeg = akses.getkode() (ID user sesi / NIP / NIK).
 */
export async function getLoggedInPegawai() {
  try {
    // Import getSession dari modul auth
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();

    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    const userId = session.id;

    const query = `
      SELECT pegawai.nik, pegawai.nama
      FROM pegawai
      WHERE pegawai.nik = ?
    `;
    const [rows]: any = await db.execute(query, [userId]);

    const isAdmin = session.role === 'admin';

    if (rows.length > 0) {
      return {
        success: true,
        data: {
          nik: rows[0].nik,
          nama: rows[0].nama,
          is_admin: isAdmin,
        },
      };
    }

    // Jika user tidak ditemukan di pegawai, gunakan session id sebagai fallback
    return {
      success: true,
      data: {
        nik: userId,
        nama: userId,
        is_admin: isAdmin,
      },
    };
  } catch (error: any) {
    console.error("Error fetching pegawai info:", error);
    return { success: false, message: "Gagal mengambil data petugas", error: error.message };
  }
}

/**
 * Mengambil data asuhan gizi pasien rawat inap.
 * Query dari RMDataAsuhanGizi.java (tampil method).
 * Tabel: asuhan_gizi
 */
export async function getAsuhanGiziRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [];

    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          reg_periksa.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          asuhan_gizi.diagnosis LIKE ? OR
          asuhan_gizi.instruksi LIKE ? OR
          asuhan_gizi.nip LIKE ? OR
          petugas.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 7; i++) params.push(searchKey);
    }

    const query = `
      SELECT
        reg_periksa.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        pasien.jk,
        pasien.tgl_lahir,
        asuhan_gizi.tanggal AS tgl_asuhan,
        asuhan_gizi.antropometri_bb AS bb,
        asuhan_gizi.antropometri_tb AS tb,
        asuhan_gizi.antropometri_imt AS imt,
        asuhan_gizi.antropometri_lla AS lla,
        asuhan_gizi.antropometri_tl AS tl,
        asuhan_gizi.antropometri_ulna AS ulna,
        asuhan_gizi.antropometri_bbideal AS bb_ideal,
        asuhan_gizi.antropometri_bbperu AS bb_u,
        asuhan_gizi.antropometri_tbperu AS tku,
        asuhan_gizi.antropometri_bbpertb AS bb_tb,
        asuhan_gizi.antropometri_llaperu AS lla_u,
        asuhan_gizi.antropometri_llaperu AS lla_u_persen,
        asuhan_gizi.biokimia,
        asuhan_gizi.fisik_klinis AS fisik_klinis,
        asuhan_gizi.alergi_telur AS telur,
        asuhan_gizi.alergi_susu_sapi AS susu_sapi,
        asuhan_gizi.alergi_kacang AS kacang,
        asuhan_gizi.alergi_gluten AS gluten,
        asuhan_gizi.alergi_udang AS udang,
        asuhan_gizi.alergi_ikan AS ikan,
        asuhan_gizi.alergi_hazelnut AS hazelnut,
        asuhan_gizi.pola_makan,
        asuhan_gizi.riwayat_personal,
        asuhan_gizi.diagnosis AS diagnosa_gizi,
        asuhan_gizi.intervensi_gizi,
        asuhan_gizi.instruksi,
        asuhan_gizi.monitoring_evaluasi,
        asuhan_gizi.nip,
        petugas.nama AS nm_pegawai,
        '' AS jabatan
      FROM reg_periksa
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN asuhan_gizi ON reg_periksa.no_rawat = asuhan_gizi.no_rawat
      INNER JOIN petugas ON asuhan_gizi.nip = petugas.nip
      WHERE reg_periksa.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND asuhan_gizi.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY asuhan_gizi.tanggal DESC
    `;

    const [rows]: any = await db.execute(query, [noRawat, ...params]);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      telur: row.telur === "Ya" || row.telur === true || row.telur === 1,
      susu_sapi: row.susu_sapi === "Ya" || row.susu_sapi === true || row.susu_sapi === 1,
      kacang: row.kacang === "Ya" || row.kacang === true || row.kacang === 1,
      gluten: row.gluten === "Ya" || row.gluten === true || row.gluten === 1,
      udang: row.udang === "Ya" || row.udang === true || row.udang === 1,
      ikan: row.ikan === "Ya" || row.ikan === true || row.ikan === 1,
      hazelnut: row.hazelnut === "Ya" || row.hazelnut === true || row.hazelnut === 1,
      bb: Number(row.bb) || 0,
      tb: Number(row.tb) || 0,
      imt: Number(row.imt) || 0,
      lla: Number(row.lla) || 0,
      tl: Number(row.tl) || 0,
      ulna: Number(row.ulna) || 0,
      lla_u: Number(row.lla_u) || 0,
      bb_ideal: Number(row.bb_ideal) || 0,
      bb_u: Number(row.bb_u) || 0,
      tku: Number(row.tku) || 0,
      bb_tb: Number(row.bb_tb) || 0,
      lla_u_persen: Number(row.lla_u_persen) || 0,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching asuhan gizi:", error);
    return {
      success: false,
      message: "Gagal mengambil data asuhan gizi",
      error: error.message,
      data: [],
    };
  }
}

/**
 * Menyimpan data asuhan gizi baru (Simpan).
 * INSERT ke tabel asuhan_gizi.
 */
export async function simpanAsuhanGiziRanap(data: {
  no_rawat: string; tanggal: string;
  bb: string; tb: string; imt: string; lla: string; tl: string; ulna: string;
  bb_ideal: string; bb_u: string; tku: string; bb_tb: string; lla_u: string;
  biokimia: string; fisik_klinis: string;
  alergi_telur: string; alergi_susu_sapi: string; alergi_kacang: string;
  alergi_gluten: string; alergi_udang: string; alergi_ikan: string; alergi_hazelnut: string;
  pola_makan: string; riwayat_personal: string; diagnosis: string;
  intervensi_gizi: string; instruksi: string; monitoring_evaluasi: string;
  nip: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      INSERT INTO asuhan_gizi (no_rawat, tanggal, antropometri_bb, antropometri_tb, antropometri_imt, antropometri_lla, antropometri_tl, antropometri_ulna, antropometri_bbideal, antropometri_bbperu, antropometri_tbperu, antropometri_bbpertb, antropometri_llaperu, biokimia, fisik_klinis, alergi_telur, alergi_susu_sapi, alergi_kacang, alergi_gluten, alergi_udang, alergi_ikan, alergi_hazelnut, pola_makan, riwayat_personal, diagnosis, intervensi_gizi, instruksi, monitoring_evaluasi, nip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.no_rawat, data.tanggal,
      data.bb || "0", data.tb || "0", data.imt || "0",
      data.lla || "0", data.tl || "0", data.ulna || "0",
      data.bb_ideal || "0", data.bb_u || "0", data.tku || "0", data.bb_tb || "0", data.lla_u || "0",
      data.biokimia || "", data.fisik_klinis || "",
      data.alergi_telur || "Tidak", data.alergi_susu_sapi || "Tidak",
      data.alergi_kacang || "Tidak", data.alergi_gluten || "Tidak",
      data.alergi_udang || "Tidak", data.alergi_ikan || "Tidak", data.alergi_hazelnut || "Tidak",
      data.pola_makan || "", data.riwayat_personal || "", data.diagnosis || "",
      data.intervensi_gizi || "", data.instruksi || "", data.monitoring_evaluasi || "",
      data.nip,
    ]);

    return { success: true, message: "Data asuhan gizi berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving asuhan gizi:", error);
    return { success: false, message: "Gagal menyimpan data asuhan gizi", error: error.message };
  }
}

/**
 * Mengedit data asuhan gizi (Ganti).
 * UPDATE tabel asuhan_gizi WHERE no_rawat=? AND tanggal=?.
 */
export async function editAsuhanGiziRanap(
  oldNoRawat: string,
  oldTanggal: string,
  newData: {
    no_rawat: string; tanggal: string;
    bb: string; tb: string; imt: string; lla: string; tl: string; ulna: string;
    bb_ideal: string; bb_u: string; tku: string; bb_tb: string; lla_u: string;
    biokimia: string; fisik_klinis: string;
    alergi_telur: string; alergi_susu_sapi: string; alergi_kacang: string;
    alergi_gluten: string; alergi_udang: string; alergi_ikan: string; alergi_hazelnut: string;
    pola_makan: string; riwayat_personal: string; diagnosis: string;
    intervensi_gizi: string; instruksi: string; monitoring_evaluasi: string;
    nip: string;
  },
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      UPDATE asuhan_gizi SET
        no_rawat=?, tanggal=?, antropometri_bb=?, antropometri_tb=?, antropometri_imt=?,
        antropometri_lla=?, antropometri_tl=?, antropometri_ulna=?, antropometri_bbideal=?,
        antropometri_bbperu=?, antropometri_tbperu=?, antropometri_bbpertb=?, antropometri_llaperu=?,
        biokimia=?, fisik_klinis=?, alergi_telur=?, alergi_susu_sapi=?, alergi_kacang=?,
        alergi_gluten=?, alergi_udang=?, alergi_ikan=?, alergi_hazelnut=?, pola_makan=?,
        riwayat_personal=?, diagnosis=?, intervensi_gizi=?, instruksi=?, monitoring_evaluasi=?, nip=?
      WHERE no_rawat=? AND tanggal=?
    `, [
      newData.no_rawat, newData.tanggal,
      newData.bb || "0", newData.tb || "0", newData.imt || "0",
      newData.lla || "0", newData.tl || "0", newData.ulna || "0",
      newData.bb_ideal || "0", newData.bb_u || "0", newData.tku || "0",
      newData.bb_tb || "0", newData.lla_u || "0",
      newData.biokimia || "", newData.fisik_klinis || "",
      newData.alergi_telur || "Tidak", newData.alergi_susu_sapi || "Tidak",
      newData.alergi_kacang || "Tidak", newData.alergi_gluten || "Tidak",
      newData.alergi_udang || "Tidak", newData.alergi_ikan || "Tidak",
      newData.alergi_hazelnut || "Tidak",
      newData.pola_makan || "", newData.riwayat_personal || "", newData.diagnosis || "",
      newData.intervensi_gizi || "", newData.instruksi || "", newData.monitoring_evaluasi || "",
      newData.nip,
      oldNoRawat, oldTanggal,
    ]);

    return { success: true, message: "Data asuhan gizi berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing asuhan gizi:", error);
    return { success: false, message: "Gagal mengubah data asuhan gizi", error: error.message };
  }
}

/**
 * Menghapus data asuhan gizi (Hapus).
 * DELETE dari tabel asuhan_gizi WHERE no_rawat=? AND tanggal=?.
 */
export async function hapusAsuhanGiziRanap(noRawat: string, tanggal: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute("DELETE FROM asuhan_gizi WHERE no_rawat=? AND tanggal=?", [noRawat, tanggal]);

    return { success: true, message: "Data asuhan gizi berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting asuhan gizi:", error);
    return { success: false, message: "Gagal menghapus data asuhan gizi", error: error.message };
  }
}

/**
 * Mengambil data monitoring asuhan gizi pasien rawat inap.
 * Query dari RMDataMonitoringAsuhanGizi.java (tampil method).
 * Tabel: monitoring_asuhan_gizi
 */
export async function getMonitoringGiziRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [];

    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          reg_periksa.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          monitoring_asuhan_gizi.monitoring LIKE ? OR
          monitoring_asuhan_gizi.evaluasi LIKE ? OR
          monitoring_asuhan_gizi.nip LIKE ? OR
          petugas.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 7; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        reg_periksa.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        reg_periksa.umurdaftar,
        reg_periksa.sttsumur,
        pasien.jk,
        monitoring_asuhan_gizi.tanggal,
        monitoring_asuhan_gizi.monitoring,
        monitoring_asuhan_gizi.evaluasi,
        monitoring_asuhan_gizi.nip,
        petugas.nama AS nm_petugas
      FROM monitoring_asuhan_gizi
      INNER JOIN reg_periksa ON monitoring_asuhan_gizi.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN petugas ON monitoring_asuhan_gizi.nip = petugas.nip
      WHERE monitoring_asuhan_gizi.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND monitoring_asuhan_gizi.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY monitoring_asuhan_gizi.tanggal DESC
    `;

    const [rows]: any = await db.execute(query, [noRawat, ...params]);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tanggal:
        row.tanggal instanceof Date
          ? row.tanggal.toISOString().split("T")[0]
          : row.tanggal,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching monitoring gizi:", error);
    return {
      success: false,
      message: "Gagal mengambil data monitoring gizi",
      error: error.message,
      data: [],
    };
  }
}

/**
 * Menyimpan data monitoring asuhan gizi baru (Simpan).
 * INSERT ke tabel monitoring_asuhan_gizi.
 * Tabel: monitoring_asuhan_gizi (5 kolom: no_rawat, tanggal, monitoring, evaluasi, nip)
 */
export async function simpanMonitoringGiziRanap(data: {
  no_rawat: string; tanggal: string;
  monitoring: string; evaluasi: string; nip: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      INSERT INTO monitoring_asuhan_gizi (no_rawat, tanggal, monitoring, evaluasi, nip)
      VALUES (?, ?, ?, ?, ?)
    `, [
      data.no_rawat, data.tanggal, data.monitoring || "", data.evaluasi || "", data.nip,
    ]);

    return { success: true, message: "Data monitoring gizi berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving monitoring gizi:", error);
    return { success: false, message: "Gagal menyimpan data monitoring gizi", error: error.message };
  }
}

/**
 * Mengedit data monitoring asuhan gizi (Ganti).
 * UPDATE tabel monitoring_asuhan_gizi WHERE tanggal=? AND no_rawat=?.
 */
export async function editMonitoringGiziRanap(
  oldTanggal: string,
  oldNoRawat: string,
  newData: {
    no_rawat: string; tanggal: string;
    monitoring: string; evaluasi: string; nip: string;
  },
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      UPDATE monitoring_asuhan_gizi SET
        no_rawat=?, tanggal=?, monitoring=?, evaluasi=?, nip=?
      WHERE tanggal=? AND no_rawat=?
    `, [
      newData.no_rawat, newData.tanggal,
      newData.monitoring || "", newData.evaluasi || "", newData.nip,
      oldTanggal, oldNoRawat,
    ]);

    return { success: true, message: "Data monitoring gizi berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing monitoring gizi:", error);
    return { success: false, message: "Gagal mengubah data monitoring gizi", error: error.message };
  }
}

/**
 * Menghapus data monitoring asuhan gizi (Hapus).
 * DELETE dari tabel monitoring_asuhan_gizi WHERE tanggal=? AND no_rawat=?.
 */
export async function hapusMonitoringGiziRanap(tanggal: string, noRawat: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute("DELETE FROM monitoring_asuhan_gizi WHERE tanggal=? AND no_rawat=?", [tanggal, noRawat]);

    return { success: true, message: "Data monitoring gizi berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting monitoring gizi:", error);
    return { success: false, message: "Gagal menghapus data monitoring gizi", error: error.message };
  }
}

/**
 * Mengambil data skrining gizi lanjut pasien rawat inap.
 * Tabel: skrining_gizi
 */
export async function getSkriningGiziLanjutRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [];
    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          reg_periksa.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          skrining_gizi.alergi LIKE ? OR
          skrining_gizi.parameter_total LIKE ? OR
          skrining_gizi.nip LIKE ? OR
          petugas.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 7; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        reg_periksa.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        reg_periksa.umurdaftar,
        reg_periksa.sttsumur,
        pasien.jk,
        skrining_gizi.tanggal,
        skrining_gizi.skrining_bb AS bb,
        skrining_gizi.skrining_tb AS tb,
        skrining_gizi.alergi,
        skrining_gizi.parameter_imt,
        skrining_gizi.skor_imt,
        skrining_gizi.parameter_bb,
        skrining_gizi.skor_bb,
        skrining_gizi.parameter_penyakit,
        skrining_gizi.skor_penyakit,
        skrining_gizi.skor_total,
        skrining_gizi.parameter_total AS kesimpulan,
        skrining_gizi.nip,
        petugas.nama AS nm_petugas
      FROM skrining_gizi
      INNER JOIN reg_periksa ON skrining_gizi.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN petugas ON skrining_gizi.nip = petugas.nip
      WHERE skrining_gizi.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND skrining_gizi.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY skrining_gizi.tanggal DESC
    `;

    const [rows]: any = await db.execute(query, [noRawat, ...params]);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tanggal:
        row.tanggal instanceof Date
          ? row.tanggal.toISOString().split("T")[0]
          : row.tanggal,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching skrining gizi lanjut:", error);
    return {
      success: false,
      message: "Gagal mengambil data skrining gizi lanjut",
      error: error.message,
      data: [],
    };
  }
}

/**
 * Menyimpan data skrining gizi lanjut (INSERT).
 * Tabel: skrining_gizi
 * Primary key: no_rawat + tanggal
 */
export async function simpanSkriningGiziLanjutRanap(payload: {
  no_rawat: string;
  tanggal: string;
  skrining_bb: string;
  skrining_tb: string;
  alergi: string;
  parameter_imt: string;
  skor_imt: string;
  parameter_bb: string;
  skor_bb: string;
  parameter_penyakit: string;
  skor_penyakit: string;
  skor_total: string;
  parameter_total: string;
  nip: string;
}) {
  try {
    const query = `INSERT INTO skrining_gizi (no_rawat, tanggal, skrining_bb, skrining_tb, alergi, parameter_imt, skor_imt, parameter_bb, skor_bb, parameter_penyakit, skor_penyakit, skor_total, parameter_total, nip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    await db.execute(query, [
      payload.no_rawat,
      payload.tanggal,
      payload.skrining_bb,
      payload.skrining_tb,
      payload.alergi,
      payload.parameter_imt,
      payload.skor_imt,
      payload.parameter_bb,
      payload.skor_bb,
      payload.parameter_penyakit,
      payload.skor_penyakit,
      payload.skor_total,
      payload.parameter_total,
      payload.nip,
    ]);
    return { success: true, message: "Data skrining gizi lanjut berhasil disimpan" };
  } catch (error: any) {
    console.error("Error simpan skrining gizi lanjut:", error);
    return { success: false, message: "Gagal menyimpan data skrining gizi lanjut", error: error.message };
  }
}

/**
 * Mengedit data skrining gizi lanjut (UPDATE).
 * Tabel: skrining_gizi WHERE tanggal=? AND no_rawat=?
 */
export async function editSkriningGiziLanjutRanap(
  tanggalLama: string,
  noRawat: string,
  payload: {
    no_rawat: string;
    tanggal: string;
    skrining_bb: string;
    skrining_tb: string;
    alergi: string;
    parameter_imt: string;
    skor_imt: string;
    parameter_bb: string;
    skor_bb: string;
    parameter_penyakit: string;
    skor_penyakit: string;
    skor_total: string;
    parameter_total: string;
    nip: string;
  }
) {
  try {
    const query = `
      UPDATE skrining_gizi SET
        no_rawat=?, tanggal=?, skrining_bb=?, skrining_tb=?, alergi=?,
        parameter_imt=?, skor_imt=?, parameter_bb=?, skor_bb=?,
        parameter_penyakit=?, skor_penyakit=?, skor_total=?, parameter_total=?, nip=?
      WHERE tanggal=? AND no_rawat=?
    `;
    await db.execute(query, [
      payload.no_rawat,
      payload.tanggal,
      payload.skrining_bb,
      payload.skrining_tb,
      payload.alergi,
      payload.parameter_imt,
      payload.skor_imt,
      payload.parameter_bb,
      payload.skor_bb,
      payload.parameter_penyakit,
      payload.skor_penyakit,
      payload.skor_total,
      payload.parameter_total,
      payload.nip,
      tanggalLama,
      noRawat,
    ]);
    return { success: true, message: "Data skrining gizi lanjut berhasil diupdate" };
  } catch (error: any) {
    console.error("Error edit skrining gizi lanjut:", error);
    return { success: false, message: "Gagal mengupdate data skrining gizi lanjut", error: error.message };
  }
}

/**
 * Menghapus data skrining gizi lanjut (DELETE).
 * Tabel: skrining_gizi WHERE tanggal=? AND no_rawat=?
 */
export async function hapusSkriningGiziLanjutRanap(tanggal: string, noRawat: string) {
  try {
    const query = `DELETE FROM skrining_gizi WHERE tanggal=? AND no_rawat=?`;
    await db.execute(query, [tanggal, noRawat]);
    return { success: true, message: "Data skrining gizi lanjut berhasil dihapus" };
  } catch (error: any) {
    console.error("Error hapus skrining gizi lanjut:", error);
    return { success: false, message: "Gagal menghapus data skrining gizi lanjut", error: error.message };
  }
}

/**
 * Mengambil data catatan ADIME gizi pasien rawat inap.
 * Tabel: catatan_adime_gizi
 */
export async function getCatatanADIMEGiziRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [];
    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          reg_periksa.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          catatan_adime_gizi.asesmen LIKE ? OR
          catatan_adime_gizi.diagnosis LIKE ? OR
          catatan_adime_gizi.intervensi LIKE ? OR
          catatan_adime_gizi.monitoring LIKE ? OR
          catatan_adime_gizi.evaluasi LIKE ? OR
          catatan_adime_gizi.instruksi LIKE ? OR
          catatan_adime_gizi.nip LIKE ? OR
          petugas.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 11; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        reg_periksa.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        reg_periksa.umurdaftar,
        reg_periksa.sttsumur,
        pasien.jk,
        catatan_adime_gizi.tanggal,
        catatan_adime_gizi.asesmen,
        catatan_adime_gizi.diagnosis,
        catatan_adime_gizi.intervensi,
        catatan_adime_gizi.monitoring,
        catatan_adime_gizi.evaluasi,
        catatan_adime_gizi.instruksi,
        catatan_adime_gizi.nip,
        petugas.nama AS nm_petugas
      FROM catatan_adime_gizi
      INNER JOIN reg_periksa ON catatan_adime_gizi.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN petugas ON catatan_adime_gizi.nip = petugas.nip
      WHERE catatan_adime_gizi.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND catatan_adime_gizi.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY catatan_adime_gizi.tanggal DESC
    `;

    const [rows]: any = await db.execute(query, [noRawat, ...params]);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tanggal:
        row.tanggal instanceof Date
          ? row.tanggal.toISOString().split("T")[0]
          : row.tanggal,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching catatan ADIME gizi:", error);
    return {
      success: false,
      message: "Gagal mengambil data catatan ADIME gizi",
      error: error.message,
      data: [],
    };
  }
}

/**
 * Menyimpan data catatan ADIME gizi (Simpan).
 * Tabel: catatan_adime_gizi
 */
export async function simpanCatatanADIMEGiziRanap(data: {
  no_rawat: string; tanggal: string;
  asesmen: string; diagnosis: string; intervensi: string;
  monitoring: string; evaluasi: string; instruksi: string; nip: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      INSERT INTO catatan_adime_gizi (no_rawat, tanggal, asesmen, diagnosis, intervensi, monitoring, evaluasi, instruksi, nip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.no_rawat, data.tanggal, data.asesmen || "", data.diagnosis || "",
      data.intervensi || "", data.monitoring || "", data.evaluasi || "",
      data.instruksi || "", data.nip,
    ]);

    return { success: true, message: "Data catatan ADIME gizi berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving catatan ADIME gizi:", error);
    return { success: false, message: "Gagal menyimpan data catatan ADIME gizi", error: error.message };
  }
}

/**
 * Mengedit data catatan ADIME gizi (Ganti).
 * UPDATE tabel catatan_adime_gizi WHERE tanggal=? AND no_rawat=?.
 */
export async function editCatatanADIMEGiziRanap(
  oldTanggal: string,
  oldNoRawat: string,
  newData: {
    no_rawat: string; tanggal: string;
    asesmen: string; diagnosis: string; intervensi: string;
    monitoring: string; evaluasi: string; instruksi: string; nip: string;
  },
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      UPDATE catatan_adime_gizi SET
        no_rawat=?, tanggal=?, asesmen=?, diagnosis=?, intervensi=?,
        monitoring=?, evaluasi=?, instruksi=?, nip=?
      WHERE tanggal=? AND no_rawat=?
    `, [
      newData.no_rawat, newData.tanggal, newData.asesmen || "", newData.diagnosis || "",
      newData.intervensi || "", newData.monitoring || "", newData.evaluasi || "",
      newData.instruksi || "", newData.nip,
      oldTanggal, oldNoRawat,
    ]);

    return { success: true, message: "Data catatan ADIME gizi berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing catatan ADIME gizi:", error);
    return { success: false, message: "Gagal mengubah data catatan ADIME gizi", error: error.message };
  }
}

/**
 * Menghapus data catatan ADIME gizi (Hapus).
 * DELETE dari tabel catatan_adime_gizi WHERE tanggal=? AND no_rawat=?.
 */
export async function hapusCatatanADIMEGiziRanap(tanggal: string, noRawat: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute("DELETE FROM catatan_adime_gizi WHERE tanggal=? AND no_rawat=?", [tanggal, noRawat]);

    return { success: true, message: "Data catatan ADIME gizi berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting catatan ADIME gizi:", error);
    return { success: false, message: "Gagal menghapus data catatan ADIME gizi", error: error.message };
  }
}

/**
 * Mengambil data skrining nutrisi dewasa pasien rawat inap.
 * Tabel: skrining_nutrisi_dewasa
 */
export async function getSkriningNutrisiRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [];
    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          reg_periksa.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          skrining_nutrisi_dewasa.alergi LIKE ? OR
          skrining_nutrisi_dewasa.nip LIKE ? OR
          petugas.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 6; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        reg_periksa.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        pasien.tgl_lahir,
        pasien.jk,
        skrining_nutrisi_dewasa.tanggal,
        skrining_nutrisi_dewasa.bb,
        skrining_nutrisi_dewasa.lila,
        skrining_nutrisi_dewasa.tbpb,
        skrining_nutrisi_dewasa.td,
        skrining_nutrisi_dewasa.hr,
        skrining_nutrisi_dewasa.rr,
        skrining_nutrisi_dewasa.suhu,
        skrining_nutrisi_dewasa.spo2,
        skrining_nutrisi_dewasa.alergi,
        skrining_nutrisi_dewasa.sg1,
        skrining_nutrisi_dewasa.nilai1,
        skrining_nutrisi_dewasa.sg2,
        skrining_nutrisi_dewasa.nilai2,
        skrining_nutrisi_dewasa.sg3,
        skrining_nutrisi_dewasa.total_hasil,
        skrining_nutrisi_dewasa.nip,
        petugas.nama AS nm_petugas
      FROM skrining_nutrisi_dewasa
      INNER JOIN reg_periksa ON skrining_nutrisi_dewasa.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN petugas ON skrining_nutrisi_dewasa.nip = petugas.nip
      WHERE skrining_nutrisi_dewasa.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND skrining_nutrisi_dewasa.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY skrining_nutrisi_dewasa.tanggal DESC
    `;

    const [rows]: any = await db.execute(query, [noRawat, ...params]);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tanggal:
        row.tanggal instanceof Date
          ? row.tanggal.toISOString().split("T")[0]
          : row.tanggal,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching skrining nutrisi:", error);
    return {
      success: false,
      message: "Gagal mengambil data skrining nutrisi",
      error: error.message,
      data: [],
    };
  }
}

/**
 * Menyimpan data skrining nutrisi dewasa (Simpan).
 * Tabel: skrining_nutrisi_dewasa
 */
export async function simpanSkriningNutrisiRanap(data: {
  no_rawat: string; tanggal: string;
  td: string; hr: string; rr: string; suhu: string;
  lila: string; bb: string; tbpb: string; spo2: string;
  alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; total_hasil: string; nip: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      INSERT INTO skrining_nutrisi_dewasa
        (no_rawat, tanggal, td, hr, rr, suhu, lila, bb, tbpb, spo2, alergi,
         sg1, nilai1, sg2, nilai2, sg3, total_hasil, nip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tanggal=VALUES(tanggal), td=VALUES(td), hr=VALUES(hr), rr=VALUES(rr),
        suhu=VALUES(suhu), lila=VALUES(lila), bb=VALUES(bb), tbpb=VALUES(tbpb),
        spo2=VALUES(spo2), alergi=VALUES(alergi),
        sg1=VALUES(sg1), nilai1=VALUES(nilai1), sg2=VALUES(sg2), nilai2=VALUES(nilai2),
        sg3=VALUES(sg3), total_hasil=VALUES(total_hasil), nip=VALUES(nip)
    `, [
      data.no_rawat, data.tanggal,
      data.td || "", data.hr || "", data.rr || "", data.suhu || "",
      data.lila || "", data.bb || "", data.tbpb || "", data.spo2 || "",
      data.alergi || "",
      data.sg1, data.nilai1, data.sg2, data.nilai2,
      data.sg3 || "", data.total_hasil, data.nip,
    ]);

    return { success: true, message: "Data skrining nutrisi dewasa berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving skrining nutrisi dewasa:", error);
    return { success: false, message: "Gagal menyimpan data skrining nutrisi dewasa", error: error.message };
  }
}

/**
 * Mengedit data skrining nutrisi dewasa (Ganti).
 * UPDATE skrining_nutrisi_dewasa WHERE tanggal=? AND no_rawat=?.
 */
export async function editSkriningNutrisiRanap(
  oldTanggal: string,
  oldNoRawat: string,
  newData: {
    no_rawat: string; tanggal: string;
    td: string; hr: string; rr: string; suhu: string;
    lila: string; bb: string; tbpb: string; spo2: string;
    alergi: string;
    sg1: string; nilai1: string; sg2: string; nilai2: string;
    sg3: string; total_hasil: string; nip: string;
  },
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      UPDATE skrining_nutrisi_dewasa SET
        no_rawat=?, tanggal=?, td=?, hr=?, rr=?, suhu=?, lila=?, bb=?, tbpb=?, spo2=?, alergi=?,
        sg1=?, nilai1=?, sg2=?, nilai2=?, sg3=?, total_hasil=?, nip=?
      WHERE tanggal=? AND no_rawat=?
    `, [
      newData.no_rawat, newData.tanggal,
      newData.td || "", newData.hr || "", newData.rr || "", newData.suhu || "",
      newData.lila || "", newData.bb || "", newData.tbpb || "", newData.spo2 || "",
      newData.alergi || "",
      newData.sg1, newData.nilai1, newData.sg2, newData.nilai2,
      newData.sg3 || "", newData.total_hasil, newData.nip,
      oldTanggal, oldNoRawat,
    ]);

    return { success: true, message: "Data skrining nutrisi dewasa berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing skrining nutrisi dewasa:", error);
    return { success: false, message: "Gagal mengubah data skrining nutrisi dewasa", error: error.message };
  }
}

/**
 * Menghapus data skrining nutrisi dewasa (Hapus).
 * DELETE dari skrining_nutrisi_dewasa WHERE tanggal=? AND no_rawat=?.
 */
export async function hapusSkriningNutrisiRanap(tanggal: string, noRawat: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute("DELETE FROM skrining_nutrisi_dewasa WHERE tanggal=? AND no_rawat=?", [tanggal, noRawat]);

    return { success: true, message: "Data skrining nutrisi dewasa berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting skrining nutrisi dewasa:", error);
    return { success: false, message: "Gagal menghapus data skrining nutrisi dewasa", error: error.message };
  }
}

/**
 * Mengambil data skrining nutrisi anak pasien rawat inap.
 * Tabel: skrining_nutrisi_anak (StrongKids)
 */
export async function getSkriningNutrisiAnakRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [];
    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          reg_periksa.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          skrining_nutrisi_anak.alergi LIKE ? OR
          skrining_nutrisi_anak.nip LIKE ? OR
          petugas.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 6; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        reg_periksa.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        pasien.tgl_lahir,
        pasien.jk,
        skrining_nutrisi_anak.tanggal,
        skrining_nutrisi_anak.bb,
        skrining_nutrisi_anak.tbpb,
        skrining_nutrisi_anak.td,
        skrining_nutrisi_anak.hr,
        skrining_nutrisi_anak.rr,
        skrining_nutrisi_anak.suhu,
        skrining_nutrisi_anak.spo2,
        skrining_nutrisi_anak.alergi,
        skrining_nutrisi_anak.sg1,
        skrining_nutrisi_anak.nilai1,
        skrining_nutrisi_anak.sg2,
        skrining_nutrisi_anak.nilai2,
        skrining_nutrisi_anak.sg3,
        skrining_nutrisi_anak.nilai3,
        skrining_nutrisi_anak.sg4,
        skrining_nutrisi_anak.nilai4,
        skrining_nutrisi_anak.total_hasil,
        skrining_nutrisi_anak.skor_nutrisi,
        skrining_nutrisi_anak.diketahui_dietisien,
        skrining_nutrisi_anak.keterangan_diketahui_dietisien,
        skrining_nutrisi_anak.nip,
        petugas.nama AS nm_petugas
      FROM skrining_nutrisi_anak
      INNER JOIN reg_periksa ON skrining_nutrisi_anak.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN petugas ON skrining_nutrisi_anak.nip = petugas.nip
      WHERE skrining_nutrisi_anak.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND skrining_nutrisi_anak.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY skrining_nutrisi_anak.tanggal DESC
    `;

    const [rows]: any = await db.execute(query, [noRawat, ...params]);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tanggal:
        row.tanggal instanceof Date
          ? row.tanggal.toISOString().split("T")[0]
          : row.tanggal,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching skrining nutrisi anak:", error);
    return {
      success: false,
      message: "Gagal mengambil data skrining nutrisi anak",
      error: error.message,
      data: [],
    };
  }
}

/**
 * Menyimpan data skrining nutrisi anak (Simpan).
 * Tabel: skrining_nutrisi_anak (StrongKids)
 */
export async function simpanSkriningNutrisiAnakRanap(data: {
  no_rawat: string; tanggal: string;
  bb: string; tbpb: string; td: string; hr: string; rr: string;
  suhu: string; spo2: string; alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; nilai3: string; sg4: string; nilai4: string;
  total_hasil: string; skor_nutrisi: string;
  diketahui_dietisien: string; keterangan_diketahui_dietisien: string;
  nip: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      INSERT INTO skrining_nutrisi_anak
        (no_rawat, tanggal, bb, tbpb, td, hr, rr, suhu, spo2, alergi,
         sg1, nilai1, sg2, nilai2, sg3, nilai3, sg4, nilai4,
         total_hasil, skor_nutrisi, diketahui_dietisien, keterangan_diketahui_dietisien, nip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tanggal=VALUES(tanggal), bb=VALUES(bb), tbpb=VALUES(tbpb),
        td=VALUES(td), hr=VALUES(hr), rr=VALUES(rr),
        suhu=VALUES(suhu), spo2=VALUES(spo2), alergi=VALUES(alergi),
        sg1=VALUES(sg1), nilai1=VALUES(nilai1),
        sg2=VALUES(sg2), nilai2=VALUES(nilai2),
        sg3=VALUES(sg3), nilai3=VALUES(nilai3),
        sg4=VALUES(sg4), nilai4=VALUES(nilai4),
        total_hasil=VALUES(total_hasil), skor_nutrisi=VALUES(skor_nutrisi),
        diketahui_dietisien=VALUES(diketahui_dietisien),
        keterangan_diketahui_dietisien=VALUES(keterangan_diketahui_dietisien),
        nip=VALUES(nip)
    `, [
      data.no_rawat, data.tanggal,
      data.bb || "", data.tbpb || "", data.td || "", data.hr || "",
      data.rr || "", data.suhu || "", data.spo2 || "", data.alergi || "",
      data.sg1, data.nilai1, data.sg2, data.nilai2,
      data.sg3, data.nilai3, data.sg4, data.nilai4,
      data.total_hasil, data.skor_nutrisi,
      data.diketahui_dietisien, data.keterangan_diketahui_dietisien || "", data.nip,
    ]);

    return { success: true, message: "Data skrining nutrisi anak berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving skrining nutrisi anak:", error);
    return { success: false, message: "Gagal menyimpan data skrining nutrisi anak", error: error.message };
  }
}

/**
 * Mengedit data skrining nutrisi anak (Ganti).
 * UPDATE skrining_nutrisi_anak WHERE tanggal=? AND no_rawat=?.
 */
export async function editSkriningNutrisiAnakRanap(
  oldTanggal: string,
  oldNoRawat: string,
  newData: {
    no_rawat: string; tanggal: string;
    bb: string; tbpb: string; td: string; hr: string; rr: string;
    suhu: string; spo2: string; alergi: string;
    sg1: string; nilai1: string; sg2: string; nilai2: string;
    sg3: string; nilai3: string; sg4: string; nilai4: string;
    total_hasil: string; skor_nutrisi: string;
    diketahui_dietisien: string; keterangan_diketahui_dietisien: string;
    nip: string;
  },
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      UPDATE skrining_nutrisi_anak SET
        no_rawat=?, tanggal=?, bb=?, tbpb=?, td=?, hr=?, rr=?, suhu=?, spo2=?, alergi=?,
        sg1=?, nilai1=?, sg2=?, nilai2=?, sg3=?, nilai3=?, sg4=?, nilai4=?,
        total_hasil=?, skor_nutrisi=?, diketahui_dietisien=?,
        keterangan_diketahui_dietisien=?, nip=?
      WHERE tanggal=? AND no_rawat=?
    `, [
      newData.no_rawat, newData.tanggal,
      newData.bb || "", newData.tbpb || "", newData.td || "", newData.hr || "",
      newData.rr || "", newData.suhu || "", newData.spo2 || "", newData.alergi || "",
      newData.sg1, newData.nilai1, newData.sg2, newData.nilai2,
      newData.sg3, newData.nilai3, newData.sg4, newData.nilai4,
      newData.total_hasil, newData.skor_nutrisi,
      newData.diketahui_dietisien, newData.keterangan_diketahui_dietisien || "", newData.nip,
      oldTanggal, oldNoRawat,
    ]);

    return { success: true, message: "Data skrining nutrisi anak berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing skrining nutrisi anak:", error);
    return { success: false, message: "Gagal mengubah data skrining nutrisi anak", error: error.message };
  }
}

/**
 * Menghapus data skrining nutrisi anak (Hapus).
 * DELETE dari skrining_nutrisi_anak WHERE tanggal=? AND no_rawat=?.
 */
export async function hapusSkriningNutrisiAnakRanap(tanggal: string, noRawat: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute("DELETE FROM skrining_nutrisi_anak WHERE tanggal=? AND no_rawat=?", [tanggal, noRawat]);

    return { success: true, message: "Data skrining nutrisi anak berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting skrining nutrisi anak:", error);
    return { success: false, message: "Gagal menghapus data skrining nutrisi anak", error: error.message };
  }
}

/**
 * Menyimpan data skrining nutrisi lansia (Simpan).
 * Tabel: skrining_nutrisi_lansia (MNA)
 */
export async function simpanSkriningNutrisiLansiaRanap(data: {
  no_rawat: string; tanggal: string;
  bb: string; tbpb: string; td: string; hr: string; rr: string;
  suhu: string; spo2: string; alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; nilai3: string; sg4: string; nilai4: string;
  sg5: string; nilai5: string; sg6: string; nilai6: string;
  total_hasil: string; skor_nutrisi: string;
  nip: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      INSERT INTO skrining_nutrisi_lansia
        (no_rawat, tanggal, bb, tbpb, td, hr, rr, suhu, spo2, alergi,
         sg1, nilai1, sg2, nilai2, sg3, nilai3, sg4, nilai4,
         sg5, nilai5, sg6, nilai6,
         total_hasil, skor_nutrisi, nip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tanggal=VALUES(tanggal), bb=VALUES(bb), tbpb=VALUES(tbpb),
        td=VALUES(td), hr=VALUES(hr), rr=VALUES(rr),
        suhu=VALUES(suhu), spo2=VALUES(spo2), alergi=VALUES(alergi),
        sg1=VALUES(sg1), nilai1=VALUES(nilai1),
        sg2=VALUES(sg2), nilai2=VALUES(nilai2),
        sg3=VALUES(sg3), nilai3=VALUES(nilai3),
        sg4=VALUES(sg4), nilai4=VALUES(nilai4),
        sg5=VALUES(sg5), nilai5=VALUES(nilai5),
        sg6=VALUES(sg6), nilai6=VALUES(nilai6),
        total_hasil=VALUES(total_hasil), skor_nutrisi=VALUES(skor_nutrisi),
        nip=VALUES(nip)
    `, [
      data.no_rawat, data.tanggal,
      data.bb || "", data.tbpb || "", data.td || "", data.hr || "",
      data.rr || "", data.suhu || "", data.spo2 || "", data.alergi || "",
      data.sg1, data.nilai1, data.sg2, data.nilai2,
      data.sg3, data.nilai3, data.sg4, data.nilai4,
      data.sg5, data.nilai5, data.sg6, data.nilai6,
      data.total_hasil, data.skor_nutrisi, data.nip,
    ]);

    return { success: true, message: "Data skrining nutrisi lansia berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving skrining nutrisi lansia:", error);
    return { success: false, message: "Gagal menyimpan data skrining nutrisi lansia", error: error.message };
  }
}

/**
 * Mengedit data skrining nutrisi lansia (Ganti).
 * UPDATE skrining_nutrisi_lansia WHERE tanggal=? AND no_rawat=?.
 */
export async function editSkriningNutrisiLansiaRanap(
  oldTanggal: string,
  oldNoRawat: string,
  newData: {
    no_rawat: string; tanggal: string;
    bb: string; tbpb: string; td: string; hr: string; rr: string;
    suhu: string; spo2: string; alergi: string;
    sg1: string; nilai1: string; sg2: string; nilai2: string;
    sg3: string; nilai3: string; sg4: string; nilai4: string;
    sg5: string; nilai5: string; sg6: string; nilai6: string;
    total_hasil: string; skor_nutrisi: string;
    nip: string;
  },
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      UPDATE skrining_nutrisi_lansia SET
        no_rawat=?, tanggal=?, bb=?, tbpb=?, td=?, hr=?, rr=?, suhu=?, spo2=?, alergi=?,
        sg1=?, nilai1=?, sg2=?, nilai2=?, sg3=?, nilai3=?, sg4=?, nilai4=?,
        sg5=?, nilai5=?, sg6=?, nilai6=?,
        total_hasil=?, skor_nutrisi=?, nip=?
      WHERE tanggal=? AND no_rawat=?
    `, [
      newData.no_rawat, newData.tanggal,
      newData.bb || "", newData.tbpb || "", newData.td || "", newData.hr || "",
      newData.rr || "", newData.suhu || "", newData.spo2 || "", newData.alergi || "",
      newData.sg1, newData.nilai1, newData.sg2, newData.nilai2,
      newData.sg3, newData.nilai3, newData.sg4, newData.nilai4,
      newData.sg5, newData.nilai5, newData.sg6, newData.nilai6,
      newData.total_hasil, newData.skor_nutrisi, newData.nip,
      oldTanggal, oldNoRawat,
    ]);

    return { success: true, message: "Data skrining nutrisi lansia berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing skrining nutrisi lansia:", error);
    return { success: false, message: "Gagal mengubah data skrining nutrisi lansia", error: error.message };
  }
}

/**
 * Menghapus data skrining nutrisi lansia (Hapus).
 * DELETE dari skrining_nutrisi_lansia WHERE tanggal=? AND no_rawat=?.
 */
export async function hapusSkriningNutrisiLansiaRanap(tanggal: string, noRawat: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute("DELETE FROM skrining_nutrisi_lansia WHERE tanggal=? AND no_rawat=?", [tanggal, noRawat]);

    return { success: true, message: "Data skrining nutrisi lansia berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting skrining nutrisi lansia:", error);
    return { success: false, message: "Gagal menghapus data skrining nutrisi lansia", error: error.message };
  }
}

/**
 * Mengambil data skrining nutrisi lansia pasien rawat inap.
 * Tabel: skrining_nutrisi_lansia (MNA)
 */
export async function getSkriningNutrisiLansiaRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [];
    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          reg_periksa.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          skrining_nutrisi_lansia.alergi LIKE ? OR
          skrining_nutrisi_lansia.nip LIKE ? OR
          petugas.nama LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 6; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        reg_periksa.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        pasien.tgl_lahir,
        pasien.jk,
        skrining_nutrisi_lansia.tanggal,
        skrining_nutrisi_lansia.bb,
        skrining_nutrisi_lansia.tbpb,
        skrining_nutrisi_lansia.td,
        skrining_nutrisi_lansia.hr,
        skrining_nutrisi_lansia.rr,
        skrining_nutrisi_lansia.suhu,
        skrining_nutrisi_lansia.spo2,
        skrining_nutrisi_lansia.alergi,
        skrining_nutrisi_lansia.sg1,
        skrining_nutrisi_lansia.nilai1,
        skrining_nutrisi_lansia.sg2,
        skrining_nutrisi_lansia.nilai2,
        skrining_nutrisi_lansia.sg3,
        skrining_nutrisi_lansia.nilai3,
        skrining_nutrisi_lansia.sg4,
        skrining_nutrisi_lansia.nilai4,
        skrining_nutrisi_lansia.sg5,
        skrining_nutrisi_lansia.nilai5,
        skrining_nutrisi_lansia.sg6,
        skrining_nutrisi_lansia.nilai6,
        skrining_nutrisi_lansia.total_hasil,
        skrining_nutrisi_lansia.skor_nutrisi,
        skrining_nutrisi_lansia.nip,
        petugas.nama AS nm_petugas
      FROM skrining_nutrisi_lansia
      INNER JOIN reg_periksa ON skrining_nutrisi_lansia.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN petugas ON skrining_nutrisi_lansia.nip = petugas.nip
      WHERE skrining_nutrisi_lansia.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND skrining_nutrisi_lansia.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY skrining_nutrisi_lansia.tanggal DESC
    `;

    const [rows]: any = await db.execute(query, [noRawat, ...params]);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tanggal:
        row.tanggal instanceof Date
          ? row.tanggal.toISOString().split("T")[0]
          : row.tanggal,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching skrining nutrisi lansia:", error);
    return {
      success: false,
      message: "Gagal mengambil data skrining nutrisi lansia",
      error: error.message,
      data: [],
    };
  }
}

export async function getDaftarRanap(
  keyword: string = "",
  status: string = "Belum Pulang",
  tglAwal: string = "",
  tglAkhir: string = ""
) {
  try {
    let whereCondition = "";
    const params: any[] = [];

    // 1. Filter berdasarkan Status & Tanggal
    if (status === "Belum Pulang") {
      whereCondition = "WHERE kamar_inap.stts_pulang = '-'";
    } else if (status === "Sudah Pulang") {
      whereCondition = "WHERE kamar_inap.stts_pulang <> '-' AND kamar_inap.tgl_keluar BETWEEN ? AND ?";
      params.push(tglAwal, tglAkhir);
    } else if (status === "Tgl. Masuk") {
      whereCondition = "WHERE kamar_inap.tgl_masuk BETWEEN ? AND ?";
      params.push(tglAwal, tglAkhir);
    } else {
      whereCondition = "WHERE 1=1";
    }

    // 2. Filter berdasarkan Kata Kunci Pencarian
    if (keyword) {
      whereCondition += `
        AND (
          kamar_inap.no_rawat LIKE ? OR 
          reg_periksa.no_rkm_medis LIKE ? OR 
          pasien.nm_pasien LIKE ? OR 
          pasien.alamat LIKE ? OR 
          kamar_inap.kd_kamar LIKE ? OR 
          bangsal.nm_bangsal LIKE ? OR 
          kamar_inap.diagnosa_awal LIKE ? OR 
          kamar_inap.diagnosa_akhir LIKE ? OR 
          COALESCE(dpjp.nm_dokter, dokter.nm_dokter) LIKE ? OR 
          penjab.png_jawab LIKE ?
        )
      `;
      const searchKey = `%${keyword}%`;
      for (let i = 0; i < 10; i++) params.push(searchKey);
    }

    const query = `
      SELECT 
        kamar_inap.no_rawat,
        reg_periksa.no_rkm_medis,
        pasien.nm_pasien,
        concat(pasien.alamat,', ',kelurahan.nm_kel,', ',kecamatan.nm_kec,', ',kabupaten.nm_kab) as alamat,
        reg_periksa.p_jawab,
        reg_periksa.hubunganpj,
        penjab.png_jawab,
        concat(kamar_inap.kd_kamar,' ',bangsal.nm_bangsal) as kamar,
        kamar_inap.trf_kamar,
        kamar_inap.diagnosa_awal,
        kamar_inap.diagnosa_akhir,
        kamar_inap.tgl_masuk,
        kamar_inap.jam_masuk,
        if(kamar_inap.tgl_keluar='0000-00-00','',kamar_inap.tgl_keluar) as tgl_keluar,
        if(kamar_inap.jam_keluar='00:00:00','',kamar_inap.jam_keluar) as jam_keluar,
        kamar_inap.ttl_biaya,
        kamar_inap.stts_pulang,
        kamar_inap.lama,
        COALESCE(dpjp.nm_dokter, dokter.nm_dokter) as nm_dokter,
        kamar_inap.kd_kamar,
        reg_periksa.kd_pj,
        concat(reg_periksa.umurdaftar,' ',reg_periksa.sttsumur) as umur,
        reg_periksa.status_bayar,
        pasien.agama,
        pasien.no_tlp
      FROM kamar_inap 
      INNER JOIN reg_periksa ON kamar_inap.no_rawat=reg_periksa.no_rawat 
      INNER JOIN pasien ON reg_periksa.no_rkm_medis=pasien.no_rkm_medis
      INNER JOIN kamar ON kamar_inap.kd_kamar=kamar.kd_kamar 
      INNER JOIN bangsal ON kamar.kd_bangsal=bangsal.kd_bangsal
      INNER JOIN kelurahan ON pasien.kd_kel=kelurahan.kd_kel 
      INNER JOIN kecamatan ON pasien.kd_kec=kecamatan.kd_kec
      INNER JOIN kabupaten ON pasien.kd_kab=kabupaten.kd_kab 
      INNER JOIN dokter ON reg_periksa.kd_dokter=dokter.kd_dokter
      LEFT JOIN (
        SELECT dpjp_ranap.no_rawat, dokter.nm_dokter 
        FROM dpjp_ranap 
        INNER JOIN dokter ON dpjp_ranap.kd_dokter=dokter.kd_dokter 
        GROUP BY dpjp_ranap.no_rawat
      ) dpjp ON kamar_inap.no_rawat=dpjp.no_rawat
      INNER JOIN penjab ON reg_periksa.kd_pj=penjab.kd_pj
      ${whereCondition}
      ORDER BY bangsal.nm_bangsal, kamar_inap.tgl_masuk, kamar_inap.jam_masuk
    `;

    const [rows]: any = await db.execute(query, params);

    // Format tanggal ke string untuk menghindari error rendering React
    const formattedRows = rows.map((row: any) => ({
      ...row,
      tgl_masuk:
        row.tgl_masuk instanceof Date
          ? row.tgl_masuk.toISOString().split("T")[0]
          : row.tgl_masuk,
      tgl_keluar:
        row.tgl_keluar instanceof Date
          ? row.tgl_keluar.toISOString().split("T")[0]
          : row.tgl_keluar,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching Ranap list:", error);
    return {
      success: false,
      message: "Gagal mengambil data rawat inap",
      error: error.message,
    };
  }
}

/**
 * Mengambil data diet pasien rawat inap.
 * Tabel: detail_beri_diet
 */
export async function getDietPasienRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [noRawat];
    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      searchClause = `
        AND (
          detail_beri_diet.no_rawat LIKE ? OR
          pasien.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          diet.nama_diet LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 4; i++) params.push(searchKey);
    }

    const query = `
      SELECT
        detail_beri_diet.no_rawat,
        pasien.no_rkm_medis,
        pasien.nm_pasien,
        pasien.tgl_lahir,
        pasien.jk,
        CONCAT(detail_beri_diet.kd_kamar, ', ', bangsal.nm_bangsal) AS kamar,
        detail_beri_diet.tanggal,
        detail_beri_diet.waktu,
        jam_diet_pasien.jam,
        diet.nama_diet,
        detail_beri_diet.keterangan,
        detail_beri_diet.kd_kamar,
        detail_beri_diet.kd_diet
      FROM detail_beri_diet
      INNER JOIN reg_periksa ON detail_beri_diet.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      INNER JOIN diet ON detail_beri_diet.kd_diet = diet.kd_diet
      INNER JOIN kamar ON detail_beri_diet.kd_kamar = kamar.kd_kamar
      INNER JOIN bangsal ON kamar.kd_bangsal = bangsal.kd_bangsal
      INNER JOIN jam_diet_pasien ON detail_beri_diet.waktu = jam_diet_pasien.waktu
      WHERE detail_beri_diet.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND detail_beri_diet.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      ORDER BY detail_beri_diet.tanggal DESC, detail_beri_diet.waktu DESC
    `;

    const [rows]: any = await db.execute(query, params);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tanggal:
        row.tanggal instanceof Date
          ? row.tanggal.toISOString().split("T")[0]
          : row.tanggal,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching diet pasien:", error);
    return { success: false, message: "Gagal mengambil data diet pasien", error: error.message, data: [] };
  }
}

/**
 * Mengambil rekap diet pasien rawat inap.
 */
export async function getRekapDietPasienRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    const params: any[] = [noRawat];
    if (tglAwal && tglAkhir) {
      params.push(tglAwal + " 00:00:00", tglAkhir + " 23:59:59");
    }

    let searchClause = "";
    if (keyword.trim()) {
      const searchKey = `%${keyword.trim()}%`;
      params.push(searchKey);
      searchClause = `AND diet.nama_diet LIKE ?`;
    }

    const query = `
      SELECT
        diet.nama_diet,
        COUNT(*) AS jumlah
      FROM detail_beri_diet
      INNER JOIN diet ON detail_beri_diet.kd_diet = diet.kd_diet
      WHERE detail_beri_diet.no_rawat = ?
        ${tglAwal && tglAkhir ? "AND detail_beri_diet.tanggal BETWEEN ? AND ?" : ""}
        ${searchClause}
      GROUP BY diet.nama_diet
      ORDER BY diet.nama_diet
    `;

    const [rows]: any = await db.execute(query, params);
    const formattedRows = rows.map((row: any, idx: number) => ({
      ...row,
      id: `rekap-${idx}`,
    }));

    return { success: true, data: formattedRows };
  } catch (error: any) {
    console.error("Error fetching rekap diet pasien:", error);
    return { success: false, message: "Gagal mengambil rekap diet", error: error.message, data: [] };
  }
}

/**
 * Mengambil daftar diet untuk lookup.
 * Tabel: diet
 */
export async function getDaftarDiet() {
  try {
    const query = `SELECT kd_diet, nama_diet FROM diet ORDER BY nama_diet`;
    const [rows]: any = await db.execute(query);
    return { success: true, data: rows };
  } catch (error: any) {
    console.error("Error fetching daftar diet:", error);
    return { success: false, message: "Gagal mengambil daftar diet", error: error.message, data: [] };
  }
}

/**
 * Mengambil daftar jam diet.
 * Tabel: jam_diet_pasien
 */
export async function getJamDiet() {
  try {
    const query = `SELECT waktu, jam FROM jam_diet_pasien ORDER BY jam`;
    const [rows]: any = await db.execute(query);
    return { success: true, data: rows };
  } catch (error: any) {
    console.error("Error fetching jam diet:", error);
    return { success: false, message: "Gagal mengambil jam diet", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan kd_kamar pasien rawat inap.
 */
export async function getKamarPasienRanap(noRawat: string) {
  try {
    const query = `
      SELECT kd_kamar FROM kamar_inap
      WHERE no_rawat = ?
      ORDER BY tgl_masuk DESC
      LIMIT 1
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    if (rows.length > 0) {
      return { success: true, data: { kd_kamar: rows[0].kd_kamar } };
    }
    return { success: false, message: "Kamar tidak ditemukan" };
  } catch (error: any) {
    console.error("Error fetching kamar pasien:", error);
    return { success: false, message: "Gagal mengambil kamar pasien", error: error.message };
  }
}

/**
 * Menyimpan data diet pasien (Simpan).
 * INSERT ke tabel detail_beri_diet.
 * Ported from DlgPemberianDiet.java BtnSimpanActionPerformed.
 */
export async function simpanDietPasienRanap(data: {
  no_rawat: string; kd_kamar: string; tanggal: string;
  waktu: string; kd_diet: string; keterangan: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      INSERT INTO detail_beri_diet (no_rawat, kd_kamar, tanggal, waktu, kd_diet, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [data.no_rawat, data.kd_kamar, data.tanggal, data.waktu, data.kd_diet, data.keterangan]);

    return { success: true, message: "Data diet pasien berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving diet pasien:", error);
    return { success: false, message: "Gagal menyimpan data diet pasien", error: error.message };
  }
}

/**
 * Mengedit data diet pasien (Ganti).
 * UPDATE tabel detail_beri_diet WHERE no_rawat=? AND tanggal=? AND waktu=? AND kd_diet=?.
 */
export async function editDietPasienRanap(
  oldNoRawat: string, oldTanggal: string, oldWaktu: string, oldKdDiet: string,
  newData: {
    no_rawat: string; kd_kamar: string; tanggal: string;
    waktu: string; kd_diet: string; keterangan: string;
  },
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(`
      UPDATE detail_beri_diet SET
        no_rawat=?, kd_kamar=?, tanggal=?, waktu=?, kd_diet=?, keterangan=?
      WHERE no_rawat=? AND tanggal=? AND waktu=? AND kd_diet=?
    `, [
      newData.no_rawat, newData.kd_kamar, newData.tanggal, newData.waktu, newData.kd_diet, newData.keterangan,
      oldNoRawat, oldTanggal, oldWaktu, oldKdDiet,
    ]);

    return { success: true, message: "Data diet pasien berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing diet pasien:", error);
    return { success: false, message: "Gagal mengubah data diet pasien", error: error.message };
  }
}

/**
 * Menghapus data diet pasien (Hapus).
 * DELETE dari tabel detail_beri_diet WHERE no_rawat=? AND tanggal=? AND waktu=? AND kd_diet=?.
 * Ported from DlgPemberianDiet.java BtnHapusActionPerformed.
 */
export async function hapusDietPasienRanap(noRawat: string, tanggal: string, waktu: string, kdDiet: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    await db.execute(
      "DELETE FROM detail_beri_diet WHERE no_rawat=? AND tanggal=? AND waktu=? AND kd_diet=?",
      [noRawat, tanggal, waktu, kdDiet],
    );

    return { success: true, message: "Data diet pasien berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting diet pasien:", error);
    return { success: false, message: "Gagal menghapus data diet pasien", error: error.message };
  }
}

/**
 * Mengambil riwayat kunjungan pasien (Tab 0).
 * Meniru tampilKunjungan() dari RMRiwayatPerawatanRanap.java.
 * Filter mode: "5terakhir", "semua", "tanggal", "norawat"
 */
export async function getRiwayatKunjungan(
  noRM: string,
  mode: string = "5terakhir",
  tglAwal: string = "",
  tglAkhir: string = "",
  noRawat: string = "",
) {
  try {
    const params: any[] = [noRM];
    let filterClause = "";

    if (mode === "5terakhir") {
      filterClause = "ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC LIMIT 5";
    } else if (mode === "semua") {
      filterClause = "ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC";
    } else if (mode === "tanggal") {
      filterClause = "AND reg_periksa.tgl_registrasi BETWEEN ? AND ? ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC";
      params.push(tglAwal, tglAkhir);
    } else if (mode === "norawat") {
      filterClause = "AND reg_periksa.no_rawat = ? ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC";
      params.push(noRawat);
    }

    const query = `
      SELECT reg_periksa.no_rawat, reg_periksa.tgl_registrasi, reg_periksa.jam_reg,
             reg_periksa.kd_dokter, reg_periksa.status_lanjut,
             dokter.nm_dokter, reg_periksa.umurdaftar, reg_periksa.sttsumur,
             poliklinik.kd_poli, poliklinik.nm_poli, penjab.png_jawab
      FROM reg_periksa
      INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
      INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
      INNER JOIN penjab ON reg_periksa.kd_pj = penjab.kd_pj
      WHERE reg_periksa.stts <> 'Batal' AND reg_periksa.no_rkm_medis = ?
      ${filterClause}
    `;

    const [rows]: any = await db.execute(query, params);

    // Flatten into rows like Java tampilKunjungan()
    const enriched: any[] = [];
    for (const row of rows) {
      const noR = row.no_rawat;
      const umurStr = `${row.umurdaftar} ${row.sttsumur}`;
      const tglRegStr = row.tgl_registrasi instanceof Date ? row.tgl_registrasi.toISOString().split('T')[0] : row.tgl_registrasi;

      // Internal referral
      const [refRows]: any = await db.execute(`
        SELECT rujukan_internal_poli.kd_dokter, dokter.nm_dokter,
               rujukan_internal_poli.kd_poli, poliklinik.nm_poli
        FROM rujukan_internal_poli
        INNER JOIN dokter ON rujukan_internal_poli.kd_dokter = dokter.kd_dokter
        INNER JOIN poliklinik ON rujukan_internal_poli.kd_poli = poliklinik.kd_poli
        WHERE rujukan_internal_poli.no_rawat = ?
      `, [noR]);

      // DPJP : if status_lanjut = Ranap, cari dpjp_ranap
      let kddpjp = row.kd_dokter;
      let dpjpNama = row.nm_dokter;
      if (row.status_lanjut === 'Ranap') {
        const [dpjpRows]: any = await db.execute(`
          SELECT dpjp_ranap.kd_dokter, dokter.nm_dokter
          FROM dpjp_ranap
          INNER JOIN dokter ON dpjp_ranap.kd_dokter = dokter.kd_dokter
          WHERE dpjp_ranap.no_rawat = ?
        `, [noR]);
        if (dpjpRows.length > 0) {
          kddpjp = dpjpRows[0].kd_dokter;
          dpjpNama = dpjpRows[0].nm_dokter;
        }
      }

      // Kamar inap
      const [kamarRows]: any = await db.execute(`
        SELECT kamar_inap.tgl_masuk, kamar_inap.jam_masuk, kamar_inap.kd_kamar, bangsal.nm_bangsal
        FROM kamar_inap
        INNER JOIN kamar ON kamar_inap.kd_kamar = kamar.kd_kamar
        INNER JOIN bangsal ON kamar.kd_bangsal = bangsal.kd_bangsal
        WHERE kamar_inap.no_rawat = ?
      `, [noR]);

      // Main row
      enriched.push({
        rowType: 'main',
        no_rawat: noR,
        tgl: tglRegStr,
        jam: row.jam_reg,
        kd_dokter: row.kd_dokter,
        nm_dokter: row.nm_dokter,
        umur: umurStr,
        poli_kamar: row.kd_poli + ' ' + row.nm_poli,
        png_jawab: row.png_jawab,
      });

      // Referral rows (like Java: adds extra rows with referral doctor/poli)
      for (const ref of refRows) {
        enriched.push({
          rowType: 'rujukan',
          no_rawat: noR,
          tgl: tglRegStr,
          jam: '',
          kd_dokter: ref.kd_dokter,
          nm_dokter: ref.nm_dokter,
          umur: umurStr,
          poli_kamar: ref.kd_poli + ' ' + ref.nm_poli,
          png_jawab: row.png_jawab,
        });
      }

      // Kamar inap rows (like Java: uses DPJP, kamar date/jam, kamar as poli)
      for (const kamar of kamarRows) {
        const tglMasukStr = kamar.tgl_masuk instanceof Date ? kamar.tgl_masuk.toISOString().split('T')[0] : kamar.tgl_masuk;
        enriched.push({
          rowType: 'kamar',
          no_rawat: noR,
          tgl: tglMasukStr,
          jam: kamar.jam_masuk,
          kd_dokter: kddpjp,
          nm_dokter: dpjpNama,
          umur: umurStr,
          poli_kamar: kamar.kd_kamar + ' ' + kamar.nm_bangsal,
          png_jawab: row.png_jawab,
        });
      }
    }

    return { success: true, data: enriched };
  } catch (error: any) {
    console.error("Error fetching riwayat kunjungan:", error);
    return { success: false, message: "Gagal mengambil riwayat kunjungan", error: error.message, data: [] };
  }
}

/**
 * Mengambil riwayat SOAPIE rawat inap (Tab 1).
 * Meniru tampilSoapi() dari RMRiwayatPerawatanRanap.java.
 * Filter mode: "5terakhir", "semua", "tanggal", "norawat"
 */
export async function getRiwayatSoapie(
  noRM: string,
  mode: string = "5terakhir",
  tglAwal: string = "",
  tglAkhir: string = "",
  noRawat: string = "",
) {
  try {
    const params: any[] = [noRM];
    let filterClause = "";

    if (mode === "5terakhir") {
      filterClause = "ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC LIMIT 5";
    } else if (mode === "semua") {
      filterClause = "ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC";
    } else if (mode === "tanggal") {
      filterClause = "AND reg_periksa.tgl_registrasi BETWEEN ? AND ? ORDER BY reg_periksa.tgl_registrasi DESC";
      params.push(tglAwal, tglAkhir);
    } else if (mode === "norawat") {
      filterClause = "AND reg_periksa.no_rawat = ?";
      params.push(noRawat);
    }

    const visitQuery = `
      SELECT reg_periksa.no_rawat, reg_periksa.tgl_registrasi, reg_periksa.status_lanjut
      FROM reg_periksa
      WHERE reg_periksa.stts <> 'Batal' AND reg_periksa.no_rkm_medis = ?
      ${filterClause}
    `;

    const [visitRows]: any = await db.execute(visitQuery, params);
    const result = [];

    for (const visit of visitRows) {
      const noR = visit.no_rawat;

      // Ranap SOAP data (with audit trail and verification)
      const [soapRows]: any = await db.execute(`
        SELECT pemeriksaan_ranap.tgl_perawatan, pemeriksaan_ranap.jam_rawat,
               pemeriksaan_ranap.suhu_tubuh, pemeriksaan_ranap.tensi,
               pemeriksaan_ranap.nadi, pemeriksaan_ranap.respirasi,
               pemeriksaan_ranap.tinggi, pemeriksaan_ranap.berat,
               pemeriksaan_ranap.spo2, pemeriksaan_ranap.gcs,
               pemeriksaan_ranap.kesadaran, pemeriksaan_ranap.keluhan,
               pemeriksaan_ranap.pemeriksaan, pemeriksaan_ranap.alergi,
               pemeriksaan_ranap.penilaian, pemeriksaan_ranap.rtl,
               pemeriksaan_ranap.instruksi, pemeriksaan_ranap.evaluasi,
               pemeriksaan_ranap.nip, pegawai.nama AS nm_pegawai, pegawai.jbtn,
               verifikasi_soap_ranap.verifikasi,
               DATE_FORMAT(verifikasi_soap_ranap.tgl_verifikasi, '%Y-%m-%d %H:%i') AS tgl_verifikasi
        FROM pemeriksaan_ranap
        INNER JOIN pegawai ON pemeriksaan_ranap.nip = pegawai.nik
        LEFT JOIN verifikasi_soap_ranap
          ON pemeriksaan_ranap.no_rawat = verifikasi_soap_ranap.no_rawat
          AND pemeriksaan_ranap.tgl_perawatan = verifikasi_soap_ranap.tgl_perawatan
          AND pemeriksaan_ranap.jam_rawat = verifikasi_soap_ranap.jam_rawat
        LEFT JOIN pemeriksaan_ranap_audit_trail
          ON pemeriksaan_ranap.no_rawat = pemeriksaan_ranap_audit_trail.no_rawat
          AND pemeriksaan_ranap.tgl_perawatan = pemeriksaan_ranap_audit_trail.tgl_perawatan
          AND pemeriksaan_ranap.jam_rawat = pemeriksaan_ranap_audit_trail.jam_rawat
        WHERE pemeriksaan_ranap.no_rawat = ?
          AND (pemeriksaan_ranap_audit_trail.status = 'aktif' OR pemeriksaan_ranap_audit_trail.status IS NULL)
        ORDER BY pemeriksaan_ranap.tgl_perawatan, pemeriksaan_ranap.jam_rawat
      `, [noR]);

      // Build SOAP entries
      const entries = soapRows.map((row: any) => ({
        status: "Ranap",
        tglJam: `${row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split('T')[0] : row.tgl_perawatan} ${row.jam_rawat}`,
        petugas: row.nip,
        profesi: `${row.nm_pegawai} - ${row.jbtn}`,
        subjektif: row.keluhan,
        objektif: `Tensi: ${row.tensi}, Nadi: ${row.nadi}, Respirasi: ${row.respirasi}, Suhu: ${row.suhu_tubuh}, SpO2: ${row.spo2}, GCS: ${row.gcs}, Kesadaran: ${row.kesadaran}, Tinggi: ${row.tinggi}, Berat: ${row.berat}`,
        pemeriksaan: row.pemeriksaan,
        alergi: row.alergi,
        asesmen: row.penilaian,
        plan: row.rtl,
        instruksi: row.instruksi,
        evaluasi: row.evaluasi,
        verifikasi: row.verifikasi,
        tgl_verifikasi: row.tgl_verifikasi,
      }));

      // DPJP info
      const [dpjpRows]: any = await db.execute(`
        SELECT dpjp_ranap.kd_dokter, dokter.nm_dokter
        FROM dpjp_ranap
        INNER JOIN dokter ON dpjp_ranap.kd_dokter = dokter.kd_dokter
        WHERE dpjp_ranap.no_rawat = ?
      `, [noR]);

      result.push({
        tglReg: visit.tgl_registrasi instanceof Date ? visit.tgl_registrasi.toISOString().split('T')[0] : visit.tgl_registrasi,
        no_rawat: noR,
        dpjp: dpjpRows.map((r: any) => ({ kd_dokter: r.kd_dokter, nm_dokter: r.nm_dokter })),
        entries,
      });
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error fetching riwayat SOAPIE:", error);
    return { success: false, message: "Gagal mengambil riwayat SOAPIE", error: error.message, data: [] };
  }
}

/**
 * Mengambil daftar kunjungan untuk tab Riwayat Perawatan.
 */
export async function getRiwayatPerawatanPasien(
  noRM: string,
  mode: string = "5terakhir",
  tglAwal: string = "",
  tglAkhir: string = "",
  noRawat: string = "",
) {
  try {
    const params: any[] = [noRM];
    let filterClause = "";

    if (mode === "5terakhir") {
      filterClause = "ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC LIMIT 5";
    } else if (mode === "semua") {
      filterClause = "ORDER BY reg_periksa.tgl_registrasi DESC, reg_periksa.jam_reg DESC";
    } else if (mode === "tanggal") {
      filterClause = "AND reg_periksa.tgl_registrasi BETWEEN ? AND ? ORDER BY reg_periksa.tgl_registrasi DESC";
      params.push(tglAwal, tglAkhir);
    } else if (mode === "norawat") {
      filterClause = "AND reg_periksa.no_rawat = ?";
      params.push(noRawat);
    }

    const query = `
      SELECT reg_periksa.no_reg, reg_periksa.no_rawat, reg_periksa.tgl_registrasi, reg_periksa.jam_reg,
             reg_periksa.kd_dokter, dokter.nm_dokter, poliklinik.nm_poli,
             reg_periksa.p_jawab, reg_periksa.almt_pj, reg_periksa.hubunganpj,
             reg_periksa.biaya_reg, reg_periksa.status_lanjut, penjab.png_jawab,
             reg_periksa.umurdaftar, reg_periksa.sttsumur
      FROM reg_periksa
      INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
      INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
      INNER JOIN penjab ON reg_periksa.kd_pj = penjab.kd_pj
      WHERE reg_periksa.stts <> 'Batal' AND reg_periksa.no_rkm_medis = ?
      ${filterClause}
    `;

    const [rows]: any = await db.execute(query, params);
    const result = [];

    for (const row of rows) {
      const noR = row.no_rawat;

      // DPJP
      const [dpjpRows]: any = await db.execute(`
        SELECT dokter.nm_dokter FROM dpjp_ranap
        INNER JOIN dokter ON dpjp_ranap.kd_dokter = dokter.kd_dokter
        WHERE dpjp_ranap.no_rawat = ?
      `, [noR]);

      // Internal referral
      const [refRows]: any = await db.execute(`
        SELECT poliklinik.nm_poli, dokter.nm_dokter
        FROM rujukan_internal_poli
        INNER JOIN poliklinik ON rujukan_internal_poli.kd_poli = poliklinik.kd_poli
        INNER JOIN dokter ON rujukan_internal_poli.kd_dokter = dokter.kd_dokter
        WHERE rujukan_internal_poli.no_rawat = ?
      `, [noR]);

      result.push({
        ...row,
        tgl_registrasi: row.tgl_registrasi instanceof Date ? row.tgl_registrasi.toISOString().split('T')[0] : row.tgl_registrasi,
        dpjp: dpjpRows.map((r: any) => r.nm_dokter).join(', '),
        referrals: refRows,
      });
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error fetching riwayat perawatan pasien:", error);
    return { success: false, message: "Gagal mengambil data pasien", error: error.message, data: [] };
  }
}

/**
 * Mengambil data diagnosa/ICD-10 pasien.
 */
export async function getDiagnosaPasien(noRawat: string) {
  try {
    const query = `
      SELECT diagnosa_pasien.kd_penyakit, penyakit.nm_penyakit,
             diagnosa_pasien.status, GROUP_CONCAT(dokter.nm_dokter SEPARATOR ', ') AS nm_dokter
      FROM diagnosa_pasien
      INNER JOIN penyakit ON diagnosa_pasien.kd_penyakit = penyakit.kd_penyakit
      LEFT JOIN dokter ON diagnosa_pasien.kd_dokter = dokter.kd_dokter
      WHERE diagnosa_pasien.no_rawat = ?
      GROUP BY diagnosa_pasien.kd_penyakit, diagnosa_pasien.status
      ORDER BY diagnosa_pasien.status
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil diagnosa", error: error.message, data: [] };
  }
}

/**
 * Mengambil data prosedur/ICD-9 pasien.
 */
export async function getProsedurPasien(noRawat: string) {
  try {
    const query = `
      SELECT prosedur_pasien.kd_icd9, icd9.nm_icd9_1
      FROM prosedur_pasien
      INNER JOIN icd9 ON prosedur_pasien.kd_icd9 = icd9.kd_icd9
      WHERE prosedur_pasien.no_rawat = ?
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil prosedur", error: error.message, data: [] };
  }
}

/**
 * Mengambil data triase IGD pasien.
 */
export async function getTriaseIGD(noRawat: string) {
  try {
    const query = `
      SELECT data_triase_igdprimer.kd_triase_igdprimer, data_triase_igdprimer.pemeriksaan,
             data_triase_igdprimer.hasil, master_triase_macam_kasus.macam_kasus,
             master_triase_pemeriksaan.nama_pemeriksaan, data_triase_igdprimer.nip,
             pegawai.nama AS nm_pegawai
      FROM data_triase_igdprimer
      LEFT JOIN master_triase_macam_kasus ON data_triase_igdprimer.kd_macam_kasus = master_triase_macam_kasus.kd_macam_kasus
      LEFT JOIN master_triase_pemeriksaan ON data_triase_igdprimer.kd_pemeriksaan = master_triase_pemeriksaan.kd_pemeriksaan
      LEFT JOIN pegawai ON data_triase_igdprimer.nip = pegawai.nik
      WHERE data_triase_igdprimer.no_rawat = ?
      ORDER BY data_triase_igdprimer.jam_masuk
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil triase IGD", error: error.message, data: [] };
  }
}

/**
 * Mengambil data pemeriksaan ranap (SOAP) untuk display.
 */
export async function getPemeriksaanRanapRiwayat(noRawat: string) {
  try {
    const query = `
      SELECT pemeriksaan_ranap.tgl_perawatan, pemeriksaan_ranap.jam_rawat,
             pemeriksaan_ranap.keluhan, pemeriksaan_ranap.pemeriksaan,
             pemeriksaan_ranap.alergi, pemeriksaan_ranap.penilaian,
             pemeriksaan_ranap.rtl, pemeriksaan_ranap.instruksi, 
pemeriksaan_ranap.evaluasi,
             pemeriksaan_ranap.nip, pegawai.nama AS nm_pegawai, pegawai.jbtn
      FROM pemeriksaan_ranap
      LEFT JOIN pegawai ON pemeriksaan_ranap.nip = pegawai.nik
      LEFT JOIN (
        SELECT no_rawat, tgl_perawatan, jam_rawat, status
        FROM pemeriksaan_ranap_audit_trail
        WHERE status = 'aktif'
        GROUP BY no_rawat, tgl_perawatan, jam_rawat
      ) audit ON pemeriksaan_ranap.no_rawat = audit.no_rawat
        AND pemeriksaan_ranap.tgl_perawatan = audit.tgl_perawatan
        AND pemeriksaan_ranap.jam_rawat = audit.jam_rawat
      WHERE pemeriksaan_ranap.no_rawat = ?
        AND (audit.status = 'aktif' OR NOT EXISTS (
          SELECT 1 FROM pemeriksaan_ranap_audit_trail at2
          WHERE at2.no_rawat = pemeriksaan_ranap.no_rawat
            AND at2.tgl_perawatan = pemeriksaan_ranap.tgl_perawatan
            AND at2.jam_rawat = pemeriksaan_ranap.jam_rawat
        ))
      ORDER BY pemeriksaan_ranap.tgl_perawatan DESC, pemeriksaan_ranap.jam_rawat DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);

    const formatted = rows.map((row: any) => ({
      ...row,
      tgl_perawatan: row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split('T')[0] : row.tgl_perawatan,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil pemeriksaan ranap", error: error.message, data: [] };
  }
}

/**
 * Mengambil data tindakan ranap dokter.
 */
export async function getTindakanRanapDokter(noRawat: string) {
  try {
    const query = `
      SELECT rawat_inap_dr.tgl_perawatan, rawat_inap_dr.jam_rawat,
             jns_perawatan_inap.nm_perawatan, rawat_inap_dr.biaya_rawat,
             dokter.nm_dokter
      FROM rawat_inap_dr
      INNER JOIN jns_perawatan_inap ON rawat_inap_dr.kd_jenis_prw = jns_perawatan_inap.kd_jenis_prw
      INNER JOIN dokter ON rawat_inap_dr.kd_dokter = dokter.kd_dokter
      WHERE rawat_inap_dr.no_rawat = ?
      ORDER BY rawat_inap_dr.tgl_perawatan DESC, rawat_inap_dr.jam_rawat DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);

    const formatted = rows.map((row: any) => ({
      ...row,
      tgl_perawatan: row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split('T')[0] : row.tgl_perawatan,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil tindakan dokter", error: error.message, data: [] };
  }
}

/**
 * Mengambil data tindakan ranap paramedis.
 */
export async function getTindakanRanapParamedis(noRawat: string) {
  try {
    const query = `
      SELECT rawat_inap_pr.tgl_perawatan, rawat_inap_pr.jam_rawat,
             jns_perawatan_inap.nm_perawatan, rawat_inap_pr.biaya_rawat,
             petugas.nm_petugas
      FROM rawat_inap_pr
      INNER JOIN jns_perawatan_inap ON rawat_inap_pr.kd_jenis_prw = jns_perawatan_inap.kd_jenis_prw
      INNER JOIN petugas ON rawat_inap_pr.kd_petugas = petugas.kd_petugas
      WHERE rawat_inap_pr.no_rawat = ?
      ORDER BY rawat_inap_pr.tgl_perawatan DESC, rawat_inap_pr.jam_rawat DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);

    const formatted = rows.map((row: any) => ({
      ...row,
      tgl_perawatan: row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split('T')[0] : row.tgl_perawatan,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil tindakan paramedis", error: error.message, data: [] };
  }
}

/**
 * Mengambil data penggunaan kamar inap.
 */
export async function getPenggunaanKamar(noRawat: string) {
  try {
    const query = `
      SELECT kamar_inap.tgl_masuk, kamar_inap.jam_masuk,
             kamar_inap.tgl_keluar, kamar_inap.jam_keluar,
             CONCAT(kamar.kd_kamar, ' - ', bangsal.nm_bangsal) AS kamar,
             kamar_inap.lama, kamar_inap.ttl_biaya
      FROM kamar_inap
      INNER JOIN kamar ON kamar_inap.kd_kamar = kamar.kd_kamar
      INNER JOIN bangsal ON kamar.kd_bangsal = bangsal.kd_bangsal
      WHERE kamar_inap.no_rawat = ?
      ORDER BY kamar_inap.tgl_masuk, kamar_inap.jam_masuk
    `;
    const [rows]: any = await db.execute(query, [noRawat]);

    const formatted = rows.map((row: any) => ({
      ...row,
      tgl_masuk: row.tgl_masuk instanceof Date ? row.tgl_masuk.toISOString().split('T')[0] : row.tgl_masuk,
      tgl_keluar: row.tgl_keluar instanceof Date ? row.tgl_keluar.toISOString().split('T')[0] : row.tgl_keluar,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil penggunaan kamar", error: error.message, data: [] };
  }
}

/**
 * Mengambil data resume pasien ranap.
 */
export async function getResumeRanap(noRawat: string) {
  try {
    const query = `
      SELECT resume_pasien_ranap.tgl_resume, resume_pasien_ranap.diagnosa_utama,
             resume_pasien_ranap.diagnosa_sekunder, resume_pasien_ranap.prosedur_utama,
             resume_pasien_ranap.prosedur_sekunder, resume_pasien_ranap.tgl_keluar,
             resume_pasien_ranap.jam_keluar, resume_pasien_ranap.status_keluar,
             dokter.nm_dokter
      FROM resume_pasien_ranap
      INNER JOIN dokter ON resume_pasien_ranap.kd_dokter = dokter.kd_dokter
      WHERE resume_pasien_ranap.no_rawat = ?
    `;
    const [rows]: any = await db.execute(query, [noRawat]);

    const formatted = rows.map((row: any) => ({
      ...row,
      tgl_resume: row.tgl_resume instanceof Date ? row.tgl_resume.toISOString().split('T')[0] : row.tgl_resume,
      tgl_keluar: row.tgl_keluar instanceof Date ? row.tgl_keluar.toISOString().split('T')[0] : row.tgl_keluar,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil resume ranap", error: error.message, data: [] };
  }
}

/**
 * Mengambil data operasi/VK pasien.
 */
export async function getOperasiPasien(noRawat: string) {
  try {
    const query = `
      SELECT operasi.tgl_operasi, operasi.jam_mulai, operasi.jam_selesai,
             paket_operasi.nm_perawatan, operasi.status_operasi,
             operasi.dokter_anak, operasi.dokter_utama,
             operasi.dokter_mata, operasi.dokter_bedah
      FROM operasi
      INNER JOIN paket_operasi ON operasi.kd_paket = paket_operasi.kd_paket
      WHERE operasi.no_rawat = ?
      ORDER BY operasi.tgl_operasi DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil data operasi", error: error.message, data: [] };
  }
}

/**
 * Mengambil data pemeriksaan radiologi pasien.
 */
export async function getRadiologiPasien(noRawat: string) {
  try {
    const query = `
      SELECT periksa_radiologi.tgl_periksa, periksa_radiologi.jam_periksa,
             jns_perawatan_radiologi.nm_perawatan, periksa_radiologi.biaya,
             dokter.nm_dokter, petugas.nm_petugas
      FROM periksa_radiologi
      INNER JOIN jns_perawatan_radiologi ON periksa_radiologi.kd_jenis_prw = jns_perawatan_radiologi.kd_jenis_prw
      LEFT JOIN dokter ON periksa_radiologi.kd_dokter = dokter.kd_dokter
      LEFT JOIN petugas ON periksa_radiologi.kd_petugas = petugas.kd_petugas
      WHERE periksa_radiologi.no_rawat = ?
      ORDER BY periksa_radiologi.tgl_periksa DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil data radiologi", error: error.message, data: [] };
  }
}

/**
 * Mengambil data pemeriksaan laboratorium pasien.
 */
export async function getLaboratPasien(noRawat: string) {
  try {
    const query = `
      SELECT periksa_lab.tgl_periksa, periksa_lab.jam_periksa,
             jns_perawatan_lab.nm_perawatan, periksa_lab.biaya,
             dokter.nm_dokter, petugas.nm_petugas
      FROM periksa_lab
      INNER JOIN jns_perawatan_lab ON periksa_lab.kd_jenis_prw = jns_perawatan_lab.kd_jenis_prw
      LEFT JOIN dokter ON periksa_lab.kd_dokter = dokter.kd_dokter
      LEFT JOIN petugas ON periksa_lab.kd_petugas = petugas.kd_petugas
      WHERE periksa_lab.no_rawat = ?
      ORDER BY periksa_lab.tgl_periksa DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil data laboratorium", error: error.message, data: [] };
  }
}

/**
 * Mengambil info lengkap pasien berdasarkan No.RM.
 * Meniru isPasien() dari RMRiwayatPerawatanRanap.java.
 */
export async function getPasienInfo(noRM: string) {
  try {
    const query = `
      SELECT pasien.no_rkm_medis, pasien.nm_pasien, pasien.jk,
             pasien.tmp_lahir, pasien.tgl_lahir, pasien.agama,
             bahasa_pasien.nama_bahasa, cacat_fisik.nama_cacat,
             pasien.gol_darah, pasien.nm_ibu, pasien.no_ktp,
             pasien.no_tlp, pasien.stts_nikah, pasien.pnd,
             CONCAT(pasien.alamat, ', ', kelurahan.nm_kel, ', ', kecamatan.nm_kec, ', ', kabupaten.nm_kab) AS alamat,
             pasien.pekerjaan
      FROM pasien
      INNER JOIN bahasa_pasien ON bahasa_pasien.id = pasien.bahasa_pasien
      INNER JOIN cacat_fisik ON cacat_fisik.id = pasien.cacat_fisik
      INNER JOIN kelurahan ON pasien.kd_kel = kelurahan.kd_kel
      INNER JOIN kecamatan ON pasien.kd_kec = kecamatan.kd_kec
      INNER JOIN kabupaten ON pasien.kd_kab = kabupaten.kd_kab
      WHERE pasien.no_rkm_medis = ?
    `;
    const [rows]: any = await db.execute(query, [noRM]);
    if (rows.length > 0) {
      const r = rows[0];
      return {
        success: true,
        data: {
          no_rkm_medis: r.no_rkm_medis,
          nm_pasien: r.nm_pasien,
          jk: r.jk,
          tmp_lahir: r.tmp_lahir,
          tgl_lahir: r.tgl_lahir instanceof Date ? r.tgl_lahir.toISOString().split('T')[0] : r.tgl_lahir,
          agama: r.agama,
          bahasa: r.nama_bahasa,
          cacat_fisik: r.nama_cacat,
          gol_darah: r.gol_darah,
          nm_ibu: r.nm_ibu,
          no_ktp: r.no_ktp,
          no_tlp: r.no_tlp,
          stts_nikah: r.stts_nikah,
          pendidikan: r.pnd,
          alamat: r.alamat,
          pekerjaan: r.pekerjaan,
        },
      };
    }
    return { success: false, message: "Pasien tidak ditemukan", data: null };
  } catch (error: any) {
    console.error("Error fetching pasien info:", error);
    return { success: false, message: "Gagal mengambil data pasien", error: error.message, data: null };
  }
}

/**
 * Mengambil data pemberian obat/BHP/Alkes pasien.
 */
export async function getPemberianObat(noRawat: string) {
  try {
    const query = `
      SELECT detail_pemberian_obat.tgl_perawatan, detail_pemberian_obat.jam,
             databarang.nama_brng, detail_pemberian_obat.jumlah,
             detail_pemberian_obat.harga_satuan, (detail_pemberian_obat.jumlah * detail_pemberian_obat.harga_satuan) AS subtotal
      FROM detail_pemberian_obat
      INNER JOIN databarang ON detail_pemberian_obat.kd_obat = databarang.kd_brng
      WHERE detail_pemberian_obat.no_rawat = ?
      ORDER BY detail_pemberian_obat.tgl_perawatan DESC, detail_pemberian_obat.jam DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);

    const formatted = rows.map((row: any) => ({
      ...row,
      tgl_perawatan: row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split('T')[0] : row.tgl_perawatan,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil data obat", error: error.message, data: [] };
  }
}

/**
 * Menyimpan data pemeriksaan/CPPT baru (Simpan).
 * INSERT ke pemeriksaan_ranap + INSERT ke pemeriksaan_ranap_audit_trail (status='aktif').
 * Meniru case 3 (Simpan) dari DlgRawatInap.java (lines 5465-5502).
 */
export async function simpanPemeriksaanRanap(data: {
  no_rawat: string; tgl_perawatan: string; jam_rawat: string;
  suhu_tubuh: string; tensi: string; nadi: string; respirasi: string;
  tinggi: string; berat: string; spo2: string; gcs: string; kesadaran: string;
  keluhan: string; pemeriksaan: string; alergi: string;
  penilaian: string; rtl: string; instruksi: string; evaluasi: string; nip: string;
}) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    const curTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    // INSERT ke pemeriksaan_ranap (20 kolom)
    const [insertResult]: any = await db.execute(`
      INSERT INTO pemeriksaan_ranap (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, gcs, kesadaran, keluhan, pemeriksaan, alergi, penilaian, rtl, instruksi, evaluasi, nip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.no_rawat, data.tgl_perawatan, data.jam_rawat,
      data.suhu_tubuh, data.tensi, data.nadi, data.respirasi,
      data.tinggi, data.berat, data.spo2, data.gcs, data.kesadaran,
      data.keluhan, data.pemeriksaan, data.alergi,
      data.penilaian, data.rtl, data.instruksi, data.evaluasi, data.nip,
    ]);

    // INSERT ke pemeriksaan_ranap_audit_trail (13 kolom)
    await db.execute(`
      INSERT INTO pemeriksaan_ranap_audit_trail (id_log, no_rawat, tgl_perawatan, jam_rawat, created_at, created_by, updated_at, updated_by, ket_edit, deleted_at, deleted_by, ket_hapus, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      null, data.no_rawat, data.tgl_perawatan, data.jam_rawat,
      curTime, session.id, null, null, null, null, null, null, "aktif",
    ]);

    logCppt('SIMPAN', session.id, data.no_rawat, 'BERHASIL', 'Data pemeriksaan berhasil disimpan');
    return { success: true, message: "Data pemeriksaan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving pemeriksaan ranap:", error);
    logCppt('SIMPAN', 'system', data?.no_rawat || '', 'GAGAL', 'Gagal menyimpan data pemeriksaan', error.message);
    return { success: false, message: "Gagal menyimpan data pemeriksaan", error: error.message };
  }
}

/**
 * Mengedit/mengganti data pemeriksaan/CPPT (Ganti).
 * 1. Mark data lama sbg 'direvisi' di audit_trail (insert jika blm ada, update jika sudah)
 * 2a. Jika PK berubah → INSERT baris baru ke pemeriksaan_ranap (data lama tetap sbg histori)
 * 2b. Jika PK sama → UPDATE baris yang ada (hindari duplicate PK)
 * 3. INSERT audit_trail baru dgn status='aktif'
 * Jika langkah 2 gagal → rollback status audit_trail lama ke 'aktif'.
 * Meniru case 3 (Ganti) dari DlgRawatInap.java (lines 6700-6776).
 */
export async function editPemeriksaanRanap(
  oldData: { no_rawat: string; tgl_perawatan: string; jam_rawat: string },
  newData: {
    no_rawat: string; tgl_perawatan: string; jam_rawat: string;
    suhu_tubuh: string; tensi: string; nadi: string; respirasi: string;
    tinggi: string; berat: string; spo2: string; gcs: string; kesadaran: string;
    keluhan: string; pemeriksaan: string; alergi: string;
    penilaian: string; rtl: string; instruksi: string; evaluasi: string; nip: string;
  },
  alasan: string,
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    // Ownership check — hanya author (NIP) atau Admin Utama yang boleh edit
    const [oldRows]: any = await db.execute(
      "SELECT nip FROM pemeriksaan_ranap WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=? LIMIT 1",
      [oldData.no_rawat, oldData.tgl_perawatan, oldData.jam_rawat],
    );
    if (oldRows.length === 0) {
      return { success: false, message: "Data lama tidak ditemukan" };
    }
    const isAdmin = session.role === 'admin';
    const isOwner = session.id === oldRows[0].nip;
    if (!isAdmin && !isOwner) {
      return { success: false, message: "Anda tidak berhak mengedit data pemeriksaan ini. Hanya pembuat data atau Admin Utama yang dapat mengedit." };
    }

    const pelaku = isAdmin ? "admin" : session.id;
    const curTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Cek apakah audit trail sudah ada untuk data lama
    const [cekRows]: any = await db.execute(
      "SELECT id_log FROM pemeriksaan_ranap_audit_trail WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=? LIMIT 1",
      [oldData.no_rawat, oldData.tgl_perawatan, oldData.jam_rawat],
    );

    if (cekRows.length === 0) {
      // Blm ada → INSERT data lama sbg 'direvisi'
      await db.execute(`
        INSERT INTO pemeriksaan_ranap_audit_trail (id_log, no_rawat, tgl_perawatan, jam_rawat, created_at, created_by, updated_at, updated_by, ket_edit, deleted_at, deleted_by, ket_hapus, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        null, oldData.no_rawat, oldData.tgl_perawatan, oldData.jam_rawat,
        curTime, pelaku, null, null, alasan, null, null, null, "direvisi",
      ]);
    } else {
      // Udah ada → UPDATE status ke 'direvisi'
      await db.execute(`
        UPDATE pemeriksaan_ranap_audit_trail SET updated_at=?, updated_by=?, ket_edit=?, status=?
        WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?
      `, [curTime, pelaku, alasan, "direvisi", oldData.no_rawat, oldData.tgl_perawatan, oldData.jam_rawat]);
    }

    // INSERT baris baru — data lama di pemeriksaan_ranap TIDAK diubah (sama persis Java)
    try {
      await db.execute(`
        INSERT INTO pemeriksaan_ranap (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, gcs, kesadaran, keluhan, pemeriksaan, alergi, penilaian, rtl, instruksi, evaluasi, nip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newData.no_rawat, newData.tgl_perawatan, newData.jam_rawat,
        newData.suhu_tubuh, newData.tensi, newData.nadi, newData.respirasi,
        newData.tinggi, newData.berat, newData.spo2, newData.gcs, newData.kesadaran,
        newData.keluhan, newData.pemeriksaan, newData.alergi,
        newData.penilaian, newData.rtl, newData.instruksi, newData.evaluasi, newData.nip,
      ]);
    } catch (insertErr: any) {
      // Rollback: restore audit trail lama ke 'aktif'
      await db.execute(
        "UPDATE pemeriksaan_ranap_audit_trail SET status=? WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?",
        ["aktif", oldData.no_rawat, oldData.tgl_perawatan, oldData.jam_rawat],
      );
      logCppt('EDIT', pelaku, newData.no_rawat, 'GAGAL', `Rollback: INSERT gagal (mungkin PK duplikat). Alasan: ${alasan}`, insertErr.message);
      return { success: false, message: `Gagal menyimpan data baru. ${insertErr.message}` };
    }

    // INSERT audit trail baru dengan status 'aktif'
    await db.execute(`
      INSERT INTO pemeriksaan_ranap_audit_trail (id_log, no_rawat, tgl_perawatan, jam_rawat, created_at, created_by, updated_at, updated_by, ket_edit, deleted_at, deleted_by, ket_hapus, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      null, newData.no_rawat, newData.tgl_perawatan, newData.jam_rawat,
      curTime, pelaku, null, null, null, null, null, null, "aktif",
    ]);

    logCppt('EDIT', pelaku, newData.no_rawat, 'BERHASIL', `Data lama ${oldData.tgl_perawatan} ${oldData.jam_rawat} → ${newData.tgl_perawatan} ${newData.jam_rawat}. Alasan: ${alasan}`);
    return { success: true, message: "Data pemeriksaan berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing pemeriksaan ranap:", error);
    logCppt('EDIT', 'system', newData?.no_rawat || oldData?.no_rawat || '', 'GAGAL', 'Gagal mengubah data pemeriksaan', error.message);
    return { success: false, message: "Gagal mengubah data pemeriksaan", error: error.message };
  }
}

/**
 * Menghapus data pemeriksaan/CPPT (Hapus) — soft delete.
 * UPDATE pemeriksaan_ranap_audit_trail SET deleted_at, deleted_by, ket_hapus, status='dibatalkan'.
 * Meniru case 3 (Hapus) dari DlgRawatInap.java (lines 5907-5941).
 */
/**
 * Mengambil data audit trail pemeriksaan/CPPT.
 * Meniru tampil() dari AtRawatInap.java.
 * Query langsung ke pemeriksaan_ranap_audit_trail (bukan pemeriksaan_ranap).
 */
export async function getPemeriksaanRanapAuditTrail(
  noRawat: string = "",
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
  page: number = 1,
  pageSize: number = 50,
) {
  try {
    const params: any[] = [];
    const countParams: any[] = [];

    if (tglAwal && tglAkhir) {
      params.push(tglAwal, tglAkhir);
      countParams.push(tglAwal, tglAkhir);
    }

    let whereClause = tglAwal && tglAkhir
      ? "WHERE pemeriksaan_ranap_audit_trail.tgl_perawatan BETWEEN ? AND ?"
      : "WHERE 1=1";

    if (noRawat.trim()) {
      whereClause += " AND pemeriksaan_ranap_audit_trail.no_rawat = ?";
      params.push(noRawat.trim());
      countParams.push(noRawat.trim());
    }

    if (keyword.trim()) {
      whereClause += `
        AND (
          pemeriksaan_ranap_audit_trail.no_rawat LIKE ? OR
          reg_periksa.no_rkm_medis LIKE ? OR
          pasien.nm_pasien LIKE ? OR
          pemeriksaan_ranap_audit_trail.status LIKE ? OR
          pemeriksaan_ranap_audit_trail.created_by LIKE ? OR
          pemeriksaan_ranap_audit_trail.updated_by LIKE ? OR
          pemeriksaan_ranap_audit_trail.deleted_by LIKE ?
        )
      `;
      const searchKey = `%${keyword.trim()}%`;
      for (let i = 0; i < 7; i++) {
        params.push(searchKey);
        countParams.push(searchKey);
      }
    }

    // Hitung total
    const [countRows]: any = await db.execute(`
      SELECT COUNT(*) AS total
      FROM pemeriksaan_ranap_audit_trail
      INNER JOIN reg_periksa ON pemeriksaan_ranap_audit_trail.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      ${whereClause}
    `, countParams);
    const total = Number(countRows[0]?.total) || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const offset = (currentPage - 1) * pageSize;

    const query = `
      SELECT 
        pemeriksaan_ranap_audit_trail.no_rawat,
        reg_periksa.no_rkm_medis,
        pasien.nm_pasien,
        pemeriksaan_ranap_audit_trail.tgl_perawatan,
        pemeriksaan_ranap_audit_trail.jam_rawat,
        pemeriksaan_ranap_audit_trail.created_at,
        pemeriksaan_ranap_audit_trail.created_by,
        pemeriksaan_ranap_audit_trail.updated_at,
        pemeriksaan_ranap_audit_trail.updated_by,
        pemeriksaan_ranap_audit_trail.ket_edit,
        pemeriksaan_ranap_audit_trail.deleted_at,
        pemeriksaan_ranap_audit_trail.deleted_by,
        pemeriksaan_ranap_audit_trail.ket_hapus,
        pemeriksaan_ranap_audit_trail.status
      FROM pemeriksaan_ranap_audit_trail
      INNER JOIN reg_periksa ON pemeriksaan_ranap_audit_trail.no_rawat = reg_periksa.no_rawat
      INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
      ${whereClause}
      ORDER BY pemeriksaan_ranap_audit_trail.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(pageSize, offset);

    const [rows]: any = await db.execute(query, params);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tgl_perawatan: row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split("T")[0] : row.tgl_perawatan,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString().slice(0, 19).replace("T", " ") : row.created_at,
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString().slice(0, 19).replace("T", " ") : row.updated_at,
      deleted_at: row.deleted_at instanceof Date ? row.deleted_at.toISOString().slice(0, 19).replace("T", " ") : row.deleted_at,
    }));

    return { success: true, data: formattedRows, total, page: currentPage, totalPages };
  } catch (error: any) {
    console.error("Error fetching audit trail:", error);
    return { success: false, message: "Gagal mengambil data audit trail", error: error.message, data: [] };
  }
}

/**
 * Mengambil detail pemeriksaan ranap berdasarkan no_rawat, tgl_perawatan, jam_rawat.
 * Meniru getData() dari AtRawatInap.java — menampilkan nilai klinis dari tabel pemeriksaan_ranap.
 */
export async function getDetailPemeriksaanRanap(noRawat: string, tglPerawatan: string, jamRawat: string) {
  try {
    const query = `
      SELECT suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, gcs, kesadaran,
             keluhan, pemeriksaan, alergi, penilaian, rtl, instruksi, evaluasi,
             pemeriksaan_ranap.nip, pegawai.nama AS nm_pegawai, pegawai.jbtn
      FROM pemeriksaan_ranap
      LEFT JOIN pegawai ON pemeriksaan_ranap.nip = pegawai.nik
      WHERE pemeriksaan_ranap.no_rawat = ? AND pemeriksaan_ranap.tgl_perawatan = ? AND pemeriksaan_ranap.jam_rawat = ?
    `;
    const [rows]: any = await db.execute(query, [noRawat, tglPerawatan, jamRawat]);
    if (rows.length > 0) {
      return { success: true, data: rows[0] };
    }
    return { success: false, message: "Data tidak ditemukan" };
  } catch (error: any) {
    console.error("Error fetching detail pemeriksaan:", error);
    return { success: false, message: "Gagal mengambil detail pemeriksaan", error: error.message };
  }
}

export async function hapusPemeriksaanRanap(
  noRawat: string,
  tglPerawatan: string,
  jamRawat: string,
  alasan: string,
  nipPelaku: string,
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    const curTime = new Date().toISOString().slice(0, 19).replace("T", " ");
    const pelaku = session.id;

    // Soft delete: UPDATE audit trail
    await db.execute(`
      UPDATE pemeriksaan_ranap_audit_trail
      SET deleted_at=?, deleted_by=?, ket_hapus=?, status=?
      WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?
    `, [curTime, pelaku, alasan, "dibatalkan", noRawat, tglPerawatan, jamRawat]);

    // Cleanup verifikasi_soap_ranap (meniru DlgRawatInap.java baris 5928-5930)
    await db.execute(`
      DELETE FROM verifikasi_soap_ranap
      WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?
    `, [noRawat, tglPerawatan, jamRawat]);

    logCppt('HAPUS', pelaku, noRawat, 'BERHASIL', `Data ${tglPerawatan} ${jamRawat} dihapus. Alasan: ${alasan}`);
    return { success: true, message: "Data pemeriksaan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting pemeriksaan ranap:", error);
    logCppt('HAPUS', 'system', noRawat, 'GAGAL', 'Gagal menghapus data pemeriksaan', error.message);
    return { success: false, message: "Gagal menghapus data pemeriksaan", error: error.message };
  }
}

/**
 * Mengambil 5 SOAP terakhir pasien berdasarkan NIP petugas.
 * Meniru RMCari5SOAPTerakhir.java -> tampil().
 */
export async function get5SoapTerakhir(noRM: string, nip: string) {
  try {
    const query = `
      SELECT pemeriksaan_ranap.tgl_perawatan, pemeriksaan_ranap.jam_rawat,
             pemeriksaan_ranap.keluhan, pemeriksaan_ranap.pemeriksaan,
             pemeriksaan_ranap.penilaian, pemeriksaan_ranap.rtl,
             pemeriksaan_ranap.instruksi, pemeriksaan_ranap.evaluasi
      FROM pemeriksaan_ranap
      INNER JOIN reg_periksa ON pemeriksaan_ranap.no_rawat = reg_periksa.no_rawat
      WHERE reg_periksa.no_rkm_medis = ? AND pemeriksaan_ranap.nip = ?
      ORDER BY pemeriksaan_ranap.tgl_perawatan DESC, pemeriksaan_ranap.jam_rawat DESC
      LIMIT 5
    `;
    const [rows]: any = await db.execute(query, [noRM, nip]);
    const formatted = rows.map((row: any) => ({
      ...row,
      tgl_perawatan: row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split("T")[0] : row.tgl_perawatan,
    }));
    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("Error fetching 5 SOAP terakhir:", error);
    return { success: false, message: "Gagal mengambil 5 SOAP terakhir", error: error.message, data: [] };
  }
}

/**
 * Mengecek apakah resume pasien rawat inap sudah diisi.
 * Meniru isResumeFilled() dari DlgRawatInap.java (line 10707).
 */
export async function cekResumePasien(noRawat: string) {
  try {
    const [rows]: any = await db.execute(
      "SELECT COUNT(*) AS jumlah FROM resume_pasien_ranap WHERE no_rawat = ?",
      [noRawat],
    );
    const isFilled = Number(rows[0]?.jumlah) > 0;
    return { success: true, isFilled };
  } catch (error: any) {
    console.error("Error cek resume pasien:", error);
    return { success: false, isFilled: false, message: "Gagal cek resume", error: error.message };
  }
}

/**
 * Cek verifikasi SOAP sebelumnya — hanya untuk DPJP.
 * Jika ada SOAP pada hari terakhir (sebelum hari ini) yang belum diverifikasi,
 * maka pembuatan SOAP baru diblokir.
 * Meniru cekVerifSOAPSebelumnya() dari DlgRawatInap.java (line 11054-11201).
 */
export async function cekVerifSOAPSebelumnya(noRawat: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, allowed: true, message: "Sesi tidak ditemukan" };
    }

    // 1. Cek apakah user adalah DPJP
    const [dpjpRows]: any = await db.execute(
      "SELECT COUNT(1) AS cnt FROM dpjp_ranap WHERE no_rawat=? AND kd_dokter=?",
      [noRawat, session.id],
    );
    const isDPJP = Number(dpjpRows[0]?.cnt) > 0;

    if (!isDPJP) {
      return { success: true, allowed: true, message: "User bukan DPJP, tidak perlu verifikasi sebelumnya" };
    }

    // 2. Cari tanggal perawatan terakhir yang bukan hari ini (UNION ranap + ralan)
    const [tglRows]: any = await db.execute(`
      SELECT MAX(tgl_perawatan) AS tgl_terakhir
      FROM (
        SELECT tgl_perawatan FROM pemeriksaan_ranap WHERE no_rawat = ? AND tgl_perawatan < CURDATE()
        UNION
        SELECT tgl_perawatan FROM pemeriksaan_ralan WHERE no_rawat = ? AND tgl_perawatan < CURDATE()
      ) AS semua_periksa
    `, [noRawat, noRawat]);

    if (tglRows.length === 0 || !tglRows[0].tgl_terakhir) {
      return { success: true, allowed: true, message: "Tidak ada pemeriksaan sebelumnya" };
    }

    const tglTerakhir = tglRows[0].tgl_terakhir instanceof Date
      ? tglRows[0].tgl_terakhir.toISOString().split("T")[0]
      : tglRows[0].tgl_terakhir;

    // 3. Hitung jumlah pemeriksaan pada tanggal terakhir (ranap + ralan, hanya status='aktif')
    const [jmlRanap]: any = await db.execute(`
      SELECT COUNT(1) AS jumlah
      FROM pemeriksaan_ranap
      LEFT JOIN pemeriksaan_ranap_audit_trail
        ON pemeriksaan_ranap.no_rawat = pemeriksaan_ranap_audit_trail.no_rawat
        AND pemeriksaan_ranap.tgl_perawatan = pemeriksaan_ranap_audit_trail.tgl_perawatan
        AND pemeriksaan_ranap.jam_rawat = pemeriksaan_ranap_audit_trail.jam_rawat
      WHERE pemeriksaan_ranap.no_rawat = ?
        AND pemeriksaan_ranap.tgl_perawatan = ?
        AND (pemeriksaan_ranap_audit_trail.status = 'aktif' OR pemeriksaan_ranap_audit_trail.status IS NULL)
    `, [noRawat, tglTerakhir]);
    const jumlahRanap = Number(jmlRanap[0]?.jumlah) || 0;

    const [jmlRalan]: any = await db.execute(`
      SELECT COUNT(1) AS jumlah
      FROM pemeriksaan_ralan
      LEFT JOIN pemeriksaan_ralan_audit_trail
        ON pemeriksaan_ralan.no_rawat = pemeriksaan_ralan_audit_trail.no_rawat
        AND pemeriksaan_ralan.tgl_perawatan = pemeriksaan_ralan_audit_trail.tgl_perawatan
        AND pemeriksaan_ralan.jam_rawat = pemeriksaan_ralan_audit_trail.jam_rawat
      WHERE pemeriksaan_ralan.no_rawat = ?
        AND pemeriksaan_ralan.tgl_perawatan = ?
        AND (pemeriksaan_ralan_audit_trail.status = 'aktif' OR pemeriksaan_ralan_audit_trail.status IS NULL)
    `, [noRawat, tglTerakhir]);
    const jumlahRalan = Number(jmlRalan[0]?.jumlah) || 0;

    const jumlahPeriksa = jumlahRanap + jumlahRalan;

    // 4. Hitung jumlah verifikasi pada tanggal tersebut (ranap + ralan)
    const [verifRanap]: any = await db.execute(
      "SELECT COUNT(1) AS jumlah FROM verifikasi_soap_ranap WHERE no_rawat=? AND tgl_perawatan=?",
      [noRawat, tglTerakhir],
    );
    const jumlahVerifRanap = Number(verifRanap[0]?.jumlah) || 0;

    const [verifRalan]: any = await db.execute(
      "SELECT COUNT(1) AS jumlah FROM verifikasi_soap_ralan WHERE no_rawat=? AND tgl_perawatan=?",
      [noRawat, tglTerakhir],
    );
    const jumlahVerifRalan = Number(verifRalan[0]?.jumlah) || 0;

    const jumlahVerif = jumlahVerifRanap + jumlahVerifRalan;

    if (jumlahVerif >= jumlahPeriksa) {
      return { success: true, allowed: true, message: `Semua SOAP tanggal ${tglTerakhir} sudah diverifikasi (${jumlahVerif}/${jumlahPeriksa})` };
    }

    return {
      success: true,
      allowed: false,
      message: `SOAP tanggal ${tglTerakhir} belum diverifikasi (${jumlahVerif}/${jumlahPeriksa})`,
      tglTerakhir,
      jumlahPeriksa,
      jumlahVerif,
    };
  } catch (error: any) {
    console.error("Error cek verif sebelumnya:", error);
    return { success: false, allowed: true, message: "Gagal cek verifikasi sebelumnya", error: error.message };
  }
}

// ──────────────────────────────────────────────
// VERIFIKASI DPJP (Dokter Penanggung Jawab Pelayanan)
// ──────────────────────────────────────────────

/**
 * Cek apakah user login terdaftar sebagai DPJP untuk pasien ini.
 */
export async function cekApakahDPJP(noRawat: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, isDPJP: false, message: "Sesi tidak ditemukan" };
    }
    const [rows]: any = await db.execute(
      "SELECT COUNT(1) AS cnt FROM dpjp_ranap WHERE no_rawat=? AND kd_dokter=?",
      [noRawat, session.id],
    );
    const isDPJP = Number(rows[0]?.cnt) > 0;
    return { success: true, isDPJP, message: isDPJP ? "User adalah DPJP" : "User bukan DPJP" };
  } catch (error: any) {
    console.error("Error cek DPJP:", error);
    return { success: false, isDPJP: false, message: "Gagal cek DPJP", error: error.message };
  }
}

/**
 * Mendapatkan daftar DPJP untuk suatu no_rawat.
 */
export async function getDaftarDPJP(noRawat: string) {
  try {
    const [rows]: any = await db.execute(`
      SELECT dpjp_ranap.kd_dokter, dokter.nm_dokter
      FROM dpjp_ranap
      INNER JOIN dokter ON dpjp_ranap.kd_dokter = dokter.kd_dokter
      WHERE dpjp_ranap.no_rawat = ?
    `, [noRawat]);
    return { success: true, data: rows.map((r: any) => ({ kd_dokter: r.kd_dokter, nm_dokter: r.nm_dokter })) };
  } catch (error: any) {
    console.error("Error get daftar DPJP:", error);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Verifikasi satu SOAP Ranap.
 * Hanya DPJP atau Admin Utama yang bisa verifikasi.
 */
export async function verifikasiSoapRanap(
  noRawat: string,
  tglPerawatan: string,
  jamRawat: string,
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    // Cek apakah user adalah DPJP
    const [dpjpRows]: any = await db.execute(
      "SELECT COUNT(1) AS cnt FROM dpjp_ranap WHERE no_rawat=? AND kd_dokter=?",
      [noRawat, session.id],
    );
    const isAdmin = session.role === 'admin';
    const isDPJP = Number(dpjpRows[0]?.cnt) > 0;

    if (!isDPJP && !isAdmin) {
      return { success: false, message: "Hanya DPJP atau Admin Utama yang dapat memverifikasi SOAP" };
    }

    // Cek audit trail — hanya data 'aktif' yang bisa diverifikasi
    const [auditRows]: any = await db.execute(`
      SELECT status FROM pemeriksaan_ranap_audit_trail
      WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?
    `, [noRawat, tglPerawatan, jamRawat]);

    if (auditRows.length > 0 && auditRows[0].status !== 'aktif') {
      return { success: false, message: "Data sudah direvisi atau dibatalkan, tidak bisa diverifikasi!" };
    }

    const curTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    await db.execute(`
      INSERT INTO verifikasi_soap_ranap (verifikasi, no_rawat, tgl_perawatan, jam_rawat, tgl_verifikasi)
      VALUES (?, ?, ?, ?, ?)
    `, [session.id, noRawat, tglPerawatan, jamRawat, curTime]);

    return { success: true, message: "Verifikasi berhasil" };
  } catch (error: any) {
    console.error("Error verifikasi SOAP ranap:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, message: "Data sudah diverifikasi sebelumnya" };
    }
    return { success: false, message: "Gagal melakukan verifikasi", error: error.message };
  }
}

/**
 * Hapus verifikasi satu SOAP Ranap.
 * Hanya pembuat verifikasi atau Admin Utama yang bisa hapus.
 */
export async function hapusVerifikasiSoapRanap(
  noRawat: string,
  tglPerawatan: string,
  jamRawat: string,
) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    // Cek siapa yang memverifikasi
    const [verifRows]: any = await db.execute(
      "SELECT verifikasi FROM verifikasi_soap_ranap WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?",
      [noRawat, tglPerawatan, jamRawat],
    );

    if (verifRows.length === 0) {
      return { success: false, message: "Data verifikasi tidak ditemukan" };
    }

    const isAdmin = session.role === 'admin';
    const isOwner = session.id === verifRows[0].verifikasi;

    if (!isAdmin && !isOwner) {
      return { success: false, message: "Tidak bisa menghapus verifikasi. Hanya pembuat verifikasi atau Admin Utama yang dapat menghapus." };
    }

    await db.execute(
      "DELETE FROM verifikasi_soap_ranap WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?",
      [noRawat, tglPerawatan, jamRawat],
    );

    return { success: true, message: "Verifikasi berhasil dihapus" };
  } catch (error: any) {
    console.error("Error hapus verifikasi SOAP ranap:", error);
    return { success: false, message: "Gagal menghapus verifikasi", error: error.message };
  }
}

/**
 * Verifikasi semua SOAP yang belum diverifikasi pada suatu tanggal.
 */
export async function bulkVerifikasiSoapRanap(noRawat: string, tglPerawatan: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    const isAdmin = session.role === 'admin';
    const [dpjpRows]: any = await db.execute(
      "SELECT COUNT(1) AS cnt FROM dpjp_ranap WHERE no_rawat=? AND kd_dokter=?",
      [noRawat, session.id],
    );
    if (!isAdmin && Number(dpjpRows[0]?.cnt) === 0) {
      return { success: false, message: "Hanya DPJP atau Admin Utama yang dapat memverifikasi SOAP" };
    }

    const curTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Ambil semua SOAP pada tanggal tsb yang belum diverifikasi
    const [soapRows]: any = await db.execute(`
      SELECT pemeriksaan_ranap.jam_rawat
      FROM pemeriksaan_ranap
      LEFT JOIN verifikasi_soap_ranap
        ON pemeriksaan_ranap.no_rawat = verifikasi_soap_ranap.no_rawat
        AND pemeriksaan_ranap.tgl_perawatan = verifikasi_soap_ranap.tgl_perawatan
        AND pemeriksaan_ranap.jam_rawat = verifikasi_soap_ranap.jam_rawat
      LEFT JOIN pemeriksaan_ranap_audit_trail
        ON pemeriksaan_ranap.no_rawat = pemeriksaan_ranap_audit_trail.no_rawat
        AND pemeriksaan_ranap.tgl_perawatan = pemeriksaan_ranap_audit_trail.tgl_perawatan
        AND pemeriksaan_ranap.jam_rawat = pemeriksaan_ranap_audit_trail.jam_rawat
      WHERE pemeriksaan_ranap.no_rawat = ?
        AND pemeriksaan_ranap.tgl_perawatan = ?
        AND verifikasi_soap_ranap.verifikasi IS NULL
        AND (pemeriksaan_ranap_audit_trail.status = 'aktif' OR pemeriksaan_ranap_audit_trail.status IS NULL)
    `, [noRawat, tglPerawatan]);

    if (soapRows.length === 0) {
      return { success: true, message: "Semua SOAP sudah diverifikasi" };
    }

    let berhasil = 0;
    let gagal = 0;

    for (const row of soapRows) {
      try {
        await db.execute(`
          INSERT INTO verifikasi_soap_ranap (verifikasi, no_rawat, tgl_perawatan, jam_rawat, tgl_verifikasi)
          VALUES (?, ?, ?, ?, ?)
        `, [session.id, noRawat, tglPerawatan, row.jam_rawat, curTime]);
        berhasil++;
      } catch {
        gagal++;
      }
    }

    return {
      success: true,
      message: `Verifikasi massal selesai: ${berhasil} berhasil, ${gagal} gagal`,
      berhasil,
      gagal,
    };
  } catch (error: any) {
    console.error("Error bulk verifikasi SOAP ranap:", error);
    return { success: false, message: "Gagal melakukan verifikasi massal", error: error.message };
  }
}

/**
 * Hapus semua verifikasi pada suatu tanggal.
 */
export async function hapusBulkVerifikasiSoapRanap(noRawat: string, tglPerawatan: string) {
  try {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, message: "Sesi tidak ditemukan" };
    }

    const isAdmin = session.role === 'admin';
    const [dpjpRows]: any = await db.execute(
      "SELECT COUNT(1) AS cnt FROM dpjp_ranap WHERE no_rawat=? AND kd_dokter=?",
      [noRawat, session.id],
    );
    if (!isAdmin && Number(dpjpRows[0]?.cnt) === 0) {
      return { success: false, message: "Hanya DPJP atau Admin Utama yang dapat menghapus verifikasi" };
    }

    const [result]: any = await db.execute(
      "DELETE FROM verifikasi_soap_ranap WHERE no_rawat=? AND tgl_perawatan=?",
      [noRawat, tglPerawatan],
    );

    const terhapus = result.affectedRows || 0;
    return { success: true, message: `${terhapus} verifikasi berhasil dihapus`, terhapus };
  } catch (error: any) {
    console.error("Error bulk hapus verifikasi SOAP ranap:", error);
    return { success: false, message: "Gagal menghapus verifikasi massal", error: error.message };
  }
}

/**
 * Mencari pegawai berdasarkan keyword (NIP, Nama, Jabatan, Departemen, Bidang).
 * Meniru Java: DlgCariPegawai.tampil() + tampil2()
 */
export async function cariPegawai(keyword: string = "") {
  try {
    let query = `
      SELECT nik, nama, jk, jbtn, jnj_jabatan, departemen, bidang, stts_aktif
      FROM pegawai
      WHERE stts_aktif <> 'KELUAR'
    `;
    const params: any[] = [];

    if (keyword.trim()) {
      query += ` AND (nik LIKE ? OR nama LIKE ? OR jbtn LIKE ? OR departemen LIKE ? OR bidang LIKE ?)`;
      const kw = `%${keyword.trim()}%`;
      params.push(kw, kw, kw, kw, kw);
    }

    query += ` ORDER BY id ASC LIMIT 500`;

    const [rows]: any = await db.execute(query, params);

    return {
      success: true,
      data: rows.map((row: any) => ({
        nik: row.nik,
        nama: row.nama,
        jk: row.jk,
        jabatan: row.jbtn,
        kode_jenjang: row.jnj_jabatan,
        departemen: row.departemen,
        bidang: row.bidang,
        stts_aktif: row.stts_aktif,
      })),
    };
  } catch (error: any) {
    console.error("Error cari pegawai:", error);
    return { success: false, message: "Gagal mencari pegawai", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data untuk satu seksi riwayat perawatan.
 */
export async function getSectionData(sectionId: string, noRawat: string) {
  const queries: Record<string, string> = {
    // Sudah ada di fungsi terpisah, tapi kita sediakan juga di sini
    diagnosa: `
      SELECT diagnosa_pasien.kd_penyakit, penyakit.nm_penyakit, diagnosa_pasien.status, dokter.nm_dokter
      FROM diagnosa_pasien
      INNER JOIN penyakit ON diagnosa_pasien.kd_penyakit = penyakit.kd_penyakit
      INNER JOIN dokter ON diagnosa_pasien.kd_dokter = dokter.kd_dokter
      WHERE diagnosa_pasien.no_rawat = ?`,
    prosedur: `
      SELECT prosedur_pasien.kd_icd9, icd9.nm_icd9_1
      FROM prosedur_pasien
      INNER JOIN icd9 ON prosedur_pasien.kd_icd9 = icd9.kd_icd9
      WHERE prosedur_pasien.no_rawat = ?`,
    triase: `
      SELECT dt.nama_pemeriksaan, dtd.hasil, pegawai.nama AS nm_pegawai
      FROM data_triase_igd_detail dtd
      INNER JOIN data_triase_igd dt ON dtd.no_rawat = dt.no_rawat AND dtd.kode_pemeriksaan = dt.kode_pemeriksaan
      LEFT JOIN pegawai ON dtd.nip = pegawai.nik
      WHERE dtd.no_rawat = ?`,
    catatan_dokter: `
      SELECT catatan_perawatan.tanggal, catatan_perawatan.jam, catatan_perawatan.kd_dokter, dokter.nm_dokter, catatan_perawatan.catatan
      FROM catatan_perawatan INNER JOIN dokter ON catatan_perawatan.kd_dokter = dokter.kd_dokter
      WHERE catatan_perawatan.no_rawat = ? ORDER BY catatan_perawatan.tanggal DESC, catatan_perawatan.jam DESC`,
    resep_pulang: `
      SELECT resep_pulang.kode_brng, databarang.nama_brng, resep_pulang.dosis, resep_pulang.jml_barang, databarang.kode_sat, resep_pulang.total
      FROM resep_pulang INNER JOIN databarang ON resep_pulang.kode_brng = databarang.kode_brng
      WHERE resep_pulang.no_rawat = ? ORDER BY databarang.nama_brng`,
    gas_medik: `
      SELECT beri_gas_medik.tanggal, gasmedis.nm_obat, beri_gas_medik.hargasatuan, beri_gas_medik.jumlah, beri_gas_medik.kd_petugas
      FROM beri_gas_medik INNER JOIN gasmedis ON beri_gas_medik.kd_obat = gasmedis.kd_obat
      WHERE beri_gas_medik.no_rawat = ? ORDER BY beri_gas_medik.tanggal`,
    tambahan_biaya: `
      SELECT nama_biaya, besar_biaya FROM tambahan_biaya WHERE no_rawat = ? ORDER BY nama_biaya`,
    potongan_biaya: `
      SELECT nama_pengurangan, (-1 * besar_pengurangan) AS besar_pengurangan FROM pengurangan_biaya WHERE no_rawat = ? ORDER BY nama_pengurangan`,
    pemeriksaan_ralan: `
      SELECT pemeriksaan_ralan.tgl_perawatan, pemeriksaan_ralan.jam_rawat, pemeriksaan_ralan.keluhan, pemeriksaan_ralan.pemeriksaan, pemeriksaan_ralan.penilaian, pemeriksaan_ralan.rtl, pemeriksaan_ralan.instruksi, pemeriksaan_ralan.tensi, pemeriksaan_ralan.nadi, pemeriksaan_ralan.respirasi, pemeriksaan_ralan.suhu_tubuh, pegawai.nama AS nm_pegawai
      FROM pemeriksaan_ralan LEFT JOIN pegawai ON pemeriksaan_ralan.nip = pegawai.nik
      WHERE pemeriksaan_ralan.no_rawat = ? ORDER BY pemeriksaan_ralan.tgl_perawatan DESC, pemeriksaan_ralan.jam_rawat DESC`,
    pemeriksaan_obstetri_ralan: `
      SELECT * FROM pemeriksaan_obstetri_ralan WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    pemeriksaan_genekologi_ralan: `
      SELECT * FROM pemeriksaan_ginekologi_ralan WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    pemeriksaan_obstetri_ranap: `
      SELECT * FROM pemeriksaan_obstetri_ranap WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    pemeriksaan_genekologi_ranap: `
      SELECT * FROM pemeriksaan_ginekologi_ranap WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    catatan_observasi_igd: `
      SELECT * FROM catatan_observasi_igd WHERE no_rawat = ? ORDER BY tgl_observasi DESC`,
    catatan_observasi_ranap: `
      SELECT * FROM catatan_observasi_ranap WHERE no_rawat = ? ORDER BY tgl_observasi DESC`,
    catatan_observasi_ranap_kebidanan: `
      SELECT * FROM catatan_observasi_ranap_kebidanan WHERE no_rawat = ? ORDER BY tgl_observasi DESC`,
    catatan_observasi_ranap_postpartum: `
      SELECT * FROM catatan_observasi_ranap_postpartum WHERE no_rawat = ? ORDER BY tgl_observasi DESC`,
    catatan_keperawatan_ralan: `
      SELECT * FROM catatan_keperawatan_ralan WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    catatan_keperawatan_ranap: `
      SELECT * FROM catatan_keperawatan_ranap WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    follow_up_dbd: `
      SELECT * FROM follow_up_dbd WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    catatan_cek_gds: `
      SELECT * FROM catatan_cek_gds WHERE no_rawat = ? ORDER BY tgl_perawatan DESC, jam_rawat DESC`,
    penilaian_ulang_nyeri: `
      SELECT * FROM penilaian_ulang_nyeri WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    monitoring_reaksi_tranfusi: `
      SELECT * FROM monitoring_reaksi_tranfusi WHERE no_rawat = ? ORDER BY tgl_perawatan DESC`,
    catatan_persalinan: `
      SELECT * FROM catatan_persalinan WHERE no_rawat = ?`,
    rekonsiliasi_obat: `
      SELECT rekonsiliasi_obat.*, petugas.nama FROM rekonsiliasi_obat LEFT JOIN petugas ON rekonsiliasi_obat.nip = petugas.nip WHERE rekonsiliasi_obat.no_rawat = ? ORDER BY rekonsiliasi_obat.tanggal_wawancara DESC`,
    konseling_farmasi: `
      SELECT konseling_farmasi.*, petugas.nama FROM konseling_farmasi LEFT JOIN petugas ON konseling_farmasi.nip = petugas.nip WHERE konseling_farmasi.no_rawat = ? ORDER BY konseling_farmasi.tanggal DESC`,
    pelayanan_informasi_obat: `
      SELECT pio.*, jawab.tanggal_jawab, jawab.metode AS metodejawab, jawab.penyampaian_jawaban, jawab.jawaban, jawab.referensi, jawab.nip AS apoteker_nip, petugas.nama AS apoteker_nama
      FROM pelayanan_informasi_obat pio
      INNER JOIN jawaban_pio_apoteker jawab ON jawab.no_permintaan = pio.no_permintaan
      LEFT JOIN petugas ON jawab.nip = petugas.nip
      WHERE pio.no_rawat = ? ORDER BY pio.tanggal DESC`,
    konsultasi_medik: `
      SELECT km.*, jawab.tanggal_jawab, jawab.jawaban AS jawaban_konsultasi, jawab.nip, petugas.nama AS nm_petugas
      FROM konsultasi_medik km
      LEFT JOIN jawaban_konsultasi_medik jawab ON jawab.no_permintaan = km.no_permintaan
      LEFT JOIN petugas ON jawab.nip = petugas.nip
      WHERE km.no_rawat = ? ORDER BY km.tanggal DESC`,
    transfer_antar_ruang: `
      SELECT * FROM transfer_pasien_antar_ruang WHERE no_rawat = ? ORDER BY tgl_masuk DESC`,
    pengkajian_restrain: `
      SELECT * FROM pengkajian_restrain WHERE no_rawat = ? ORDER BY tgl_pengkajian DESC`,
    skrining_tb: `
      SELECT * FROM skrining_tb WHERE no_rawat = ? ORDER BY tgl_skrining DESC`,
    edukasi_pasien: `
      SELECT * FROM edukasi_pasien_keluarga_rj WHERE no_rawat = ? ORDER BY tgl_edukasi DESC`,
    perencanaan_pemulangan: `
      SELECT * FROM perencanaan_pemulangan WHERE no_rawat = ? ORDER BY tgl_perencanaan DESC`,
    uji_fungsi_kfr: `
      SELECT uji_fungsi_kfr.*, petugas.nama AS nm_petugas
      FROM uji_fungsi_kfr LEFT JOIN petugas ON uji_fungsi_kfr.nip = petugas.nip
      WHERE uji_fungsi_kfr.no_rawat = ? ORDER BY uji_fungsi_kfr.tgl_uji DESC`,
    hemodialisa: `
      SELECT * FROM hemodialisa WHERE no_rawat = ? ORDER BY tgl_hemodialisa DESC`,
    hasil_usg: `
      SELECT * FROM hasil_pemeriksaan_usg WHERE no_rawat = ? ORDER BY tgl_pemeriksaan DESC`,
    hasil_usg_urologi: `
      SELECT * FROM hasil_pemeriksaan_usg_urologi WHERE no_rawat = ? ORDER BY tgl_pemeriksaan DESC`,
    hasil_usg_gynecologi: `
      SELECT * FROM hasil_pemeriksaan_usg_gynecologi WHERE no_rawat = ? ORDER BY tgl_pemeriksaan DESC`,
    dokumentasi_eswl: `
      SELECT * FROM hasil_tindakan_eswl WHERE no_rawat = ? ORDER BY tgl_tindakan DESC`,
    penilaian_terminal: `
      SELECT * FROM penilaian_pasien_terminal WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    penilaian_korban_kekerasan: `
      SELECT * FROM penilaian_korban_kekerasan WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    penilaian_kecemasan_anak: `
      SELECT * FROM penilaian_kecemasan_anak_ranap WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    penilaian_penyakit_menular: `
      SELECT * FROM penilaian_pasien_penyakit_menular WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    penilaian_keracunan: `
      SELECT * FROM penilaian_pasien_keracunan WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,

    // Checklist / skor
    pemantauan_ews_anak: `
      SELECT * FROM pemantauan_pews_anak WHERE no_rawat = ? ORDER BY tgl_pemantauan DESC`,
    pemantauan_ews_dewasa: `
      SELECT * FROM pemantauan_pews_dewasa WHERE no_rawat = ? ORDER BY tgl_pemantauan DESC`,
    pemantauan_meows_obstetri: `
      SELECT * FROM pemantauan_meows_obstetri WHERE no_rawat = ? ORDER BY tgl_pemantauan DESC`,
    pemantauan_ews_neonatus: `
      SELECT * FROM pemantauan_ews_neonatus WHERE no_rawat = ? ORDER BY tgl_pemantauan DESC`,
    pre_induksi: `
      SELECT * FROM penilaian_pre_induksi WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    checklist_pre_operasi: `
      SELECT * FROM checklist_pre_operasi WHERE no_rawat = ?`,
    checklist_post_operasi: `
      SELECT * FROM checklist_post_operasi WHERE no_rawat = ?`,
    signin_sebelum_anestesi: `
      SELECT * FROM signin_sebelum_anestesi WHERE no_rawat = ?`,
    timeout_sebelum_insisi: `
      SELECT * FROM timeout_sebelum_insisi WHERE no_rawat = ?`,
    signout_sebelum_menutup_luka: `
      SELECT * FROM signout_sebelum_menutup_luka WHERE no_rawat = ?`,
    penilaian_pre_operasi: `
      SELECT * FROM penilaian_pre_operasi WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    penilaian_pre_anestesi: `
      SELECT * FROM penilaian_pre_anestesi WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    skor_aldrette: `
      SELECT * FROM skor_aldrette_pasca_anestesi WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    skor_steward: `
      SELECT * FROM skor_steward_pasca_anestesi WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    skor_bromage: `
      SELECT * FROM skor_bromage_pasca_anestesi WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    kriteria_masuk_hcu: `
      SELECT * FROM checklist_kriteria_masuk_hcu WHERE no_rawat = ?`,
    kriteria_keluar_hcu: `
      SELECT * FROM checklist_kriteria_keluar_hcu WHERE no_rawat = ?`,
    kriteria_masuk_icu: `
      SELECT * FROM checklist_kriteria_masuk_icu WHERE no_rawat = ?`,
    kriteria_keluar_icu: `
      SELECT * FROM checklist_kriteria_keluar_icu WHERE no_rawat = ?`,

    // Resiko jatuh
    risiko_jatuh_dewasa: `
      SELECT * FROM penilaian_lanjutan_resiko_jatuh WHERE no_rawat = ? AND kategori = 'dewasa' ORDER BY tgl_pemeriksaan DESC`,
    risiko_jatuh_anak: `
      SELECT * FROM penilaian_lanjutan_resiko_jatuh WHERE no_rawat = ? AND kategori = 'anak' ORDER BY tgl_pemeriksaan DESC`,
    risiko_jatuh_lansia: `
      SELECT * FROM penilaian_lanjutan_resiko_jatuh WHERE no_rawat = ? AND kategori = 'lansia' ORDER BY tgl_pemeriksaan DESC`,
    risiko_jatuh_geriatri: `
      SELECT * FROM penilaian_lanjutan_resiko_jatuh_geriatri WHERE no_rawat = ? ORDER BY tgl_pemeriksaan DESC`,
    risiko_jatuh_neonatus: `
      SELECT * FROM penilaian_risiko_jatuh_neonatus WHERE no_rawat = ? ORDER BY tgl_pemeriksaan DESC`,
    risiko_jatuh_psikiatri: `
      SELECT * FROM penilaian_lanjutan_resiko_jatuh WHERE no_rawat = ? AND kategori = 'psikiatri' ORDER BY tgl_pemeriksaan DESC`,
    skrining_fungsional: `
      SELECT * FROM penilaian_lanjutan_skrining_fungsional WHERE no_rawat = ? ORDER BY tgl_pemeriksaan DESC`,
    risiko_dekubitus: `
      SELECT * FROM penilaian_risiko_dekubitus WHERE no_rawat = ? ORDER BY tgl_pemeriksaan DESC`,

    // Tambahan
    tambahan_geriatri: `
      SELECT * FROM penilaian_tambahan_geriatri WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    tambahan_bunuh_diri: `
      SELECT * FROM penilaian_tambahan_bunuh_diri WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    tambahan_perilaku_kekerasan: `
      SELECT * FROM penilaian_tambahan_perilaku_kekerasan WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,
    tambahan_melarikan_diri: `
      SELECT * FROM penilaian_tambahan_beresiko_melarikan_diri WHERE no_rawat = ? ORDER BY tgl_penilaian DESC`,

    // Awal keperawatan
    asuhan_keperawatan_igd: `SELECT * FROM penilaian_awal_keperawatan_igd WHERE no_rawat = ?`,
    asuhan_keperawatan_ralan: `SELECT * FROM penilaian_awal_keperawatan_ralan WHERE no_rawat = ?`,
    asuhan_keperawatan_ralan_gigi: `SELECT * FROM penilaian_awal_keperawatan_gigi_ralan WHERE no_rawat = ?`,
    asuhan_keperawatan_ralan_bayi: `SELECT * FROM penilaian_awal_keperawatan_bayi_ralan WHERE no_rawat = ?`,
    asuhan_keperawatan_ranap_bayi: `SELECT * FROM penilaian_awal_keperawatan_bayi_ranap WHERE no_rawat = ?`,
    asuhan_keperawatan_ralan_kandungan: `SELECT * FROM penilaian_awal_keperawatan_kebidanan_ralan WHERE no_rawat = ?`,
    asuhan_keperawatan_ralan_psikiatri: `SELECT * FROM penilaian_awal_keperawatan_psikiatri_ralan WHERE no_rawat = ?`,
    asuhan_keperawatan_ralan_geriatri: `SELECT * FROM penilaian_awal_keperawatan_geriatri_ralan WHERE no_rawat = ?`,
    asuhan_keperawatan_ranap: `SELECT * FROM penilaian_awal_keperawatan_ranap WHERE no_rawat = ?`,
    asuhan_keperawatan_ranap_kandungan: `SELECT * FROM penilaian_awal_keperawatan_kebidanan_ranap WHERE no_rawat = ?`,

    // Awal medis
    asuhan_medis_igd: `SELECT * FROM penilaian_awal_medis_igd WHERE no_rawat = ?`,
    asuhan_medis_igd_psikiatri: `SELECT * FROM penilaian_awal_medis_igd_psikiatri WHERE no_rawat = ?`,
    asuhan_medis_ralan: `SELECT * FROM penilaian_awal_medis_ralan WHERE no_rawat = ?`,
    asuhan_medis_ralan_kandungan: `SELECT * FROM penilaian_awal_medis_ralan_kandungan WHERE no_rawat = ?`,
    asuhan_medis_ralan_bayi: `SELECT * FROM penilaian_awal_medis_ralan_bayi WHERE no_rawat = ?`,
    asuhan_medis_ralan_tht: `SELECT * FROM penilaian_awal_medis_ralan_tht WHERE no_rawat = ?`,
    asuhan_medis_ralan_psikiatri: `SELECT * FROM penilaian_awal_medis_ralan_psikiatri WHERE no_rawat = ?`,
    asuhan_medis_ralan_penyakit_dalam: `SELECT * FROM penilaian_awal_medis_ralan_penyakit_dalam WHERE no_rawat = ?`,
    asuhan_medis_ralan_mata: `SELECT * FROM penilaian_awal_medis_ralan_mata WHERE no_rawat = ?`,
    asuhan_medis_ralan_neurologi: `SELECT * FROM penilaian_awal_medis_ralan_neurologi WHERE no_rawat = ?`,
    asuhan_medis_ralan_orthopedi: `SELECT * FROM penilaian_awal_medis_ralan_orthopedi WHERE no_rawat = ?`,
    asuhan_medis_ralan_bedah: `SELECT * FROM penilaian_awal_medis_ralan_bedah WHERE no_rawat = ?`,
    asuhan_medis_ralan_bedah_mulut: `SELECT * FROM penilaian_awal_medis_ralan_bedah_mulut WHERE no_rawat = ?`,
    asuhan_medis_ralan_geriatri: `SELECT * FROM penilaian_awal_medis_ralan_geriatri WHERE no_rawat = ?`,
    asuhan_medis_ralan_kulit_kelamin: `SELECT * FROM penilaian_awal_medis_ralan_kulit_kelamin WHERE no_rawat = ?`,
    asuhan_medis_ralan_paru: `SELECT * FROM penilaian_awal_medis_ralan_paru WHERE no_rawat = ?`,
    asuhan_medis_ralan_fisik_rehab: `SELECT * FROM penilaian_awal_medis_ralan_fisik_rehab WHERE no_rawat = ?`,
    asuhan_medis_ranap: `SELECT * FROM penilaian_awal_medis_ranap WHERE no_rawat = ?`,
    asuhan_medis_ranap_kandungan: `SELECT * FROM penilaian_awal_medis_ranap_kandungan WHERE no_rawat = ?`,
    asuhan_medis_ranap_paru: `SELECT * FROM penilaian_awal_medis_ranap_paru WHERE no_rawat = ?`,
    asuhan_medis_hemodialisa: `SELECT * FROM penilaian_awal_medis_hemodialisa WHERE no_rawat = ?`,

    // Rehab
    asuhan_fisioterapi: `SELECT * FROM penilaian_fisioterapi WHERE no_rawat = ?`,
    penilaian_terapi_wicara: `SELECT * FROM penilaian_terapi_wicara WHERE no_rawat = ?`,
    penilaian_psikolog: `SELECT * FROM penilaian_psikolog WHERE no_rawat = ?`,
  };

  const query = queries[sectionId];
  if (!query) return { success: false, message: `Seksi ${sectionId} tidak dikenal`, data: [] };

  try {
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: `Gagal mengambil ${sectionId}`, error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data operasi/VK lengkap dengan laporan operasi.
 */
export async function getOperasiLengkap(noRawat: string) {
  try {
    const query = `
      SELECT operasi.tgl_operasi, operasi.jam_mulai, operasi.jam_selesai,
             paket_operasi.nm_perawatan, operasi.status_operasi,
             operasi.dokter_anak, operasi.dokter_utama,
             operasi.dokter_mata, operasi.dokter_bedah,
             laporan_operasi.diagnosa_pre_op, laporan_operasi.diagnosa_post_op,
             laporan_operasi.jaringan_dieksekusi, laporan_operasi.permintaan_pa
      FROM operasi
      INNER JOIN paket_operasi ON operasi.kd_paket = paket_operasi.kd_paket
      LEFT JOIN laporan_operasi ON laporan_operasi.no_rawat = operasi.no_rawat AND laporan_operasi.tgl_operasi = operasi.tgl_operasi
      WHERE operasi.no_rawat = ?
      ORDER BY operasi.tgl_operasi DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil data operasi lengkap", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data berkas digital perawatan.
 */
export async function getBerkasDigital(noRawat: string) {
  try {
    const query = `
      SELECT berkas_digital_perawatan.*, master_berkas_digital.nama_berkas
      FROM berkas_digital_perawatan
      INNER JOIN master_berkas_digital ON berkas_digital_perawatan.kode_berkas = master_berkas_digital.kode_berkas
      WHERE berkas_digital_perawatan.no_rawat = ?
      ORDER BY berkas_digital_perawatan.tgl_perawatan DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil berkas digital", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data tindakan rawat jalan dokter.
 */
export async function getTindakanRalanDokter(noRawat: string) {
  try {
    const query = `
      SELECT rawat_jl_dr.tgl_perawatan, rawat_jl_dr.jam_rawat, rawat_jl_dr.kd_jenis_prw,
             jns_perawatan.nm_perawatan, dokter.nm_dokter, rawat_jl_dr.biaya_rawat
      FROM rawat_jl_dr
      INNER JOIN jns_perawatan ON rawat_jl_dr.kd_jenis_prw = jns_perawatan.kd_jenis_prw
      INNER JOIN dokter ON rawat_jl_dr.kd_dokter = dokter.kd_dokter
      WHERE rawat_jl_dr.no_rawat = ?
      ORDER BY rawat_jl_dr.tgl_perawatan DESC, rawat_jl_dr.jam_rawat DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil tindakan ralan dokter", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data tindakan rawat jalan paramedis.
 */
export async function getTindakanRalanParamedis(noRawat: string) {
  try {
    const query = `
      SELECT rawat_jl_pr.tgl_perawatan, rawat_jl_pr.jam_rawat, rawat_jl_pr.kd_jenis_prw,
             jns_perawatan.nm_perawatan, petugas.nama, rawat_jl_pr.biaya_rawat
      FROM rawat_jl_pr
      INNER JOIN jns_perawatan ON rawat_jl_pr.kd_jenis_prw = jns_perawatan.kd_jenis_prw
      INNER JOIN petugas ON rawat_jl_pr.nip = petugas.nip
      WHERE rawat_jl_pr.no_rawat = ?
      ORDER BY rawat_jl_pr.tgl_perawatan DESC, rawat_jl_pr.jam_rawat DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil tindakan ralan paramedis", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data tindakan rawat jalan dokter & paramedis.
 */
export async function getTindakanRalanDokterParamedis(noRawat: string) {
  try {
    const query = `
      SELECT rawat_jl_drpr.tgl_perawatan, rawat_jl_drpr.jam_rawat, rawat_jl_drpr.kd_jenis_prw,
             jns_perawatan.nm_perawatan, dokter.nm_dokter, petugas.nama, rawat_jl_drpr.biaya_rawat
      FROM rawat_jl_drpr
      INNER JOIN jns_perawatan ON rawat_jl_drpr.kd_jenis_prw = jns_perawatan.kd_jenis_prw
      INNER JOIN dokter ON rawat_jl_drpr.kd_dokter = dokter.kd_dokter
      INNER JOIN petugas ON rawat_jl_drpr.nip = petugas.nip
      WHERE rawat_jl_drpr.no_rawat = ?
      ORDER BY rawat_jl_drpr.tgl_perawatan DESC, rawat_jl_drpr.jam_rawat DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil tindakan ralan dokter paramedis", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data tindakan rawat inap dokter & paramedis.
 */
export async function getTindakanRanapDokterParamedis(noRawat: string) {
  try {
    const query = `
      SELECT rawat_inap_drpr.tgl_perawatan, rawat_inap_drpr.jam_rawat, rawat_inap_drpr.kd_jenis_prw,
             jns_perawatan_inap.nm_perawatan, dokter.nm_dokter, petugas.nama, rawat_inap_drpr.biaya_rawat
      FROM rawat_inap_drpr
      INNER JOIN jns_perawatan_inap ON rawat_inap_drpr.kd_jenis_prw = jns_perawatan_inap.kd_jenis_prw
      INNER JOIN dokter ON rawat_inap_drpr.kd_dokter = dokter.kd_dokter
      INNER JOIN petugas ON rawat_inap_drpr.nip = petugas.nip
      WHERE rawat_inap_drpr.no_rawat = ?
      ORDER BY rawat_inap_drpr.tgl_perawatan DESC, rawat_inap_drpr.jam_rawat DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil tindakan ranap dokter paramedis", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data penggunaan obat/BHP operasi.
 */
export async function getPenggunaanObatOperasi(noRawat: string) {
  try {
    const query = `
      SELECT beri_obat_operasi.tanggal, databarang.nama_brng, beri_obat_operasi.jumlah
      FROM beri_obat_operasi
      INNER JOIN databarang ON beri_obat_operasi.kd_obat = databarang.kd_brng
      WHERE beri_obat_operasi.no_rawat = ?
      ORDER BY beri_obat_operasi.tanggal DESC
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil penggunaan obat operasi", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data resume rawat jalan.
 */
export async function getResumePasien(noRawat: string) {
  try {
    const query = `
      SELECT resume_pasien.*, dokter.nm_dokter
      FROM resume_pasien
      LEFT JOIN dokter ON resume_pasien.kd_dokter = dokter.kd_dokter
      WHERE resume_pasien.no_rawat = ?
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil resume pasien", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data resume ICU.
 */
export async function getResumeICU(noRawat: string) {
  try {
    const query = `
      SELECT resume_pasien_icu.*, dokter.nm_dokter
      FROM resume_pasien_icu
      LEFT JOIN dokter ON resume_pasien_icu.kd_dokter = dokter.kd_dokter
      WHERE resume_pasien_icu.no_rawat = ?
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil resume ICU", error: error.message, data: [] };
  }
}

/**
 * Mendapatkan data resume Mata.
 */
export async function getResumeMata(noRawat: string) {
  try {
    const query = `
      SELECT * FROM resume_pasien_mata WHERE no_rawat = ?
    `;
    const [rows]: any = await db.execute(query, [noRawat]);
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, message: "Gagal mengambil resume mata", error: error.message, data: [] };
  }
}
