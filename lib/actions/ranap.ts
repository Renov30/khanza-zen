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
