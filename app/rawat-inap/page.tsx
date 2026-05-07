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

export default function RawatInap() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState("Belum Pulang");
  const [tglAwal, setTglAwal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [tglAkhir, setTglAkhir] = useState(
    new Date().toISOString().split("T")[0],
  );
  const router = useRouter();

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
      className="flex flex-col w-full h-full overflow-hidden bg-slate-50 text-slate-800 rounded-tl-xl shadow-inner border-t border-l border-white"
    >
      {/* Elegant Page Header */}
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1 border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
          <FaBed className="text-brand-600" />
          Daftar Pasien Rawat Inap
        </h2>
        <button
          onClick={fetchData}
          className="p-1.5 hover:bg-brand-200 rounded-full transition-colors text-brand-700"
          title="Refresh Data"
        >
          <FaSync className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table Area - Modernized with Horizontal Scroll */}
      <div className="flex-1 overflow-auto bg-slate-50/50 border-t border-slate-300 relative custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10 text-slate-600 shadow-sm backdrop-blur-md bg-white/95 border-b-2 border-brand-500">
            <tr className="border-b-2 border-brand-500">
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                No.
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                No.Rawat
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Nomor RM
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Nama Pasien
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Alamat Pasien
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Penanggung Jawab
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Hubungan P.J.
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Jenis Bayar
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Kamar
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-right">
                Tarif Kamar
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Diagnosa Awal
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Diagnosa Akhir
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center">
                Tgl.Masuk
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center">
                Jam Masuk
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center">
                Tgl.Keluar
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center">
                Jam Keluar
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-right">
                Ttl.Biaya
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center">
                Stts.Pulang
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200 text-center">
                Lama
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Dokter P.J.
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Kd Kamar
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Status Bayar
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                Agama
              </th>
              <th className="py-2.5 px-3 font-bold border-r border-slate-200">
                No. HP
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={23}
                  className="py-20 text-center text-slate-400 italic"
                >
                  <div className="flex flex-col items-center gap-3">
                    <FaSync className="animate-spin text-3xl text-brand-500" />
                    <span>Mengambil data dari server...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={23}
                  className="py-20 text-center text-slate-400 italic"
                >
                  Tidak ada data pasien rawat inap yang ditemukan.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-100 cursor-pointer transition-all duration-200
                    ${i % 2 === 0 ? "bg-white" : "bg-slate-50/80"} 
                    hover:bg-brand-50 hover:shadow-[inset_4px_0_0_0_var(--color-brand-500)]`}
                >
                  <td className="py-2 px-3 text-slate-500 text-center border-r border-slate-100 font-medium">
                    {i + 1}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium border-r border-slate-100">
                    <Link
                      href={`/rawat-inap/pemeriksaan?noRawat=${encodeURIComponent(row.no_rawat)}`}
                      className="text-brand-600 hover:text-brand-800 hover:underline font-bold"
                    >
                      {row.no_rawat}
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-brand-600 font-semibold border-r border-slate-100">
                    {row.no_rkm_medis}
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-bold border-r border-slate-100">
                    {row.nm_pasien} ({row.umur})
                  </td>
                  <td
                    className="py-2 px-3 text-slate-600 truncate max-w-[200px] border-r border-slate-100"
                    title={row.alamat}
                  >
                    {row.alamat}
                  </td>
                  <td className="py-2 px-3 text-slate-600 border-r border-slate-100">
                    {row.p_jawab}
                  </td>
                  <td className="py-2 px-3 text-slate-600 border-r border-slate-100">
                    {row.hubunganpj}
                  </td>
                  <td className="py-2 px-3 text-center border-r border-slate-100">
                    <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                      {row.png_jawab}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium border-r border-slate-100">
                    {row.kamar}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100">
                    {new Intl.NumberFormat("id-ID").format(row.trf_kamar)}
                  </td>
                  <td
                    className="py-2 px-3 text-slate-600 border-r border-slate-100 truncate max-w-[150px]"
                    title={row.diagnosa_awal}
                  >
                    {row.diagnosa_awal}
                  </td>
                  <td
                    className="py-2 px-3 text-slate-600 border-r border-slate-100 truncate max-w-[150px]"
                    title={row.diagnosa_akhir}
                  >
                    {row.diagnosa_akhir}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 border-r border-slate-100">
                    {row.tgl_masuk}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 border-r border-slate-100">
                    {row.jam_masuk}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 border-r border-slate-100">
                    {row.tgl_keluar || "-"}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 border-r border-slate-100">
                    {row.jam_keluar || "-"}
                  </td>
                  <td className="py-2 px-3 text-right text-brand-700 font-bold border-r border-slate-100">
                    {new Intl.NumberFormat("id-ID").format(row.ttl_biaya)}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 border-r border-slate-100">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.stts_pulang === "-" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                    >
                      {row.stts_pulang}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 border-r border-slate-100">
                    {row.lama}
                  </td>
                  <td className="py-2 px-3 text-slate-700 border-r border-slate-100">
                    {row.nm_dokter}
                  </td>
                  <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                    {row.kd_kamar}
                  </td>
                  <td className="py-2 px-3 text-center border-r border-slate-100">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.status_bayar === "Sudah Bayar" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {row.status_bayar}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 border-r border-slate-100">
                    {row.agama}
                  </td>
                  <td className="py-2 px-3 text-slate-600">{row.no_tlp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Actions and Filters Panel */}
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
            <span className="font-semibold text-slate-600">Status :</span>
            <select
              className="border border-slate-200 rounded text-slate-600 px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white shadow-sm outline-none"
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
