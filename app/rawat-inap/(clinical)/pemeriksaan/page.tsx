"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaBed, FaEdit, FaExpand, FaCompress, FaSync, FaSearch
} from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import { getPatientInfoByNoRawat, getPemeriksaanRanap } from '@/lib/actions/ranap';

interface PemeriksaanRow {
  no_rawat: string;
  no_rkm_medis: string;
  nm_pasien: string;
  tgl_perawatan: string;
  jam_rawat: string;
  suhu_tubuh: string;
  tensi: string;
  nadi: string;
  respirasi: string;
  tinggi: string;
  berat: string;
  spo2: string;
  gcs: string;
  kesadaran: string;
  keluhan: string;
  pemeriksaan: string;
  alergi: string;
  penilaian: string;
  rtl: string;
  instruksi: string;
  evaluasi: string;
  nip: string;
  nm_pegawai: string;
  jabatan: string;
}

const TABLE_COLUMNS = [
  { key: 'no_rawat', label: 'No.Rawat', width: '105px' },
  { key: 'no_rkm_medis', label: 'No.R.M.', width: '70px' },
  { key: 'nm_pasien', label: 'Nama Pasien', width: '150px' },
  { key: 'tgl_perawatan', label: 'Tgl.Rawat', width: '80px' },
  { key: 'jam_rawat', label: 'Jam', width: '60px' },
  { key: 'suhu_tubuh', label: 'Suhu(C)', width: '50px' },
  { key: 'tensi', label: 'Tensi', width: '65px' },
  { key: 'nadi', label: 'Nadi(/mnt)', width: '70px' },
  { key: 'respirasi', label: 'Respirasi(/mnt)', width: '90px' },
  { key: 'tinggi', label: 'Tinggi(Cm)', width: '65px' },
  { key: 'berat', label: 'Berat(Kg)', width: '60px' },
  { key: 'spo2', label: 'SpO2(%)', width: '55px' },
  { key: 'gcs', label: 'GCS(E,V,M)', width: '70px' },
  { key: 'kesadaran', label: 'Kesadaran', width: '90px' },
  { key: 'keluhan', label: 'Subjek', width: '180px' },
  { key: 'pemeriksaan', label: 'Objek', width: '180px' },
  { key: 'alergi', label: 'Alergi', width: '130px' },
  { key: 'penilaian', label: 'Asesmen', width: '180px' },
  { key: 'rtl', label: 'Plan', width: '180px' },
  { key: 'instruksi', label: 'Instruksi', width: '150px' },
  { key: 'evaluasi', label: 'Evaluasi', width: '150px' },
  { key: 'nip', label: 'NIP', width: '80px' },
  { key: 'nm_pegawai', label: 'Dokter/Paramedis', width: '160px' },
  { key: 'jabatan', label: 'Profesi/Jabatan', width: '130px' },
];

function CpptTable({ data, isLoading }: { data: PemeriksaanRow[]; isLoading: boolean }) {
  return (
    <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
      <thead className="sticky top-0 bg-slate-100 border-b border-slate-300 z-10 shadow-sm text-slate-600">
        <tr>
          <th className="py-2 px-3 border-r border-slate-300 font-semibold w-8">P</th>
          {TABLE_COLUMNS.map((col) => (
            <th key={col.key} className="py-2 px-3 border-r border-slate-300 font-semibold" style={{ minWidth: col.width }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={TABLE_COLUMNS.length + 1} className="py-8 text-center text-slate-400 italic">
              <div className="flex flex-col items-center gap-2">
                <FaSync className="animate-spin text-xl text-brand-500" />
                <span>Mengambil data pemeriksaan...</span>
              </div>
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={TABLE_COLUMNS.length + 1} className="py-8 text-center text-slate-400 italic">
              Belum ada data pemeriksaan...
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={`${row.tgl_perawatan}-${row.jam_rawat}-${i}`}
              className={`border-b border-slate-100 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-brand-50`}
            >
              <td className="py-1.5 px-3 border-r border-slate-200 text-center">
                <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 cursor-pointer" />
              </td>
              {TABLE_COLUMNS.map((col) => (
                <td key={col.key} className="py-1.5 px-3 border-r border-slate-200 truncate max-w-[200px]" title={String(row[col.key as keyof PemeriksaanRow] ?? '')}>
                  {row[col.key as keyof PemeriksaanRow] ?? ''}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function PemeriksaanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('cppt');
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // Patient info state
  const [noRawat, setNoRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState('');
  const [namaPasien, setNamaPasien] = useState('');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Pemeriksaan data state
  const [pemeriksaanData, setPemeriksaanData] = useState<PemeriksaanRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchPatientInfo = useCallback(async (nrw: string) => {
    if (!nrw.trim()) return;
    setIsLoadingPatient(true);
    try {
      const result = await getPatientInfoByNoRawat(nrw);
      if (result.success && result.data) {
        setNoRM(result.data.no_rkm_medis);
        setNamaPasien(result.data.nm_pasien);
      } else {
        setNoRM('');
        setNamaPasien('');
      }
    } catch {
      setNoRM('');
      setNamaPasien('');
    }
    setIsLoadingPatient(false);
  }, []);

  const fetchPemeriksaan = useCallback(async (nrw: string, keyword: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingData(true);
    try {
      const result = await getPemeriksaanRanap(nrw, keyword);
      if (result.success && result.data) {
        setPemeriksaanData(result.data);
      } else {
        setPemeriksaanData([]);
      }
    } catch {
      setPemeriksaanData([]);
    }
    setIsLoadingData(false);
  }, []);

  // Fetch on mount when noRawat is available
  useEffect(() => {
    setMounted(true);
    if (noRawatParam) {
      setNoRawat(noRawatParam);
      fetchPatientInfo(noRawatParam);
      fetchPemeriksaan(noRawatParam);
    }
  }, [noRawatParam, fetchPatientInfo, fetchPemeriksaan]);

  if (!mounted) return null;

  const handleSearchTable = () => {
    fetchPemeriksaan(noRawat, searchKeyword);
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1 border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
          <FaBed className="text-brand-600" />
          <span className="truncate">Pemeriksaan / Tindakan Rawat Inap</span>
        </h2>
      </div>

      {/* Top Patient Info Bar */}
      <div className="bg-white border-b border-slate-200 p-3 shrink-0 flex flex-wrap gap-4 items-center text-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <label className="font-semibold text-slate-600 min-w-[80px] sm:min-w-0">Pasien :</label>
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 sm:w-35 bg-slate-50 focus:outline-none focus:border-brand-500" value={noRawat} readOnly />
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 sm:w-20 bg-slate-50 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? '...' : noRM} readOnly placeholder="No. RM" />
        </div>
        <div className="flex items-center gap-1 w-full md:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 md:w-50 bg-slate-50 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama Pasien" />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto w-full sm:w-auto">
          <label className="font-semibold text-slate-600">Tanggal :</label>
          <input type="date" className="border border-slate-300 rounded px-2 py-1 mr-2 focus:outline-none focus:border-brand-500" defaultValue={new Date().toISOString().split('T')[0]} />
          <input type="time" step="1" className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500 bg-white"
            defaultValue={new Date().toTimeString().slice(0, 8)} />
          <input type="checkbox" className="accent-brand-500 w-4 h-4 cursor-pointer ml-2" defaultChecked />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {['Penanganan Dokter', 'Penanganan Petugas', 'Penanganan Dokter & Petugas', 'Pemeriksaan / CPPT', 'Pemeriksaan Obstetri', 'Pemeriksaan Ginekologi'].map((tab) => {
          const tabId = tab.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isActive = activeTab === (tab === 'Pemeriksaan / CPPT' ? 'cppt' : tabId);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === 'Pemeriksaan / CPPT' ? 'cppt' : tabId)}
              className={`px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap relative ${isActive
                ? 'text-brand-700 font-bold'
                : 'text-slate-500 hover:text-brand-600'
                }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-white p-4 relative">
        {activeTab === 'cppt' && (
          <div className="flex flex-col h-full gap-4 max-w-7xl mx-auto w-full">
            {/* Main Form Area */}
            <div className="flex flex-col gap-5">
              {/* Petugas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Dilakukan Oleh</label>
                  <div className="flex gap-1">
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 w-20 focus:outline-none focus:border-brand-500 text-xs bg-white" />
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white" />
                    <button className="px-2 text-brand-500 hover:bg-brand-50 rounded border border-transparent hover:border-brand-200 transition-colors"><FaEdit /></button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Jabatan / Departemen</label>
                  <div className="flex gap-1">
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white" />
                    <button className="px-2 text-brand-500 hover:bg-brand-50 rounded border border-transparent hover:border-brand-200 transition-colors"><FaEdit /></button>
                  </div>
                </div>
              </div>

              {/* SOAP, Instruksi & Alergi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Subjek (S)</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-20 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Keluhan pasien..."></textarea>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Objek (O)</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-20 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Hasil pemeriksaan..."></textarea>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Alergi</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-20 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Alergi pasien..."></textarea>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Asesmen (A)</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-20 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Diagnosis/Asesmen..."></textarea>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Plan (P)</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-20 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Rencana tindakan..."></textarea>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Instruksi</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-20 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Instruksi medis..."></textarea>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Evaluasi</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-20 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Evaluasi tindakan..."></textarea>
                </div>
              </div>

              {/* Tanda-Tanda Vital */}
              <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                  Tanda-Tanda Vital (TTV)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Suhu (°C)', id: 'suhu' },
                    { label: 'Tensi (mmHg)', id: 'tensi' },
                    { label: 'Berat (Kg)', id: 'berat' },
                    { label: 'Tinggi (Cm)', id: 'tinggi' },
                    { label: 'Respirasi (/mnt)', id: 'respirasi' },
                    { label: 'Nadi (/mnt)', id: 'nadi' },
                    { label: 'SpO2 (%)', id: 'spo2' },
                    { label: 'GCS (E,V,M)', id: 'gcs' },
                  ].map(v => (
                    <div key={v.id} className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">{v.label}</label>
                      <input type="text" className="border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-brand-500 text-xs bg-white" />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600">Kesadaran</label>
                    <select className="border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-brand-500 text-xs bg-white">
                      <option>-</option>
                      <option>Compos Mentis</option>
                      <option>Apatis</option>
                      <option>Somnolent</option>
                      <option>Sopor</option>
                      <option>Coma</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Table */}
            <div className={`flex flex-col mt-4 transition-opacity duration-150 flex-1 min-h-[400px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                <h3 className="font-bold text-slate-700 text-[13px] flex items-center gap-2">
                  Tabel Riwayat Pemeriksaan / CPPT
                  <span className="text-[11px] font-normal text-slate-500">({pemeriksaanData.length} data)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input type="text" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearchTable()}
                      className="pl-7 pr-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-brand-500 bg-white w-40"
                      placeholder="Cari data..." />
                    <FaSearch className="absolute left-2 top-1.5 text-slate-400 text-[10px]" />
                  </div>
                  <button onClick={() => fetchPemeriksaan(noRawat, searchKeyword)}
                    className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors text-xs shadow-sm"
                    title="Refresh">
                    <FaSync className={isLoadingData ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={() => setIsTableExpanded(true)}
                    className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                    <FaExpand className="text-[10px]" /> Perbesar
                  </button>
                </div>
              </div>
              <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                <CpptTable data={pemeriksaanData} isLoading={isLoadingData} />
              </div>
            </div>

            {/* Expanded Modal Table */}
            <AnimatePresence>
              {isTableExpanded && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                    className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 p-4 shadow-2xl rounded-xl border border-slate-300 flex flex-col">
                    <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                      <h3 className="font-bold text-slate-700 text-[13px] flex items-center gap-2">
                        Tabel Riwayat Pemeriksaan / CPPT
                        <span className="text-[11px] font-normal text-slate-500">({pemeriksaanData.length} data)</span>
                      </h3>
                      <button onClick={() => setIsTableExpanded(false)}
                        className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                        <FaCompress className="text-[10px]" /> Perkecil
                      </button>
                    </div>
                    <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                      <CpptTable data={pemeriksaanData} isLoading={isLoadingData} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab !== 'cppt' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            Menu {activeTab.toUpperCase()} belum tersedia (Demo)
          </div>
        )}
      </div>
      {/* Main Bottom Actions */}
      <BottomActionPanel
        recordCount={pemeriksaanData.length}
        onExit={() => router.push('/rawat-inap')}
      />
    </>
  );
}

export default function PemeriksaanRawatInap() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <PemeriksaanContent />
    </Suspense>
  );
}
