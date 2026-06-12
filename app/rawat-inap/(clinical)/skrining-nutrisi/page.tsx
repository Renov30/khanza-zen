"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaBed, FaCompress, FaEdit } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import FormSection from '@/components/FormSection';
import DialogPilihPegawai from '@/components/DialogPilihPegawai';
import { getPatientInfoByNoRawat, getSkriningNutrisiRanap, getSkriningNutrisiAnakRanap, getSkriningNutrisiLansiaRanap, getLoggedInPegawai, simpanSkriningNutrisiRanap, editSkriningNutrisiRanap, hapusSkriningNutrisiRanap, simpanSkriningNutrisiAnakRanap, editSkriningNutrisiAnakRanap, hapusSkriningNutrisiAnakRanap, simpanSkriningNutrisiLansiaRanap, editSkriningNutrisiLansiaRanap, hapusSkriningNutrisiLansiaRanap } from '@/lib/actions/ranap';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';

interface SkriningNutrisiRow {
  id: string;
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_lahir: string; jk: string; tanggal: string;
  bb: string; lila: string; tbpb: string;
  td: string; hr: string; rr: string; suhu: string; spo2: string;
  alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; total_hasil: string;
  nip: string; nm_petugas: string;
}

interface SkriningNutrisiAnakRow {
  id: string;
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_lahir: string; jk: string; tanggal: string;
  bb: string; tbpb: string; td: string; hr: string; rr: string; suhu: string; spo2: string;
  alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; nilai3: string; sg4: string; nilai4: string;
  total_hasil: string; skor_nutrisi: string;
  diketahui_dietisien: string; keterangan_diketahui_dietisien: string;
  nip: string; nm_petugas: string;
}

interface SkriningNutrisiLansiaRow {
  id: string;
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_lahir: string; jk: string; tanggal: string;
  bb: string; tbpb: string; td: string; hr: string; rr: string; suhu: string; spo2: string;
  alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; nilai3: string; sg4: string; nilai4: string;
  sg5: string; nilai5: string; sg6: string; nilai6: string;
  total_hasil: string; skor_nutrisi: string;
  nip: string; nm_petugas: string;
}

interface SkriningNutrisiAnakRow {
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_lahir: string; jk: string; tanggal: string;
  bb: string; tbpb: string;
  td: string; hr: string; rr: string; suhu: string; spo2: string;
  alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; nilai3: string; sg4: string; nilai4: string;
  total_hasil: string; skor_nutrisi: string;
  diketahui_dietisien: string; keterangan_diketahui_dietisien: string;
  nip: string; nm_petugas: string;
}

interface SkriningNutrisiLansiaRow {
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_lahir: string; jk: string; tanggal: string;
  bb: string; tbpb: string; td: string; hr: string; rr: string; suhu: string; spo2: string;
  alergi: string;
  sg1: string; nilai1: string; sg2: string; nilai2: string;
  sg3: string; nilai3: string; sg4: string; nilai4: string;
  sg5: string; nilai5: string; sg6: string; nilai6: string;
  total_hasil: string; skor_nutrisi: string;
  nip: string; nm_petugas: string;
}

const dewasaColumns: TableColumn[] = [
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
  { header: 'Skrining 1', key: 'sg1', width: '80px', className: 'truncate' },
  { header: 'Nilai 1', key: 'nilai1', width: '50px' },
  { header: 'Skrining 2', key: 'sg2', width: '80px', className: 'truncate' },
  { header: 'Nilai 2', key: 'nilai2', width: '50px' },
  { header: 'Skrining 3', key: 'sg3', width: '80px', className: 'truncate' },
  { header: 'Total Skor', key: 'total_hasil', width: '70px' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

const anakColumns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.RM', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Tgl.Lahir', key: 'tgl_lahir', width: '100px' },
  { header: 'JK', key: 'jk', width: '30px' },
  { header: 'Kode Petugas', key: 'nip', width: '100px' },
  { header: 'Nama Petugas', key: 'nm_petugas', width: '180px' },
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'BB(Kg)', key: 'bb', width: '60px' },
  { header: 'TB/PB(Cm)', key: 'tbpb', width: '80px' },
  { header: 'TD(mmHg)', key: 'td', width: '75px' },
  { header: 'HR(/mnt)', key: 'hr', width: '65px' },
  { header: 'RR(/mnt)', key: 'rr', width: '65px' },
  { header: 'Suhu', key: 'suhu', width: '50px' },
  { header: 'SpO2(%)', key: 'spo2', width: '65px' },
  { header: 'Alergi', key: 'alergi', width: '120px', className: 'truncate' },
  { header: 'SG 1 (Kurus)', key: 'sg1', width: '80px', className: 'truncate' },
  { header: 'N1', key: 'nilai1', width: '40px' },
  { header: 'SG 2 (BB Turun)', key: 'sg2', width: '80px', className: 'truncate' },
  { header: 'N2', key: 'nilai2', width: '40px' },
  { header: 'SG 3 (Diare)', key: 'sg3', width: '80px', className: 'truncate' },
  { header: 'N3', key: 'nilai3', width: '40px' },
  { header: 'SG 4 (Risiko)', key: 'sg4', width: '80px', className: 'truncate' },
  { header: 'N4', key: 'nilai4', width: '40px' },
  { header: 'Total', key: 'total_hasil', width: '50px' },
  { header: 'Hasil Skrining', key: 'skor_nutrisi', width: '150px', className: 'truncate' },
  { header: 'Diketahui', key: 'diketahui_dietisien', width: '70px' },
  { header: 'Ket.Diketahui', key: 'keterangan_diketahui_dietisien', width: '150px', className: 'truncate' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

const lansiaColumns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.RM', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'Tgl.Lahir', key: 'tgl_lahir', width: '100px' },
  { header: 'JK', key: 'jk', width: '30px' },
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'BB(Kg)', key: 'bb', width: '60px' },
  { header: 'TB/PB(Cm)', key: 'tbpb', width: '80px' },
  { header: 'TD(mmHg)', key: 'td', width: '75px' },
  { header: 'HR(/mnt)', key: 'hr', width: '65px' },
  { header: 'RR(/mnt)', key: 'rr', width: '65px' },
  { header: 'Suhu', key: 'suhu', width: '50px' },
  { header: 'SpO2(%)', key: 'spo2', width: '65px' },
  { header: 'Alergi', key: 'alergi', width: '120px', className: 'truncate' },
  { header: 'SG 1', key: 'sg1', width: '120px', className: 'truncate' },
  { header: 'N1', key: 'nilai1', width: '40px' },
  { header: 'SG 2', key: 'sg2', width: '120px', className: 'truncate' },
  { header: 'N2', key: 'nilai2', width: '40px' },
  { header: 'SG 3', key: 'sg3', width: '120px', className: 'truncate' },
  { header: 'N3', key: 'nilai3', width: '40px' },
  { header: 'SG 4', key: 'sg4', width: '60px', className: 'truncate' },
  { header: 'N4', key: 'nilai4', width: '40px' },
  { header: 'SG 5', key: 'sg5', width: '120px', className: 'truncate' },
  { header: 'N5', key: 'nilai5', width: '40px' },
  { header: 'SG 6', key: 'sg6', width: '100px', className: 'truncate' },
  { header: 'N6', key: 'nilai6', width: '40px' },
  { header: 'Total', key: 'total_hasil', width: '50px' },
  { header: 'Skor Nutrisi', key: 'skor_nutrisi', width: '120px', className: 'truncate' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

type TabId = 'dewasa' | 'anak' | 'lansia';

const tabs: { id: TabId; label: string }[] = [
  { id: 'dewasa', label: 'Dewasa' },
  { id: 'anak', label: 'Anak' },
  { id: 'lansia', label: 'Lansia' },
];

function FormField({ label, value, onChange, unit, placeholder, className = "", onKeyDown }: {
  label: string; value: string; onChange?: (v: string) => void; unit?: string; placeholder?: string; className?: string; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 sm:w-24 shrink-0 flex items-center gap-1">
        {label}
        {unit && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal lowercase">({unit})</span>}
      </label>
      <input type="text"
        value={value} onChange={e => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors bg-white dark:bg-slate-700 dark:text-slate-100"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, className = "" }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 sm:w-24 shrink-0">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors bg-white dark:bg-slate-700 dark:text-slate-100">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SkriningNutrisiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dewasa');
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("khanza_skrining_nutrisi_form_open");
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });
  const toggleForm = useCallback(() => {
    setFormOpen((prev: boolean) => {
      const next = !prev;
      if (typeof window !== "undefined")
        localStorage.setItem("khanza_skrining_nutrisi_form_open", JSON.stringify(next));
      return next;
    });
  }, []);
  const [dialogPegawaiOpen, setDialogPegawaiOpen] = useState(false);
  const handlePilihPegawai = (nik: string, nama: string) => {
    setPegawaiNik(nik);
    setPegawaiNama(nama);
    setDialogPegawaiOpen(false);
  };
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 8));
  const [isClockRunning, setIsClockRunning] = useState(true);

  const [noRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState('');
  const [namaPasien, setNamaPasien] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Shared
  const [dataDewasa, setDataDewasa] = useState<SkriningNutrisiRow[]>([]);
  const [dataAnak, setDataAnak] = useState<SkriningNutrisiAnakRow[]>([]);
  const [dataLansia, setDataLansia] = useState<SkriningNutrisiLansiaRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [tglAwal, setTglAwal] = useState(today);
  const [tglAkhir, setTglAkhir] = useState(today);

  const [pegawaiNik, setPegawaiNik] = useState('');
  const [pegawaiNama, setPegawaiNama] = useState('');

  // === Form state: Dewasa ===
  const [dBB, setDBB] = useState(''); const [dLILA, setDLILA] = useState('');
  const [dTBPB, setDTBPB] = useState(''); const [dTD, setDTD] = useState('');
  const [dHR, setDHR] = useState(''); const [dRR, setDRR] = useState('');
  const [dSuhu, setDSuhu] = useState(''); const [dSpO2, setDSpO2] = useState('');
  const [dAlergi, setDAlergi] = useState('');
  const [dSG1, setDSG1] = useState('Tidak'); const [dNilai1, setDNilai1] = useState('0');
  const [dSG2, setDSG2] = useState('Tidak'); const [dNilai2, setDNilai2] = useState('0');
  const [dSG3, setDSG3] = useState('Tidak');
  const [dTotal, setDTotal] = useState('');
  const [isEditModeDewasa, setIsEditModeDewasa] = useState(false);
  const [selectedRowIdxDewasa, setSelectedRowIdxDewasa] = useState<number | null>(null);

  // === Form state: Anak ===
  const [aBB, setABB] = useState(''); const [aTBPB, setATBPB] = useState('');
  const [aTD, setATD] = useState(''); const [aHR, setAHR] = useState('');
  const [aRR, setARR] = useState(''); const [aSuhu, setASuhu] = useState('');
  const [aSpO2, setASpO2] = useState('');   const [aAlergi, setAAlergi] = useState('');
  const [aSG1, setASG1] = useState('Tidak'); const [aN1, setAN1] = useState('0'); // Tampak Kurus
  const [aSG2, setASG2] = useState('Tidak'); const [aN2, setAN2] = useState('0'); // Penurunan BB
  const [aSG3, setASG3] = useState('Tidak'); const [aN3, setAN3] = useState('0'); // Diare/Muntah
  const [aSG4, setASG4] = useState('Tidak'); const [aN4, setAN4] = useState('0'); // Penyakit Risiko
  const [aTotal, setATotal] = useState('0');
  const [aSkorNutrisi, setASkorNutrisi] = useState('');
  const [aDiketahui, setADiketahui] = useState('Tidak');
  const [aKetDiketahui, setAKetDiketahui] = useState('');
  const [isEditModeAnak, setIsEditModeAnak] = useState(false);
  const [selectedRowIdxAnak, setSelectedRowIdxAnak] = useState<number | null>(null);
  const [isEditModeLansia, setIsEditModeLansia] = useState(false);
  const [selectedRowIdxLansia, setSelectedRowIdxLansia] = useState<number | null>(null);

  // === Form state: Lansia ===
  const [lBB, setLBB] = useState(''); const [lTBPB, setLTBPB] = useState('');
  const [lTD, setLTD] = useState(''); const [lHR, setLHR] = useState('');
  const [lRR, setLRR] = useState(''); const [lSuhu, setLSuhu] = useState('');
  const [lSpO2, setLSpO2] = useState('');   const [lAlergi, setLAlergi] = useState('');
  const [lSG1, setLSG1] = useState('Asupan Makan Tidak Berkurang'); const [lN1, setLN1] = useState('0');
  const [lSG2, setLSG2] = useState('Tidak Ada Penurunan Berat Badan'); const [lN2, setLN2] = useState('0');
  const [lSG3, setLSG3] = useState('Dapat Bepergian Keluar Rumah'); const [lN3, setLN3] = useState('0');
  const [lSG4, setLSG4] = useState('Tidak'); const [lN4, setLN4] = useState('0');
  const [lSG5, setLSG5] = useState('Tidak Ada Gangguan Psikologis'); const [lN5, setLN5] = useState('0');
  const [lSG6, setLSG6] = useState('IMT >= 23'); const [lN6, setLN6] = useState('0');
  const [lTotal, setLTotal] = useState('0');
  const [lSkorNutrisi, setLSkorNutrisi] = useState('');

  // === Fetch helpers ===
  const fetchPatientInfo = useCallback(async (nrw: string) => {
    if (!nrw.trim()) return;
    setIsLoadingPatient(true);
    try {
      const result = await getPatientInfoByNoRawat(nrw);
      if (result.success && result.data) { setNoRM(result.data.no_rkm_medis); setNamaPasien(result.data.nm_pasien); setTglLahir(result.data.tgl_lahir || ''); }
      else { setNoRM(''); setNamaPasien(''); setTglLahir(''); }
    } catch { setNoRM(''); setNamaPasien(''); setTglLahir(''); }
    setIsLoadingPatient(false);
  }, []);

  const fetchAllData = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingData(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        getSkriningNutrisiRanap(nrw, kw, ta, tb),
        getSkriningNutrisiAnakRanap(nrw, kw, ta, tb),
        getSkriningNutrisiLansiaRanap(nrw, kw, ta, tb),
      ]);
      if (r1.success) setDataDewasa(r1.data.map((r: any) => ({ ...r, id: `${r.no_rawat}-${r.tanggal}-dewasa` })));
      if (r2.success) setDataAnak(r2.data.map((r: any) => ({ ...r, id: `${r.no_rawat}-${r.tanggal}-anak` })));
      if (r3.success) setDataLansia(r3.data.map((r: any) => ({ ...r, id: `${r.no_rawat}-${r.tanggal}-lansia` })));
    } catch (e) { console.error('fetch error:', e); }
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

  // Real-time clock
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
    setMounted(true);
    fetchPegawaiInfo();
    if (noRawatParam) {
      fetchPatientInfo(noRawatParam);
    }
  }, [noRawatParam, fetchPatientInfo, fetchAllData, fetchPegawaiInfo]);

  // Auto-refetch when patient, keyword, or date filters change
  useEffect(() => {
    if (noRawat) fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);
  }, [noRawat, searchKeyword, tglAwal, tglAkhir]);

  // === Auto-score: Dewasa (MST) ===
  useEffect(() => {
    const sg1Opts = ['Tidak', 'Tidak Yakin (Baju Jadi Longgar)', 'Ya, 1-5 Kg', 'Ya, 6-10 Kg', 'Ya, 11-15 Kg', 'Ya, >15 Kg'];
    const sg1Vals = ['0', '2', '1', '2', '3', '4'];
    const sg2Opts = ['Tidak', 'Ya'];
    const sg2Vals = ['0', '1'];
    const i1 = sg1Opts.indexOf(dSG1);
    const i2 = sg2Opts.indexOf(dSG2);
    const n1 = i1 >= 0 ? sg1Vals[i1] : '0';
    const n2 = i2 >= 0 ? sg2Vals[i2] : '0';
    setDNilai1(n1); setDNilai2(n2);
    setDTotal((parseInt(n1) + parseInt(n2)).toString());
  }, [dSG1, dSG2]);

  // === Auto-score: Anak ===
  useEffect(() => {
    const n1 = aSG1 === 'Ya' ? 1 : 0; // Tampak Kurus
    const n2 = aSG2 === 'Ya' ? 1 : 0; // Penurunan BB
    const n3 = aSG3 === 'Ya' ? 1 : 0; // Diare/Muntah
    const n4 = aSG4 === 'Ya' ? 1 : 0; // Penyakit Risiko
    setAN1(n1.toString()); setAN2(n2.toString()); setAN3(n3.toString()); setAN4(n4.toString());
    const total = n1 + n2 + n3 + n4;
    setATotal(total.toString());
    if (total === 0) setASkorNutrisi('Risiko Rendah');
    else if (total <= 3) setASkorNutrisi('Risiko Sedang');
    else setASkorNutrisi('Risikio Berat');
  }, [aSG1, aSG2, aSG3, aSG4]);

  // === Auto-score: Lansia (MNA) ===
  const lansiaSGIndex = useCallback((sg: string, items: string[]) => {
    const idx = items.indexOf(sg);
    return idx >= 0 ? idx : 0;
  }, []);
  useEffect(() => {
    const i1 = lansiaSGIndex(lSG1, ['Asupan Makan Tidak Berkurang', 'Asupan Makan Agak Berkurang', 'Asupan Makan Sangat Berkurang']);
    const i2 = lansiaSGIndex(lSG2, ['Tidak Ada Penurunan Berat Badan', 'Penurunan Berat Badan Antara 1 Hingga 3 Kg', 'Tidak Tahu', 'Penurunan Berat Badan Lebih Dari 3 Kg']);
    const i3 = lansiaSGIndex(lSG3, ['Dapat Bepergian Keluar Rumah', 'Mampu Bangun Dari Tempat Tidur/Kursi Tetapi Tidak Bepergian Keluar Rumah', 'Terbatas Dari Tempat Tidur Atau Kursi']);
    const i4 = lansiaSGIndex(lSG4, ['Tidak', 'Ya']);
    const i5 = lansiaSGIndex(lSG5, ['Tidak Ada Gangguan Psikologis', 'Kepikunan Ringan', 'Depresi Berat Atau Kepikunan Berat']);
    const i6 = lansiaSGIndex(lSG6, ['IMT >= 23', '21 Hingga < 23', '19 Hingga < 21', 'IMT < 19']);
    setLN1(i1.toString()); setLN2(i2.toString()); setLN3(i3.toString());
    setLN4(i4.toString()); setLN5(i5.toString()); setLN6(i6.toString());
    const total = i1 + i2 + i3 + i4 + i5 + i6;
    setLTotal(total.toString());
    if (total >= 12) setLSkorNutrisi('Status Gizi Normal');
    else if (total >= 8) setLSkorNutrisi('Beresiko Malnutrisi');
    else setLSkorNutrisi('Malnutrisi');
  }, [lSG1, lSG2, lSG3, lSG4, lSG5, lSG6, lansiaSGIndex]);

  // === CRUD: Dewasa ===
  const resetFormDewasa = () => {
    setDBB(''); setDLILA(''); setDTBPB(''); setDTD('');
    setDHR(''); setDRR(''); setDSuhu(''); setDSpO2('');
    setDAlergi('');
    setDSG1('Tidak'); setDSG2('Tidak'); setDSG3('Tidak');
    setDTotal('');
    setIsEditModeDewasa(false);
    setSelectedRowIdxDewasa(null);
    setSelectedRows([]);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormDewasa = (row: SkriningNutrisiRow, idx: number) => {
    setDBB(row.bb ?? ''); setDLILA(row.lila ?? ''); setDTBPB(row.tbpb ?? '');
    setDTD(row.td ?? ''); setDHR(row.hr ?? ''); setDRR(row.rr ?? '');
    setDSuhu(row.suhu ?? ''); setDSpO2(row.spo2 ?? ''); setDAlergi(row.alergi ?? '');
    setDSG1(row.sg1 ?? 'Tidak'); setDSG2(row.sg2 ?? 'Tidak'); setDSG3(row.sg3 ?? 'Tidak');
    setDTotal(row.total_hasil ?? '');
    if (row.tanggal) {
      const parts = row.tanggal.split(' ');
      setCurrentDate(parts[0] || currentDate);
      setCurrentTime(parts[1] || currentTime);
    }
    setIsEditModeDewasa(true);
    setSelectedRowIdxDewasa(idx);
    setFormOpen(true);
  };

  const handleSimpanDewasa = async () => {
    if (!noRawat) return;
    const payload = {
      no_rawat: noRawat,
      tanggal: `${currentDate} ${currentTime}`,
      td: dTD, hr: dHR, rr: dRR, suhu: dSuhu,
      lila: dLILA, bb: dBB, tbpb: dTBPB, spo2: dSpO2,
      alergi: dAlergi,
      sg1: dSG1, nilai1: dNilai1, sg2: dSG2, nilai2: dNilai2,
      sg3: dSG3, total_hasil: dTotal, nip: pegawaiNik,
    };

    let result;
    if (isEditModeDewasa && selectedRowIdxDewasa !== null) {
      const oldRow = dataDewasa[selectedRowIdxDewasa];
      result = await editSkriningNutrisiRanap(oldRow.tanggal, oldRow.no_rawat, payload);
    } else {
      result = await simpanSkriningNutrisiRanap(payload);
    }

    if (result.success) {
      resetFormDewasa();
      fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruDewasa = () => {
    resetFormDewasa();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusDewasa = async () => {
    if (selectedRowIdxDewasa === null || selectedRowIdxDewasa < 0 || selectedRowIdxDewasa >= dataDewasa.length) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data skrining nutrisi dewasa ini?')) return;
    const row = dataDewasa[selectedRowIdxDewasa];
    const result = await hapusSkriningNutrisiRanap(row.tanggal, row.no_rawat);
    if (result.success) {
      resetFormDewasa();
      fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiDewasa = async () => {
    if (!isEditModeDewasa || selectedRowIdxDewasa === null) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanDewasa();
  };

  // === CRUD: Anak ===
  const resetFormAnak = () => {
    setABB(''); setATBPB(''); setATD(''); setAHR('');
    setARR(''); setASuhu(''); setASpO2(''); setAAlergi('');
    setASG1('Tidak'); setASG2('Tidak'); setASG3('Tidak'); setASG4('Tidak');
    setATotal('0'); setASkorNutrisi('');
    setADiketahui('Tidak'); setAKetDiketahui('');
    setIsEditModeAnak(false);
    setSelectedRowIdxAnak(null);
    setSelectedRows([]);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormAnak = (row: SkriningNutrisiAnakRow, idx: number) => {
    setABB(row.bb ?? ''); setATBPB(row.tbpb ?? '');
    setATD(row.td ?? ''); setAHR(row.hr ?? ''); setARR(row.rr ?? '');
    setASuhu(row.suhu ?? ''); setASpO2(row.spo2 ?? ''); setAAlergi(row.alergi ?? '');
    setASG1(row.sg1 ?? 'Tidak'); setASG2(row.sg2 ?? 'Tidak');
    setASG3(row.sg3 ?? 'Tidak'); setASG4(row.sg4 ?? 'Tidak');
    setATotal(row.total_hasil ?? '0'); setASkorNutrisi(row.skor_nutrisi ?? '');
    setADiketahui(row.diketahui_dietisien ?? 'Tidak');
    setAKetDiketahui(row.keterangan_diketahui_dietisien ?? '');
    if (row.tanggal) {
      const parts = row.tanggal.split(' ');
      setCurrentDate(parts[0] || currentDate);
      setCurrentTime(parts[1] || currentTime);
    }
    setIsEditModeAnak(true);
    setSelectedRowIdxAnak(idx);
    setFormOpen(true);
  };

  const handleSimpanAnak = async () => {
    if (!noRawat) return;
    const payload = {
      no_rawat: noRawat,
      tanggal: `${currentDate} ${currentTime}`,
      bb: aBB, tbpb: aTBPB, td: aTD, hr: aHR, rr: aRR,
      suhu: aSuhu, spo2: aSpO2, alergi: aAlergi,
      sg1: aSG1, nilai1: aN1, sg2: aSG2, nilai2: aN2,
      sg3: aSG3, nilai3: aN3, sg4: aSG4, nilai4: aN4,
      total_hasil: aTotal, skor_nutrisi: aSkorNutrisi,
      diketahui_dietisien: aDiketahui, keterangan_diketahui_dietisien: aKetDiketahui,
      nip: pegawaiNik,
    };

    let result;
    if (isEditModeAnak && selectedRowIdxAnak !== null) {
      const oldRow = dataAnak[selectedRowIdxAnak];
      result = await editSkriningNutrisiAnakRanap(oldRow.tanggal, oldRow.no_rawat, payload);
    } else {
      result = await simpanSkriningNutrisiAnakRanap(payload);
    }

    if (result.success) {
      resetFormAnak();
      fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruAnak = () => {
    resetFormAnak();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusAnak = async () => {
    if (selectedRowIdxAnak === null || selectedRowIdxAnak < 0 || selectedRowIdxAnak >= dataAnak.length) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data skrining nutrisi anak ini?')) return;
    const row = dataAnak[selectedRowIdxAnak];
    const result = await hapusSkriningNutrisiAnakRanap(row.tanggal, row.no_rawat);
    if (result.success) {
      resetFormAnak();
      fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiAnak = async () => {
    if (!isEditModeAnak || selectedRowIdxAnak === null) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanAnak();
  };

  // === CRUD: Lansia ===
  const resetFormLansia = () => {
    setLSG1('Asupan Makan Tidak Berkurang'); setLSG2('Tidak Ada Penurunan Berat Badan');
    setLSG3('Dapat Bepergian Keluar Rumah'); setLSG4('Tidak');
    setLSG5('Tidak Ada Gangguan Psikologis'); setLSG6('IMT >= 23');
    setLN1('0'); setLN2('0'); setLN3('0'); setLN4('0'); setLN5('0'); setLN6('0');
    setLTotal('0'); setLSkorNutrisi('');
    setIsEditModeLansia(false);
    setSelectedRowIdxLansia(null);
    setSelectedRows([]);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormLansia = (row: SkriningNutrisiLansiaRow, idx: number) => {
    setLSG1(row.sg1 ?? 'Asupan Makan Tidak Berkurang'); setLSG2(row.sg2 ?? 'Tidak Ada Penurunan Berat Badan');
    setLSG3(row.sg3 ?? 'Dapat Bepergian Keluar Rumah'); setLSG4(row.sg4 ?? 'Tidak');
    setLSG5(row.sg5 ?? 'Tidak Ada Gangguan Psikologis'); setLSG6(row.sg6 ?? 'IMT >= 23');
    setLN1(row.nilai1 ?? '0'); setLN2(row.nilai2 ?? '0'); setLN3(row.nilai3 ?? '0');
    setLN4(row.nilai4 ?? '0'); setLN5(row.nilai5 ?? '0'); setLN6(row.nilai6 ?? '0');
    setLTotal(row.total_hasil ?? '0'); setLSkorNutrisi(row.skor_nutrisi ?? '');
    if (row.tanggal) {
      const parts = row.tanggal.split(' ');
      setCurrentDate(parts[0] || currentDate);
      setCurrentTime(parts[1] || currentTime);
    }
    setIsEditModeLansia(true);
    setSelectedRowIdxLansia(idx);
    setFormOpen(true);
  };

  const handleSimpanLansia = async () => {
    if (!noRawat) return;
    const payload = {
      no_rawat: noRawat,
      tanggal: `${currentDate} ${currentTime}`,
      bb: lBB, tbpb: lTBPB, td: lTD, hr: lHR, rr: lRR,
      suhu: lSuhu, spo2: lSpO2, alergi: lAlergi,
      sg1: lSG1, nilai1: lN1, sg2: lSG2, nilai2: lN2,
      sg3: lSG3, nilai3: lN3, sg4: lSG4, nilai4: lN4,
      sg5: lSG5, nilai5: lN5, sg6: lSG6, nilai6: lN6,
      total_hasil: lTotal, skor_nutrisi: lSkorNutrisi,
      nip: pegawaiNik,
    };

    let result;
    if (isEditModeLansia && selectedRowIdxLansia !== null) {
      const oldRow = dataLansia[selectedRowIdxLansia];
      result = await editSkriningNutrisiLansiaRanap(oldRow.tanggal, oldRow.no_rawat, payload);
    } else {
      result = await simpanSkriningNutrisiLansiaRanap(payload);
    }

    if (result.success) {
      resetFormLansia();
      fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menyimpan data');
    }
  };

  const handleBaruLansia = () => {
    resetFormLansia();
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split('T')[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
    setFormOpen(true);
  };

  const handleHapusLansia = async () => {
    if (selectedRowIdxLansia === null || selectedRowIdxLansia < 0 || selectedRowIdxLansia >= dataLansia.length) {
      alert('Silakan pilih data yang akan dihapus terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin akan menghapus data skrining nutrisi lansia ini?')) return;
    const row = dataLansia[selectedRowIdxLansia];
    const result = await hapusSkriningNutrisiLansiaRanap(row.tanggal, row.no_rawat);
    if (result.success) {
      resetFormLansia();
      fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);
    } else {
      alert(result.message || 'Gagal menghapus data');
    }
  };

  const handleGantiLansia = async () => {
    if (!isEditModeLansia || selectedRowIdxLansia === null) {
      alert('Silakan pilih data yang akan diganti terlebih dahulu.');
      return;
    }
    await handleSimpanLansia();
  };

  if (!mounted) return null;

  const currentData = activeTab === 'dewasa' ? dataDewasa : activeTab === 'anak' ? dataAnak : dataLansia;
  const currentColumns = activeTab === 'dewasa' ? dewasaColumns : activeTab === 'anak' ? anakColumns : lansiaColumns;

  const handleBottomSearch = () => fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);

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

  const renderForm = () => {
    switch (activeTab) {
      case 'dewasa': return (
        <TopFormContainer title="Form Input Skrining Nutrisi Dewasa (MST)" isOpen={formOpen}>
          <div data-form="skrining" className="flex flex-col gap-5">
            <FormSection className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 shrink-0">Pasien</label>
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-14 sm:w-20 lg:w-35 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={noRawat} readOnly />
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-12 sm:w-14 lg:w-18 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={isLoadingPatient ? '...' : noRM} readOnly placeholder="RM" />
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-24 sm:w-28 lg:w-70 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama" />
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 sm:w-12 shrink-0">Tanggal</label>
                <input type="date"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-26 sm:w-28 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100"
                  value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
                <input type="time" step="1"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-22 sm:w-24 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100"
                  value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
                <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0" checked={isClockRunning} disabled title="Jam selalu real-time" />
              </div>
            </FormSection>
            <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <FormField label="BB" value={dBB} onChange={setDBB} unit="Kg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="LILA" value={dLILA} onChange={setDLILA} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="TB/PB" value={dTBPB} onChange={setDTBPB} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="TD" value={dTD} onChange={setDTD} unit="mmHg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="HR" value={dHR} onChange={setDHR} unit="/mnt" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="RR" value={dRR} onChange={setDRR} unit="/mnt" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="Suhu" value={dSuhu} onChange={setDSuhu} unit="°C" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="SpO2" value={dSpO2} onChange={setDSpO2} unit="%" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="Alergi" value={dAlergi} onChange={setDAlergi} placeholder="Alergi..." className="lg:col-span-2" onKeyDown={handleEnterKeyDown} />
              </div>
            </div>
            <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
              <div className="flex flex-col gap-4">
                {[
                  { num: "1.", text: "Apakah pasien mengalami penurunan berat badan yang tidak direncanakan dalam 6 bulan terakhir? (Penilaian 0-4)", val: dSG1, set: setDSG1, opts: ['Tidak', 'Tidak Yakin (Baju Jadi Longgar)', 'Ya, 1-5 Kg', 'Ya, 6-10 Kg', 'Ya, 11-15 Kg', 'Ya, >15 Kg'], skor: dNilai1 },
                  { num: "2.", text: "Apakah asupan makan pasien berkurang karena penurunan nafsu makan/kesulitan menerima makanan?", val: dSG2, set: setDSG2, opts: ['Tidak', 'Ya'], skor: dNilai2 },
                  { num: "3.", text: "Pasien dengan diagnosis khusus (DM/Kanker/GGK/Pasien HD/Infeksi kronis/Lain-lain)", val: dSG3, set: setDSG3, opts: ['Tidak', 'Ya'], skor: '-' },
                ].map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0 mt-1.5 w-4">{q.num}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{q.text}</p>
                    </div>
                    <select
                      value={q.val}
                      onChange={e => q.set(e.target.value)}
                      className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100 shrink-0"
                    >
                      {q.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 shrink-0 whitespace-nowrap mt-1.5 w-14 text-right">Nilai: {q.skor}</span>
                  </div>
                ))}
                <p className="text-[11px] italic text-slate-400 dark:text-slate-500 -mt-1">{'Bila Skor >= 2, Pasien Beresiko Malnutrisi, Konsul Ke Ahli Gizi'}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-bold text-brand-700 dark:text-brand-400 w-28 shrink-0">Total Skor</label>
                  <input type="text" value={dTotal} readOnly className="flex-1 border border-brand-300 dark:border-brand-700 rounded px-2 py-1.5 text-xs bg-brand-50 dark:bg-slate-700 font-bold text-brand-700 dark:text-brand-400" />
                </div>
              </div>
            </div>
            <FormSection>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 sm:w-24 shrink-0">Dilakukan Oleh</label>
                <div className="flex gap-1 flex-1">
                  <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 w-24 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-100" value={pegawaiNik} readOnly />
                  <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 w-75 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-100" value={pegawaiNama} readOnly />
                  <button onClick={() => setDialogPegawaiOpen(true)} className="px-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-600 rounded border border-transparent hover:border-brand-200 dark:hover:border-brand-600 transition-colors" title="Pilih Petugas"><FaEdit /></button>
                </div>
              </div>
            </FormSection>
          </div>
        </TopFormContainer>
      );
      case 'anak': return (
        <TopFormContainer title="Form Input Skrining Nutrisi Anak (StrongKids)" isOpen={formOpen}>
          <div data-form="skrining" className="flex flex-col gap-5">
            <FormSection className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 shrink-0">Pasien</label>
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-14 sm:w-20 lg:w-35 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={noRawat} readOnly />
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-12 sm:w-14 lg:w-18 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={isLoadingPatient ? '...' : noRM} readOnly placeholder="RM" />
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-24 sm:w-28 lg:w-70 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama" />
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-14 shrink-0">Tgl.Lahir</label>
                <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-24 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100" value={tglLahir} readOnly />
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 sm:w-12 shrink-0">Tanggal</label>
                <input type="date"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-26 sm:w-28 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100"
                  value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
                <input type="time" step="1"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-22 sm:w-24 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100"
                  value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
                <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0" checked={isClockRunning} disabled title="Jam selalu real-time" />
              </div>
            </FormSection>
            <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField label="BB" value={aBB} onChange={setABB} unit="Kg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="TB/PB" value={aTBPB} onChange={setATBPB} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="TD" value={aTD} onChange={setATD} unit="mmHg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="HR" value={aHR} onChange={setAHR} unit="/mnt" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="RR" value={aRR} onChange={setARR} unit="/mnt" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="Suhu" value={aSuhu} onChange={setASuhu} unit="°C" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="SpO2" value={aSpO2} onChange={setASpO2} unit="%" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="Alergi" value={aAlergi} onChange={setAAlergi} placeholder="Alergi..." className="lg:col-span-2" onKeyDown={handleEnterKeyDown} />
              </div>
            </div>
            <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
              <div className="flex flex-col gap-4">
                {[
                  { num: "1.", text: "Apakah pasien tampak kurus?", val: aSG1, set: setASG1, nil: aN1 },
                  { num: "2.", text: "Apakah terdapat penurunan berat badan selama satu bulan terakhir? (berdasarkan penilaian objektif data berat badan bila ada atau untuk bayi < 1 tahun ; berat badan tidak naik selama 3 bulan terakhir)", val: aSG2, set: setASG2, nil: aN2 },
                  { num: "3.", text: "Apakah terdapat salah satu dari kondisi tersebut? Diare > 5 kali/hari dan/atau muntah > 3 kali/hari dalam seminggu terakhir; Asupan makanan berkurang selama 1 minggu terakhir", val: aSG3, set: setASG3, nil: aN3 },
                  { num: "4.", text: "Apakah terdapat penyakit atau keadaan yang menyebabkan pasien beresiko mengalami malnutrisi?", val: aSG4, set: setASG4, nil: aN4 },
                ].map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0 mt-1.5 w-4">{q.num}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{q.text}</p>
                    </div>
                    <select
                      value={q.val}
                      onChange={e => q.set(e.target.value)}
                      className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100 shrink-0"
                    >
                      {['Tidak', 'Ya'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 shrink-0 whitespace-nowrap mt-1.5 w-14 text-right">Nilai: {q.nil}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600 mt-1">
                  <label className="text-xs font-bold text-brand-700 dark:text-brand-400 w-28 shrink-0">Total Skor</label>
                  <input type="text" value={aTotal} readOnly className="w-16 border border-brand-300 dark:border-brand-700 rounded px-2 py-1.5 text-xs bg-brand-50 dark:bg-slate-700 font-bold text-brand-700 dark:text-brand-400 text-center" />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-4 shrink-0">Hasil Skrining</label>
                  <input type="text" value={aSkorNutrisi} readOnly className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200" />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                  <SelectField label="Diketahui Dietisien" value={aDiketahui} onChange={setADiketahui} options={['Tidak', 'Ya']} className="flex-1" />
                  <FormField label="Jam/Dokter" value={aKetDiketahui} onChange={setAKetDiketahui} placeholder="Jam dilaporkan / nama dokter..." className="flex-1" onKeyDown={handleEnterKeyDown} />
                </div>
              </div>
            </div>
            <FormSection>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 sm:w-24 shrink-0">Dilakukan Oleh</label>
                <div className="flex gap-1 flex-1">
                  <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 w-24 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-100" value={pegawaiNik} readOnly />
                  <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 w-75 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-100" value={pegawaiNama} readOnly />
                  <button onClick={() => setDialogPegawaiOpen(true)} className="px-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-600 rounded border border-transparent hover:border-brand-200 dark:hover:border-brand-600 transition-colors" title="Pilih Petugas"><FaEdit /></button>
                </div>
              </div>
            </FormSection>
          </div>
        </TopFormContainer>
      );
      case 'lansia': return (
        <TopFormContainer title="Form Input Skrining Nutrisi Lansia (MNA)" isOpen={formOpen}>
          <div data-form="skrining" className="flex flex-col gap-5">
            <FormSection className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 shrink-0">Pasien</label>
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-14 sm:w-20 lg:w-35 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={noRawat} readOnly />
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-12 sm:w-14 lg:w-18 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={isLoadingPatient ? '...' : noRM} readOnly placeholder="RM" />
                <input type="text"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-24 sm:w-28 lg:w-70 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500 dark:text-slate-100"
                  value={isLoadingPatient ? 'Memuat...' : namaPasien} readOnly placeholder="Nama" />
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 sm:w-12 shrink-0">Tanggal</label>
                <input type="date"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-26 sm:w-28 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100"
                  value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
                <input type="time" step="1"
                  className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-22 sm:w-24 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100"
                  value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
                <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0" checked={isClockRunning} disabled title="Jam selalu real-time" />
              </div>
            </FormSection>
            <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField label="BB" value={lBB} onChange={setLBB} unit="Kg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="TB/PB" value={lTBPB} onChange={setLTBPB} unit="Cm" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="TD" value={lTD} onChange={setLTD} unit="mmHg" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="HR" value={lHR} onChange={setLHR} unit="/mnt" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="RR" value={lRR} onChange={setLRR} unit="/mnt" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="Suhu" value={lSuhu} onChange={setLSuhu} unit="°C" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="SpO2" value={lSpO2} onChange={setLSpO2} unit="%" placeholder="0" onKeyDown={handleEnterKeyDown} />
                <FormField label="Alergi" value={lAlergi} onChange={setLAlergi} placeholder="Alergi..." className="lg:col-span-2" onKeyDown={handleEnterKeyDown} />
              </div>
            </div>
            <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
              <div className="flex flex-col gap-4">
                {[
                  { num: "A.", text: "Apakah Asupan Makan Berkurang Selama 3 Bulan Terakhir ?", val: lSG1, set: setLSG1, opts: ['Asupan Makan Tidak Berkurang', 'Asupan Makan Agak Berkurang', 'Asupan Makan Sangat Berkurang'], skor: lN1 },
                  { num: "B.", text: "Penurunan Berat Badan Selama 3 Bulan Terakhir", val: lSG2, set: setLSG2, opts: ['Tidak Ada Penurunan Berat Badan', 'Penurunan Berat Badan Antara 1 Hingga 3 Kg', 'Tidak Tahu', 'Penurunan Berat Badan Lebih Dari 3 Kg'], skor: lN2 },
                  { num: "C.", text: "Mobilitas", val: lSG3, set: setLSG3, opts: ['Dapat Bepergian Keluar Rumah', 'Mampu Bangun Dari Tempat Tidur/Kursi Tetapi Tidak Bepergian Keluar Rumah', 'Terbatas Dari Tempat Tidur Atau Kursi'], skor: lN3 },
                  { num: "D.", text: "Menderita Tekanan Psikologis Atau Penyakit Berat Dalam 3 Bulan Terakhir", val: lSG4, set: setLSG4, opts: ['Tidak', 'Ya'], skor: lN4 },
                  { num: "E.", text: "Gangguan Neuropsikologis", val: lSG5, set: setLSG5, opts: ['Tidak Ada Gangguan Psikologis', 'Kepikunan Ringan', 'Depresi Berat Atau Kepikunan Berat'], skor: lN5 },
                  { num: "F.", text: "Indeks Masa Tubuh (IMT)", val: lSG6, set: setLSG6, opts: ['IMT >= 23', '21 Hingga < 23', '19 Hingga < 21', 'IMT < 19'], skor: lN6 },
                ].map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0 mt-1.5 w-5">{q.num}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{q.text}</p>
                    </div>
                    <select
                      value={q.val}
                      onChange={e => q.set(e.target.value)}
                      className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100 shrink-0 max-w-[220px]"
                    >
                      {q.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 shrink-0 whitespace-nowrap mt-1.5 w-14 text-right">Nilai: {q.skor}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600 mt-1">
                  <label className="text-xs font-bold text-brand-700 dark:text-brand-400 w-28 shrink-0">Total Skor</label>
                  <input type="text" value={lTotal} readOnly className="w-16 border border-brand-300 dark:border-brand-700 rounded px-2 py-1.5 text-xs bg-brand-50 dark:bg-slate-700 font-bold text-brand-700 dark:text-brand-400 text-center" />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-4 shrink-0">Hasil Skrining</label>
                  <input type="text" value={lSkorNutrisi} readOnly className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200" />
                </div>
              </div>
            </div>
            <FormSection>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20 sm:w-24 shrink-0">Dilakukan Oleh</label>
                <div className="flex gap-1 flex-1">
                  <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 w-24 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-100" value={pegawaiNik} readOnly />
                  <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 w-75 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-100" value={pegawaiNama} readOnly />
                  <button onClick={() => setDialogPegawaiOpen(true)} className="px-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-600 rounded border border-transparent hover:border-brand-200 dark:hover:border-brand-600 transition-colors" title="Pilih Petugas"><FaEdit /></button>
                </div>
              </div>
            </FormSection>
          </div>
        </TopFormContainer>
      );
    }
  };

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-2 md:px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setIsTableExpanded(false); setSelectedRows([]); }}
              className={`px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap relative ${isActive ? 'text-brand-700 dark:text-brand-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-brand-600'}`}>
              {t.label}
              {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 pt-0 pb-2 relative">
        <div className="flex flex-col min-h-full w-full">
          {renderForm()}

          <div className={`flex flex-col flex-1 min-h-0 transition-all duration-150 ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <DataTableMulti
              title={`Data ${tabs.find(t => t.id === activeTab)?.label || 'Skrining Nutrisi'}`}
              icon={<FaBed />}
              onRefresh={handleBottomSearch}
              onTitleClick={toggleForm}
              titleChevronOpen={formOpen}
              columns={currentColumns}
              data={currentData}
              idKey="id"
              selectedIds={selectedRows}
              onSelectionChange={setSelectedRows}
              onRowClick={(row: any) => {
                if (activeTab === 'dewasa') {
                  const idx = dataDewasa.findIndex(r => r.id === row.id);
                  if (idx >= 0) populateFormDewasa(row, idx);
                } else if (activeTab === 'anak') {
                  const idx = dataAnak.findIndex(r => r.id === row.id);
                  if (idx >= 0) populateFormAnak(row, idx);
                } else if (activeTab === 'lansia') {
                  const idx = dataLansia.findIndex(r => r.id === row.id);
                  if (idx >= 0) populateFormLansia(row, idx);
                }
              }}
              isLoading={isLoadingData}
              emptyMessage={`Tidak ada data ${tabs.find(t => t.id === activeTab)?.label || 'skrining nutrisi'} yang ditemukan.`}
            />
          </div>

          <AnimatePresence>
            {isTableExpanded && (<>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 dark:bg-slate-900 p-4 shadow-2xl rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-t-lg px-3 py-2 shrink-0">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 text-[13px]">Tabel Data {tabs.find(t => t.id === activeTab)?.label || 'Skrining Nutrisi'}</h3>
                  <button onClick={() => setIsTableExpanded(false)}
                    className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                    <FaCompress className="text-[10px]" /> Perkecil
                  </button>
                </div>
                <div className="border border-slate-300 dark:border-slate-700 border-t-0 overflow-auto bg-white dark:bg-slate-800 rounded-b-lg flex-1">
                  <DataTableMulti
                    columns={currentColumns}
                    data={currentData}
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

      <DialogPilihPegawai
        open={dialogPegawaiOpen}
        onClose={() => setDialogPegawaiOpen(false)}
        onSelect={handlePilihPegawai}
      />
      <BottomActionPanel buttonsAlign="left"
        onSave={activeTab === 'dewasa' ? handleSimpanDewasa : activeTab === 'anak' ? handleSimpanAnak : activeTab === 'lansia' ? handleSimpanLansia : undefined}
        onNew={activeTab === 'dewasa' ? handleBaruDewasa : activeTab === 'anak' ? handleBaruAnak : activeTab === 'lansia' ? handleBaruLansia : undefined}
        onReplace={activeTab === 'dewasa' ? handleGantiDewasa : activeTab === 'anak' ? handleGantiAnak : activeTab === 'lansia' ? handleGantiLansia : undefined}
        onDelete={activeTab === 'dewasa' ? handleHapusDewasa : activeTab === 'anak' ? handleHapusAnak : activeTab === 'lansia' ? handleHapusLansia : undefined}
        recordCount={currentData.length}
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
