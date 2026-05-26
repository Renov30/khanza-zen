"use server";

import { db } from "@/lib/db";

/**
 * Mengambil info pasien (no_rkm_medis, nm_pasien) berdasarkan no_rawat.
 * Meniru isRawat() + isPsien() dari Java DlgRawatInap.
 */
export async function getPatientInfoByNoRawat(noRawat: string) {
  try {
    const query = `
      SELECT reg_periksa.no_rkm_medis, pasien.nm_pasien 
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
      LEFT JOIN pemeriksaan_ranap_audit_trail 
        ON pemeriksaan_ranap.no_rawat = pemeriksaan_ranap_audit_trail.no_rawat 
        AND pemeriksaan_ranap.tgl_perawatan = pemeriksaan_ranap_audit_trail.tgl_perawatan 
        AND pemeriksaan_ranap.jam_rawat = pemeriksaan_ranap_audit_trail.jam_rawat 
      INNER JOIN pegawai ON pemeriksaan_ranap.nip = pegawai.nik 
      WHERE 
        (pemeriksaan_ranap_audit_trail.status = 'aktif' OR pemeriksaan_ranap_audit_trail.status IS NULL)
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
      SELECT pegawai.nik, pegawai.nama, pegawai.jbtn
      FROM pegawai
      WHERE pegawai.nik = ?
    `;
    const [rows]: any = await db.execute(query, [userId]);

    if (rows.length > 0) {
      return {
        success: true,
        data: {
          nik: rows[0].nik,
          nama: rows[0].nama,
          jabatan: rows[0].jbtn,
        },
      };
    }

    // Jika user tidak ditemukan di pegawai, gunakan session id sebagai fallback
    return {
      success: true,
      data: {
        nik: userId,
        nama: userId,
        jabatan: "-",
      },
    };
  } catch (error: any) {
    console.error("Error fetching pegawai info:", error);
    return { success: false, message: "Gagal mengambil data petugas", error: error.message };
  }
}

/**
 * Mengambil data asuhan gizi pasien rawat inap.
 * Saat ini masih menggunakan demo data karena tabel asuhan_gizi
 * belum tersedia di database.
 */
export async function getAsuhanGiziRanap(
  noRawat: string,
  keyword: string = "",
  tglAwal: string = "",
  tglAkhir: string = "",
) {
  try {
    // TODO: Implement query ke tabel asuhan_gizi setelah tabel tersedia
    const demoData = [
      {
        id: "1",
        no_rawat: noRawat,
        no_rkm_medis: "617244",
        nm_pasien: "Tn. Sukarji",
        jk: "L",
        tgl_lahir: "1959-06-22",
        tgl_asuhan: "2025-10-23",
        bb: 55, tb: 155, imt: 22.9,
        lla: 0, tl: 0, ulna: 0, lla_u: 0,
        bb_ideal: 0, bb_u: 0, tku: 0, bb_tb: 0, lla_u_persen: 0,
        subjektif: "A p51.1.b Leukosit : 13.5 10^3/...",
        fisik_klinis: "Status Gizi : normal. Mual dan nyeri...",
        telur: false, susu_sapi: false, kacang: false, gluten: false,
        udang: false, ikan: false, hazelnut: false,
        pola_makan: "3x makan utama, porsi habis",
        riwayat_personal: "",
        diagnosa_gizi: "",
        intervensi_gizi: "",
        instruksi: "",
        monitoring_evaluasi: "",
        nip: "",
        nm_pegawai: "Ukhuwwatun Hasanah Pristari Rahayu, S.Gz",
        jabatan: "Ahli Gizi",
      },
    ];

    return { success: true, data: demoData };
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
             reg_periksa.kd_dokter, dokter.nm_dokter, reg_periksa.umurdaftar, reg_periksa.sttsumur,
             poliklinik.nm_poli, penjab.png_jawab
      FROM reg_periksa
      INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
      INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
      INNER JOIN penjab ON reg_periksa.kd_pj = penjab.kd_pj
      WHERE reg_periksa.stts <> 'Batal' AND reg_periksa.no_rkm_medis = ?
      ${filterClause}
    `;

    const [rows]: any = await db.execute(query, params);

    // For each visit, get internal referrals, DPJP, and kamar inap
    const enriched = [];
    for (const row of rows) {
      const noR = row.no_rawat;

      // Internal referral
      const [refRows]: any = await db.execute(`
        SELECT dokter.nm_dokter, poliklinik.nm_poli
        FROM rujukan_internal_poli
        INNER JOIN dokter ON rujukan_internal_poli.kd_dokter = dokter.kd_dokter
        INNER JOIN poliklinik ON rujukan_internal_poli.kd_poli = poliklinik.kd_poli
        WHERE rujukan_internal_poli.no_rawat = ?
      `, [noR]);

      // DPJP Ranap
      const [dpjpRows]: any = await db.execute(`
        SELECT dokter.nm_dokter FROM dpjp_ranap
        INNER JOIN dokter ON dpjp_ranap.kd_dokter = dokter.kd_dokter
        WHERE dpjp_ranap.no_rawat = ?
      `, [noR]);

      // Kamar inap
      const [kamarRows]: any = await db.execute(`
        SELECT kamar_inap.tgl_masuk, kamar_inap.jam_masuk, bangsal.nm_bangsal
        FROM kamar_inap
        INNER JOIN kamar ON kamar_inap.kd_kamar = kamar.kd_kamar
        INNER JOIN bangsal ON kamar.kd_bangsal = bangsal.kd_bangsal
        WHERE kamar_inap.no_rawat = ?
      `, [noR]);

      enriched.push({
        no_rawat: row.no_rawat,
        tgl_registrasi: row.tgl_registrasi instanceof Date ? row.tgl_registrasi.toISOString().split('T')[0] : row.tgl_registrasi,
        jam_reg: row.jam_reg,
        kd_dokter: row.kd_dokter,
        nm_dokter: row.nm_dokter,
        umur: `${row.umurdaftar} ${row.sttsumur}`,
        nm_poli: row.nm_poli,
        png_jawab: row.png_jawab,
        referrals: refRows.map((r: any) => ({ nm_dokter: r.nm_dokter, nm_poli: r.nm_poli })),
        dpjp: dpjpRows.map((r: any) => r.nm_dokter).join(', '),
        kamar_inap: kamarRows.map((r: any) => ({
          tgl_masuk: r.tgl_masuk instanceof Date ? r.tgl_masuk.toISOString().split('T')[0] : r.tgl_masuk,
          jam_masuk: r.jam_masuk,
          nm_bangsal: r.nm_bangsal,
        })),
      });
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

      result.push({
        tglReg: visit.tgl_registrasi instanceof Date ? visit.tgl_registrasi.toISOString().split('T')[0] : visit.tgl_registrasi,
        no_rawat: noR,
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
             pemeriksaan_ranap.rtl, pemeriksaan_ranap.instruksi, pemeriksaan_ranap.evaluasi,
             pemeriksaan_ranap.nip, pegawai.nama AS nm_pegawai, pegawai.jbtn
      FROM pemeriksaan_ranap
      INNER JOIN pegawai ON pemeriksaan_ranap.nip = pegawai.nik
      LEFT JOIN pemeriksaan_ranap_audit_trail
        ON pemeriksaan_ranap.no_rawat = pemeriksaan_ranap_audit_trail.no_rawat
        AND pemeriksaan_ranap.tgl_perawatan = pemeriksaan_ranap_audit_trail.tgl_perawatan
        AND pemeriksaan_ranap.jam_rawat = pemeriksaan_ranap_audit_trail.jam_rawat
      WHERE pemeriksaan_ranap.no_rawat = ?
        AND (pemeriksaan_ranap_audit_trail.status = 'aktif' OR pemeriksaan_ranap_audit_trail.status IS NULL)
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

    return { success: true, message: "Data pemeriksaan berhasil disimpan" };
  } catch (error: any) {
    console.error("Error saving pemeriksaan ranap:", error);
    return { success: false, message: "Gagal menyimpan data pemeriksaan", error: error.message };
  }
}

/**
 * Mengedit/mengganti data pemeriksaan/CPPT (Ganti).
 * 1. Mark data lama sbg 'direvisi' di audit_trail (insert jika blm ada, update jika sudah)
 * 2. INSERT baris baru ke pemeriksaan_ranap
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

    const pelaku = session.id;
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

    const pkChanged =
      oldData.no_rawat !== newData.no_rawat ||
      oldData.tgl_perawatan !== newData.tgl_perawatan ||
      oldData.jam_rawat !== newData.jam_rawat;

    if (pkChanged) {
      // PK berubah → INSERT baris baru, lalu INSERT audit trail baru
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
        console.error("Error inserting new pemeriksaan row on edit:", insertErr);
        return { success: false, message: "Gagal menyimpan data baru", error: insertErr.message };
      }

      await db.execute(`
        INSERT INTO pemeriksaan_ranap_audit_trail (id_log, no_rawat, tgl_perawatan, jam_rawat, created_at, created_by, updated_at, updated_by, ket_edit, deleted_at, deleted_by, ket_hapus, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        null, newData.no_rawat, newData.tgl_perawatan, newData.jam_rawat,
        curTime, pelaku, null, null, null, null, null, null, "aktif",
      ]);
    } else {
      // PK sama → UPDATE baris yang ada
      await db.execute(`
        UPDATE pemeriksaan_ranap SET
          suhu_tubuh=?, tensi=?, nadi=?, respirasi=?, tinggi=?, berat=?, spo2=?, gcs=?, kesadaran=?,
          keluhan=?, pemeriksaan=?, alergi=?, penilaian=?, rtl=?, instruksi=?, evaluasi=?, nip=?
        WHERE no_rawat=? AND tgl_perawatan=? AND jam_rawat=?
      `, [
        newData.suhu_tubuh, newData.tensi, newData.nadi, newData.respirasi,
        newData.tinggi, newData.berat, newData.spo2, newData.gcs, newData.kesadaran,
        newData.keluhan, newData.pemeriksaan, newData.alergi,
        newData.penilaian, newData.rtl, newData.instruksi, newData.evaluasi, newData.nip,
        newData.no_rawat, newData.tgl_perawatan, newData.jam_rawat,
      ]);
    }

    return { success: true, message: "Data pemeriksaan berhasil diubah" };
  } catch (error: any) {
    console.error("Error editing pemeriksaan ranap:", error);
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
) {
  try {
    const params: any[] = [];

    if (tglAwal && tglAkhir) {
      params.push(tglAwal, tglAkhir);
    }

    let whereClause = tglAwal && tglAkhir
      ? "WHERE pemeriksaan_ranap_audit_trail.tgl_perawatan BETWEEN ? AND ?"
      : "WHERE 1=1";

    if (noRawat.trim()) {
      whereClause += " AND pemeriksaan_ranap_audit_trail.no_rawat = ?";
      params.push(noRawat.trim());
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
      for (let i = 0; i < 7; i++) params.push(searchKey);
    }

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
      ORDER BY pemeriksaan_ranap_audit_trail.tgl_perawatan DESC, pemeriksaan_ranap_audit_trail.jam_rawat DESC
    `;

    const [rows]: any = await db.execute(query, params);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      tgl_perawatan: row.tgl_perawatan instanceof Date ? row.tgl_perawatan.toISOString().split("T")[0] : row.tgl_perawatan,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString().slice(0, 19).replace("T", " ") : row.created_at,
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString().slice(0, 19).replace("T", " ") : row.updated_at,
      deleted_at: row.deleted_at instanceof Date ? row.deleted_at.toISOString().slice(0, 19).replace("T", " ") : row.deleted_at,
    }));

    return { success: true, data: formattedRows };
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

    return { success: true, message: "Data pemeriksaan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting pemeriksaan ranap:", error);
    return { success: false, message: "Gagal menghapus data pemeriksaan", error: error.message };
  }
}
