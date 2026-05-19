"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaUtensils, FaEdit, FaExpand, FaCompress } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import { getPatientInfoByNoRawat, getAsuhanGiziRanap, getMonitoringGiziRanap, getSkriningGiziLanjutRanap, getCatatanADIMEGiziRanap, getSkriningNutrisiRanap, getLoggedInPegawai } from '@/lib/actions/ranap';
import DataTableMulti from '@/components/DataTableMulti';
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

interface AsuhanGiziRow {
  id: string; no_rawat: string; no_rkm_medis: string; nm_pasien: string;
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

const skriningNutrisiColumns: TableColumn[] = [
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

function AsuhanGiziContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('asuhangizi');
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const [noRawat, setNoRawat] = useState(noRawatParam);

  useEffect(() => {
    setNoRawat(noRawatParam);
  }, [noRawatParam]);
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
  const [pegawaiJabatan, setPegawaiJabatan] = useState('');

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
  const [monitoringDate, setMonitoringDate] = useState(today);
  const [monitoringTime, setMonitoringTime] = useState(new Date().toTimeString().slice(0, 8));

  // Skrining Gizi Lanjut state
  const [dataSkriningGizi, setDataSkriningGizi] = useState<SkriningGiziLanjutRow[]>([]);
  const [isLoadingSkriningGizi, setIsLoadingSkriningGizi] = useState(false);
  const [skriningGiziBB, setSkriningGiziBB] = useState('');
  const [skriningGiziTB, setSkriningGiziTB] = useState('');
  const [skriningGiziAlergi, setSkriningGiziAlergi] = useState('');
  const [skriningGiziDate, setSkriningGiziDate] = useState(today);

  // Catatan ADIME Gizi state
  const [dataADIME, setDataADIME] = useState<CatatanADIMERow[]>([]);
  const [isLoadingADIME, setIsLoadingADIME] = useState(false);
  const [adimeAsesmen, setAdimeAsesmen] = useState('');
  const [adimeDiagnosis, setAdimeDiagnosis] = useState('');
  const [adimeIntervensi, setAdimeIntervensi] = useState('');
  const [adimeMonitoring, setAdimeMonitoring] = useState('');
  const [adimeEvaluasi, setAdimeEvaluasi] = useState('');
  const [adimeInstruksi, setAdimeInstruksi] = useState('');
  const [adimeDate, setAdimeDate] = useState(today);

  // Skrining Nutrisi state
  const [dataSkriningNutrisi, setDataSkriningNutrisi] = useState<SkriningNutrisiRow[]>([]);
  const [isLoadingSkriningNutrisi, setIsLoadingSkriningNutrisi] = useState(false);
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

  const fetchDataSkriningNutrisi = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingSkriningNutrisi(true);
    try {
      const result = await getSkriningNutrisiRanap(nrw, kw, ta, tb);
      if (result.success && result.data) {
        const mappedData = result.data.map((row: any) => ({
          ...row,
          id: `${row.no_rawat}-${row.tanggal}`
        }));
        setDataSkriningNutrisi(mappedData);
      }
      else setDataSkriningNutrisi([]);
    } catch (e) { console.error('fetchDataSkriningNutrisi error:', e); setDataSkriningNutrisi([]); }
    setIsLoadingSkriningNutrisi(false);
  }, []);

  const fetchPegawaiInfo = useCallback(async () => {
    try {
      const result = await getLoggedInPegawai();
      if (result.success && result.data) {
        setPegawaiNik(result.data.nik);
        setPegawaiNama(result.data.nama);
        setPegawaiJabatan(result.data.jabatan);
      }
    } catch (e) { console.error('fetchPegawaiInfo error:', e); }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchPegawaiInfo();
    if (noRawatParam) {
      fetchPatientInfo(noRawatParam);
      fetchDataGizi(noRawatParam);
      fetchDataMonitoring(noRawatParam);
      fetchDataSkriningGizi(noRawatParam);
      fetchDataADIME(noRawatParam);
      fetchDataSkriningNutrisi(noRawatParam);
    }
  }, [noRawatParam, fetchPatientInfo, fetchDataGizi, fetchDataMonitoring, fetchDataSkriningGizi, fetchDataADIME, fetchDataSkriningNutrisi, fetchPegawaiInfo]);

  useEffect(() => {
    if (noRawat) {
      fetchDataGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
      fetchDataMonitoring(noRawat, searchKeyword, tglAwal, tglAkhir);
      fetchDataSkriningGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
      fetchDataADIME(noRawat, searchKeyword, tglAwal, tglAkhir);
      fetchDataSkriningNutrisi(noRawat, searchKeyword, tglAwal, tglAkhir);
    }
  }, [tglAwal, tglAkhir]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const handleBottomSearch = () => {
    fetchDataGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    fetchDataMonitoring(noRawat, searchKeyword, tglAwal, tglAkhir);
    fetchDataSkriningGizi(noRawat, searchKeyword, tglAwal, tglAkhir);
    fetchDataADIME(noRawat, searchKeyword, tglAwal, tglAkhir);
    fetchDataSkriningNutrisi(noRawat, searchKeyword, tglAwal, tglAkhir);
  };

  const FormField = ({ label, value, onChange, unit, placeholder, type = 'text', readOnly = false, className = "" }: {
    label: string; value: string; onChange?: (v: string) => void; unit?: string; placeholder?: string; type?: string; readOnly?: boolean; className?: string
  }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0 flex items-center gap-1">
        {label}
        {unit && <span className="text-[10px] text-slate-400 font-normal lowercase">({unit})</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`flex-1 min-w-0 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors ${readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  );

  const FormTextarea = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
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

  const tabs = [
    'Asuhan Gizi',
    'Monitoring Gizi',
    'Skrining Gizi Lanjut',
    'Catatan ADIME Gizi',
    'Skrining Nutrisi',
  ];

  return (
    <>
      {/* Bar Info Pasien Atas */}
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
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto w-full sm:w-auto">
          <label className="font-semibold text-slate-600">Tanggal :</label>
          <input type="date" className="border border-slate-300 rounded px-2 py-1 mr-1 focus:outline-none sm:w-27 focus:border-brand-500"
            value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
          <input type="time" step="1" className="border border-slate-300 rounded px-2 py-1 text-xs sm:w-25 focus:outline-none focus:border-brand-500 bg-white"
            value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
          <input type="checkbox" className="accent-brand-500 w-4 h-4 cursor-pointer ml-2"
            checked={isClockRunning} onChange={e => setIsClockRunning(e.target.checked)} title="Centang untuk jam real-time" />
        </div>
      </div>

      {/* Tab */}
      <div className="flex bg-white border-b border-slate-200 px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => {
          const tabId = tab.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isActive = activeTab === tabId;
          return (
            <button key={tab} onClick={() => { setActiveTab(tabId); setIsTableExpanded(false); setSelectedRows([]); }}
              className={`px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap relative ${isActive ? 'text-brand-700 font-bold' : 'text-slate-500 hover:text-brand-600'}`}>
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
            <TopFormContainer title="Form Input Asuhan Gizi" persistenceKey="khanza_asuhan_gizi_form_open">
              <div className="flex flex-col gap-5">
                {/* Antropometri */}
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">
                    Pengukuran Antropometri
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <FormField label="BB" value={bb} onChange={setBb} unit="Kg" placeholder="0" />
                    <FormField label="TB" value={tb} onChange={setTb} unit="Cm" placeholder="0" />
                    <FormField label="IMT" value={imt} onChange={setImt} unit="Kg/m²" placeholder="0" />
                    <FormField label="LLA" value={lla} onChange={setLla} unit="Cm" placeholder="0" />
                    <FormField label="TL" value={tl} onChange={setTl} unit="Cm" placeholder="0" />
                    <FormField label="ULNA" value={ulna} onChange={setUlna} unit="Cm" placeholder="0" />
                    <FormField label="BB Ideal" value={bbIdeal} onChange={setBbIdeal} unit="Kg" placeholder="0" />
                    <FormField label="BB/U" value={bbU} onChange={setBbU} unit="SD" placeholder="0" />
                    <FormField label="TKU" value={tku} onChange={setTku} unit="SD" placeholder="0" />
                    <FormField label="BB/TB" value={bbTb} onChange={setBbTb} unit="SD" placeholder="0" />
                    <FormField label="LLA/U" value={llaUPersen} onChange={setLlaUPersen} unit="SD" placeholder="0" />
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
                      <FormField label="Pola Makan" value={polaMakan} onChange={setPolaMakan} placeholder="Contoh: 3x makan utama, porsi habis" />
                      <FormField label="Riwayat Personal" value={riwayatPersonal} onChange={setRiwayatPersonal} placeholder="Riwayat penyakit keluarga/personal..." />
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
            <div className={`flex flex-col transition-all duration-150 h-[500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DataTableMulti
                title="Data Asuhan Gizi Pasien"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                columns={columns}
                data={dataGizi}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
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
            <TopFormContainer title="Form Input Monitoring & Evaluasi Gizi" persistenceKey="khanza_monitoring_gizi_form_open">
              <div className="flex flex-col gap-5">
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">
                    Data Monitoring
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">Tanggal & Waktu</label>
                    <div className="flex gap-2 flex-1">
                      <input type="date" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                        value={monitoringDate} onChange={e => setMonitoringDate(e.target.value)} />
                      <input type="time" step="1" className="border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-brand-500 text-xs bg-white"
                        value={monitoringTime} onChange={e => setMonitoringTime(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormTextarea label="Monitoring" value={monitoringText} onChange={setMonitoringText} placeholder="Catatan monitoring asuhan gizi..." />
                  <FormTextarea label="Evaluasi" value={evaluasiText} onChange={setEvaluasiText} placeholder="Catatan evaluasi asuhan gizi..." />
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

            <div className={`flex flex-col transition-all duration-150 h-[500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DataTableMulti
                title="Data Monitoring & Evaluasi Asuhan Gizi"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                columns={monitoringColumns}
                data={dataMonitoring}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
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
            <TopFormContainer title="Form Input Skrining Gizi Lanjut" persistenceKey="khanza_skrining_gizi_form_open">
              <div className="flex flex-col gap-5">
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">Data Skrining Gizi</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">Tanggal</label>
                    <input type="date" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={skriningGiziDate} onChange={e => setSkriningGiziDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField label="BB" value={skriningGiziBB} onChange={setSkriningGiziBB} unit="Kg" placeholder="0" />
                  <FormField label="TB" value={skriningGiziTB} onChange={setSkriningGiziTB} unit="Cm" placeholder="0" />
                  <FormField label="Alergi" value={skriningGiziAlergi} onChange={setSkriningGiziAlergi} placeholder="Alergi makanan/obat..." />
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

            <div className={`flex flex-col transition-all duration-150 h-[500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DataTableMulti
                title="Data Skrining Gizi Lanjut"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                columns={skriningGiziLanjutColumns}
                data={dataSkriningGizi}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
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
            <TopFormContainer title="Form Input Catatan ADIME Gizi" persistenceKey="khanza_adime_gizi_form_open">
              <div className="flex flex-col gap-5">
                <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
                  <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">Catatan ADIME</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">Tanggal</label>
                    <input type="date" className="border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-brand-500 text-xs bg-white"
                      value={adimeDate} onChange={e => setAdimeDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormTextarea label="Asesmen (A)" value={adimeAsesmen} onChange={setAdimeAsesmen} placeholder="Hasil asesmen gizi..." />
                  <FormTextarea label="Diagnosis (D)" value={adimeDiagnosis} onChange={setAdimeDiagnosis} placeholder="Diagnosis gizi..." />
                  <FormTextarea label="Intervensi (I)" value={adimeIntervensi} onChange={setAdimeIntervensi} placeholder="Intervensi gizi..." />
                  <FormTextarea label="Monitoring (M)" value={adimeMonitoring} onChange={setAdimeMonitoring} placeholder="Monitoring gizi..." />
                  <FormTextarea label="Evaluasi (E)" value={adimeEvaluasi} onChange={setAdimeEvaluasi} placeholder="Evaluasi gizi..." />
                  <FormTextarea label="Instruksi" value={adimeInstruksi} onChange={setAdimeInstruksi} placeholder="Instruksi medis/diet..." />
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

            <div className={`flex flex-col transition-all duration-150 h-[500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DataTableMulti
                title="Data Catatan ADIME Gizi"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                columns={catatanADIMEColumns}
                data={dataADIME}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
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
                      isLoading={isLoadingADIME}
                    />
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'skriningnutrisi' && (
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

            <div className={`flex flex-col transition-all duration-150 h-[500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DataTableMulti
                title="Data Skrining Nutrisi"
                icon={<FaUtensils />}
                onRefresh={handleBottomSearch}
                columns={skriningNutrisiColumns}
                data={dataSkriningNutrisi}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
                isLoading={isLoadingSkriningNutrisi}
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
                      columns={skriningNutrisiColumns}
                      data={dataSkriningNutrisi}
                      idKey="id"
                      selectedIds={selectedRows}
                      onSelectionChange={setSelectedRows}
                      isLoading={isLoadingSkriningNutrisi}
                    />
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>
        )}

        {activeTab !== 'asuhangizi' && activeTab !== 'monitoringgizi' && activeTab !== 'skrininggizilanjut' && activeTab !== 'catatanadimegizi' && activeTab !== 'skriningnutrisi' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            Menu belum tersedia
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <BottomActionPanel
        recordCount={
          activeTab === 'monitoringgizi' ? dataMonitoring.length :
          activeTab === 'skrininggizilanjut' ? dataSkriningGizi.length :
          activeTab === 'catatanadimegizi' ? dataADIME.length :
          activeTab === 'skriningnutrisi' ? dataSkriningNutrisi.length :
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
