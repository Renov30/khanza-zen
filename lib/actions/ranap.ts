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
