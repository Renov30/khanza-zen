"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaUtensils, FaCompress } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import { getPatientInfoByNoRawat, getDietPasienRanap, getDaftarDiet, getJamDiet, getLoggedInPegawai } from '@/lib/actions/ranap';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';

interface DietOption {
  kd_diet: string; nama_diet: string;
}

interface JamDietOption {
  waktu: string; jam: string;
}

const columns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.RM', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Kamar', key: 'kamar', width: '200px' },
  { header: 'Tanggal', key: 'tanggal', width: '100px' },
  { header: 'Waktu', key: 'waktu', width: '60px' },
  { header: 'Jam', key: 'jam', width: '60px' },
  { header: 'Diet', key: 'nama_diet', width: '180px' },
  { header: 'Keterangan', key: 'keterangan', width: '200px', className: 'truncate' },
];

function DietPasienContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [noRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState('');
  const [namaPasien, setNamaPasien] = useState('');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  const [dietData, setDietData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [tglAwal, setTglAwal] = useState(today);
  const [tglAkhir, setTglAkhir] = useState(today);

  const [pegawaiNik, setPegawaiNik] = useState('');
  const [pegawaiNama, setPegawaiNama] = useState('');

  const [formTanggal, setFormTanggal] = useState(today);
  const [formWaktu, setFormWaktu] = useState('');
  const [formKdDiet, setFormKdDiet] = useState('');
  const [formNmDiet, setFormNmDiet] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');

  const [dietOptions, setDietOptions] = useState<DietOption[]>([]);
  const [jamDietOptions, setJamDietOptions] = useState<JamDietOption[]>([]);

  const [isClockRunning, setIsClockRunning] = useState(true);
  const [currentDate, setCurrentDate] = useState(today);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 8));
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isClockRunning) {
      const tick = () => {
        const now = new Date();
        setCurrentDate(now.toISOString().split('T')[0]);
        setCurrentTime(now.toTimeString().slice(0, 8));
      };
      tick();
      clockRef.current = setInterval(tick, 1000);
    } else if (clockRef.current) {
      clearInterval(clockRef.current);
      clockRef.current = null;
    }
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, [isClockRunning]);

  useEffect(() => {
    getDaftarDiet().then(r => { if (r.success) setDietOptions(r.data); });
    getJamDiet().then(r => { if (r.success) setJamDietOptions(r.data); });
  }, []);

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

  const fetchDiet = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingData(true);
    try {
      const result = await getDietPasienRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any, i: number) => ({
          ...row,
          id: `${row.no_rawat}-${row.tanggal}-${row.waktu}-${row.kd_diet}-${i}`
        }));
        setDietData(mappedData);
      } else setDietData([]);
    } catch { setDietData([]); }
    setIsLoadingData(false);
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
    }
  }, [noRawatParam, fetchPatientInfo, fetchPegawaiInfo]);

  useEffect(() => {
    if (noRawat) fetchDiet(noRawat, searchKeyword, tglAwal, tglAkhir);
  }, [noRawat, searchKeyword, tglAwal, tglAkhir]);

  if (!mounted) return null;

  const handleBottomSearch = () => fetchDiet(noRawat, searchKeyword, tglAwal, tglAkhir);

  const handleKdDietChange = (val: string) => {
    setFormKdDiet(val);
    const found = dietOptions.find(d => d.kd_diet === val);
    setFormNmDiet(found ? found.nama_diet : '');
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 shrink-0 flex flex-wrap gap-2 items-center text-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <label className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">Pasien :</label>
          <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 flex-1 lg:w-33 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-500" value={noRawat} readOnly />
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 flex-1 lg:w-16 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? '...' : noRM} readOnly placeholder="No. RM" />
        </div>
        <div className="flex items-center gap-1 w-full md:w-auto">
          <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 flex-1 lg:w-70 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama Pasien" />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto w-full sm:w-auto">
          <label className="font-semibold text-slate-600 dark:text-slate-300">Tanggal :</label>
          <input type="date" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 mr-1 focus:outline-none sm:w-27 focus:border-brand-500 bg-white dark:bg-slate-700"
            value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
          <input type="time" step="1" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs w-27 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
            value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
          <input type="checkbox" className="accent-brand-500 w-4 h-4 ml-2 opacity-60"
            checked={isClockRunning} disabled title="Jam selalu real-time" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 pt-0 pb-2 relative">
        <div className="flex flex-col min-h-full w-full">
          <TopFormContainer title="Form Input Diet Pasien" persistenceKey="khanza_diet_pasien_form_open">
            <div className="flex flex-col gap-5">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">Data Diet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 shrink-0">Tanggal</label>
                    <input type="date" value={formTanggal} onChange={e => setFormTanggal(e.target.value)}
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 shrink-0">Waktu Diet</label>
                    <select value={formWaktu} onChange={e => setFormWaktu(e.target.value)}
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100">
                      <option value="">-- Pilih Waktu --</option>
                      {jamDietOptions.map(j => (
                        <option key={j.waktu} value={j.waktu}>{j.waktu} - {j.jam}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 shrink-0">Kode Diet</label>
                    <input type="text" value={formKdDiet} onChange={e => handleKdDietChange(e.target.value)}
                      list="diet-list"
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100" placeholder="Ketik kode/nama diet" />
                    <datalist id="diet-list">
                      {dietOptions.map(d => (
                        <option key={d.kd_diet} value={d.kd_diet}>{d.nama_diet}</option>
                      ))}
                    </datalist>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 shrink-0">Nama Diet</label>
                    <input type="text" value={formNmDiet} readOnly
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-300 focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 lg:col-span-2 xl:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 shrink-0">Keterangan</label>
                    <input type="text" value={formKeterangan} onChange={e => setFormKeterangan(e.target.value)}
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100" placeholder="Keterangan diet..." />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 sm:w-24 shrink-0">Dilakukan Oleh</label>
                  <div className="flex gap-1 flex-1">
                    <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 w-24 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700" value={pegawaiNik} readOnly />
                    <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700" value={pegawaiNama} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </TopFormContainer>

          <div className={`flex flex-col transition-all duration-150 h-[1500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <DataTableMulti
              title="Data Diet Pasien"
              icon={<FaUtensils />}
              onRefresh={handleBottomSearch}
              columns={columns}
              data={dietData}
              idKey="id"
              selectedIds={selectedRows}
              onSelectionChange={setSelectedRows}
              isLoading={isLoadingData}
              emptyMessage="Tidak ada data diet pasien yang ditemukan."
            />
          </div>

          <AnimatePresence>
            {isTableExpanded && (<>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 dark:bg-slate-900 p-4 shadow-2xl rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-t-lg px-3 py-2 shrink-0">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 text-[13px]">Tabel Data Diet Pasien</h3>
                  <button onClick={() => setIsTableExpanded(false)}
                    className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                    <FaCompress className="text-[10px]" /> Perkecil
                  </button>
                </div>
                <div className="border border-slate-300 dark:border-slate-700 border-t-0 overflow-auto bg-white dark:bg-slate-800 rounded-b-lg flex-1">
                  <DataTableMulti
                    columns={columns}
                    data={dietData}
                    idKey="id"
                    selectedIds={selectedRows}
                    onSelectionChange={setSelectedRows}
                    isLoading={isLoadingData}
                  />
                </div>
              </motion.div>
            </>)}
          </AnimatePresence>
        </div>
      </div>

      <BottomActionPanel
        recordCount={dietData.length}
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

export default function DietPasienPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <DietPasienContent />
    </Suspense>
  );
}
