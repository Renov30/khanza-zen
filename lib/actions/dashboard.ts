"use server";

import { db } from "@/lib/db";

const HARI_INDONESIA: Record<string, string> = {
  Sunday: "AKHAD",
  Monday: "SENIN",
  Tuesday: "SELASA",
  Wednesday: "RABU",
  Thursday: "KAMIS",
  Friday: "JUMAT",
  Saturday: "SABTU",
};

function todayDayName(): string {
  const nama = HARI_INDONESIA[new Date().toLocaleDateString("en-US", { weekday: "long" })];
  return nama || "SENIN";
}

function pctChange(today: number, yesterday: number): { pct: string; isUp: boolean } {
  if (yesterday === 0) return { pct: yesterday === today ? "0%" : "100%", isUp: today > 0 };
  const diff = ((today - yesterday) / yesterday) * 100;
  const abs = Math.abs(diff);
  return {
    pct: `${abs.toFixed(1)}% dari kemarin`,
    isUp: diff >= 0,
  };
}

export async function getDashboardMetrics() {
  try {
    const [todayRows]: any = await db.execute(
      `SELECT COUNT(DISTINCT no_rkm_medis) AS total FROM reg_periksa WHERE tgl_registrasi = CURDATE() AND stts <> 'Batal'`
    );
    const [yesterdayRows]: any = await db.execute(
      `SELECT COUNT(DISTINCT no_rkm_medis) AS total FROM reg_periksa WHERE tgl_registrasi = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND stts <> 'Batal'`
    );

    const [inapRows]: any = await db.execute(
      `SELECT COUNT(DISTINCT kamar_inap.no_rawat) AS total FROM kamar_inap WHERE stts_pulang = '-'`
    );
    const [inapKemarinRows]: any = await db.execute(
      `SELECT COUNT(DISTINCT no_rawat) AS total FROM kamar_inap WHERE stts_pulang = '-' AND tgl_masuk <= DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
    );

    const [igdRows]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli WHERE reg_periksa.tgl_registrasi = CURDATE() AND reg_periksa.stts <> 'Batal' AND poliklinik.nm_poli LIKE '%IGD%'`
    );
    const [igdKemarinRows]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli WHERE reg_periksa.tgl_registrasi = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND reg_periksa.stts <> 'Batal' AND poliklinik.nm_poli LIKE '%IGD%'`
    );

    const [ralanRows]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli WHERE reg_periksa.tgl_registrasi = CURDATE() AND reg_periksa.stts <> 'Batal' AND poliklinik.nm_poli NOT LIKE '%IGD%' AND (reg_periksa.status_lanjut IS NULL OR reg_periksa.status_lanjut != 'Ranap')`
    );
    const [ralanKemarinRows]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli WHERE reg_periksa.tgl_registrasi = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND reg_periksa.stts <> 'Batal' AND poliklinik.nm_poli NOT LIKE '%IGD%' AND (reg_periksa.status_lanjut IS NULL OR reg_periksa.status_lanjut != 'Ranap')`
    );

    const [daftarRows]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa WHERE tgl_registrasi = CURDATE() AND stts <> 'Batal'`
    );
    const [daftarKemarinRows]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa WHERE tgl_registrasi = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND stts <> 'Batal'`
    );

    const today = Number(todayRows[0]?.total) || 0;
    const yesterday = Number(yesterdayRows[0]?.total) || 0;
    const inap = Number(inapRows[0]?.total) || 0;
    const inapKemarin = Number(inapKemarinRows[0]?.total) || 0;
    const igd = Number(igdRows[0]?.total) || 0;
    const igdKemarin = Number(igdKemarinRows[0]?.total) || 0;
    const ralan = Number(ralanRows[0]?.total) || 0;
    const ralanKemarin = Number(ralanKemarinRows[0]?.total) || 0;
    const daftar = Number(daftarRows[0]?.total) || 0;
    const daftarKemarin = Number(daftarKemarinRows[0]?.total) || 0;

    return {
      success: true,
      data: {
        pasienHariIni: today,
        rawatInap: inap,
        igdUgd: igd,
        rawatJalan: ralan,
        pendaftaran: daftar,
        trends: {
          pasienHariIni: pctChange(today, yesterday),
          rawatInap: pctChange(inap, inapKemarin),
          igdUgd: pctChange(igd, igdKemarin),
          rawatJalan: pctChange(ralan, ralanKemarin),
          pendaftaran: pctChange(daftar, daftarKemarin),
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching dashboard metrics:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function getChartData(tgl?: string, jenis: string = "ralan") {
  try {
    let dateClause = "CURDATE()";
    if (tgl) {
      dateClause = "?";
    }
    const params: any[] = [];
    if (tgl) params.push(tgl);

    let query = "";
    if (jenis === "ranap") {
      query = `
        SELECT
          CASE
            WHEN HOUR(jam_masuk) BETWEEN 0 AND 3 THEN '00:00'
            WHEN HOUR(jam_masuk) BETWEEN 4 AND 7 THEN '04:00'
            WHEN HOUR(jam_masuk) BETWEEN 8 AND 11 THEN '08:00'
            WHEN HOUR(jam_masuk) BETWEEN 12 AND 15 THEN '12:00'
            WHEN HOUR(jam_masuk) BETWEEN 16 AND 19 THEN '16:00'
            WHEN HOUR(jam_masuk) BETWEEN 20 AND 23 THEN '20:00'
          END AS label,
          COUNT(*) AS total
        FROM kamar_inap
        WHERE tgl_masuk = ${dateClause}
        GROUP BY label
        ORDER BY FIELD(label, '00:00','04:00','08:00','12:00','16:00','20:00')
      `;
    } else if (jenis === "igd") {
      query = `
        SELECT
          CASE
            WHEN HOUR(jam_reg) BETWEEN 0 AND 3 THEN '00:00'
            WHEN HOUR(jam_reg) BETWEEN 4 AND 7 THEN '04:00'
            WHEN HOUR(jam_reg) BETWEEN 8 AND 11 THEN '08:00'
            WHEN HOUR(jam_reg) BETWEEN 12 AND 15 THEN '12:00'
            WHEN HOUR(jam_reg) BETWEEN 16 AND 19 THEN '16:00'
            WHEN HOUR(jam_reg) BETWEEN 20 AND 23 THEN '20:00'
          END AS label,
          COUNT(*) AS total
        FROM reg_periksa
        INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
        WHERE reg_periksa.tgl_registrasi = ${dateClause}
          AND reg_periksa.stts <> 'Batal'
          AND poliklinik.nm_poli LIKE '%IGD%'
        GROUP BY label
        ORDER BY FIELD(label, '00:00','04:00','08:00','12:00','16:00','20:00')
      `;
    } else if (jenis === "pendaftaran") {
      query = `
        SELECT
          CASE
            WHEN HOUR(jam_reg) BETWEEN 0 AND 3 THEN '00:00'
            WHEN HOUR(jam_reg) BETWEEN 4 AND 7 THEN '04:00'
            WHEN HOUR(jam_reg) BETWEEN 8 AND 11 THEN '08:00'
            WHEN HOUR(jam_reg) BETWEEN 12 AND 15 THEN '12:00'
            WHEN HOUR(jam_reg) BETWEEN 16 AND 19 THEN '16:00'
            WHEN HOUR(jam_reg) BETWEEN 20 AND 23 THEN '20:00'
          END AS label,
          COUNT(*) AS total
        FROM reg_periksa
        WHERE tgl_registrasi = ${dateClause} AND stts <> 'Batal'
        GROUP BY label
        ORDER BY FIELD(label, '00:00','04:00','08:00','12:00','16:00','20:00')
      `;
    } else {
      query = `
        SELECT
          CASE
            WHEN HOUR(jam_reg) BETWEEN 0 AND 3 THEN '00:00'
            WHEN HOUR(jam_reg) BETWEEN 4 AND 7 THEN '04:00'
            WHEN HOUR(jam_reg) BETWEEN 8 AND 11 THEN '08:00'
            WHEN HOUR(jam_reg) BETWEEN 12 AND 15 THEN '12:00'
            WHEN HOUR(jam_reg) BETWEEN 16 AND 19 THEN '16:00'
            WHEN HOUR(jam_reg) BETWEEN 20 AND 23 THEN '20:00'
          END AS label,
          COUNT(*) AS total
        FROM reg_periksa
        INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
        WHERE reg_periksa.tgl_registrasi = ${dateClause}
          AND reg_periksa.stts <> 'Batal'
          AND poliklinik.nm_poli NOT LIKE '%IGD%'
          AND (reg_periksa.status_lanjut IS NULL OR reg_periksa.status_lanjut != 'Ranap')
        GROUP BY label
        ORDER BY FIELD(label, '00:00','04:00','08:00','12:00','16:00','20:00')
      `;
    }

    const [rows]: any = await db.execute(query, params);

    const labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
    const chartData = labels.map((l) => {
      const found = rows.find((r: any) => r.label === l);
      return Number(found?.total) || 0;
    });

    const total = chartData.reduce((a: number, b: number) => a + b, 0);

    return {
      success: true,
      data: { labels, values: chartData, total },
    };
  } catch (error: any) {
    console.error("Error fetching chart data:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function getChartLegendByDate(tgl?: string) {
  try {
    let dateClause = "CURDATE()";
    const params: any[] = [];
    if (tgl) {
      dateClause = "?";
      params.push(tgl);
    }

    const [pendaftaran]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa WHERE tgl_registrasi = ${dateClause} AND stts <> 'Batal'`,
      params
    );
    const [igd]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli WHERE reg_periksa.tgl_registrasi = ${dateClause} AND reg_periksa.stts <> 'Batal' AND poliklinik.nm_poli LIKE '%IGD%'`,
      params
    );
    const [ralan]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM reg_periksa INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli WHERE reg_periksa.tgl_registrasi = ${dateClause} AND reg_periksa.stts <> 'Batal' AND poliklinik.nm_poli NOT LIKE '%IGD%' AND (reg_periksa.status_lanjut IS NULL OR reg_periksa.status_lanjut != 'Ranap')`,
      params
    );
    const [ranap]: any = await db.execute(
      `SELECT COUNT(*) AS total FROM kamar_inap WHERE tgl_masuk = ${dateClause}`,
      params
    );

    return {
      success: true,
      data: {
        pendaftaran: Number(pendaftaran[0]?.total) || 0,
        igd: Number(igd[0]?.total) || 0,
        ralan: Number(ralan[0]?.total) || 0,
        ranap: Number(ranap[0]?.total) || 0,
      },
    };
  } catch (error: any) {
    console.error("Error fetching chart legend:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function getJadwalDokterHariIni() {
  try {
    const hari = todayDayName();
    const [rows]: any = await db.execute(
      `SELECT jadwal.kd_dokter, dokter.nm_dokter, jadwal.hari_kerja,
              jadwal.jam_mulai, jadwal.jam_selesai, poliklinik.nm_poli, jadwal.kuota
       FROM jadwal
       INNER JOIN dokter ON jadwal.kd_dokter = dokter.kd_dokter
       INNER JOIN poliklinik ON jadwal.kd_poli = poliklinik.kd_poli
       WHERE jadwal.hari_kerja = ?
       ORDER BY jadwal.jam_mulai`,
      [hari]
    );

    const data = rows.map((r: any) => ({
      kd_dokter: r.kd_dokter,
      nm_dokter: r.nm_dokter,
      hari_kerja: r.hari_kerja,
      jam_mulai: r.jam_mulai?.substring(0, 5),
      jam_selesai: r.jam_selesai?.substring(0, 5),
      nm_poli: r.nm_poli,
      kuota: Number(r.kuota) || 0,
    }));

    return { success: true, data, hari };
  } catch (error: any) {
    console.error("Error fetching jadwal dokter:", error);
    return { success: false, data: [], hari: "", error: error.message };
  }
}
