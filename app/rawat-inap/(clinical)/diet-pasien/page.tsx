"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaUtensils, FaCompress, FaEdit } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import FormSection from '@/components/FormSection';
import DialogPilihPegawai from '@/components/DialogPilihPegawai';
import { getPatientInfoByNoRawat, getDietPasienRanap, getDaftarDiet, getJamDiet, getLoggedInPegawai, simpanDietPasienRanap, editDietPasienRanap, hapusDietPasienRanap, getKamarPasienRanap } from '@/lib/actions/ranap';
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
  const [formOpen, setFormOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("khanza_diet_pasien_form_open");
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });
  const toggleForm = useCallback(() => {
    setFormOpen((prev: boolean) => {
      const next = !prev;
      if (typeof window !== "undefined")
        localStorage.setItem("khanza_diet_pasien_form_open", JSON.stringify(next));
      return next;
    });
  }, []);
  const [dialogPegawaiOpen, setDialogPegawaiOpen] = useState(false);
  const handlePilihPegawai = (nik: string, nama: string) => {
    setPegawaiNik(nik);
    setPegawaiNama(nama);
    setDialogPegawaiOpen(false);
  };

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

  const [isEditMode, setIsEditMode] = useState(false);
  const [oldPk, setOldPk] = useState<{no_rawat: string; tanggal: string; waktu: string; kd_diet: string} | null>(null);
  const [formTanggal, setFormTanggal] = useState(today);
  const [formWaktu, setFormWaktu] = useState('');
  const [formKdDiet, setFormKdDiet] = useState('');
  const [formNmDiet, setFormNmDiet] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formKdKamar, setFormKdKamar] = useState('');

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

  const fetchKamar = useCallback(async (nrw: string) => {
    if (!nrw.trim()) return;
    try {
      const result = await getKamarPasienRanap(nrw);
      if (result.success && result.data) {
        setFormKdKamar(result.data.kd_kamar);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchPegawaiInfo();
    if (noRawatParam) {
      fetchPatientInfo(noRawatParam);
      fetchKamar(noRawatParam);
    }
  }, [noRawatParam, fetchPatientInfo, fetchPegawaiInfo, fetchKamar]);

  useEffect(() => {
    if (noRawat) fetchDiet(noRawat, searchKeyword, tglAwal, tglAkhir);
  }, [noRawat, searchKeyword, tglAwal, tglAkhir]);

  if (!mounted) return null;

  const resetForm = () => {
    setFormTanggal(today);
    setFormWaktu('');
    setFormKdDiet('');
    setFormNmDiet('');
    setFormKeterangan('');
    setFormKdKamar('');
    setIsEditMode(false);
    setOldPk(null);
    setSelectedRows([]);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    if (noRawat) fetchKamar(noRawat);
  };

  const populateFormFromRow = (row: any) => {
    setFormTanggal(row.tanggal ?? '');
    setFormWaktu(row.waktu ?? '');
    setFormKdDiet(row.kd_diet ?? '');
    setFormNmDiet(row.nama_diet ?? '');
    setFormKeterangan(row.keterangan ?? '');
    setFormKdKamar(row.kd_kamar ?? '');
    setCurrentDate(row.tanggal || currentDate);
    setOldPk({ no_rawat: row.no_rawat, tanggal: row.tanggal, waktu: row.waktu, kd_diet: row.kd_diet });
    setIsEditMode(true);
    setFormOpen(true);
  };

  const handleSimpanDiet = async () => {
    if (!noRawat) return;
    if (!formWaktu) { alert('Silakan pilih waktu diet terlebih dahulu.'); return; }
    if (!formKdDiet) { alert('Silakan pilih diet terlebih dahulu.'); return; }
    if (!formKdKamar) { alert('Kamar pasien belum ditemukan.'); return; }

    const payload = {
      no_rawat: noRawat,
      kd_kamar: formKdKamar,
      tanggal: formTanggal,
      waktu: formWaktu,
      kd_diet: formKdDiet,
      keterangan: formKeterangan,
    };

    let result;
    if (isEditMode && oldPk) {
      result = await editDietPasienRanap(oldPk.no_rawat, oldPk.tanggal, oldPk.waktu, oldPk.kd_diet, payload);
    } else {
      result = await simpanDietPasienRanap(payload);
    }

    if (result.success) {
      resetForm();
      fetchDiet(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruDiet = () => {
    resetForm();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusDiet = async () => {
    if (!oldPk) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data diet pasien ini?')) return;
    const result = await hapusDietPasienRanap(oldPk.no_rawat, oldPk.tanggal, oldPk.waktu, oldPk.kd_diet);
    if (result.success) {
      resetForm();
      fetchDiet(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiDiet = async () => {
    if (!isEditMode || !oldPk) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanDiet();
  };

  const handleBottomSearch = () => fetchDiet(noRawat, searchKeyword, tglAwal, tglAkhir);

  const handleEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = (e.currentTarget as HTMLElement).closest('[data-form]');
      if (!form) return;
      const inputs = form.querySelectorAll<HTMLInputElement>('input:not([readonly])');
      const currentIdx = Array.from(inputs).indexOf(e.currentTarget as HTMLInputElement);
      if (currentIdx >= 0 && currentIdx < inputs.length - 1) {
        inputs[currentIdx + 1].focus();
      }
    }
  };

  const handleKdDietChange = (val: string) => {
    setFormKdDiet(val);
    const found = dietOptions.find(d => d.kd_diet === val);
    setFormNmDiet(found ? found.nama_diet : '');
  };

  return (
    <>
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 pt-0 pb-2 relative">
        <div className="flex flex-col min-h-full w-full">
          <TopFormContainer title="Form Input Diet Pasien" isOpen={formOpen}>
              <div data-form="diet" className="flex flex-col gap-5">
                <FormSection className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 w-18 sm:w-20 shrink-0">Nama Pasien</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1 w-35 bg-slate-50 text-xs focus:outline-none focus:border-brand-500" value={noRawat} readOnly />
                  </div>
                  <input type="text" className="border border-slate-300 rounded px-2 py-1 w-16 bg-slate-50 text-xs focus:outline-none focus:border-brand-500" value={isLoadingPatient ? '...' : noRM} readOnly placeholder="RM" />
                  <input type="text" className="border border-slate-300 rounded px-2 py-1 w-75 bg-slate-50 text-xs focus:outline-none focus:border-brand-500" value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama" />
                  <div className="ml-auto flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 w-10 sm:w-12 shrink-0">Tanggal</label>
                    <input type="date" className="border border-slate-300 rounded px-2 py-1 text-xs w-30 focus:outline-none focus:border-brand-500 bg-white" value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
                    <input type="time" step="1" className="border border-slate-300 rounded px-2 py-1 text-xs w-25 focus:outline-none focus:border-brand-500 bg-white" value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
                    <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60" checked={isClockRunning} disabled title="Jam selalu real-time" />
                  </div>
                </FormSection>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">Data Diet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 shrink-0">Tanggal</label>
                    <input type="date" value={formTanggal} onChange={e => setFormTanggal(e.target.value)} onKeyDown={handleEnterKeyDown}
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
                    <input type="text" value={formKdDiet} onChange={e => handleKdDietChange(e.target.value)} onKeyDown={handleEnterKeyDown}
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
                    <input type="text" value={formKeterangan} onChange={e => setFormKeterangan(e.target.value)} onKeyDown={handleEnterKeyDown}
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100" placeholder="Keterangan diet..." />
                  </div>
                </div>
              </div>
              <FormSection>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">Dilakukan Oleh</label>
                  <div className="flex gap-1 flex-1">
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 w-24 focus:outline-none focus:border-brand-500 text-xs bg-slate-50" value={pegawaiNik} readOnly />
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 w-75 focus:outline-none focus:border-brand-500 text-xs bg-slate-50" value={pegawaiNama} readOnly />
                    <button onClick={() => setDialogPegawaiOpen(true)} className="px-2 text-brand-500 hover:bg-brand-50 rounded border border-transparent hover:border-brand-200 transition-colors" title="Pilih Petugas"><FaEdit /></button>
                  </div>
                </div>
              </FormSection>
            </div>
          </TopFormContainer>

          <div className={`flex flex-col flex-1 min-h-0 transition-all duration-150 ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <DataTableMulti
              title="Data Diet Pasien"
              icon={<FaUtensils />}
              onRefresh={handleBottomSearch}
              onTitleClick={toggleForm}
              titleChevronOpen={formOpen}
              columns={columns}
              data={dietData}
              idKey="id"
              selectedIds={selectedRows}
              onSelectionChange={setSelectedRows}
              onRowClick={(row: any) => populateFormFromRow(row)}
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
                    onRowClick={(row: any) => populateFormFromRow(row)}
                    isLoading={isLoadingData}
                  />
                </div>
              </motion.div>
            </>)}
          </AnimatePresence>
        </div>
      </div>

      <DialogPilihPegawai
        open={dialogPegawaiOpen}
        onClose={() => setDialogPegawaiOpen(false)}
        onSelect={handlePilihPegawai}
      />
      <BottomActionPanel buttonsAlign="left"
        onSave={handleSimpanDiet}
        onNew={handleBaruDiet}
        onReplace={handleGantiDiet}
        onDelete={handleHapusDiet}
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
