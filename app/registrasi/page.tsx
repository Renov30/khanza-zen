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

export default function Registrasi() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  /* Mock Data for Table */
  const mockData = [
    { p: false, no: "2026/02/23/000001", tgl: "2026-02-23", jam: "08:07:55", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000005", nama: "Sakha Hamizan Aqila", jk: "L", umur: "8 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "-", pj: "WINDIHARTO", alamatPj: "PAJANGAN BANTUL, -, -", hubPj: "AYAH", biaya: "10,000", sts: "Lama", telp: "0896267503923" },
    { p: false, no: "2026/02/25/000005", tgl: "2026-02-25", jam: "20:22:37", kd_dok: "D0000005", nm_dok: "dr. Sri Rahma", rm: "000051", nama: "ADI KAZAMA", jk: "L", umur: "41 Th", poli: "Poliklinik Jantung", jnsB: "UMUM", pj: "-", alamatPj: ", CAMPURJO, BOJONEGO...", hubPj: "DIRI SENDIRI", biaya: "10,000", sts: "Lama", telp: "-" },
    { p: false, no: "2026/02/25/000003", tgl: "2026-02-25", jam: "14:35:37", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000048", nama: "LIYA RAHMA", jk: "P", umur: "39 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "UMUM", pj: "-", alamatPj: "TES, JOYOTAKAN, SEREN...", hubPj: "DIRI SENDIRI", biaya: "10,000", sts: "Lama", telp: "08965786" },
    { p: false, no: "2026/02/25/000002", tgl: "2026-02-25", jam: "11:55:49", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000009", nama: "WAHYUDI KURNIAWAN", jk: "L", umur: "36 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "-", pj: "-", alamatPj: "PEKALONGAN, -, -, -", hubPj: "SAUDARA", biaya: "10,000", sts: "Lama", telp: "083875000083" },
    { p: true, no: "2026/02/25/000001", tgl: "2026-02-25", jam: "10:07:55", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000022", nama: "RUDI SANTOSO", jk: "L", umur: "68 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "BPJS", pj: "-", alamatPj: "TES, KEDUNGWARLU, PRE...", hubPj: "SAUDARA", biaya: "10,000", sts: "Lama", telp: "123123213" },
    { p: false, no: "2026/03/03/000001", tgl: "2026-03-03", jam: "18:01:10", kd_dok: "D0000001", nm_dok: "dr. Hilyatul Nadia", rm: "000005", nama: "Sakha Hamizan Aqila", jk: "L", umur: "9 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "-", pj: "WINDIHARTO", alamatPj: "PAJANGAN BANTUL, -, -", hubPj: "AYAH", biaya: "10,000", sts: "Lama", telp: "0896267503923" },
    { p: false, no: "2026/03/10/000001", tgl: "2026-03-10", jam: "11:46:36", kd_dok: "D0000004", nm_dok: "dr. Hilyatul Nadia", rm: "000047", nama: "RIDWAN HALIM", jk: "L", umur: "37 Th", poli: "Poliklinik Penyakit Dalam", jnsB: "PT KERETA API", pj: "-", alamatPj: "GAS, KARANG TIMUR, KA...", hubPj: "DIRI SENDIRI", biaya: "10,000", sts: "Lama", telp: "-" },
  ];

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
          <FaIdCard className="text-brand-600" />
          Daftar Registrasi Pasien
        </h2>
      </div>

      <TopFormContainer title="Input Data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          {/* Left Column */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-20 text-right">No. Reg :</span>
              <div className="flex gap-1 flex-1">
                <input type="text" className="w-[60px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 transition-all font-semibold" defaultValue="001" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-20 text-right">No. Rawat :</span>
              <div className="flex flex-1">
                <input type="text" className="w-[180px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50 transition-all" defaultValue="2026/04/22/000001" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-20 text-right">Tgl. Reg :</span>
              <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                <input type="date" className="border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white" defaultValue="2026-04-22" />
                <span className="font-medium text-slate-500 pl-1">Jam :</span>
                <input type="time" step="1" className="border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-white" defaultValue="09:24:19" />
                <input type="checkbox" className="accent-brand-600 ml-1 w-3.5 h-3.5 rounded" defaultChecked />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-20 text-right">Dr Dituju :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="w-[80px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <input type="text" className="flex-1 min-w-[120px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <button className="bg-brand-50 border border-brand-200 p-1.5 rounded-md hover:bg-brand-100 text-brand-600 transition-colors shadow-sm"><FaSearch className="text-[10px]" /></button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-20 text-right">Unit :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="w-[80px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <input type="text" className="flex-1 min-w-[120px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <button className="bg-brand-50 border border-brand-200 p-1.5 rounded-md hover:bg-brand-100 text-brand-600 transition-colors shadow-sm"><FaSearch className="text-[10px]" /></button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-[110px] text-right">No. Rekam Medik :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="w-[80px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <input type="text" className="flex-1 min-w-[140px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <button className="bg-brand-50 border border-brand-200 p-1.5 rounded-md hover:bg-brand-100 text-brand-600 transition-colors shadow-sm"><FaSearch className="text-[10px]" /></button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-[110px] text-right">Penanggung Jawab :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 min-w-[100px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <span className="font-medium text-slate-500 text-right ml-1">Hubungan :</span>
                <input type="text" className="w-[100px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-[110px] text-right">Alamat P. J. :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 min-w-[100px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <span className="font-medium text-slate-500 w-[60px] text-right ml-1 mr-1">Status :</span>
                <input type="text" className="w-[100px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-[110px] text-right">Jenis Bayar :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 min-w-[100px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
                <span className="font-medium text-slate-500 w-[60px] text-right ml-1 mr-1">No. KA :</span>
                <input type="text" className="w-[100px] border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 w-[110px] text-right">Asal Rujukan :</span>
              <div className="flex items-center gap-1 flex-1">
                <input type="text" className="flex-1 border border-slate-200 rounded-md px-2 py-1 focus:outline-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50" />
              </div>
            </div>
          </div>
        </div>
      </TopFormContainer>

      {/* Table Area (Tabbed) */}
      <TabbedTable
        tabs={[
          {
            id: 'registrasi_awal',
            label: 'Registrasi Awal',
            header: (
              <tr>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer text-center">P</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">No.Rawat</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer text-center">Tanggal</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer text-center">Jam</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Kode Dokter</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Dokter Dituju</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Nomor RM</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Pasien</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer text-center">J.K.</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Umur</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Poliklinik</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Jenis Bayar</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Penanggung Jawab</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Alamat P.J.</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Hubungan P.J.</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer text-right">Biaya Registrasi</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">Status</th>
                <th className="py-2.5 px-2 font-bold hover:bg-slate-100 cursor-pointer">No. Telp</th>
              </tr>
            ),
            body: (
              <>
                {mockData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-100 cursor-pointer transition-all duration-200
                      ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} 
                      hover:bg-brand-50 hover:shadow-[inset_3px_0_0_0_var(--color-brand-500)]`}
                  >
                    <td className="py-1.5 px-2 text-center">
                      <input type="checkbox" className="accent-brand-600 rounded" defaultChecked={row.p} />
                    </td>
                    <td className="py-1.5 px-2 text-slate-700 font-medium">{row.no}</td>
                    <td className="py-1.5 px-2 text-center text-slate-600">{row.tgl}</td>
                    <td className="py-1.5 px-2 text-center text-slate-600">{row.jam}</td>
                    <td className="py-1.5 px-2 text-slate-500 text-[9px]">{row.kd_dok}</td>
                    <td className="py-1.5 px-2 font-semibold text-brand-800">{row.nm_dok}</td>
                    <td className="py-1.5 px-2 font-bold text-slate-700">{row.rm}</td>
                    <td className="py-1.5 px-2 font-bold text-slate-800">{row.nama}</td>
                    <td className="py-1.5 px-2 text-center text-slate-600">{row.jk}</td>
                    <td className="py-1.5 px-2 text-slate-600">{row.umur}</td>
                    <td className="py-1.5 px-2 text-slate-700 font-medium">{row.poli}</td>
                    <td className="py-1.5 px-2"><span className="bg-sky-100 text-sky-700 px-1.5 py-[2px] rounded-sm text-[8px] font-bold">{row.jnsB}</span></td>
                    <td className="py-1.5 px-2 text-slate-600">{row.pj}</td>
                    <td className="py-1.5 px-2 truncate max-w-[120px]" title={row.alamatPj}>{row.alamatPj}</td>
                    <td className="py-1.5 px-2 text-slate-600">{row.hubPj}</td>
                    <td className="py-1.5 px-2 text-right text-slate-700">{row.biaya}</td>
                    <td className="py-1.5 px-2 text-slate-600">{row.sts}</td>
                    <td className="py-1.5 px-2 text-brand-600 tabular-nums">{row.telp}</td>
                  </tr>
                ))}
              </>
            )
          },
          {
            id: 'rujukan_internal',
            label: 'Rujukan Internal Poli',
            header: (
              <tr>
                <th className="py-2.5 px-2 font-bold">No. Rujukan</th>
                <th className="py-2.5 px-2 font-bold">Poli Asal</th>
                <th className="py-2.5 px-2 font-bold">Poli Tujuan</th>
                <th className="py-2.5 px-2 font-bold">Dokter Perujuk</th>
                <th className="py-2.5 px-2 font-bold">Keterangan</th>
              </tr>
            ),
            body: (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 italic font-medium">Belum ada data rujukan internal poli.</td>
              </tr>
            )
          }
        ]}
      />

      {/* Actions and Filters Panel */}
      <BottomActionPanel
        recordCount={16}
      />
    </motion.div>
  );
}


