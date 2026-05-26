"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaBed, FaEdit, FaExpand, FaCompress } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import { getPatientInfoByNoRawat, getPemeriksaanRanap, getLoggedInPegawai, simpanPemeriksaanRanap, editPemeriksaanRanap, hapusPemeriksaanRanap } from '@/lib/actions/ranap';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';

interface PemeriksaanRow {
  id?: string;
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_perawatan: string; jam_rawat: string; suhu_tubuh: string;
  tensi: string; nadi: string; respirasi: string; tinggi: string;
  berat: string; spo2: string; gcs: string; kesadaran: string;
  keluhan: string; pemeriksaan: string; alergi: string;
  penilaian: string; rtl: string; instruksi: string;
  evaluasi: string; nip: string; nm_pegawai: string; jabatan: string;
}

const columns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.R.M.', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Tgl.Rawat', key: 'tgl_perawatan', width: '100px' },
  { header: 'Jam', key: 'jam_rawat', width: '80px' },
  { header: 'Suhu(C)', key: 'suhu_tubuh', width: '80px' },
  { header: 'Tensi', key: 'tensi', width: '80px' },
  { header: 'Nadi(/mnt)', key: 'nadi', width: '80px' },
  { header: 'Respirasi(/mnt)', key: 'respirasi', width: '112px' },
  { header: 'Tinggi(Cm)', key: 'tinggi', width: '90px' },
  { header: 'Berat(Kg)', key: 'berat', width: '80px' },
  { header: 'SpO2(%)', key: 'spo2', width: '80px' },
  { header: 'GCS(E,V,M)', key: 'gcs', width: '90px' },
  { header: 'Kesadaran', key: 'kesadaran', width: '140px' },
  { header: 'Subjek', key: 'keluhan', width: '180px', className: 'truncate' },
  { header: 'Objek', key: 'pemeriksaan', width: '180px', className: 'truncate' },
  { header: 'Alergi', key: 'alergi', width: '180px', className: 'truncate' },
  { header: 'Asesmen', key: 'penilaian', width: '180px', className: 'truncate' },
  { header: 'Plan', key: 'rtl', width: '180px', className: 'truncate' },
  { header: 'Instruksi', key: 'instruksi', width: '180px', className: 'truncate' },
  { header: 'Evaluasi', key: 'evaluasi', width: '180px', className: 'truncate' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Dokter/Paramedis', key: 'nm_pegawai', width: '160px' },
  { header: 'Profesi/Jabatan', key: 'jabatan', width: '130px' },
];

function PemeriksaanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('cppt');
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Patient info
  const [noRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState('');
  const [namaPasien, setNamaPasien] = useState('');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Pemeriksaan data
  const [pemeriksaanData, setPemeriksaanData] = useState<PemeriksaanRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // BottomPanel filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [tglAwal, setTglAwal] = useState(today);
  const [tglAkhir, setTglAkhir] = useState(today);

  // Logged-in pegawai info
  const [pegawaiNik, setPegawaiNik] = useState('');
  const [pegawaiNama, setPegawaiNama] = useState('');

  // Edit state
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Alasan dialog
  const [alasanDialog, setAlasanDialog] = useState<{ open: boolean; mode: 'ganti' | 'hapus' }>({ open: false, mode: 'ganti' });
  const [alasanText, setAlasanText] = useState('');

  // Form state — SOAPIE + TTV
  const [formKeluhan, setFormKeluhan] = useState('');
  const [formPemeriksaan, setFormPemeriksaan] = useState('');
  const [formAlergi, setFormAlergi] = useState('');
  const [formPenilaian, setFormPenilaian] = useState('');
  const [formRtl, setFormRtl] = useState('');
  const [formInstruksi, setFormInstruksi] = useState('');
  const [formEvaluasi, setFormEvaluasi] = useState('');
  const [formSuhu, setFormSuhu] = useState('');
  const [formTensi, setFormTensi] = useState('');
  const [formNadi, setFormNadi] = useState('');
  const [formRespirasi, setFormRespirasi] = useState('');
  const [formTinggi, setFormTinggi] = useState('');
  const [formBerat, setFormBerat] = useState('');
  const [formSpo2, setFormSpo2] = useState('');
  const [formGcs, setFormGcs] = useState('');
  const [formKesadaran, setFormKesadaran] = useState('');

  // Real-time clock
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [currentDate, setCurrentDate] = useState(today);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 8));
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clock effect
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

  const fetchPemeriksaan = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingData(true);
    try {
      const result = await getPemeriksaanRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any, i: number) => ({
          ...row,
          id: `${row.tgl_perawatan}-${row.jam_rawat}-${i}`
        }));
        setPemeriksaanData(mappedData);
      }
      else setPemeriksaanData([]);
    } catch { setPemeriksaanData([]); }
    setIsLoadingData(false);
  }, []);

  const fetchPegawaiInfo = useCallback(async () => {
    try {
      const result = await getLoggedInPegawai();
      if (result.success && result.data) {
        setPegawaiNik(result.data.nik);
        setPegawaiNama(result.data.nama);
      }
    } catch { }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchPegawaiInfo();
    if (noRawatParam) {
      fetchPatientInfo(noRawatParam);
    }
  }, [noRawatParam, fetchPatientInfo, fetchPemeriksaan, fetchPegawaiInfo]);

  useEffect(() => {
    if (noRawat) fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
  }, [noRawat, searchKeyword, tglAwal, tglAkhir]);

  const resetForm = () => {
    setFormKeluhan('');
    setFormPemeriksaan('');
    setFormAlergi('');
    setFormPenilaian('');
    setFormRtl('');
    setFormInstruksi('');
    setFormEvaluasi('');
    setFormSuhu('');
    setFormTensi('');
    setFormNadi('');
    setFormRespirasi('');
    setFormTinggi('');
    setFormBerat('');
    setFormSpo2('');
    setFormGcs('');
    setFormKesadaran('');
    setSelectedRowIdx(null);
    setIsEditMode(false);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormFromRow = (row: PemeriksaanRow, idx: number) => {
    setFormKeluhan(row.keluhan || '');
    setFormPemeriksaan(row.pemeriksaan || '');
    setFormAlergi(row.alergi || '');
    setFormPenilaian(row.penilaian || '');
    setFormRtl(row.rtl || '');
    setFormInstruksi(row.instruksi || '');
    setFormEvaluasi(row.evaluasi || '');
    setFormSuhu(row.suhu_tubuh || '');
    setFormTensi(row.tensi || '');
    setFormNadi(row.nadi || '');
    setFormRespirasi(row.respirasi || '');
    setFormTinggi(row.tinggi || '');
    setFormBerat(row.berat || '');
    setFormSpo2(row.spo2 || '');
    setFormGcs(row.gcs || '');
    setFormKesadaran(row.kesadaran || '');
    setCurrentDate(row.tgl_perawatan || today);
    setCurrentTime(row.jam_rawat || '00:00:00');
    setSelectedRowIdx(idx);
    setIsEditMode(true);
  };

  const getFormData = () => ({
    no_rawat: noRawat,
    tgl_perawatan: currentDate,
    jam_rawat: currentTime,
    suhu_tubuh: formSuhu,
    tensi: formTensi,
    nadi: formNadi,
    respirasi: formRespirasi,
    tinggi: formTinggi,
    berat: formBerat,
    spo2: formSpo2,
    gcs: formGcs,
    kesadaran: formKesadaran,
    keluhan: formKeluhan,
    pemeriksaan: formPemeriksaan,
    alergi: formAlergi,
    penilaian: formPenilaian,
    rtl: formRtl,
    instruksi: formInstruksi,
    evaluasi: formEvaluasi,
    nip: pegawaiNik,
  });

  const isFormEmpty = () => {
    return !formKeluhan.trim() && !formPemeriksaan.trim() && !formSuhu.trim() &&
      !formTensi.trim() && !formAlergi.trim() && !formTinggi.trim() &&
      !formBerat.trim() && !formRespirasi.trim() && !formNadi.trim() &&
      !formGcs.trim() && !formRtl.trim() && !formPenilaian.trim() &&
      !formInstruksi.trim() && !formSpo2.trim() && !formEvaluasi.trim();
  };

  // Handlers

  const handleSave = async () => {
    if (isFormEmpty()) { alert('Isi minimal satu data pemeriksaan terlebih dahulu!'); return; }
    if (!pegawaiNik.trim()) { alert('Dokter/Paramedis masih kosong!'); return; }
    setIsSaving(true);
    try {
      const result = await simpanPemeriksaanRanap(getFormData());
      if (result.success) {
        resetForm();
        fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
      } else {
        alert(result.message || 'Gagal menyimpan data');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    }
    setIsSaving(false);
  };

  const handleNew = () => {
    resetForm();
    setSelectedRows([]);
  };

  const handleReplace = async () => {
    if (selectedRowIdx === null) { alert('Silahkan pilih data yang mau diganti dari tabel terlebih dahulu!'); return; }
    if (isFormEmpty()) { alert('Isi minimal satu data pemeriksaan terlebih dahulu!'); return; }
    if (!pegawaiNik.trim()) { alert('Dokter/Paramedis masih kosong!'); return; }
    setAlasanText('');
    setAlasanDialog({ open: true, mode: 'ganti' });
  };

  const confirmReplace = async () => {
    if (!alasanText.trim()) { alert('Alasan tidak boleh kosong!'); return; }
    setAlasanDialog({ open: false, mode: 'ganti' });
    setIsSaving(true);
    try {
      const row = pemeriksaanData[selectedRowIdx!];
      const result = await editPemeriksaanRanap(
        { no_rawat: row.no_rawat, tgl_perawatan: row.tgl_perawatan, jam_rawat: row.jam_rawat },
        getFormData(),
        alasanText.trim(),
      );
      if (result.success) {
        resetForm();
        fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
      } else {
        alert(result.message || 'Gagal mengubah data');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    const idsToDelete = selectedRows;
    if (idsToDelete.length === 0) { alert('Silahkan centang data yang mau dihapus terlebih dahulu!'); return; }
    setAlasanText('');
    setAlasanDialog({ open: true, mode: 'hapus' });
  };

  const confirmDelete = async () => {
    if (!alasanText.trim()) { alert('Alasan tidak boleh kosong!'); return; }
    setAlasanDialog({ open: false, mode: 'hapus' });
    const idsToDelete = selectedRows;
    setIsSaving(true);
    try {
      for (const id of idsToDelete) {
        const row = pemeriksaanData.find(r => r.id === id);
        if (!row) continue;
        const result = await hapusPemeriksaanRanap(row.no_rawat, row.tgl_perawatan, row.jam_rawat, alasanText.trim(), pegawaiNik);
        if (!result.success) {
          alert(result.message || `Gagal menghapus data ${row.tgl_perawatan} ${row.jam_rawat}`);
        }
      }
      setSelectedRows([]);
      resetForm();
      fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    }
    setIsSaving(false);
  };

  const handlePrint = () => {
    const url = `/rawat-inap/print/cppt?noRawat=${encodeURIComponent(noRawat)}&tglAwal=${encodeURIComponent(tglAwal)}&tglAkhir=${encodeURIComponent(tglAkhir)}`;
    window.open(url, '_blank');
  };

  const handleBottomSearch = () => fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);

  if (!mounted) return null;

  return (
    <>

      {/* Bar Info Pasien Atas */}
      <div className="bg-white border-b border-slate-200 p-3 shrink-0 flex flex-wrap gap-2 items-center text-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <label className="font-semibold text-slate-600 shrink-0">Pasien :</label>
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-33 bg-slate-50 focus:outline-none focus:border-brand-500" value={noRawat} readOnly />
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-16 bg-slate-50 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? '...' : noRM} readOnly placeholder="No. RM" />
        </div>
        <div className="flex items-center gap-1 w-full md:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-70 bg-slate-50 focus:outline-none focus:border-brand-500"
            value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama Pasien" />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto w-full sm:w-auto">
          <label className="font-semibold text-slate-600">Tanggal :</label>
          <input type="date" className="border border-slate-300 rounded px-2 py-1 mr-1 focus:outline-none sm:w-27 focus:border-brand-500"
            value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
          <input type="time" step="1" className="border border-slate-300 rounded px-2 py-1 text-xs w-27 focus:outline-none focus:border-brand-500 bg-white"
            value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
          <input type="checkbox" className="accent-brand-500 w-4 h-4 ml-2 opacity-60"
            checked={isClockRunning} disabled title="Jam selalu real-time" />
        </div>
      </div>

      {/* Tab */}
      <div className="flex bg-white border-b border-slate-200 px-2 md:px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {['Penanganan Dokter', 'Penanganan Petugas', 'Penanganan Dokter & Petugas', 'Pemeriksaan / CPPT', 'Pemeriksaan Obstetri', 'Pemeriksaan Ginekologi'].map(tab => {
          const tabId = tab.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isActive = activeTab === (tab === 'Pemeriksaan / CPPT' ? 'cppt' : tabId);
          return (
            <button key={tab} onClick={() => setActiveTab(tab === 'Pemeriksaan / CPPT' ? 'cppt' : tabId)}
              className={`px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap relative ${isActive ? 'text-brand-700 font-bold' : 'text-slate-500 hover:text-brand-600'}`}>
              {tab}
              {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Konten Tab */}
      <div className="flex-1 overflow-auto bg-white pt-0 pb-2 relative">
        {activeTab === 'cppt' && (
          <div className="flex flex-col min-h-full w-full">
            <TopFormContainer title="Form Input Pemeriksaan / CPPT" persistenceKey="khanza_cppt_form_open">
              <div className="flex flex-col gap-5">
              {/* SOAP, Instruksi & Alergi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0 pt-2">Subjek</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-15 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Keluhan pasien..."
                    value={formKeluhan} onChange={e => setFormKeluhan(e.target.value)} />
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0 pt-2">Objek</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-15 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Hasil pemeriksaan..."
                    value={formPemeriksaan} onChange={e => setFormPemeriksaan(e.target.value)} />
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0 pt-2">Asesmen</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-15 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Diagnosis/Asesmen..."
                    value={formPenilaian} onChange={e => setFormPenilaian(e.target.value)} />
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0 pt-2">Plan</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-15 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Rencana tindakan..."
                    value={formRtl} onChange={e => setFormRtl(e.target.value)} />
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0 pt-2">Instruksi</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-15 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Instruksi medis..."
                    value={formInstruksi} onChange={e => setFormInstruksi(e.target.value)} />
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0 pt-2">Evaluasi</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-15 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Evaluasi tindakan..."
                    value={formEvaluasi} onChange={e => setFormEvaluasi(e.target.value)} />
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0 pt-2">Alergi</label>
                  <textarea className="border border-slate-300 rounded p-2 flex-1 h-15 resize-none focus:outline-none focus:border-brand-500 text-xs" placeholder="Alergi pasien..."
                    value={formAlergi} onChange={e => setFormAlergi(e.target.value)} />
                </div>
              </div>

              {/* TTV */}
              <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">Tanda-Tanda Vital (TTV)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">Suhu (°C)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formSuhu} onChange={e => setFormSuhu(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">Tensi (mmHg)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formTensi} onChange={e => setFormTensi(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">Berat (Kg)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formBerat} onChange={e => setFormBerat(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">Tinggi (Cm)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formTinggi} onChange={e => setFormTinggi(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">Respirasi (/mnt)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formRespirasi} onChange={e => setFormRespirasi(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">Nadi (/mnt)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formNadi} onChange={e => setFormNadi(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">SpO2 (%)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formSpo2} onChange={e => setFormSpo2(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">GCS (E,V,M)</label>
                    <input type="text" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formGcs} onChange={e => setFormGcs(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">Kesadaran</label>
                    <select className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={formKesadaran} onChange={e => setFormKesadaran(e.target.value)}>
                      <option value="">-</option><option value="Compos Mentis">Compos Mentis</option><option value="Somnolence">Somnolence</option><option value="Sopor">Sopor</option><option value="Coma">Coma</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Petugas */}
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

            {/* Tabel Inline */}
            <div className={`flex flex-col flex-1 min-h-0 transition-all duration-150 ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DataTableMulti
                title="Riwayat Pemeriksaan / CPPT"
                icon={<FaBed />}
                onRefresh={handleBottomSearch}
                columns={columns}
                data={pemeriksaanData}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
                isLoading={isLoadingData}
                emptyMessage="Tidak ada data pemeriksaan yang ditemukan."
                onRowClick={(row: any) => {
                  const idx = pemeriksaanData.findIndex(r => r.id === row.id);
                  if (idx >= 0) populateFormFromRow(row, idx);
                }}
              />
            </div>

            {/* Modal Tabel Diperluas */}
            <AnimatePresence>
              {isTableExpanded && (<>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                  className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 p-4 shadow-2xl rounded-xl border border-slate-300 flex flex-col">
                  <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                    <h3 className="font-bold text-slate-700 text-[13px]">Tabel Riwayat Pemeriksaan / CPPT</h3>
                    <button onClick={() => setIsTableExpanded(false)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                      <FaCompress className="text-[10px]" /> Perkecil
                    </button>
                  </div>
                  <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                    <DataTableMulti
                      columns={columns}
                      data={pemeriksaanData}
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
        )}

        {activeTab !== 'cppt' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            Menu {activeTab.toUpperCase()} belum tersedia (Demo)
          </div>
        )}
      </div>

      {/* Dialog Alasan untuk Ganti/Hapus */}
      <AnimatePresence>
        {alasanDialog.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setAlasanDialog({ ...alasanDialog, open: false })}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-300 w-96 p-5"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-sm text-slate-700 mb-3">
                {alasanDialog.mode === 'ganti' ? 'Masukkan alasan edit data:' : 'Masukkan alasan hapus data:'}
              </h3>
              <textarea className="border border-slate-300 rounded p-2 w-full h-20 resize-none focus:outline-none focus:border-brand-500 text-xs"
                placeholder="Alasan..." value={alasanText} onChange={e => setAlasanText(e.target.value)} autoFocus />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setAlasanDialog({ ...alasanDialog, open: false })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-600 transition-colors">
                  Batal
                </button>
                <button onClick={alasanDialog.mode === 'ganti' ? confirmReplace : confirmDelete}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold transition-colors">
                  Konfirmasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fitur 1 & 2: BottomPanel dengan filter periode + pencarian */}
      <BottomActionPanel
        recordCount={pemeriksaanData.length}
        onSave={handleSave}
        onNew={handleNew}
        onReplace={handleReplace}
        onDelete={handleDelete}
        onPrint={handlePrint}
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

export default function PemeriksaanRawatInap() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <PemeriksaanContent />
    </Suspense>
  );
}
