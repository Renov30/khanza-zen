"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaSearch,
  FaCheck,
  FaPrint,
  FaExchangeAlt,
  FaSignOutAlt,
  FaFolderOpen,
  FaTimes,
  FaBed,
  FaSync,
} from "react-icons/fa";
import BottomActionPanel, {
  ActionButton,
} from "@/components/BottomActionPanel";
import { getDaftarRanap } from "@/lib/actions/ranap";
import DataTableSingle from "@/components/DataTableSingle";
import { TableColumn } from "@/components/TableTypes";
import { ranapRowClass } from "@/lib/row-colors";

export default function RawatInap() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState("Belum Pulang");
  const [selectedNoRawat, setSelectedNoRawat] = useState<string | null>(null);

  const [tglAwal, setTglAwal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [tglAkhir, setTglAkhir] = useState(
    new Date().toISOString().split("T")[0],
  );
  const router = useRouter();

  const columns: TableColumn[] = [
    {
      header: "No.Rawat",
      key: "no_rawat",
      render: (row) => (
        <Link
          href={`/rawat-inap/pemeriksaan?noRawat=${encodeURIComponent(row.no_rawat)}`}
          className="text-brand-600 hover:text-brand-800 hover:underline font-bold"
        >
          {row.no_rawat}
        </Link>
      ),
    },
    { header: "Nomor RM", key: "no_rkm_medis", className: "text-slate-800 dark:text-slate-100 font-bold" },
    {
      header: "Nama Pasien",
      key: "nm_pasien",
      className: "text-slate-800 dark:text-slate-100 font-bold",
      render: (row) => `${row.nm_pasien} (${row.umur})`,
    },
    {
      header: "Alamat Pasien",
      key: "alamat",
      className: "text-slate-600 truncate max-w-[200px]",
    },
    { header: "Penanggung Jawab", key: "p_jawab", className: "text-slate-600 dark:text-slate-300" },
    { header: "Hubungan P.J.", key: "hubunganpj", className: "text-slate-600 dark:text-slate-300" },
    {
      header: "Jenis Bayar",
      key: "png_jawab",
      className: "text-center",
      render: (row) => (
        <span className="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
          {row.png_jawab}
        </span>
      ),
    },
    { header: "Kamar", key: "kamar", className: "text-slate-700 dark:text-slate-200 font-medium" },
    {
      header: "Tarif Kamar",
      key: "trf_kamar",
      className: "text-right text-slate-700 dark:text-slate-200",
      render: (row) => new Intl.NumberFormat("id-ID").format(row.trf_kamar),
    },
    {
      header: "Diagnosa Awal",
      key: "diagnosa_awal",
      className: "text-slate-600 dark:text-slate-300 truncate max-w-[150px]",
    },
    {
      header: "Diagnosa Akhir",
      key: "diagnosa_akhir",
      className: "text-slate-600 dark:text-slate-300 truncate max-w-[150px]",
    },
    { header: "Tgl.Masuk", key: "tgl_masuk", className: "text-center text-slate-600 dark:text-slate-300" },
    { header: "Jam Masuk", key: "jam_masuk", className: "text-center text-slate-600 dark:text-slate-300" },
    { header: "Tgl.Keluar", key: "tgl_keluar", className: "text-center text-slate-600 dark:text-slate-300", render: (row) => row.tgl_keluar || "-" },
    { header: "Jam Keluar", key: "jam_keluar", className: "text-center text-slate-600 dark:text-slate-300", render: (row) => row.jam_keluar || "-" },
    {
      header: "Ttl.Biaya",
      key: "ttl_biaya",
      className: "text-right text-brand-700 font-bold",
      render: (row) => new Intl.NumberFormat("id-ID").format(row.ttl_biaya),
    },
    {
      header: "Stts.Pulang",
      key: "stts_pulang",
      className: "text-center",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.stts_pulang === "-" ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}
        >
          {row.stts_pulang}
        </span>
      ),
    },
    { header: "Lama", key: "lama", className: "text-center text-slate-600 dark:text-slate-300" },
    { header: "Dokter P.J.", key: "nm_dokter", className: "text-slate-700 dark:text-slate-200" },
    { header: "Kd Kamar", key: "kd_kamar", className: "text-slate-500 dark:text-slate-400" },
    {
      header: "Status Bayar",
      key: "status_bayar",
      className: "text-center",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.status_bayar === "Sudah Bayar" ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"}`}
        >
          {row.status_bayar}
        </span>
      ),
    },
    { header: "Agama", key: "agama", className: "text-slate-600 dark:text-slate-300" },
    { header: "No. HP", key: "no_tlp", className: "text-slate-600 dark:text-slate-300" },
  ];

  const fetchData = async (keyword: string = searchKeyword) => {
    setIsLoading(true);
    const result = await getDaftarRanap(keyword, status, tglAwal, tglAkhir);
    if (result.success) {
      setData(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [status, tglAwal, tglAkhir]); // Re-fetch when filters change

  const handleSearch = () => {
    fetchData(searchKeyword);
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col w-full h-full overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-inner border-t border-l border-white dark:border-t-white/5 dark:border-l-white/5"
    >
      <DataTableSingle
        title="Daftar Pasien Rawat Inap"
        icon={<FaBed />}
        onRefresh={fetchData}
        columns={columns}
        data={data}
        idKey="no_rawat"
        selectedId={selectedNoRawat}
        onSelectionChange={setSelectedNoRawat}
        isLoading={isLoading}
        emptyMessage="Tidak ada data pasien rawat inap yang ditemukan."
        getRowKey={(row) => `${row.no_rawat}-${row.kd_kamar}`}
        getRowClass={ranapRowClass}
      />

      {/* Panel Aksi dan Filter */}
      <BottomActionPanel
        recordCount={data.length}
        hideStandardButtons
        searchValue={searchKeyword}
        onSearchChange={setSearchKeyword}
        onSearch={handleSearch}
        dateStart={tglAwal}
        dateEnd={tglAkhir}
        onDateStartChange={setTglAwal}
        onDateEndChange={setTglAkhir}
        leftFilters={
          <div className="flex items-center gap-2 mr-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Status :</span>
            <select
              className="border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-700 shadow-sm outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Belum Pulang">Belum Pulang</option>
              <option value="Sudah Pulang">Sudah Pulang</option>
              <option value="Tgl. Masuk">Tanggal Masuk</option>
            </select>
          </div>
        }
        customButtons={
          <>
            <ActionButton
              icon={<FaFolderOpen className="text-brand-600 drop-shadow-sm" />}
              label="Masuk"
            />
            <ActionButton
              icon={<FaSignOutAlt className="text-amber-600 drop-shadow-sm" />}
              label="Pulang"
            />
            <ActionButton
              icon={<FaExchangeAlt className="text-blue-600 drop-shadow-sm" />}
              label="Pindah"
            />
            <ActionButton
              icon={<FaPrint className="text-indigo-600 drop-shadow-sm" />}
              label="Cetak"
            />
          </>
        }
      />
    </motion.div>
  );
}
