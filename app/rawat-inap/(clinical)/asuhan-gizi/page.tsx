"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaUtensils, FaEdit, FaCompress, FaHistory } from 'react-icons/fa';
import FormSection from '@/components/FormSection';
import { Button } from '@/components/ui/button';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import { getPatientInfoByNoRawat, getAsuhanGiziRanap, simpanAsuhanGiziRanap, editAsuhanGiziRanap, hapusAsuhanGiziRanap, getMonitoringGiziRanap, simpanMonitoringGiziRanap, editMonitoringGiziRanap, hapusMonitoringGiziRanap, getSkriningGiziLanjutRanap, simpanSkriningGiziLanjutRanap, editSkriningGiziLanjutRanap, hapusSkriningGiziLanjutRanap, getCatatanADIMEGiziRanap, simpanCatatanADIMEGiziRanap, editCatatanADIMEGiziRanap, hapusCatatanADIMEGiziRanap, getLoggedInPegawai } from '@/lib/actions/ranap';
import DataTableMulti from '@/components/DataTableMulti';
import DialogPilihPegawai from '@/components/DialogPilihPegawai';
import { TableColumn } from '@/components/TableTypes';

interface MonitoringGiziRow {
  id: string; no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  umurdaftar: string; sttsumur: string; jk: string;
  tanggal: string; monitoring: string; evaluasi: string;
  nip: string; nm_petugas: string;
}

interface SkriningGiziLanjutRow {
  id: string; no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  umurdaftar: string; sttsumur: string; jk: string;
  tanggal: string; bb: string; tb: string; alergi: string;
  parameter_imt: string; skor_imt: string;
  parameter_bb: string; skor_bb: string;
  parameter_penyakit: string; skor_penyakit: string;
  skor_total: string; kesimpulan: string;
  nip: string; nm_petugas: string;
}

interface CatatanADIMERow {
  id: string; no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  umurdaftar: string; sttsumur: string; jk: string;
  tanggal: string; asesmen: string; diagnosis: string;
  intervensi: string; monitoring: string; evaluasi: string;
  instruksi: string; nip: string; nm_petugas: string;
}

interface AsuhanGiziRow {
  id?: string;
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  jk: string; tgl_lahir: string; tgl_asuhan: string;
  bb: number; tb: number; imt: number; lla: number; tl: number;
  ulna: number; lla_u: number; bb_ideal: number; bb_u: number;
  tku: number; bb_tb: number; lla_u_persen: number;
  subjektif: string; fisik_klinis: string;
  telur: boolean; susu_sapi: boolean; kacang: boolean; gluten: boolean;
  udang: boolean; ikan: boolean; hazelnut: boolean;
  pola_makan: string; nip: string; nm_pegawai: string; jabatan: string;
}

const columns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.R.M.', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'J.K.', key: 'jk', width: '40px' },
  { header: 'Tgl.Lahir', key: 'tgl_lahir', width: '100px' },
  { header: 'Tgl.Asuhan', key: 'tgl_asuhan', width: '100px' },
  { header: 'BB(Kg)', key: 'bb', width: '70px' },
  { header: 'TB(Cm)', key: 'tb', width: '70px' },
  { header: 'IMT', key: 'imt', width: '70px' },
  { header: 'LLA(Cm)', key: 'lla', width: '70px' },
  { header: 'TL(Cm)', key: 'tl', width: '60px' },
  { header: 'ULNA(Cm)', key: 'ulna', width: '70px' },
  { header: 'LLA/U', key: 'lla_u', width: '60px' },
  { header: 'BB Ideal', key: 'bb_ideal', width: '70px' },
  { header: 'BB/U(SD)', key: 'bb_u', width: '80px' },
  { header: 'TKU(SD)', key: 'tku', width: '70px' },
  { header: 'BB/TB(SD)', key: 'bb_tb', width: '80px' },
  { header: 'LLA/U(SD)', key: 'lla_u_persen', width: '80px' },
  { header: 'Subjektif', key: 'subjektif', width: '180px', className: 'truncate' },
  { header: 'Fisik/Klinis', key: 'fisik_klinis', width: '180px', className: 'truncate' },
  { header: 'Telur', key: 'telur', width: '50px', render: (row) => (row.telur === true || row.telur === 1 ? 'Ya' : 'Tidak') },
  { header: 'Susu Sapi', key: 'susu_sapi', width: '70px', render: (row) => (row.susu_sapi === true || row.susu_sapi === 1 ? 'Ya' : 'Tidak') },
  { header: 'Kacang', key: 'kacang', width: '60px', render: (row) => (row.kacang === true || row.kacang === 1 ? 'Ya' : 'Tidak') },
  { header: 'Gluten', key: 'gluten', width: '60px', render: (row) => (row.gluten === true || row.gluten === 1 ? 'Ya' : 'Tidak') },
  { header: 'Udang', key: 'udang', width: '55px', render: (row) => (row.udang === true || row.udang === 1 ? 'Ya' : 'Tidak') },
  { header: 'Ikan', key: 'ikan', width: '50px', render: (row) => (row.ikan === true || row.ikan === 1 ? 'Ya' : 'Tidak') },
  { header: 'Hazelnut', key: 'hazelnut', width: '65px', render: (row) => (row.hazelnut === true || row.hazelnut === 1 ? 'Ya' : 'Tidak') },
  { header: 'Pola Makan', key: 'pola_makan', width: '180px', className: 'truncate' },
  { header: 'Petugas', key: 'nm_pegawai', width: '160px' },
  { header: 'Jabatan', key: 'jabatan', width: '100px' },
];

const monitoringColumns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.R.M.', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Umur', key: 'umurdaftar', width: '60px' },
  { header: 'JK', key: 'jk', width: '30px' },
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'Monitoring', key: 'monitoring', width: '250px', className: 'truncate' },
  { header: 'Evaluasi', key: 'evaluasi', width: '250px', className: 'truncate' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

const skriningGiziLanjutColumns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.R.M.', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Umur', key: 'umurdaftar', width: '60px' },
  { header: 'JK', key: 'jk', width: '30px' },
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'BB', key: 'bb', width: '40px' },
  { header: 'TB', key: 'tb', width: '40px' },
  { header: 'Alergi', key: 'alergi', width: '100px', className: 'truncate' },
  { header: 'Skor IMT', key: 'parameter_imt', width: '120px', className: 'truncate' },
  { header: 'Skor 1', key: 'skor_imt', width: '50px' },
  { header: 'Kehilangan BB', key: 'parameter_bb', width: '120px', className: 'truncate' },
  { header: 'Skor 2', key: 'skor_bb', width: '50px' },
  { header: 'Efek Penyakit', key: 'parameter_penyakit', width: '160px', className: 'truncate' },
  { header: 'Skor 3', key: 'skor_penyakit', width: '50px' },
  { header: 'Ttl.Skor', key: 'skor_total', width: '60px' },
  { header: 'Kesimpulan', key: 'kesimpulan', width: '250px', className: 'truncate' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

const catatanADIMEColumns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.R.M.', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Umur', key: 'umurdaftar', width: '60px' },
  { header: 'JK', key: 'jk', width: '30px' },
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'Asesmen', key: 'asesmen', width: '250px', className: 'truncate' },
  { header: 'Diagnosis', key: 'diagnosis', width: '250px', className: 'truncate' },
  { header: 'Intervensi', key: 'intervensi', width: '250px', className: 'truncate' },
  { header: 'Monitoring', key: 'monitoring', width: '250px', className: 'truncate' },
  { header: 'Evaluasi', key: 'evaluasi', width: '250px', className: 'truncate' },
  { header: 'Instruksi', key: 'instruksi', width: '250px', className: 'truncate' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

function AllergyItem({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100 last:border-0 sm:border-0 sm:py-0">
      <span className="text-[11px] text-slate-700 leading-tight pr-2">{label}</span>
      <div className="flex items-center gap-3 shrink-0">
        <label className="flex items-center gap-1.5 cursor-pointer group">
          <input type="radio" name={label} checked={value} onChange={() => onChange(true)} className="accent-brand-500 w-3.5 h-3.5 cursor-pointer" />
          <span className="text-[11px] text-slate-600 group-hover:text-brand-600 transition-colors">Ya</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer group">
          <input type="radio" name={label} checked={!value} onChange={() => onChange(false)} className="accent-brand-500 w-3.5 h-3.5 cursor-pointer" />
          <span className="text-[11px] text-slate-600 group-hover:text-brand-600 transition-colors">Tidak</span>
        </label>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, unit, placeholder, type = 'text', readOnly = false, className = "", onKeyDown }: {
  label: string; value: string; onChange?: (v: string) => void; unit?: string; placeholder?: string; type?: string; readOnly?: boolean; className?: string; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0 flex items-center gap-1">
        {label}
        {unit && <span className="text-[10px] text-slate-400 font-normal lowercase">({unit})</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`flex-1 min-w-0 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors ${readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-start gap-2">
      <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0 pt-2">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white resize-y min-h-[80px]"
      />
    </div>
  );
}

function AsuhanGiziContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('asuhangizi');
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [formOpen, setFormOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("khanza_asuhan_gizi_form_open");
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });

  const toggleForm = useCallback(() => {
    setFormOpen((prev: boolean) => {
      const next = !prev;
      if (typeof window !== "undefined")
        localStorage.setItem("khanza_asuhan_gizi_form_open", JSON.stringify(next));
      return next;
    });
  }, []);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [noRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState('');
  const [namaPasien, setNamaPasien] = useState('');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  const [dataGizi, setDataGizi] = useState<AsuhanGiziRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [tglAwal, setTglAwal] = useState(today);
  const [tglAkhir, setTglAkhir] = useState(today);

  const [pegawaiNik, setPegawaiNik] = useState('');
  const [pegawaiNama, setPegawaiNama] = useState('');
  const [dialogPegawaiOpen, setDialogPegawaiOpen] = useState(false);

  // Form state
  const [bb, setBb] = useState('');
  const [tb, setTb] = useState('');
  const [imt, setImt] = useState('');
  const [lla, setLla] = useState('');
  const [tl, setTl] = useState('');
  const [ulna, setUlna] = useState('');
  const [llaU, setLlaU] = useState('');
  const [bbIdeal, setBbIdeal] = useState('');
  const [bbU, setBbU] = useState('');
  const [tku, setTku] = useState('');
  const [bbTb, setBbTb] = useState('');
  const [llaUPersen, setLlaUPersen] = useState('');
  const [biokimia, setBiokimia] = useState('');
  const [fisikKlinis, setFisikKlinis] = useState('');
  const [polaMakan, setPolaMakan] = useState('');
  const [riwayatPersonal, setRiwayatPersonal] = useState('');
  const [diagnosaGizi, setDiagnosaGizi] = useState('');
  const [intervensiGizi, setIntervensiGizi] = useState('');
  const [instruksi, setInstruksi] = useState('');
  const [monitoringEvaluasi, setMonitoringEvaluasi] = useState('');

  // Monitoring Gizi state
  const [dataMonitoring, setDataMonitoring] = useState<MonitoringGiziRow[]>([]);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [monitoringText, setMonitoringText] = useState('');
  const [evaluasiText, setEvaluasiText] = useState('');
  const [isEditModeMonitoring, setIsEditModeMonitoring] = useState(false);
  const [selectedRowIdxMonitoring, setSelectedRowIdxMonitoring] = useState<number | null>(null);

  // Skrining Gizi Lanjut state
  const [dataSkriningGizi, setDataSkriningGizi] = useState<SkriningGiziLanjutRow[]>([]);
  const [isLoadingSkriningGizi, setIsLoadingSkriningGizi] = useState(false);
  const [skriningGiziBB, setSkriningGiziBB] = useState('');
  const [skriningGiziTB, setSkriningGiziTB] = useState('');
  const [skriningGiziAlergi, setSkriningGiziAlergi] = useState('');
  const [skriningGiziIMT, setSkriningGiziIMT] = useState('');
  const [skriningGiziSkor1, setSkriningGiziSkor1] = useState("IMT > 20/z score > 2");
  const [skriningGiziSkor2, setSkriningGiziSkor2] = useState("BB Hilang < 5%");
  const [skriningGiziSkor3, setSkriningGiziSkor3] = useState("Ada asupan nutrisi > 5 hari");
  const [skriningGiziSkor1Val, setSkriningGiziSkor1Val] = useState("0");
  const [skriningGiziSkor2Val, setSkriningGiziSkor2Val] = useState("0");
  const [skriningGiziSkor3Val, setSkriningGiziSkor3Val] = useState("0");
  const [skriningGiziTotal, setSkriningGiziTotal] = useState("0");
  const [skriningGiziKesimpulan, setSkriningGiziKesimpulan] = useState("Beresiko rendah, ulangi 7 hari");
  const [isEditModeSkrining, setIsEditModeSkrining] = useState(false);
  const [selectedRowIdxSkrining, setSelectedRowIdxSkrining] = useState<number | null>(null);

  // Catatan ADIME Gizi state
  const [dataADIME, setDataADIME] = useState<CatatanADIMERow[]>([]);
  const [isLoadingADIME, setIsLoadingADIME] = useState(false);
  const [adimeAsesmen, setAdimeAsesmen] = useState('');
  const [adimeDiagnosis, setAdimeDiagnosis] = useState('');
  const [adimeIntervensi, setAdimeIntervensi] = useState('');
  const [adimeMonitoring, setAdimeMonitoring] = useState('');
  const [adimeEvaluasi, setAdimeEvaluasi] = useState('');
  const [adimeInstruksi, setAdimeInstruksi] = useState('');
  const [isEditModeADIME, setIsEditModeADIME] = useState(false);
  const [selectedRowIdxADIME, setSelectedRowIdxADIME] = useState<number | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);

  const [alergiTelur, setAlergiTelur] = useState(false);
  const [alergiSusuSapi, setAlergiSusuSapi] = useState(false);
  const [alergiKacang, setAlergiKacang] = useState(false);
  const [alergiGluten, setAlergiGluten] = useState(false);
  const [alergiUdang, setAlergiUdang] = useState(false);
  const [alergiIkan, setAlergiIkan] = useState(false);
  const [alergiHazelnut, setAlergiHazelnut] = useState(false);

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

  const fetchPatientInfo = useCallback(async (nrw: string) => {
    if (!nrw.trim()) return;
    setIsLoadingPatient(true);
    try {
      const result = await getPatientInfoByNoRawat(nrw);
      if (result.success && result.data) { setNoRM(result.data.no_rkm_medis); setNamaPasien(result.data.nm_pasien); }
      else { setNoRM(''); setNamaPasien(''); }
    } catch (e) { console.error('fetchPatientInfo error:', e); setNoRM(''); setNamaPasien(''); }
    setIsLoadingPatient(false);
  }, []);

  const fetchDataGizi = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingData(true);
    try {
      const result = await getAsuhanGiziRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any, i: number) => ({
          ...row,
          id: `${row.no_rawat}-${row.tgl_asuhan}`
        }));
        setDataGizi(mappedData);
      }
      else setDataGizi([]);
    } catch (e) { console.error('fetchDataGizi error:', e); setDataGizi([]); }
    setIsLoadingData(false);
  }, []);

  const fetchDataMonitoring = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingMonitoring(true);
    try {
      const result = await getMonitoringGiziRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any) => ({
          ...row,
          id: `${row.no_rawat}-${row.tanggal}`
        }));
        setDataMonitoring(mappedData);
      }
      else setDataMonitoring([]);
    } catch (e) { console.error('fetchDataMonitoring error:', e); setDataMonitoring([]); }
    setIsLoadingMonitoring(false);
  }, []);

  const fetchDataSkriningGizi = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingSkriningGizi(true);
    try {
      const result = await getSkriningGiziLanjutRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any) => ({
          ...row,
          id: `${row.no_rawat}-${row.tanggal}`
        }));
        setDataSkriningGizi(mappedData);
      }
      else setDataSkriningGizi([]);
    } catch (e) { console.error('fetchDataSkriningGizi error:', e); setDataSkriningGizi([]); }
    setIsLoadingSkriningGizi(false);
  }, []);

  const fetchDataADIME = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingADIME(true);
    try {
      const result = await getCatatanADIMEGiziRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any) => ({
          ...row,
          id: `${row.no_rawat}-${row.tanggal}`
        }));
        setDataADIME(mappedData);
      }
      else setDataADIME([]);
    } catch (e) { console.error('fetchDataADIME error:', e); setDataADIME([]); }
    setIsLoadingADIME(false);
  }, []);

  const handlePilihPegawai = (nik: string, nama: string) => {
    setPegawaiNik(nik);
    setPegawaiNama(nama);
    setDialogPegawaiOpen(false);
  };

  const fetchPegawaiInfo = useCallback(async () => {
    try {
      const result = await getLoggedInPegawai();
      if (result.success && result.data) {
        setPegawaiNik(result.data.nik);
        setPegawaiNama(result.data.nama);
      }
    } catch (e) { console.error('fetchPegawaiInfo error:', e); }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchPegawaiInfo();
    if (noRawatParam) {
      fetchPatientInfo(noRawatParam);
    }
  }, [noRawatParam, fetchPatientInfo, fetchPegawaiInfo]);

  useEffect(() => {
    if (noRawat) {
      fetchDataGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
      fetchDataMonitoring(noRawat, searchKeyword, tglAwal, tglAkhir);
      fetchDataSkriningGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
      fetchDataADIME(noRawat, searchKeyword, tglAwal, tglAkhir);
    }
  }, [noRawat, searchKeyword, tglAwal, tglAkhir]);

  // === Skrining Gizi scoring helpers (ported from RMDataSkriningGiziLanjut.java) ===
  const calcSkor1 = useCallback((combo: string) => {
    if (combo === "IMT 18,5-20/-2 =< z score =< 2") return 1;
    if (combo === "IMT < 18,5/z score < -2") return 2;
    return 0;
  }, []);
  const calcSkor2 = useCallback((combo: string) => {
    if (combo === "BB Hilang 5 - 10 %") return 1;
    if (combo === "BB Hilang > 10 %") return 2;
    return 0;
  }, []);
  const calcSkor3 = useCallback((combo: string) => {
    if (combo === "Tidak ada asupan nutrisi > 5 hari") return 2;
    return 0;
  }, []);
  const calcTotal = useCallback((s1: number, s2: number, s3: number) => s1 + s2 + s3, []);
  const calcKesimpulan = useCallback((total: number) => {
    if (total === 0) return "Beresiko rendah, ulangi 7 hari";
    if (total === 1) return "Beresiko menengah, monitoring asupan selama 3 hari";
    return "Beresiko tinggi, bekerja sama dengan tim dukungan gizi upayakan peningkatan asupan gizi dan memberikan makanan sesuai dengan daya terima";
  }, []);
  const calcIMT = useCallback((bb: string, tb: string) => {
    const bbNum = parseFloat(bb);
    const tbNum = parseFloat(tb);
    if (bbNum > 0 && tbNum > 0) {
      const bmi = bbNum / ((tbNum / 100) * (tbNum / 100));
      return bmi.toFixed(1);
    }
    return '';
  }, []);

  // Auto-calc IMT when BB or TB changes
  useEffect(() => {
    setSkriningGiziIMT(calcIMT(skriningGiziBB, skriningGiziTB));
  }, [skriningGiziBB, skriningGiziTB, calcIMT]);

  // Auto-calc scoring when combos change
  useEffect(() => {
    const s1 = calcSkor1(skriningGiziSkor1);
    const s2 = calcSkor2(skriningGiziSkor2);
    const s3 = calcSkor3(skriningGiziSkor3);
    setSkriningGiziSkor1Val(s1.toString());
    setSkriningGiziSkor2Val(s2.toString());
    setSkriningGiziSkor3Val(s3.toString());
    const total = calcTotal(s1, s2, s3);
    setSkriningGiziTotal(total.toString());
    setSkriningGiziKesimpulan(calcKesimpulan(total));
  }, [skriningGiziSkor1, skriningGiziSkor2, skriningGiziSkor3, calcSkor1, calcSkor2, calcSkor3, calcTotal, calcKesimpulan]);

  // Auto-calc IMT for Asuhan Gizi tab (matches Java isBMI())
  useEffect(() => {
    const bbNum = parseFloat(bb);
    const tbNum = parseFloat(tb);
    if (bbNum > 0 && tbNum > 0) {
      const bmi = bbNum / ((tbNum / 100) * (tbNum / 100));
      setImt(bmi.toFixed(1));
    } else {
      setImt('');
    }
  }, [bb, tb]);

  if (!mounted) return null;

  const handleBottomSearch = () => {
    fetchDataGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    fetchDataMonitoring(noRawat, searchKeyword, tglAwal, tglAkhir);
    fetchDataSkriningGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    fetchDataADIME(noRawat, searchKeyword, tglAwal, tglAkhir);
  };

  const handleEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const form = e.currentTarget.closest('[data-form]');
    if (!form) return;
    const inputs = form.querySelectorAll<HTMLInputElement>('input:not([readonly])');
    const idx = Array.from(inputs).indexOf(e.currentTarget);
    const next = inputs[idx + 1];
    if (next) next.focus();
  };

  const resetFormAsuhanGizi = () => {
    setBb(''); setTb(''); setImt(''); setLla(''); setTl(''); setUlna('');
    setLlaU(''); setBbIdeal(''); setBbU(''); setTku(''); setBbTb(''); setLlaUPersen('');
    setBiokimia(''); setFisikKlinis('');
    setAlergiTelur(false); setAlergiSusuSapi(false); setAlergiKacang(false);
    setAlergiGluten(false); setAlergiUdang(false); setAlergiIkan(false); setAlergiHazelnut(false);
    setPolaMakan(''); setRiwayatPersonal('');
    setDiagnosaGizi(''); setIntervensiGizi(''); setInstruksi(''); setMonitoringEvaluasi('');
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setIsEditMode(false);
    setSelectedRowIdx(null);
    setSelectedRows([]);
  };

  const populateFormFromRow = (row: any, idx: number) => {
    setBb(String(row.bb ?? ''));
    setTb(String(row.tb ?? ''));
    setImt(String(row.imt ?? ''));
    setLla(String(row.lla ?? ''));
    setTl(String(row.tl ?? ''));
    setUlna(String(row.ulna ?? ''));
    setLlaU(String(row.lla_u ?? ''));
    setBbIdeal(String(row.bb_ideal ?? ''));
    setBbU(String(row.bb_u ?? ''));
    setTku(String(row.tku ?? ''));
    setBbTb(String(row.bb_tb ?? ''));
    setLlaUPersen(String(row.lla_u_persen ?? ''));
    setBiokimia(row.subjektif ?? '');
    setFisikKlinis(row.fisik_klinis ?? '');
    setAlergiTelur(row.telur === true || row.telur === 1);
    setAlergiSusuSapi(row.susu_sapi === true || row.susu_sapi === 1);
    setAlergiKacang(row.kacang === true || row.kacang === 1);
    setAlergiGluten(row.gluten === true || row.gluten === 1);
    setAlergiUdang(row.udang === true || row.udang === 1);
    setAlergiIkan(row.ikan === true || row.ikan === 1);
    setAlergiHazelnut(row.hazelnut === true || row.hazelnut === 1);
    setPolaMakan(row.pola_makan ?? '');
    setRiwayatPersonal(row.riwayat_personal ?? '');
    setDiagnosaGizi(row.diagnosa_gizi ?? '');
    setIntervensiGizi(row.intervensi_gizi ?? '');
    setInstruksi(row.instruksi ?? '');
    setMonitoringEvaluasi(row.monitoring_evaluasi ?? '');
    setSelectedRowIdx(idx);
    setIsEditMode(true);
    setCurrentDate(row.tgl_asuhan || currentDate);
  };

  const handleSimpanAsuhanGizi = async () => {
    if (!noRawat) return;
    const alergiVal = (v: boolean) => v ? 'Ya' : 'Tidak';
    const payload = {
      no_rawat: noRawat,
      tanggal: currentDate,
      bb, tb, imt, lla, tl, ulna,
      bb_ideal: bbIdeal, bb_u: bbU, tku, bb_tb: bbTb, lla_u: llaU,
      biokimia, fisik_klinis: fisikKlinis,
      alergi_telur: alergiVal(alergiTelur),
      alergi_susu_sapi: alergiVal(alergiSusuSapi),
      alergi_kacang: alergiVal(alergiKacang),
      alergi_gluten: alergiVal(alergiGluten),
      alergi_udang: alergiVal(alergiUdang),
      alergi_ikan: alergiVal(alergiIkan),
      alergi_hazelnut: alergiVal(alergiHazelnut),
      pola_makan: polaMakan,
      riwayat_personal: riwayatPersonal,
      diagnosis: diagnosaGizi,
      intervensi_gizi: intervensiGizi,
      instruksi,
      monitoring_evaluasi: monitoringEvaluasi,
      nip: pegawaiNik,
    };

    let result;
    if (isEditMode && selectedRowIdx !== null) {
      const oldRow = dataGizi[selectedRowIdx];
      result = await editAsuhanGiziRanap(oldRow.no_rawat, oldRow.tgl_asuhan, payload);
    } else {
      result = await simpanAsuhanGiziRanap(payload);
    }

    if (result.success) {
      resetFormAsuhanGizi();
      fetchDataGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruAsuhanGizi = () => {
    resetFormAsuhanGizi();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusAsuhanGizi = async () => {
    if (selectedRowIdx === null || selectedRowIdx < 0 || selectedRowIdx >= dataGizi.length) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data asuhan gizi ini?')) return;
    const row = dataGizi[selectedRowIdx];
    const result = await hapusAsuhanGiziRanap(row.no_rawat, row.tgl_asuhan);
    if (result.success) {
      resetFormAsuhanGizi();
      fetchDataGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiAsuhanGizi = async () => {
    if (!isEditMode || selectedRowIdx === null) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanAsuhanGizi();
  };

  // === Monitoring Gizi CRUD ===
  const resetFormMonitoring = () => {
    setMonitoringText('');
    setEvaluasiText('');
    setIsEditModeMonitoring(false);
    setSelectedRowIdxMonitoring(null);
    setSelectedRows([]);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormMonitoring = (row: any, idx: number) => {
    setMonitoringText(row.monitoring ?? '');
    setEvaluasiText(row.evaluasi ?? '');
    if (row.tanggal) {
      const parts = row.tanggal.split(' ');
      setCurrentDate(parts[0] || currentDate);
      setCurrentTime(parts[1] || currentTime);
    }
    setIsEditModeMonitoring(true);
    setSelectedRowIdxMonitoring(idx);
  };

  const handleSimpanMonitoring = async () => {
    if (!noRawat) return;
    const payload = {
      no_rawat: noRawat,
      tanggal: `${currentDate} ${currentTime}`,
      monitoring: monitoringText,
      evaluasi: evaluasiText,
      nip: pegawaiNik,
    };

    let result;
    if (isEditModeMonitoring && selectedRowIdxMonitoring !== null) {
      const oldRow = dataMonitoring[selectedRowIdxMonitoring];
      result = await editMonitoringGiziRanap(oldRow.tanggal, oldRow.no_rawat, payload);
    } else {
      result = await simpanMonitoringGiziRanap(payload);
    }

    if (result.success) {
      resetFormMonitoring();
      fetchDataMonitoring(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruMonitoring = () => {
    resetFormMonitoring();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusMonitoring = async () => {
    if (selectedRowIdxMonitoring === null || selectedRowIdxMonitoring < 0 || selectedRowIdxMonitoring >= dataMonitoring.length) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data monitoring gizi ini?')) return;
    const row = dataMonitoring[selectedRowIdxMonitoring];
    const result = await hapusMonitoringGiziRanap(row.tanggal, row.no_rawat);
    if (result.success) {
      resetFormMonitoring();
      fetchDataMonitoring(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiMonitoring = async () => {
    if (!isEditModeMonitoring || selectedRowIdxMonitoring === null) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanMonitoring();
  };

  // === Skrining Gizi Lanjut CRUD ===
  const resetFormSkrining = () => {
    setSkriningGiziBB('');
    setSkriningGiziTB('');
    setSkriningGiziAlergi('');
    setSkriningGiziIMT('');
    setSkriningGiziSkor1("IMT > 20/z score > 2");
    setSkriningGiziSkor2("BB Hilang < 5%");
    setSkriningGiziSkor3("Ada asupan nutrisi > 5 hari");
    setSkriningGiziSkor1Val("0");
    setSkriningGiziSkor2Val("0");
    setSkriningGiziSkor3Val("0");
    setSkriningGiziTotal("0");
    setSkriningGiziKesimpulan("Beresiko rendah, ulangi 7 hari");
    setIsEditModeSkrining(false);
    setSelectedRowIdxSkrining(null);
    setSelectedRows([]);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormSkrining = (row: any, idx: number) => {
    setSkriningGiziBB(row.bb ?? '');
    setSkriningGiziTB(row.tb ?? '');
    setSkriningGiziAlergi(row.alergi ?? '');
    setSkriningGiziSkor1(row.parameter_imt ?? "IMT > 20/z score > 2");
    setSkriningGiziSkor2(row.parameter_bb ?? "BB Hilang < 5%");
    setSkriningGiziSkor3(row.parameter_penyakit ?? "Ada asupan nutrisi > 5 hari");
    setSkriningGiziSkor1Val(row.skor_imt ?? "0");
    setSkriningGiziSkor2Val(row.skor_bb ?? "0");
    setSkriningGiziSkor3Val(row.skor_penyakit ?? "0");
    setSkriningGiziTotal(row.skor_total ?? "0");
    setSkriningGiziKesimpulan(row.kesimpulan ?? "");
    if (row.tanggal) {
      const parts = row.tanggal.split(' ');
      setCurrentDate(parts[0] || currentDate);
      setCurrentTime(parts[1] || currentTime);
    }
    setIsEditModeSkrining(true);
    setSelectedRowIdxSkrining(idx);
  };

  const handleSimpanSkrining = async () => {
    if (!noRawat) return;
    const payload = {
      no_rawat: noRawat,
      tanggal: `${currentDate} ${currentTime}`,
      skrining_bb: skriningGiziBB,
      skrining_tb: skriningGiziTB,
      alergi: skriningGiziAlergi,
      parameter_imt: skriningGiziSkor1,
      skor_imt: skriningGiziSkor1Val,
      parameter_bb: skriningGiziSkor2,
      skor_bb: skriningGiziSkor2Val,
      parameter_penyakit: skriningGiziSkor3,
      skor_penyakit: skriningGiziSkor3Val,
      skor_total: skriningGiziTotal,
      parameter_total: skriningGiziKesimpulan,
      nip: pegawaiNik,
    };

    let result;
    if (isEditModeSkrining && selectedRowIdxSkrining !== null) {
      const oldRow = dataSkriningGizi[selectedRowIdxSkrining];
      result = await editSkriningGiziLanjutRanap(oldRow.tanggal, oldRow.no_rawat, payload);
    } else {
      result = await simpanSkriningGiziLanjutRanap(payload);
    }

    if (result.success) {
      resetFormSkrining();
      fetchDataSkriningGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruSkrining = () => {
    resetFormSkrining();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusSkrining = async () => {
    if (selectedRowIdxSkrining === null || selectedRowIdxSkrining < 0 || selectedRowIdxSkrining >= dataSkriningGizi.length) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data skrining gizi lanjut ini?')) return;
    const row = dataSkriningGizi[selectedRowIdxSkrining];
    const result = await hapusSkriningGiziLanjutRanap(row.tanggal, row.no_rawat);
    if (result.success) {
      resetFormSkrining();
      fetchDataSkriningGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiSkrining = async () => {
    if (!isEditModeSkrining || selectedRowIdxSkrining === null) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanSkrining();
  };

  // === Catatan ADIME Gizi CRUD ===
  const resetFormADIME = () => {
    setAdimeAsesmen('');
    setAdimeDiagnosis('');
    setAdimeIntervensi('');
    setAdimeMonitoring('');
    setAdimeEvaluasi('');
    setAdimeInstruksi('');
    setIsEditModeADIME(false);
    setSelectedRowIdxADIME(null);
    setSelectedRows([]);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormADIME = (row: CatatanADIMERow, idx: number) => {
    setAdimeAsesmen(row.asesmen ?? '');
    setAdimeDiagnosis(row.diagnosis ?? '');
    setAdimeIntervensi(row.intervensi ?? '');
    setAdimeMonitoring(row.monitoring ?? '');
    setAdimeEvaluasi(row.evaluasi ?? '');
    setAdimeInstruksi(row.instruksi ?? '');
    if (row.tanggal) {
      const parts = row.tanggal.split(' ');
      setCurrentDate(parts[0] || currentDate);
      setCurrentTime(parts[1] || currentTime);
    }
    setIsEditModeADIME(true);
    setSelectedRowIdxADIME(idx);
    setFormOpen(true);
  };

  const handleSimpanADIME = async () => {
    if (!noRawat) return;
    const payload = {
      no_rawat: noRawat,
      tanggal: `${currentDate} ${currentTime}`,
      asesmen: adimeAsesmen,
      diagnosis: adimeDiagnosis,
      intervensi: adimeIntervensi,
      monitoring: adimeMonitoring,
      evaluasi: adimeEvaluasi,
      instruksi: adimeInstruksi,
      nip: pegawaiNik,
    };

    let result;
    if (isEditModeADIME && selectedRowIdxADIME !== null) {
      const oldRow = dataADIME[selectedRowIdxADIME];
      result = await editCatatanADIMEGiziRanap(oldRow.tanggal, oldRow.no_rawat, payload);
    } else {
      result = await simpanCatatanADIMEGiziRanap(payload);
    }

    if (result.success) {
      resetFormADIME();
      fetchDataADIME(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruADIME = () => {
    resetFormADIME();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusADIME = async () => {
    if (selectedRowIdxADIME === null || selectedRowIdxADIME < 0 || selectedRowIdxADIME >= dataADIME.length) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data catatan ADIME gizi ini?')) return;
    const row = dataADIME[selectedRowIdxADIME];
    const result = await hapusCatatanADIMEGiziRanap(row.tanggal, row.no_rawat);
    if (result.success) {
      resetFormADIME();
      fetchDataADIME(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiADIME = async () => {
    if (!isEditModeADIME || selectedRowIdxADIME === null) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanADIME();
  };

  const tabs = [
    'Asuhan Gizi',
    'Monitoring Gizi',
    'Skrining Gizi Lanjut',
    'Catatan ADIME Gizi',
  ];

  return (
    <>
      {/* Tab */}
      <div className="flex bg-white border-b border-slate-200 px-2 md:px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => {
          const tabId = tab.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isActive = activeTab === tabId;
          return (
            <button key={tab} onClick={() => { setActiveTab(tabId); setIsTableExpanded(false); setSelectedRows([]); }}
              className={`px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap relative ${isActive ? 'text-brand-700 font-bold' : 'text-slate-500 hover:text-brand-600'}`}>
              {tab}
              {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Konten Tab */}
      <div className="flex-1 overflow-auto bg-white pt-0 pb-2 relative">
        {activeTab === 'asuhangizi' && (
          <div className="flex flex-col min-h-full w-full">
            <TopFormContainer title="Form Input Asuhan Gizi" isOpen={formOpen}>
              <div data-form="gizi" className="flex flex-col gap-5">
                {/* Info Pasien & Tanggal */}
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
                {/* Antropometri */}
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">
                    Pengukuran Antropometri
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <FormField label="BB" value={bb} onChange={setBb} unit="Kg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="TB" value={tb} onChange={setTb} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="IMT" value={imt} onChange={setImt} unit="Kg/m²" placeholder="0" readOnly onKeyDown={handleEnterKeyDown} />
                    <FormField label="LLA" value={lla} onChange={setLla} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="TL" value={tl} onChange={setTl} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="ULNA" value={ulna} onChange={setUlna} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="BB Ideal" value={bbIdeal} onChange={setBbIdeal} unit="Kg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="BB/U" value={bbU} onChange={setBbU} unit="SD" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="TKU" value={tku} onChange={setTku} unit="SD" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="BB/TB" value={bbTb} onChange={setBbTb} unit="SD" placeholder="0" onKeyDown={handleEnterKeyDown} />
                    <FormField label="LLA/U" value={llaUPersen} onChange={setLlaUPersen} unit="SD" placeholder="0" onKeyDown={handleEnterKeyDown} />
                  </div>
                </div>

                {/* Biokimia & Fisik */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormTextarea label="Pemeriksaan Biokimia" value={biokimia} onChange={setBiokimia} placeholder="Masukkan hasil lab/biokimia..." />
                  <FormTextarea label="Pemeriksaan Fisik / Klinis" value={fisikKlinis} onChange={setFisikKlinis} placeholder="Masukkan kondisi fisik/klinis pasien..." />
                </div>

                {/* Riwayat Gizi */}
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">
                    Riwayat Gizi & Diet
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-600 block mb-3">Alergi Makanan :</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-12 px-2">
                        <div className="space-y-1">
                          <AllergyItem label="Telur" value={alergiTelur} onChange={setAlergiTelur} />
                          <AllergyItem label="Susu Sapi & Produk Olahannya" value={alergiSusuSapi} onChange={setAlergiSusuSapi} />
                          <AllergyItem label="Kacang Kedelai / Tanah" value={alergiKacang} onChange={setAlergiKacang} />
                          <AllergyItem label="Gluten / Gandum" value={alergiGluten} onChange={setAlergiGluten} />
                        </div>
                        <div className="space-y-1">
                          <AllergyItem label="Udang" value={alergiUdang} onChange={setAlergiUdang} />
                          <AllergyItem label="Ikan" value={alergiIkan} onChange={setAlergiIkan} />
                          <AllergyItem label="Hazelnut / Almond" value={alergiHazelnut} onChange={setAlergiHazelnut} />
                          <div className="h-5 invisible md:block" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-brand-100/30">
                      <FormField label="Pola Makan" value={polaMakan} onChange={setPolaMakan} placeholder="Contoh: 3x makan utama, porsi habis" onKeyDown={handleEnterKeyDown} />
                      <FormField label="Riwayat Personal" value={riwayatPersonal} onChange={setRiwayatPersonal} placeholder="Riwayat penyakit keluarga/personal..." onKeyDown={handleEnterKeyDown} />
                    </div>
                  </div>
                </div>

                {/* Diagnosa & Intervensi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormTextarea label="Diagnosa Gizi (ADIME)" value={diagnosaGizi} onChange={setDiagnosaGizi} placeholder="Diagnosa gizi..." />
                  <FormTextarea label="Intervensi Gizi" value={intervensiGizi} onChange={setIntervensiGizi} placeholder="Intervensi gizi..." />
                  <FormTextarea label="Instruksi Medis" value={instruksi} onChange={setInstruksi} placeholder="Instruksi medis..." />
                  <FormTextarea label="Monitoring & Evaluasi" value={monitoringEvaluasi} onChange={setMonitoringEvaluasi} placeholder="Monitoring dan evaluasi..." />
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

            {/* Tabel Inline */}
            <div className={`flex flex-col flex-1 min-h-0 transition-all duration-150 ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DataTableMulti
                title="Data Asuhan Gizi Pasien"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                onTitleClick={toggleForm}
                titleChevronOpen={formOpen}
                columns={columns}
                data={dataGizi}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
                onRowClick={(row: any) => {
                  const idx = dataGizi.findIndex(r => r.id === row.id);
                  if (idx >= 0) populateFormFromRow(row, idx);
                }}
                isLoading={isLoadingData}
                emptyMessage="Tidak ada data asuhan gizi yang ditemukan."
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
                    <h3 className="font-bold text-slate-700 text-[13px]">Tabel Data Asuhan Gizi</h3>
                    <button onClick={() => setIsTableExpanded(false)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                      <FaCompress className="text-[10px]" /> Perkecil
                    </button>
                  </div>
                  <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                    <DataTableMulti
                      columns={columns}
                      data={dataGizi}
                      idKey="id"
                      selectedIds={selectedRows}
                      onSelectionChange={setSelectedRows}
                      onRowClick={(row: any) => {
                        const idx = dataGizi.findIndex(r => r.id === row.id);
                        if (idx >= 0) populateFormFromRow(row, idx);
                      }}
                      isLoading={isLoadingData}
                    />
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'monitoringgizi' && (
          <div className="flex flex-col min-h-full w-full">
            <TopFormContainer title="Form Input Monitoring & Evaluasi Gizi" isOpen={formOpen}>
              <div className="flex flex-col gap-5">
                {/* Info Pasien & Tanggal */}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormTextarea label="Monitoring" value={monitoringText} onChange={setMonitoringText} placeholder="Catatan monitoring asuhan gizi..." />
                  <FormTextarea label="Evaluasi" value={evaluasiText} onChange={setEvaluasiText} placeholder="Catatan evaluasi asuhan gizi..." />
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
                  title="Data Monitoring & Evaluasi Asuhan Gizi"
                  icon={<FaUtensils />}
                  onRefresh={handleBottomSearch}
                  onTitleClick={toggleForm}
                  titleChevronOpen={formOpen}
                  columns={monitoringColumns}
                  data={dataMonitoring}
                  idKey="id"
                  selectedIds={selectedRows}
                  onSelectionChange={setSelectedRows}
                  onRowClick={(row: any) => {
                    const idx = dataMonitoring.findIndex(r => r.id === row.id);
                    if (idx >= 0) populateFormMonitoring(row, idx);
                  }}
                  isLoading={isLoadingMonitoring}
                  emptyMessage="Tidak ada data monitoring gizi yang ditemukan."
                />
            </div>

            <AnimatePresence>
              {isTableExpanded && (<>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                  className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 p-4 shadow-2xl rounded-xl border border-slate-300 flex flex-col">
                  <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                    <h3 className="font-bold text-slate-700 text-[13px]">Tabel Data Monitoring & Evaluasi Gizi</h3>
                    <button onClick={() => setIsTableExpanded(false)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                      <FaCompress className="text-[10px]" /> Perkecil
                    </button>
                  </div>
                  <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                    <DataTableMulti
                      columns={monitoringColumns}
                      data={dataMonitoring}
                      idKey="id"
                      selectedIds={selectedRows}
                      onSelectionChange={setSelectedRows}
                      onRowClick={(row: any) => {
                        const idx = dataMonitoring.findIndex(r => r.id === row.id);
                        if (idx >= 0) populateFormMonitoring(row, idx);
                      }}
                      isLoading={isLoadingMonitoring}
                    />
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'skrininggizilanjut' && (
          <div className="flex flex-col min-h-full w-full">
            <TopFormContainer title="Form Input Skrining Gizi Lanjut" isOpen={formOpen}>
              <div data-form="skrining" className="flex flex-col gap-5">
                {/* Info Pasien & Tanggal */}
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
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">Data Skrining Gizi</h3>
                  {/* Baris BB + TB + IMT + Alergi */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                    <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">BB</label>
                    <input type="text" value={skriningGiziBB} onChange={e => setSkriningGiziBB(e.target.value)} onKeyDown={handleEnterKeyDown}
                      className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-20" placeholder="0" />
                    <span className="text-[10px] text-slate-400 -ml-2 w-6">Kg</span>
                    <label className="text-xs font-semibold text-slate-600 w-8 shrink-0">TB</label>
                    <input type="text" value={skriningGiziTB} onChange={e => setSkriningGiziTB(e.target.value)} onKeyDown={handleEnterKeyDown}
                      className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-20" placeholder="0" />
                    <span className="text-[10px] text-slate-400 -ml-2 w-6">Cm</span>
                    <label className="text-xs font-semibold text-slate-600 w-8 shrink-0">IMT</label>
                    <input type="text" value={skriningGiziIMT} readOnly
                      className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 focus:outline-none focus:border-brand-500 w-20" />
                    <span className="text-[10px] text-slate-400 -ml-2 w-14">Kg/Cm</span>
                    <label className="text-xs font-semibold text-slate-600 w-12 shrink-0">Alergi</label>
                    <input type="text" value={skriningGiziAlergi} onChange={e => setSkriningGiziAlergi(e.target.value)} onKeyDown={handleEnterKeyDown}
                      className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[120px]" placeholder="Alergi makanan/obat..." />
                  </div>
                </div>

                {/* Tiga baris skor (seperti Java: baris y=100,130,160) */}
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">Penilaian Skrining</h3>
                  <div className="flex flex-col gap-3">
                    {/* Skor 1: IMT /z Score */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Skor 1</label>
                      <span className="text-xs text-slate-700 w-[300px] shrink-0">1. Skor IMT /z Score</span>
                      <select value={skriningGiziSkor1} onChange={e => setSkriningGiziSkor1(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]">
                        <option>IMT &gt; 20/z score &gt; 2</option>
                        <option>IMT 18,5-20/-2 =&lt; z score =&lt; 2</option>
                        <option>IMT &lt; 18,5/z score &lt; -2</option>
                      </select>
                      <label className="text-xs font-semibold text-slate-600">Skor :</label>
                      <input type="text" value={skriningGiziSkor1Val} readOnly
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold" />
                    </div>

                    {/* Skor 2: Kehilangan BB */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Skor 2</label>
                      <span className="text-xs text-slate-700 w-[300px] shrink-0">2. Skor kehilangan BB yang tidak direncanakan 3-6 bulan terakhir</span>
                      <select value={skriningGiziSkor2} onChange={e => setSkriningGiziSkor2(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]">
                        <option>BB Hilang &lt; 5%</option>
                        <option>BB Hilang 5 - 10 %</option>
                        <option>BB Hilang &gt; 10 %</option>
                      </select>
                      <label className="text-xs font-semibold text-slate-600">Skor :</label>
                      <input type="text" value={skriningGiziSkor2Val} readOnly
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold" />
                    </div>

                    {/* Skor 3: Efek penyakit akut */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Skor 3</label>
                      <span className="text-xs text-slate-700 w-[300px] shrink-0">3. Skor efek penyakit akut</span>
                      <select value={skriningGiziSkor3} onChange={e => setSkriningGiziSkor3(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]">
                        <option>Ada asupan nutrisi &gt; 5 hari</option>
                        <option>Tidak ada asupan nutrisi &gt; 5 hari</option>
                      </select>
                      <label className="text-xs font-semibold text-slate-600">Skor :</label>
                      <input type="text" value={skriningGiziSkor3Val} readOnly
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold" />
                    </div>

                    {/* Total Skor + Kesimpulan (seperti Java: baris y=190) */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t border-brand-100/50 mt-1">
                      <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Total Skor</label>
                      <input type="text" value={skriningGiziTotal} readOnly
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold text-brand-700" />
                      <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Kesimpulan</label>
                      <input type="text" value={skriningGiziKesimpulan} readOnly
                        className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 text-slate-700 flex-1 min-w-[200px]" />
                    </div>
                  </div>
                </div>

                {/* Petugas (Dilakukan Oleh) */}
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
                title="Data Skrining Gizi Lanjut"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                onTitleClick={toggleForm}
                titleChevronOpen={formOpen}
                columns={skriningGiziLanjutColumns}
                data={dataSkriningGizi}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
                onRowClick={(row: any) => {
                  const idx = dataSkriningGizi.findIndex(r => r.id === row.id);
                  if (idx >= 0) populateFormSkrining(row, idx);
                }}
                isLoading={isLoadingSkriningGizi}
                emptyMessage="Tidak ada data skrining gizi lanjut yang ditemukan."
              />
            </div>

            <AnimatePresence>
              {isTableExpanded && (<>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                  className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 p-4 shadow-2xl rounded-xl border border-slate-300 flex flex-col">
                  <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                    <h3 className="font-bold text-slate-700 text-[13px]">Tabel Data Skrining Gizi Lanjut</h3>
                    <button onClick={() => setIsTableExpanded(false)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                      <FaCompress className="text-[10px]" /> Perkecil
                    </button>
                  </div>
                  <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                    <DataTableMulti
                      columns={skriningGiziLanjutColumns}
                      data={dataSkriningGizi}
                      idKey="id"
                      selectedIds={selectedRows}
                      onSelectionChange={setSelectedRows}
                      onRowClick={(row: any) => {
                        const idx = dataSkriningGizi.findIndex(r => r.id === row.id);
                        if (idx >= 0) populateFormSkrining(row, idx);
                      }}
                      isLoading={isLoadingSkriningGizi}
                    />
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'catatanadimegizi' && (
          <div className="flex flex-col min-h-full w-full">
            <TopFormContainer title="Form Input Catatan ADIME Gizi" isOpen={formOpen}>
              <div className="flex flex-col gap-5">
                {/* Info Pasien & Tanggal */}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormTextarea label="Asesmen (A)" value={adimeAsesmen} onChange={setAdimeAsesmen} placeholder="Hasil asesmen gizi..." />
                  <FormTextarea label="Diagnosis (D)" value={adimeDiagnosis} onChange={setAdimeDiagnosis} placeholder="Diagnosis gizi..." />
                  <FormTextarea label="Intervensi (I)" value={adimeIntervensi} onChange={setAdimeIntervensi} placeholder="Intervensi gizi..." />
                  <FormTextarea label="Monitoring (M)" value={adimeMonitoring} onChange={setAdimeMonitoring} placeholder="Monitoring gizi..." />
                  <FormTextarea label="Evaluasi (E)" value={adimeEvaluasi} onChange={setAdimeEvaluasi} placeholder="Evaluasi gizi..." />
                  <FormTextarea label="Instruksi" value={adimeInstruksi} onChange={setAdimeInstruksi} placeholder="Instruksi medis/diet..." />
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
                title="Data Catatan ADIME Gizi"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                onTitleClick={toggleForm}
                titleChevronOpen={formOpen}
                columns={catatanADIMEColumns}
                data={dataADIME}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
                onRowClick={(row: any) => {
                  const idx = dataADIME.findIndex(r => r.id === row.id);
                  if (idx >= 0) populateFormADIME(row, idx);
                }}
                isLoading={isLoadingADIME}
                emptyMessage="Tidak ada data catatan ADIME gizi yang ditemukan."
              />
            </div>

            <AnimatePresence>
              {isTableExpanded && (<>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                  className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 p-4 shadow-2xl rounded-xl border border-slate-300 flex flex-col">
                  <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                    <h3 className="font-bold text-slate-700 text-[13px]">Tabel Data Catatan ADIME Gizi</h3>
                    <button onClick={() => setIsTableExpanded(false)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                      <FaCompress className="text-[10px]" /> Perkecil
                    </button>
                  </div>
                  <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
                    <DataTableMulti
                      columns={catatanADIMEColumns}
                      data={dataADIME}
                      idKey="id"
                      selectedIds={selectedRows}
                      onSelectionChange={setSelectedRows}
                      onRowClick={(row: any) => {
                        const idx = dataADIME.findIndex(r => r.id === row.id);
                        if (idx >= 0) populateFormADIME(row, idx);
                      }}
                      isLoading={isLoadingADIME}
                    />
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>
        )}

        {activeTab !== 'asuhangizi' && activeTab !== 'monitoringgizi' && activeTab !== 'skrininggizilanjut' && activeTab !== 'catatanadimegizi' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            Menu belum tersedia
          </div>
        )}
      </div>

      {/* Dialog Pilih Pegawai */}
      <DialogPilihPegawai
        open={dialogPegawaiOpen}
        onClose={() => setDialogPegawaiOpen(false)}
        onSelect={handlePilihPegawai}
      />

      {/* Bottom Panel */}
      <BottomActionPanel
        onSave={activeTab === 'asuhangizi' ? handleSimpanAsuhanGizi : activeTab === 'monitoringgizi' ? handleSimpanMonitoring : activeTab === 'skrininggizilanjut' ? handleSimpanSkrining : activeTab === 'catatanadimegizi' ? handleSimpanADIME : undefined}
        onNew={activeTab === 'asuhangizi' ? handleBaruAsuhanGizi : activeTab === 'monitoringgizi' ? handleBaruMonitoring : activeTab === 'skrininggizilanjut' ? handleBaruSkrining : activeTab === 'catatanadimegizi' ? handleBaruADIME : undefined}
        onReplace={activeTab === 'asuhangizi' ? handleGantiAsuhanGizi : activeTab === 'monitoringgizi' ? handleGantiMonitoring : activeTab === 'skrininggizilanjut' ? handleGantiSkrining : activeTab === 'catatanadimegizi' ? handleGantiADIME : undefined}
        onDelete={activeTab === 'asuhangizi' ? handleHapusAsuhanGizi : activeTab === 'monitoringgizi' ? handleHapusMonitoring : activeTab === 'skrininggizilanjut' ? handleHapusSkrining : activeTab === 'catatanadimegizi' ? handleHapusADIME : undefined}
        recordCount={
          activeTab === 'monitoringgizi' ? dataMonitoring.length :
          activeTab === 'skrininggizilanjut' ? dataSkriningGizi.length :
          activeTab === 'catatanadimegizi' ? dataADIME.length :
          dataGizi.length
        }
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

export default function AsuhanGiziPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <AsuhanGiziContent />
    </Suspense>
  );
}
