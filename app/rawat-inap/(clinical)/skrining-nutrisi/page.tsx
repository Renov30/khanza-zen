"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaBed, FaExpand, FaCompress, FaEdit } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import { getPatientInfoByNoRawat, getSkriningNutrisiRanap, getLoggedInPegawai } from '@/lib/actions/ranap';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';

interface SkriningNutrisiRow {
  id: string; no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_lahir: string; jk: string; tanggal: string;
  bb: string; lila: string; tbpb: string;
  td: string; hr: string; rr: string; suhu: string; spo2: string;
  alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; total_hasil: string;
  nip: string; nm_petugas: string;
}

const columns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.RM', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Tgl.Lahir', key: 'tgl_lahir', width: '100px' },
  { header: 'JK', key: 'jk', width: '30px' },
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'BB(Kg)', key: 'bb', width: '60px' },
  { header: 'LILA(Cm)', key: 'lila', width: '70px' },
  { header: 'TB/PB(Cm)', key: 'tbpb', width: '80px' },
  { header: 'TD(mmHg)', key: 'td', width: '75px' },
  { header: 'HR(/mnt)', key: 'hr', width: '65px' },
  { header: 'RR(/mnt)', key: 'rr', width: '65px' },
  { header: 'Suhu', key: 'suhu', width: '50px' },
  { header: 'SpO2(%)', key: 'spo2', width: '65px' },
  { header: 'Alergi', key: 'alergi', width: '120px', className: 'truncate' },
  { header: 'SGizi 1', key: 'sg1', width: '80px', className: 'truncate' },
  { header: 'Nilai 1', key: 'nilai1', width: '50px' },
  { header: 'SGizi 2', key: 'sg2', width: '80px', className: 'truncate' },
  { header: 'Nilai 2', key: 'nilai2', width: '50px' },
  { header: 'Total Skor', key: 'total_hasil', width: '70px' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

const FormField = ({ label, value, onChange, unit, placeholder, className = "" }: {
  label: string; value: string; onChange?: (v: string) => void; unit?: string; placeholder?: string; className?: string
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0 flex items-center gap-1">
      {label}
      {unit && <span className="text-[10px] text-slate-400 font-normal lowercase">({unit})</span>}
    </label>
    <input type="text"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="flex-1 min-w-0 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors bg-white"
    />
  </div>
);

function SkriningNutrisiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const [noRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState('');
  const [namaPasien, setNamaPasien] = useState('');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  const [data, setData] = useState<SkriningNutrisiRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [tglAwal, setTglAwal] = useState(today);
  const [tglAkhir, setTglAkhir] = useState(today);

  const [pegawaiNik, setPegawaiNik] = useState('');
  const [pegawaiNama, setPegawaiNama] = useState('');

  const [nutrisiBB, setNutrisiBB] = useState('');
  const [nutrisiLILA, setNutrisiLILA] = useState('');
  const [nutrisiTBPB, setNutrisiTBPB] = useState('');
  const [nutrisiTD, setNutrisiTD] = useState('');
  const [nutrisiHR, setNutrisiHR] = useState('');
  const [nutrisiRR, setNutrisiRR] = useState('');
  const [nutrisiSuhu, setNutrisiSuhu] = useState('');
  const [nutrisiSpO2, setNutrisiSpO2] = useState('');
  const [nutrisiAlergi, setNutrisiAlergi] = useState('');
  const [nutrisiDate, setNutrisiDate] = useState(today);

  const fetchPatientInfo = useCallback(async (nrw: string) => {
    if (!nrw.trim()) return;
    setIsLoadingPatient(true);
    try {
      const result = await getPatientInfoByNoRawat(nrw);
      if (result.success && result.data) { setNoRM(result.data.no_rkm_medis); setNamaPasien(result.data.nm_pasien); }
      else { setNoRM(''); setNamaPasien(''); }
    } catch { setNoRM(''); setNamaPasien(''); }
    setIsLoadingPatient(false);
  }, []);

  const fetchData = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoading(true);
    try {
      const result = await getSkriningNutrisiRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any) => ({
          ...row,
          id: `${row.no_rawat}-${row.tanggal}`
        }));
        setData(mappedData);
      } else setData([]);
    } catch (e) { console.error('fetch error:', e); setData([]); }
    setIsLoading(false);
  }, []);

  const fetchPegawaiInfo = useCallback(async () => {
    try {
      const result = await getLoggedInPegawai();
      if (result.success && result.data) {
        setPegawaiNik(result.data.nik);
        setPegawaiNama(result.data.nama);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchPegawaiInfo();
    if (noRawatParam) {
      fetchPatientInfo(noRawatParam);
      fetchData(noRawatParam);
    }
  }, [noRawatParam, fetchPatientInfo, fetchData, fetchPegawaiInfo]);

  useEffect(() => {
    if (noRawat) fetchData(noRawat, searchKeyword, tglAwal, tglAkhir);
  }, [tglAwal, tglAkhir]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const handleBottomSearch = () => fetchData(noRawat, searchKeyword, tglAwal, tglAkhir);

  return (
    <>
      <div className="bg-white border-b border-slate-200 p-3 shrink-0 flex flex-wrap gap-2 items-center text-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <label className="font-semibold text-slate-600 min-w-[80px] sm:min-w-0">Pasien :</label>
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-35 sm:w-33 bg-slate-50 focus:outline-none focus:border-brand-500" value={noRawat} readOnly />
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-20 sm:w-16 bg-slate-50 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? '...' : noRM} readOnly placeholder="No. RM" />
        </div>
        <div className="flex items-center gap-1 w-full md:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-75 sm:w-35 bg-slate-50 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama Pasien" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white pt-0 pb-2 relative">
        <div className="flex flex-col min-h-full w-full">
          <TopFormContainer title="Form Input Skrining Nutrisi" persistenceKey="khanza_skrining_nutrisi_form_open">
            <div className="flex flex-col gap-5">
              <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">Data Skrining Nutrisi</h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">Tanggal</label>
                  <input type="date" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                    value={nutrisiDate} onChange={e => setNutrisiDate(e.target.value)} />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-[13px] font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">Antropometri & TTV</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <FormField label="BB" value={nutrisiBB} onChange={setNutrisiBB} unit="Kg" placeholder="0" />
                  <FormField label="LILA" value={nutrisiLILA} onChange={setNutrisiLILA} unit="Cm" placeholder="0" />
                  <FormField label="TB/PB" value={nutrisiTBPB} onChange={setNutrisiTBPB} unit="Cm" placeholder="0" />
                  <FormField label="TD" value={nutrisiTD} onChange={setNutrisiTD} unit="mmHg" placeholder="0" />
                  <FormField label="HR" value={nutrisiHR} onChange={setNutrisiHR} unit="/mnt" placeholder="0" />
                  <FormField label="RR" value={nutrisiRR} onChange={setNutrisiRR} unit="/mnt" placeholder="0" />
                  <FormField label="Suhu" value={nutrisiSuhu} onChange={setNutrisiSuhu} unit="°C" placeholder="0" />
                  <FormField label="SpO2" value={nutrisiSpO2} onChange={setNutrisiSpO2} unit="%" placeholder="0" />
                  <FormField label="Alergi" value={nutrisiAlergi} onChange={setNutrisiAlergi} placeholder="Alergi..." className="lg:col-span-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">Dilakukan Oleh</label>
                  <div className="flex gap-1 flex-1">
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 w-24 focus:outline-none focus:border-brand-500 text-xs bg-slate-50" value={pegawaiNik} readOnly />
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-slate-50" value={pegawaiNama} readOnly />
                    <button className="px-2 text-brand-500 hover:bg-brand-50 rounded border border-transparent hover:border-brand-200 transition-colors"><FaEdit /></button>
                  </div>
                </div>
              </div>
            </div>
          </TopFormContainer>

          <div className={`flex flex-col transition-all duration-150 h-[1500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <DataTableMulti
              title="Data Skrining Nutrisi"
              icon={<FaBed />}
              onRefresh={handleBottomSearch}
              columns={columns}
              data={data}
              idKey="id"
              selectedIds={selectedRows}
              onSelectionChange={setSelectedRows}
              isLoading={isLoading}
              emptyMessage="Tidak ada data skrining nutrisi yang ditemukan."
            />
          </div>

          <AnimatePresence>
            {isTableExpanded && (<>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 p-4 shadow-2xl rounded-xl border border-slate-300 flex flex-col">
                <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                  <h3 className="font-bold text-slate-700 text-[13px]">Tabel Data Skrining Nutrisi</h3>
                  <button onClick={() => setIsTableExpanded(false)}
                    className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                    <FaCompress className="text-[10px]" /> Perkecil
                  </button>
                </div>
                <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                  <DataTableMulti
                    columns={columns}
                    data={data}
                    idKey="id"
                    selectedIds={selectedRows}
                    onSelectionChange={setSelectedRows}
                    isLoading={isLoading}
                  />
                </div>
              </motion.div>
            </>)}
          </AnimatePresence>
        </div>
      </div>

      <BottomActionPanel
        recordCount={data.length}
        onExit={() => router.push('/rawat-inap')}
        searchValue={searchKeyword}
        onSearchChange={setSearchKeyword}
        onSearch={handleBottomSearch}
        dateStart={tglAwal}
        dateEnd={tglAkhir}
        onDateStartChange={setTglAwal}
        onDateEndChange={setTglAkhir}
      />
    </>
  );
}

export default function SkriningNutrisiPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <SkriningNutrisiContent />
    </Suspense>
  );
}
