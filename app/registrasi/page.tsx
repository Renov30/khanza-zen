"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaSearch, FaCheck, FaPrint, FaTimes, FaIdCard,
  FaSave, FaFileAlt, FaEdit, FaTrash, FaList
} from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import TabbedTable from '@/components/TabbedTable';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';

export default function Registrasi() {
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  /* Data Mock untuk Tabel */
  const mockData = [
    { id: "1", p: false, no: "2026/02/23/000001", tgl: "2026-02-23", jam: "08:07:55", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000005", nama: "Sakha Hamizan Aqila", jk: "L", umur: "8 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "-", pj: "WINDIHARTO", alamatPj: "PAJANGAN BANTUL, -, -", hubPj: "AYAH", biaya: "10,000", sts: "Lama", telp: "0896267503923" },
    { id: "2", p: false, no: "2026/02/25/000005", tgl: "2026-02-25", jam: "20:22:37", kd_dok: "D0000005", nm_dok: "dr. Sri Rahma", rm: "000051", nama: "ADI KAZAMA", jk: "L", umur: "41 Th", poli: "Poliklinik Jantung", jnsB: "UMUM", pj: "-", alamatPj: ", CAMPURJO, BOJONEGO...", hubPj: "DIRI SENDIRI", biaya: "10,000", sts: "Lama", telp: "-" },
    { id: "3", p: false, no: "2026/02/25/000003", tgl: "2026-02-25", jam: "14:35:37", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000048", nama: "LIYA RAHMA", jk: "P", umur: "39 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "UMUM", pj: "-", alamatPj: "TES, JOYOTAKAN, SEREN...", hubPj: "DIRI SENDIRI", biaya: "10,000", sts: "Lama", telp: "08965786" },
    { id: "4", p: false, no: "2026/02/25/000002", tgl: "2026-02-25", jam: "11:55:49", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000009", nama: "WAHYUDI KURNIAWAN", jk: "L", umur: "36 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "-", pj: "-", alamatPj: "PEKALONGAN, -, -, -", hubPj: "SAUDARA", biaya: "10,000", sts: "Lama", telp: "083875000083" },
    { id: "5", p: true, no: "2026/02/25/000001", tgl: "2026-02-25", jam: "10:07:55", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000022", nama: "RUDI SANTOSO", jk: "L", umur: "68 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "BPJS", pj: "-", alamatPj: "TES, KEDUNGWARLU, PRE...", hubPj: "SAUDARA", biaya: "10,000", sts: "Lama", telp: "123123213" },
    { id: "6", p: false, no: "2026/03/03/000001", tgl: "2026-03-03", jam: "18:01:10", kd_dok: "D0000001", nm_dok: "dr. Hilyatul Nadia", rm: "000005", nama: "Sakha Hamizan Aqila", jk: "L", umur: "9 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "-", pj: "WINDIHARTO", alamatPj: "PAJANGAN BANTUL, -, -", hubPj: "AYAH", biaya: "10,000", sts: "Lama", telp: "0896267503923" },
    { id: "7", p: false, no: "2026/03/10/000001", tgl: "2026-03-10", jam: "11:46:36", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000047", nama: "RIDWAN HALIM", jk: "L", umur: "37 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "PT KERETA API", pj: "-", alamatPj: "GAS, KARANG TIMUR, KA...", hubPj: "DIRI SENDIRI", biaya: "10,000", sts: "Lama", telp: "-" },
  ];

  const columns: TableColumn[] = [
    { header: "No.Rawat", key: "no", className: "text-slate-700 dark:text-slate-200 font-medium" },
    { header: "Tanggal", key: "tgl", className: "text-center text-slate-600 dark:text-slate-300" },
    { header: "Jam", key: "jam", className: "text-center text-slate-600 dark:text-slate-300" },
    { header: "Kode Dokter", key: "kd_dok", className: "text-slate-500 dark:text-slate-400 text-[9px]" },
    { header: "Dokter Dituju", key: "nm_dok", className: "font-semibold text-brand-800" },
    { header: "Nomor RM", key: "rm", className: "font-bold text-slate-700 dark:text-slate-200" },
    { header: "Pasien", key: "nama", className: "font-bold text-slate-800 dark:text-slate-100" },
    { header: "J.K.", key: "jk", className: "text-center text-slate-600 dark:text-slate-300" },
    { header: "Umur", key: "umur", className: "text-slate-600 dark:text-slate-300" },
    { header: "Poliklinik", key: "poli", className: "text-slate-700 dark:text-slate-200 font-medium" },
    {
      header: "Jenis Bayar",
      key: "jnsB",
      render: (row) => (
        <span className="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-1.5 py-[2px] rounded-sm text-[8px] font-bold">
          {row.jnsB}
        </span>
      ),
    },
    { header: "Penanggung Jawab", key: "pj", className: "text-slate-600 dark:text-slate-300" },
    { header: "Alamat P.J.", key: "alamatPj", className: "truncate max-w-[120px]" },
    { header: "Hubungan P.J.", key: "hubPj", className: "text-slate-600 dark:text-slate-300" },
    { header: "Biaya Registrasi", key: "biaya", className: "text-right text-slate-700 dark:text-slate-200" },
    { header: "Status", key: "sts", className: "text-slate-600 dark:text-slate-300" },
    { header: "No. Telp", key: "telp", className: "text-brand-600 tabular-nums" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-xl shadow-inner border-t border-l border-white"
    >

      <TopFormContainer title="Input Data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          {/* Kolom Kiri */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-20 text-right">No. Reg :</span>
              <div className="flex gap-1 flex-1">
                <input type="text" className="w-[60px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700 transition-all font-semibold" defaultValue="001" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-20 text-right">No. Rawat :</span>
              <div className="flex flex-1">
                <input type="text" className="w-[180px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700 transition-all" defaultValue="2026/04/22/000001" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-20 text-right">Tgl. Reg :</span>
              <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                <input type="date" className="border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-700" defaultValue="2026-04-22" />
                <span className="font-medium text-slate-500 dark:text-slate-400 pl-1">Jam :</span>
                <input type="time" step="1" className="border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white dark:bg-slate-700" defaultValue="09:24:19" />
                <input type="checkbox" className="accent-brand-600 ml-1 w-3.5 h-3.5 rounded" defaultChecked />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-20 text-right">Dr Dituju :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="w-[80px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <input type="text" className="flex-1 min-w-[120px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <button className="bg-brand-50 border border-brand-200 p-1.5 rounded-md hover:bg-brand-100 text-brand-600 transition-colors shadow-sm"><FaSearch className="text-[10px]" /></button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-20 text-right">Unit :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="w-[80px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <input type="text" className="flex-1 min-w-[120px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <button className="bg-brand-50 border border-brand-200 p-1.5 rounded-md hover:bg-brand-100 text-brand-600 transition-colors shadow-sm"><FaSearch className="text-[10px]" /></button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-[110px] text-right">No. Rekam Medik :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="w-[80px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <input type="text" className="flex-1 min-w-[140px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <button className="bg-brand-50 border border-brand-200 p-1.5 rounded-md hover:bg-brand-100 text-brand-600 transition-colors shadow-sm"><FaSearch className="text-[10px]" /></button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-[110px] text-right">Penanggung Jawab :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 min-w-[100px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <span className="font-medium text-slate-500 dark:text-slate-400 text-right ml-1">Hubungan :</span>
                <input type="text" className="w-[100px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-[110px] text-right">Alamat P. J. :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 min-w-[100px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <span className="font-medium text-slate-500 dark:text-slate-400 w-[60px] text-right ml-1 mr-1">Status :</span>
                <input type="text" className="w-[100px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-[110px] text-right">Jenis Bayar :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 min-w-[100px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
                <span className="font-medium text-slate-500 dark:text-slate-400 w-[60px] text-right ml-1 mr-1">No. KA :</span>
                <input type="text" className="w-[100px] border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 w-[110px] text-right">Asal Rujukan :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </TopFormContainer>

      {/* Area Tabel (Bertab) */}
      <TabbedTable
        tabs={[
          {
            id: 'registrasi_awal',
            label: 'Registrasi Awal',
            content: (
              <DataTableMulti
                title="Daftar Registrasi Pasien"
                icon={<FaIdCard />}
                columns={columns}
                data={mockData}
                idKey="id"
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            )
          },
          {
            id: 'rujukan_internal',
            label: 'Rujukan Internal Poli',
            content: (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead className="sticky top-0 z-10 text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-md bg-white/95 dark:bg-slate-800/95 border-b-2 border-brand-500">
                    <tr>
                      <th className="py-2.5 px-2 font-bold">No. Rujukan</th>
                      <th className="py-2.5 px-2 font-bold">Poli Asal</th>
                      <th className="py-2.5 px-2 font-bold">Poli Tujuan</th>
                      <th className="py-2.5 px-2 font-bold">Dokter Perujuk</th>
                      <th className="py-2.5 px-2 font-bold">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500 italic font-medium">Belum ada data rujukan internal poli.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          }
        ]}
      />

      {/* Panel Aksi dan Filter */}
      <BottomActionPanel
        recordCount={16}
      />
    </motion.div>
  );
}


