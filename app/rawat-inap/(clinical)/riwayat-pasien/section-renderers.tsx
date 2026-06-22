import React from "react";
import {
  FaFileMedical, FaImage, FaDownload, FaLink, FaCheckCircle, FaTimesCircle,
  FaUserMd, FaClipboardList, FaStethoscope
} from "react-icons/fa";

// ─── Type ─────────────────────────────────────────────────────────────────────
export interface ColumnDef {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: any, row: any) => React.ReactNode;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(val: any): string {
  if (val === null || val === undefined) return "-";
  if (val === "0000-00-00" || val === "0000-00-00 00:00:00") return "-";
  return String(val);
}

function valOrDash(val: any): string {
  return fmt(val);
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic">
      Tidak ada data
    </div>
  );
}

// ─── Table renderer ─────────────────────────────────────────────────────────────

export function renderTable(data: any[], columns: ColumnDef[], title?: string): React.ReactNode {
  return (
    <div>
      {title && <SectionHeader icon={<FaClipboardList />} label={title} />}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-2 border dark:border-slate-700 whitespace-nowrap ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((row: any, i: number) => (
                <tr key={i} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-2 border dark:border-slate-700 whitespace-nowrap ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                      }`}
                    >
                      {col.render ? col.render(row[col.key], row) : valOrDash(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Card renderer ──────────────────────────────────────────────────────────────

export function renderCards(
  data: any[],
  fieldGroups: { label: string; keys: string[] }[],
  title?: string,
): React.ReactNode {
  return (
    <div>
      {title && <SectionHeader icon={<FaClipboardList />} label={title} />}
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {fieldGroups.map((group, gi) => (
              <div key={gi} className={gi > 0 ? "border-t border-slate-100 dark:border-slate-700/50" : ""}>
                {group.label && (
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {group.label}
                  </div>
                )}
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5">
                  {group.keys.map((key) => (
                    <div key={key} className="flex flex-col gap-0">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-slate-300 dark:text-slate-500">-</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          data.map((row: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {fieldGroups.map((group, gi) => (
                <div key={gi} className={gi > 0 ? "border-t border-slate-100 dark:border-slate-700/50" : ""}>
                  {group.label && (
                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {group.label}
                    </div>
                  )}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5">
                    {group.keys.map((key) => (
                      <div key={key} className="flex flex-col gap-0">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-200 break-words">
                          {valOrDash(row[key])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── SOAP renderer (pemeriksaan_ranap) ──────────────────────────────────────────

export function renderSoap(data: any[]): React.ReactNode {
  const fields = [
    { label: "Subjektif", key: "keluhan" },
    { label: "Objektif", key: "pemeriksaan" },
    { label: "Penilaian", key: "penilaian" },
    { label: "RTL", key: "rtl" },
    { label: "Instruksi", key: "instruksi" },
  ];
  const vitals = ["tensi", "nadi", "respirasi", "suhu_tubuh"];

  return (
    <div>
      <SectionHeader icon={<FaStethoscope />} label="Pemeriksaan Rawat Inap (SOAP)" />
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-400 italic">
              Tidak ada data
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs p-3">
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {field.label}
                  </span>
                  <span className="text-slate-300 dark:text-slate-500">-</span>
                </div>
              ))}
              <div className="flex gap-4 col-span-full">
                {vitals.map((key) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 capitalize">
                      {key === "suhu_tubuh" ? "Suhu" : key}:
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-500">-</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          data.map((row: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 flex items-center gap-3">
                <span>{valOrDash(row.tgl_perawatan)} {valOrDash(row.jam_rawat)}</span>
                <span className="text-slate-400">|</span>
                <span>{valOrDash(row.nm_pegawai)}</span>
              </div>
              <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
                {fields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {field.label}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                      {valOrDash(row[field.key])}
                    </span>
                  </div>
                ))}
                <div className="flex gap-4 col-span-full">
                  {vitals.map((key) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-slate-400 capitalize">
                        {key === "suhu_tubuh" ? "Suhu" : key}:
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {valOrDash(row[key])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Resume renderer (document-style) ───────────────────────────────────────────

export function renderResume(data: any[]): React.ReactNode {
  return (
    <div>
      {data.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">
          {data.map((row: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                <FaFileMedical className="text-slate-400" />
                <span>Resume Medis — {valOrDash(row.tgl_resume)}</span>
                {row.nm_dokter && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span>{row.nm_dokter}</span>
                  </>
                )}
              </div>
              <div className="p-3 text-xs space-y-2">
                {[
                  { label: "Diagnosa Masuk", key: "diagnosa_masuk" },
                  { label: "Diagnosa Utama", key: "diagnosa_utama" },
                  { label: "Diagnosa Sekunder", key: "diagnosa_sekunder" },
                  { label: "Prosedur Utama", key: "prosedur_utama" },
                  { label: "Prosedur Sekunder", key: "prosedur_sekunder" },
                  { label: "Ringkasan", key: "ringkasan" },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{field.label}</span>
                    <span className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                      {valOrDash(row[field.key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Berkas Digital renderer ────────────────────────────────────────────────────

export function renderBerkasDigital(data: any[]): React.ReactNode {
  return (
    <div>
      <SectionHeader icon={<FaImage />} label="Berkas Digital" />
      {data.length === 0 ? <EmptyState /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((row: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {row.lokasi_file ? (
                  ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext =>
                    row.lokasi_file?.toLowerCase().endsWith(ext)
                  ) ? (
                    <img
                      src={row.lokasi_file}
                      alt={row.nama_berkas || 'Berkas'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaFileMedical className="text-3xl text-slate-400" />
                  )
                ) : (
                  <FaFileMedical className="text-3xl text-slate-400" />
                )}
              </div>
              <div className="p-2 text-[11px]">
                <div className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {valOrDash(row.nama_berkas)}
                </div>
                <div className="text-slate-400 dark:text-slate-500">{valOrDash(row.tgl_perawatan)}</div>
                {row.lokasi_file && (
                  <a
                    href={row.lokasi_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-[10px]"
                  >
                    <FaDownload /> Lihat
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Operasi Lengkap renderer ───────────────────────────────────────────────────

export function renderOperasiLengkap(data: any[]): React.ReactNode {
  return (
    <div>
      {data.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">
          {data.map((row: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                <span>{valOrDash(row.tgl_operasi)}</span>
                <span className="text-slate-400">|</span>
                <span>{valOrDash(row.jam_mulai)} - {valOrDash(row.jam_selesai)}</span>
                <span className="text-slate-400">|</span>
                <span>{valOrDash(row.nm_perawatan)}</span>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                  row.status_operasi === "Selesai"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {valOrDash(row.status_operasi)}
                </span>
              </div>
              <div className="p-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400">Diagnosa Pre Op</span>
                  <span className="text-slate-700 dark:text-slate-200">{valOrDash(row.diagnosa_pre_op)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400">Diagnosa Post Op</span>
                  <span className="text-slate-700 dark:text-slate-200">{valOrDash(row.diagnosa_post_op)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400">Jaringan Dieksekusi</span>
                  <span className="text-slate-700 dark:text-slate-200">{valOrDash(row.jaringan_dieksekusi)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400">Permintaan PA</span>
                  <span className="text-slate-700 dark:text-slate-200">{valOrDash(row.permintaan_pa)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section renderer map ────────────────────────────────────────────────────────
// Each section maps to a render function. The render function receives data: any[].

const columnDefs: Record<string, ColumnDef[]> = {
  diagnosa: [
    { key: "kd_penyakit", label: "Kode" },
    { key: "nm_penyakit", label: "Diagnosa" },
    { key: "status", label: "Status" },
    { key: "nm_dokter", label: "Dokter" },
  ],
  prosedur: [
    { key: "kd_icd9", label: "Kode" },
    { key: "nm_icd9_1", label: "Prosedur" },
  ],
  triase: [
    { key: "nama_pemeriksaan", label: "Pemeriksaan" },
    { key: "hasil", label: "Hasil" },
    { key: "nm_pegawai", label: "Petugas" },
  ],
  catatan_dokter: [
    { key: "tanggal", label: "Tanggal" },
    { key: "jam", label: "Jam" },
    { key: "nm_dokter", label: "Dokter" },
    { key: "catatan", label: "Catatan" },
  ],
  resep_pulang: [
    { key: "nama_brng", label: "Nama Obat" },
    { key: "dosis", label: "Dosis" },
    { key: "jml_barang", label: "Jumlah", align: "right" },
    { key: "kode_sat", label: "Satuan" },
    { key: "total", label: "Total", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  gas_medik: [
    { key: "tanggal", label: "Tanggal" },
    { key: "nm_obat", label: "Gas Medik" },
    { key: "jumlah", label: "Jumlah", align: "right" },
    { key: "hargasatuan", label: "Harga", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  tambahan_biaya: [
    { key: "nama_biaya", label: "Nama Biaya" },
    { key: "besar_biaya", label: "Besaran", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  potongan_biaya: [
    { key: "nama_pengurangan", label: "Nama Pengurangan" },
    { key: "besar_pengurangan", label: "Besaran", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  tindakan_ralan_dokter: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "nm_perawatan", label: "Tindakan" },
    { key: "nm_dokter", label: "Dokter" },
    { key: "biaya_rawat", label: "Biaya", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  tindakan_ralan_paramedis: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "nm_perawatan", label: "Tindakan" },
    { key: "nama", label: "Paramedis" },
    { key: "biaya_rawat", label: "Biaya", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  tindakan_ralan_dokter_paramedis: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "nm_perawatan", label: "Tindakan" },
    { key: "nm_dokter", label: "Dokter" },
    { key: "nama", label: "Paramedis" },
    { key: "biaya_rawat", label: "Biaya", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  tindakan_ranap_dokter: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "nm_perawatan", label: "Tindakan" },
    { key: "nm_dokter", label: "Dokter" },
    { key: "biaya_rawat", label: "Biaya", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  tindakan_ranap_paramedis: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "nm_perawatan", label: "Tindakan" },
    { key: "nama", label: "Paramedis" },
    { key: "biaya_rawat", label: "Biaya", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  tindakan_ranap_dokter_paramedis: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "nm_perawatan", label: "Tindakan" },
    { key: "nm_dokter", label: "Dokter" },
    { key: "nama", label: "Paramedis" },
    { key: "biaya_rawat", label: "Biaya", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  penggunaan_kamar: [
    { key: "tgl_masuk", label: "Tgl Masuk" },
    { key: "tgl_keluar", label: "Tgl Keluar" },
    { key: "nm_bangsal", label: "Kamar" },
    { key: "kelas", label: "Kelas" },
    { key: "lama", label: "Lama", align: "right" },
    { key: "biaya", label: "Biaya", align: "right",
      render: (v: any) => v !== null && v !== undefined ? Number(v).toLocaleString() : "-" },
  ],
  operasi: [
    { key: "tgl_operasi", label: "Tanggal" },
    { key: "jam_mulai", label: "Mulai" },
    { key: "jam_selesai", label: "Selesai" },
    { key: "nm_perawatan", label: "Tindakan" },
    { key: "status_operasi", label: "Status",
      render: (v: any) => (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
          v === "Selesai" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>{valOrDash(v)}</span>
      ),
    },
  ],
  radiologi: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam", label: "Jam" },
    { key: "nm_perawatan", label: "Pemeriksaan" },
    { key: "dokter_perujuk", label: "Perujuk" },
    { key: "hasil", label: "Hasil" },
  ],
  laboratorium: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam", label: "Jam" },
    { key: "nm_perawatan", label: "Pemeriksaan" },
    { key: "nilai", label: "Nilai" },
    { key: "nilai_rujukan", label: "Nilai Rujukan" },
    { key: "keterangan", label: "Keterangan" },
  ],
  laboratorium_pa: [
    { key: "tgl_periksa", label: "Tanggal" },
    { key: "jam", label: "Jam" },
    { key: "kd_jenis_prw", label: "Kode" },
    { key: "nm_perawatan", label: "Nama Pemeriksaan" },
    { key: "nm_dokter", label: "Dokter PJ" },
    { key: "nama", label: "Petugas" },
    { key: "biaya", label: "Biaya", align: "right" },
  ],
  pemberian_obat: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam", label: "Jam" },
    { key: "nama_brng", label: "Nama Obat" },
    { key: "dosis", label: "Dosis" },
    { key: "jml", label: "Jumlah", align: "right" },
    { key: "aturan_pakai", label: "Aturan Pakai" },
  ],
  penggunaan_obat_operasi: [
    { key: "tanggal", label: "Tanggal" },
    { key: "nama_brng", label: "Nama Obat" },
    { key: "jumlah", label: "Jumlah", align: "right" },
  ],
  follow_up_dbd: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "suhu", label: "Suhu" },
    { key: "nadi", label: "Nadi" },
    { key: "respirasi", label: "Respirasi" },
    { key: "tensi", label: "Tensi" },
  ],
  catatan_cek_gds: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "gds", label: "GDS" },
    { key: "nip", label: "Petugas" },
  ],
  penilaian_ulang_nyeri: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "skala_nyeri", label: "Skala Nyeri" },
    { key: "jenis_nyeri", label: "Jenis Nyeri" },
    { key: "lokasi", label: "Lokasi" },
    { key: "durasi", label: "Durasi" },
  ],
  monitoring_reaksi_tranfusi: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "jam_rawat", label: "Jam" },
    { key: "jenis_reaksi", label: "Reaksi" },
    { key: "tindakan", label: "Tindakan" },
  ],
  catatan_persalinan: [
    { key: "tgl_persalinan", label: "Tanggal" },
    { key: "jam", label: "Jam" },
    { key: "jenis_persalinan", label: "Jenis" },
    { key: "penolong", label: "Penolong" },
    { key: "keterangan", label: "Keterangan" },
  ],
  rekonsiliasi_obat: [
    { key: "tanggal_wawancara", label: "Tanggal" },
    { key: "nama", label: "Petugas" },
    { key: "jenis_rekonsiliasi", label: "Jenis" },
  ],
  konseling_farmasi: [
    { key: "tanggal", label: "Tanggal" },
    { key: "nama", label: "Petugas" },
    { key: "topik", label: "Topik" },
    { key: "hasil", label: "Hasil" },
  ],
  pelayanan_informasi_obat: [
    { key: "tanggal", label: "Tanggal Permintaan" },
    { key: "pertanyaan", label: "Pertanyaan" },
    { key: "jawaban", label: "Jawaban" },
    { key: "apoteker_nama", label: "Apoteker" },
  ],
  konsultasi_medik: [
    { key: "tanggal", label: "Tanggal" },
    { key: "permintaan_konsultasi", label: "Permintaan" },
    { key: "jawaban_konsultasi", label: "Jawaban" },
    { key: "nm_petugas", label: "Petugas" },
  ],
  transfer_antar_ruang: [
    { key: "tgl_masuk", label: "Tgl Masuk" },
    { key: "tgl_keluar", label: "Tgl Keluar" },
    { key: "ruang_asal", label: "Ruang Asal" },
    { key: "ruang_tujuan", label: "Ruang Tujuan" },
    { key: "alasan", label: "Alasan" },
  ],
  skrining_tb: [
    { key: "tgl_skrining", label: "Tanggal" },
    { key: "gejala", label: "Gejala" },
    { key: "hasil_skrining", label: "Hasil" },
  ],
  edukasi_pasien: [
    { key: "tgl_edukasi", label: "Tanggal" },
    { key: "topik", label: "Topik" },
    { key: "metode", label: "Metode" },
    { key: "evaluasi", label: "Evaluasi" },
  ],
  perencanaan_pemulangan: [
    { key: "tgl_perencanaan", label: "Tanggal" },
    { key: "rencana", label: "Rencana" },
    { key: "keterangan", label: "Keterangan" },
  ],
  uji_fungsi_kfr: [
    { key: "tgl_uji", label: "Tanggal" },
    { key: "nm_petugas", label: "Petugas" },
    { key: "hasil_uji", label: "Hasil" },
  ],
  hemodialisa: [
    { key: "tgl_hemodialisa", label: "Tanggal" },
    { key: "jam_mulai", label: "Mulai" },
    { key: "jam_selesai", label: "Selesai" },
    { key: "berat_badan", label: "BB" },
    { key: "td_pre", label: "TD Pre" },
    { key: "td_post", label: "TD Post" },
  ],
  hasil_usg: [
    { key: "tgl_pemeriksaan", label: "Tanggal" },
    { key: "kesimpulan", label: "Kesimpulan" },
    { key: "kesan", label: "Kesan" },
  ],
  hasil_usg_urologi: [
    { key: "tgl_pemeriksaan", label: "Tanggal" },
    { key: "hasil", label: "Hasil" },
    { key: "kesimpulan", label: "Kesimpulan" },
  ],
  hasil_usg_gynecologi: [
    { key: "tgl_pemeriksaan", label: "Tanggal" },
    { key: "hasil", label: "Hasil" },
    { key: "kesimpulan", label: "Kesimpulan" },
  ],
  dokumentasi_eswl: [
    { key: "tgl_tindakan", label: "Tanggal" },
    { key: "hasil", label: "Hasil" },
    { key: "keterangan", label: "Keterangan" },
  ],
  penilaian_terminal: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "kesadaran", label: "Kesadaran" },
    { key: "pernapasan", label: "Pernapasan" },
    { key: "keterangan", label: "Keterangan" },
  ],
  penilaian_korban_kekerasan: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "jenis_kekerasan", label: "Jenis" },
    { key: "temuan", label: "Temuan" },
    { key: "tindakan", label: "Tindakan" },
  ],
  penilaian_kecemasan_anak: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "skor", label: "Skor" },
    { key: "hasil", label: "Hasil" },
    { key: "intervensi", label: "Intervensi" },
  ],
  penilaian_penyakit_menular: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "jenis_penyakit", label: "Jenis" },
    { key: "status", label: "Status" },
    { key: "tindakan", label: "Tindakan" },
  ],
  penilaian_keracunan: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "jenis_racun", label: "Jenis Racun" },
    { key: "jalan_masuk", label: "Jalan Masuk" },
    { key: "tindakan", label: "Tindakan" },
  ],
  asuhan_fisioterapi: [
    { key: "tgl_perawatan", label: "Tanggal" },
    { key: "keluhan", label: "Keluhan" },
    { key: "pemeriksaan", label: "Pemeriksaan" },
    { key: "tindakan", label: "Tindakan" },
    { key: "evaluasi", label: "Evaluasi" },
  ],
  penilaian_terapi_wicara: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "keluhan", label: "Keluhan" },
    { key: "hasil", label: "Hasil" },
    { key: "saran", label: "Saran" },
  ],
  penilaian_psikolog: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "keluhan", label: "Keluhan" },
    { key: "diagnosa", label: "Diagnosa" },
    { key: "terapi", label: "Terapi" },
    { key: "evaluasi", label: "Evaluasi" },
  ],
  tambahan_geriatri: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "jenis_penilaian", label: "Jenis" },
    { key: "hasil", label: "Hasil" },
  ],
  tambahan_bunuh_diri: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "faktor_resiko", label: "Faktor Resiko" },
    { key: "skor", label: "Skor" },
  ],
  tambahan_perilaku_kekerasan: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "jenis_perilaku", label: "Jenis" },
    { key: "skor", label: "Skor" },
    { key: "intervensi", label: "Intervensi" },
  ],
  tambahan_melarikan_diri: [
    { key: "tgl_penilaian", label: "Tanggal" },
    { key: "faktor_resiko", label: "Faktor Resiko" },
    { key: "skor", label: "Skor" },
  ],
  skrining_nutrisi_dewasa: [
    { key: "tanggal", label: "Tanggal" },
    { key: "bb", label: "BB" },
    { key: "tbpb", label: "TB/PB" },
    { key: "lila", label: "LILA" },
    { key: "td", label: "TD" },
    { key: "hr", label: "HR" },
    { key: "suhu", label: "Suhu" },
    { key: "total_hasil", label: "Total" },
    { key: "nm_petugas", label: "Petugas" },
  ],
  skrining_nutrisi_anak: [
    { key: "tanggal", label: "Tanggal" },
    { key: "bb", label: "BB" },
    { key: "tbpb", label: "TB/PB" },
    { key: "total_hasil", label: "Total" },
    { key: "skor_nutrisi", label: "Skor Nutrisi" },
    { key: "diketahui_dietisien", label: "Diketahui" },
    { key: "nm_petugas", label: "Petugas" },
  ],
  skrining_nutrisi_lansia: [
    { key: "tanggal", label: "Tanggal" },
    { key: "bb", label: "BB" },
    { key: "tbpb", label: "TB/PB" },
    { key: "total_hasil", label: "Total" },
    { key: "skor_nutrisi", label: "Skor Nutrisi" },
    { key: "nm_petugas", label: "Petugas" },
  ],
  skrining_gizi_lanjut: [
    { key: "tanggal", label: "Tanggal" },
    { key: "bb", label: "BB" },
    { key: "tb", label: "TB" },
    { key: "skor_imt", label: "Skor IMT" },
    { key: "skor_bb", label: "Skor BB" },
    { key: "skor_penyakit", label: "Skor Penyakit" },
    { key: "skor_total", label: "Total" },
    { key: "kesimpulan", label: "Kesimpulan" },
    { key: "nm_petugas", label: "Petugas" },
  ],
  monitoring_gizi: [
    { key: "tanggal", label: "Tanggal" },
    { key: "monitoring", label: "Monitoring" },
    { key: "evaluasi", label: "Evaluasi" },
    { key: "nm_petugas", label: "Petugas" },
  ],
  asuhan_gizi: [
    { key: "tgl_asuhan", label: "Tanggal" },
    { key: "diagnosa_gizi", label: "Diagnosa" },
    { key: "intervensi_gizi", label: "Intervensi" },
    { key: "instruksi", label: "Instruksi" },
    { key: "nm_pegawai", label: "Petugas" },
  ],
  retur_obat: [
    { key: "nama_brng", label: "Nama Barang" },
    { key: "kode_sat", label: "Satuan" },
    { key: "h_retur", label: "Harga", align: "right" },
    { key: "jumlah", label: "Jumlah", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ],
};

// Card-based sections with known field groups
const cardFieldGroups: Record<string, { label: string; keys: string[] }[]> = {
  pemeriksaan_ralan: [
    { label: "Waktu", keys: ["tgl_perawatan", "jam_rawat"] },
    { label: "Keluhan & Pemeriksaan", keys: ["keluhan", "pemeriksaan"] },
    { label: "Penilaian", keys: ["penilaian", "rtl", "instruksi"] },
    { label: "Tanda Vital", keys: ["tensi", "nadi", "respirasi", "suhu_tubuh"] },
    { label: "Petugas", keys: ["nm_pegawai"] },
  ],
  pemeriksaan_obstetri_ralan: [
    { label: "Waktu", keys: ["tgl_perawatan"] },
    { label: "Pemeriksaan Obstetri", keys: ["keluhan", "pemeriksaan", "penilaian"] },
  ],
  pemeriksaan_genekologi_ralan: [
    { label: "Waktu", keys: ["tgl_perawatan"] },
    { label: "Pemeriksaan Ginekologi", keys: ["keluhan", "pemeriksaan", "penilaian"] },
  ],
  pemeriksaan_obstetri_ranap: [
    { label: "Waktu", keys: ["tgl_perawatan"] },
    { label: "Pemeriksaan Obstetri", keys: ["keluhan", "pemeriksaan", "penilaian"] },
  ],
  pemeriksaan_genekologi_ranap: [
    { label: "Waktu", keys: ["tgl_perawatan"] },
    { label: "Pemeriksaan Ginekologi", keys: ["keluhan", "pemeriksaan", "penilaian"] },
  ],
  catatan_observasi_igd: [
    { label: "Observasi", keys: ["tgl_observasi", "jam", "observasi", "hasil", "nip"] },
  ],
  catatan_observasi_ranap: [
    { label: "Observasi", keys: ["tgl_observasi", "jam", "observasi", "hasil", "nip"] },
  ],
  catatan_observasi_ranap_kebidanan: [
    { label: "Observasi Kebidanan", keys: ["tgl_observasi", "jam", "observasi", "hasil"] },
  ],
  catatan_observasi_ranap_postpartum: [
    { label: "Observasi Postpartum", keys: ["tgl_observasi", "jam", "observasi", "hasil"] },
  ],
  catatan_keperawatan_ralan: [
    { label: "Waktu", keys: ["tgl_perawatan", "jam_rawat"] },
    { label: "Catatan Keperawatan", keys: ["keluhan", "pemeriksaan", "penilaian", "tindakan", "evaluasi"] },
  ],
  catatan_keperawatan_ranap: [
    { label: "Waktu", keys: ["tgl_perawatan", "jam_rawat"] },
    { label: "Catatan Keperawatan", keys: ["keluhan", "pemeriksaan", "penilaian", "tindakan", "evaluasi"] },
  ],
  pemantauan_ews_anak: [
    { label: "Pemantauan PEWS Anak", keys: ["tgl_pemantauan", "jam", "skor", "tindakan"] },
  ],
  pemantauan_ews_dewasa: [
    { label: "Pemantauan EWS Dewasa", keys: ["tgl_pemantauan", "jam", "skor", "tindakan"] },
  ],
  pemantauan_meows_obstetri: [
    { label: "Pemantauan MEOWS Obstetri", keys: ["tgl_pemantauan", "jam", "skor", "tindakan"] },
  ],
  pemantauan_ews_neonatus: [
    { label: "Pemantauan EWS Neonatus", keys: ["tgl_pemantauan", "jam", "skor", "tindakan"] },
  ],
  risiko_jatuh_dewasa: [
    { label: "Resiko Jatuh Dewasa", keys: ["tgl_pemeriksaan", "skor", "kategori", "tindakan"] },
  ],
  risiko_jatuh_anak: [
    { label: "Resiko Jatuh Anak", keys: ["tgl_pemeriksaan", "skor", "kategori", "tindakan"] },
  ],
  risiko_jatuh_lansia: [
    { label: "Resiko Jatuh Lansia", keys: ["tgl_pemeriksaan", "skor", "tindakan"] },
  ],
  risiko_jatuh_geriatri: [
    { label: "Resiko Jatuh Geriatri", keys: ["tgl_pemeriksaan", "skor", "tindakan"] },
  ],
  risiko_jatuh_neonatus: [
    { label: "Resiko Jatuh Neonatus", keys: ["tgl_pemeriksaan", "skor", "tindakan"] },
  ],
  risiko_jatuh_psikiatri: [
    { label: "Resiko Jatuh Psikiatri", keys: ["tgl_pemeriksaan", "skor", "tindakan"] },
  ],
  skrining_fungsional: [
    { label: "Skrining Fungsional", keys: ["tgl_pemeriksaan", "jenis", "skor", "hasil"] },
  ],
  risiko_dekubitus: [
    { label: "Resiko Dekubitus", keys: ["tgl_pemeriksaan", "skor", "tindakan"] },
  ],
  pre_induksi: [
    { label: "Pre Induksi", keys: ["tgl_penilaian", "skor_bishop", "indikasi", "keterangan"] },
  ],
  checklist_pre_operasi: [
    { label: "Pre Operasi", keys: ["tgl_checklist", "kelengkapan", "verifikasi"] },
  ],
  checklist_post_operasi: [
    { label: "Post Operasi", keys: ["tgl_checklist", "kelengkapan", "verifikasi"] },
  ],
  signin_sebelum_anestesi: [
    { label: "Sign In (Sebelum Anestesi)", keys: ["tgl_checklist", "verifikasi"] },
  ],
  timeout_sebelum_insisi: [
    { label: "Time Out (Sebelum Insisi)", keys: ["tgl_checklist", "verifikasi"] },
  ],
  signout_sebelum_menutup_luka: [
    { label: "Sign Out (Sebelum Menutup Luka)", keys: ["tgl_checklist", "verifikasi"] },
  ],
  penilaian_pre_operasi: [
    { label: "Penilaian Pre Operasi", keys: ["tgl_penilaian", "diagnosa", "rencana_tindakan", "keterangan"] },
  ],
  penilaian_pre_anestesi: [
    { label: "Penilaian Pre Anestesi", keys: ["tgl_penilaian", "klasifikasi_asa", "keterangan"] },
  ],
  skor_aldrette: [
    { label: "Skor Aldrette", keys: ["tgl_penilaian", "skor", "keterangan"] },
  ],
  skor_steward: [
    { label: "Skor Steward", keys: ["tgl_penilaian", "skor", "keterangan"] },
  ],
  skor_bromage: [
    { label: "Skor Bromage", keys: ["tgl_penilaian", "skor", "keterangan"] },
  ],
  kriteria_masuk_hcu: [
    { label: "Kriteria Masuk HCU", keys: ["tgl_checklist", "kriteria", "hasil"] },
  ],
  kriteria_keluar_hcu: [
    { label: "Kriteria Keluar HCU", keys: ["tgl_checklist", "kriteria", "hasil"] },
  ],
  kriteria_masuk_icu: [
    { label: "Kriteria Masuk ICU", keys: ["tgl_checklist", "kriteria", "hasil"] },
  ],
  kriteria_keluar_icu: [
    { label: "Kriteria Keluar ICU", keys: ["tgl_checklist", "kriteria", "hasil"] },
  ],
  pengkajian_restrain: [
    { label: "Pengkajian Restrain", keys: ["tgl_pengkajian", "alasan", "jenis_restrain", "evaluasi"] },
  ],
};

// ─── Main renderer dispatcher ──────────────────────────────────────────────────

export function renderSection(sectionId: string, data: any[]): React.ReactNode {
  // Special cases
  if (sectionId === "pemeriksaan_ranap") return renderSoap(data);
  if (sectionId === "operasi_lengkap") return renderOperasiLengkap(data);
  if (sectionId.startsWith("resume_") || sectionId === "resume_pasien") return renderResume(data);
  if (sectionId === "berkas_digital") return renderBerkasDigital(data);

  // Card-based sections
  if (cardFieldGroups[sectionId]) return renderCards(data, cardFieldGroups[sectionId]);

  // Asuhan keperawatan & medis — dynamic card rendering
  if (sectionId.startsWith("asuhan_")) {
    if (data.length > 0) {
      const excludeKeys = ["no_rawat", "nip", "kd_dokter", "kd_petugas", "nip_verifikasi", "tgl_verifikasi"];
      const keys = Object.keys(data[0]).filter(k => !excludeKeys.includes(k));
      const half = Math.ceil(keys.length / 2);
      return renderCards(data, [
        { label: "Data Asuhan", keys: keys.slice(0, half) },
        ...(half < keys.length ? [{ label: "", keys: keys.slice(half) }] : []),
      ]);
    }
    return renderCards(data, [
      { label: "Identitas", keys: ["tgl_perawatan", "jam_rawat"] },
      { label: "Pemeriksaan", keys: ["keluhan_utama", "riwayat_penyakit", "pemeriksaan_fisik"] },
      { label: "Tanda Vital", keys: ["kesadaran", "tensi", "nadi", "respirasi", "suhu"] },
    ]);
  }

  // Table-based sections (including generic fallback)
  if (columnDefs[sectionId]) return renderTable(data, columnDefs[sectionId]);

  // Generic fallback: render all fields in a table
  if (data.length > 0) {
    const keys = Object.keys(data[0]).filter(k => !["no_rawat", "nip", "kd_dokter", "kd_petugas"].includes(k));
    const cols: ColumnDef[] = keys.map(k => ({ key: k, label: k.replace(/_/g, " ") }));
    return renderTable(data, cols);
  }

  return <EmptyState />;
}
