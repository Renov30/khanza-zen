"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaBed, FaCompress, FaEdit } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import TopFormContainer from '@/components/TopFormContainer';
import { getPatientInfoByNoRawat, getSkriningNutrisiRanap, getSkriningNutrisiAnakRanap, getSkriningNutrisiLansiaRanap, getSkriningGiziLanjutRanap, getLoggedInPegawai } from '@/lib/actions/ranap';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';

interface SkriningNutrisiRow {
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

interface SkriningGiziLanjutRow {
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  umurdaftar: string; sttsumur: string; jk: string;
  tanggal: string; bb: string; tb: string; alergi: string;
  parameter_imt: string; skor_imt: string;
  parameter_bb: string; skor_bb: string;
  parameter_penyakit: string; skor_penyakit: string;
  skor_total: string; kesimpulan: string;
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
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'BB(Kg)', key: 'bb', width: '60px' },
  { header: 'TB/PB(Cm)', key: 'tbpb', width: '80px' },
  { header: 'TD(mmHg)', key: 'td', width: '75px' },
  { header: 'HR(/mnt)', key: 'hr', width: '65px' },
  { header: 'RR(/mnt)', key: 'rr', width: '65px' },
  { header: 'Suhu', key: 'suhu', width: '50px' },
  { header: 'SpO2(%)', key: 'spo2', width: '65px' },
  { header: 'Alergi', key: 'alergi', width: '120px', className: 'truncate' },
  { header: 'SG 1', key: 'sg1', width: '60px', className: 'truncate' },
  { header: 'N1', key: 'nilai1', width: '40px' },
  { header: 'SG 2', key: 'sg2', width: '60px', className: 'truncate' },
  { header: 'N2', key: 'nilai2', width: '40px' },
  { header: 'SG 3', key: 'sg3', width: '60px', className: 'truncate' },
  { header: 'N3', key: 'nilai3', width: '40px' },
  { header: 'SG 4', key: 'sg4', width: '60px', className: 'truncate' },
  { header: 'N4', key: 'nilai4', width: '40px' },
  { header: 'Total', key: 'total_hasil', width: '50px' },
  { header: 'Skor Nutrisi', key: 'skor_nutrisi', width: '120px', className: 'truncate' },
  { header: 'Diketahui', key: 'diketahui_dietisien', width: '70px' },
  { header: 'Ket.Diketahui', key: 'keterangan_diketahui_dietisien', width: '100px', className: 'truncate' },
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

const giziLanjutColumns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold hover:underline', width: '140px' },
  { header: 'No.RM', key: 'no_rkm_medis', className: 'text-brand-600 font-semibold', width: '70px' },
  { header: 'Nama Pasien', key: 'nm_pasien', className: 'text-slate-800 font-bold', width: '200px' },
  { header: 'JK', key: 'jk', width: '30px' },
  { header: 'Tanggal', key: 'tanggal', width: '160px' },
  { header: 'BB', key: 'bb', width: '40px' },
  { header: 'TB', key: 'tb', width: '40px' },
  { header: 'Alergi', key: 'alergi', width: '100px', className: 'truncate' },
  { header: 'Skor IMT', key: 'parameter_imt', width: '120px', className: 'truncate' },
  { header: 'S1', key: 'skor_imt', width: '40px' },
  { header: 'Kehilangan BB', key: 'parameter_bb', width: '120px', className: 'truncate' },
  { header: 'S2', key: 'skor_bb', width: '40px' },
  { header: 'Efek Penyakit', key: 'parameter_penyakit', width: '160px', className: 'truncate' },
  { header: 'S3', key: 'skor_penyakit', width: '40px' },
  { header: 'Total', key: 'skor_total', width: '50px' },
  { header: 'Kesimpulan', key: 'kesimpulan', width: '250px', className: 'truncate' },
  { header: 'NIP', key: 'nip', width: '100px' },
  { header: 'Petugas', key: 'nm_petugas', width: '180px' },
];

type TabId = 'dewasa' | 'anak' | 'lansia' | 'gizilanjut';

const tabs: { id: TabId; label: string }[] = [
  { id: 'dewasa', label: 'Dewasa' },
  { id: 'anak', label: 'Anak' },
  { id: 'lansia', label: 'Lansia' },
  { id: 'gizilanjut', label: 'Lanjutan' },
];

function SkriningNutrisiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dewasa');
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 8));
  const [isClockRunning, setIsClockRunning] = useState(true);

  const [noRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState('');
  const [namaPasien, setNamaPasien] = useState('');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Shared
  const [dataDewasa, setDataDewasa] = useState<SkriningNutrisiRow[]>([]);
  const [dataAnak, setDataAnak] = useState<SkriningNutrisiAnakRow[]>([]);
  const [dataLansia, setDataLansia] = useState<SkriningNutrisiLansiaRow[]>([]);
  const [dataGiziLanjut, setDataGiziLanjut] = useState<SkriningGiziLanjutRow[]>([]);
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
  const [dSG1, setDSG1] = useState(''); const [dNilai1, setDNilai1] = useState('');
  const [dSG2, setDSG2] = useState(''); const [dNilai2, setDNilai2] = useState('');
  const [dTotal, setDTotal] = useState('');

  // === Form state: Anak ===
  const [aBB, setABB] = useState(''); const [aTBPB, setATBPB] = useState('');
  const [aTD, setATD] = useState(''); const [aHR, setAHR] = useState('');
  const [aRR, setARR] = useState(''); const [aSuhu, setASuhu] = useState('');
  const [aSpO2, setASpO2] = useState('');   const [aAlergi, setAAlergi] = useState('');
  const [aSG1, setASG1] = useState('Tidak'); const [aN1, setAN1] = useState('0');
  const [aSG2, setASG2] = useState('Tidak'); const [aN2, setAN2] = useState('0');
  const [aSG3, setASG3] = useState('Tidak'); const [aN3, setAN3] = useState('0');
  const [aSG4, setASG4] = useState('Tidak'); const [aN4, setAN4] = useState('0');
  const [aTotal, setATotal] = useState('0');
  const [aSkorNutrisi, setASkorNutrisi] = useState('');
  const [aDiketahui, setADiketahui] = useState('Tidak');
  const [aKetDiketahui, setAKetDiketahui] = useState('');

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

  // === Form state: Gizi Lanjut ===
  const [gBB, setGBB] = useState(''); const [gTB, setGTB] = useState('');
  const [gAlergi, setGAlergi] = useState('');
  const [gIMT, setGIMT] = useState('');
  const [gSkor1, setGSkor1] = useState('IMT > 20/z score > 2');
  const [gSkor2, setGSkor2] = useState('BB Hilang < 5%');
  const [gSkor3, setGSkor3] = useState('Ada asupan nutrisi > 5 hari');
  const [gSkor1Val, setGSkor1Val] = useState('0');
  const [gSkor2Val, setGSkor2Val] = useState('0');
  const [gSkor3Val, setGSkor3Val] = useState('0');
  const [gTotal, setGTotal] = useState('0');
  const [gKesimpulan, setGKesimpulan] = useState('Beresiko rendah, ulangi 7 hari');

  // === Fetch helpers ===
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

  const fetchAllData = useCallback(async (nrw: string, kw: string = '', ta: string = '', tb: string = '') => {
    if (!nrw.trim()) return;
    setIsLoadingData(true);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        getSkriningNutrisiRanap(nrw, kw, ta, tb),
        getSkriningNutrisiAnakRanap(nrw, kw, ta, tb),
        getSkriningNutrisiLansiaRanap(nrw, kw, ta, tb),
        getSkriningGiziLanjutRanap(nrw, kw, ta, tb),
      ]);
      if (r1.success) setDataDewasa(r1.data.map((r: any) => ({ ...r, id: `${r.no_rawat}-${r.tanggal}-dewasa` })));
      if (r2.success) setDataAnak(r2.data.map((r: any) => ({ ...r, id: `${r.no_rawat}-${r.tanggal}-anak` })));
      if (r3.success) setDataLansia(r3.data.map((r: any) => ({ ...r, id: `${r.no_rawat}-${r.tanggal}-lansia` })));
      if (r4.success) setDataGiziLanjut(r4.data.map((r: any) => ({ ...r, id: `${r.no_rawat}-${r.tanggal}-gizi` })));
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

  // === Auto-score: Dewasa ===
  useEffect(() => {
    try {
      const n1 = parseInt(dNilai1) || 0;
      const n2 = parseInt(dNilai2) || 0;
      setDTotal((n1 + n2).toString());
    } catch { setDTotal('0'); }
  }, [dNilai1, dNilai2]);

  // === Auto-score: Anak ===
  useEffect(() => {
    const n1 = aSG1 === 'Ya' ? 1 : 0;
    const n2 = aSG2 === 'Ya' ? 1 : 0;
    const n3 = aSG3 === 'Ya' ? 1 : 0;
    const n4 = aSG4 === 'Ya' ? 1 : 0;
    setAN1(n1.toString()); setAN2(n2.toString()); setAN3(n3.toString()); setAN4(n4.toString());
    const total = n1 + n2 + n3 + n4;
    setATotal(total.toString());
    if (total === 0) setASkorNutrisi('Risiko rendah');
    else if (total <= 2) setASkorNutrisi('Risiko sedang');
    else setASkorNutrisi('Risiko tinggi');
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

  // === Auto-score: Gizi Lanjut ===
  const calcIMT = useCallback((bb: string, tb: string) => {
    const bbNum = parseFloat(bb); const tbNum = parseFloat(tb);
    if (bbNum > 0 && tbNum > 0) return (bbNum / ((tbNum / 100) * (tbNum / 100))).toFixed(1);
    return '';
  }, []);
  useEffect(() => { setGIMT(calcIMT(gBB, gTB)); }, [gBB, gTB, calcIMT]);
  useEffect(() => {
    const s1 = gSkor1 === 'IMT 18,5-20/-2 =< z score =< 2' ? 1 : gSkor1 === 'IMT < 18,5/z score < -2' ? 2 : 0;
    const s2 = gSkor2 === 'BB Hilang 5 - 10 %' ? 1 : gSkor2 === 'BB Hilang > 10 %' ? 2 : 0;
    const s3 = gSkor3 === 'Tidak ada asupan nutrisi > 5 hari' ? 2 : 0;
    setGSkor1Val(s1.toString()); setGSkor2Val(s2.toString()); setGSkor3Val(s3.toString());
    const total = s1 + s2 + s3;
    setGTotal(total.toString());
    if (total === 0) setGKesimpulan('Beresiko rendah, ulangi 7 hari');
    else if (total === 1) setGKesimpulan('Beresiko menengah, monitoring asupan selama 3 hari');
    else setGKesimpulan('Beresiko tinggi, bekerja sama dengan tim dukungan gizi upayakan peningkatan asupan gizi dan memberikan makanan sesuai dengan daya terima');
  }, [gSkor1, gSkor2, gSkor3]);

  if (!mounted) return null;

  const currentData = activeTab === 'dewasa' ? dataDewasa : activeTab === 'anak' ? dataAnak : activeTab === 'lansia' ? dataLansia : dataGiziLanjut;
  const currentColumns = activeTab === 'dewasa' ? dewasaColumns : activeTab === 'anak' ? anakColumns : activeTab === 'lansia' ? lansiaColumns : giziLanjutColumns;

  const handleBottomSearch = () => fetchAllData(noRawat, searchKeyword, tglAwal, tglAkhir);

  const FormField = ({ label, value, onChange, unit, placeholder, className = "" }: {
    label: string; value: string; onChange?: (v: string) => void; unit?: string; placeholder?: string; className?: string
  }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0 flex items-center gap-1">
        {label}
        {unit && <span className="text-[10px] text-slate-400 font-normal lowercase">({unit})</span>}
      </label>
      <input type="text"
        value={value} onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors bg-white"
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options, className = "" }: {
    label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string
  }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 min-w-0 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors bg-white">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'dewasa': return (
        <TopFormContainer title="Form Input Skrining Nutrisi Dewasa (MST)" persistenceKey="khanza_skrining_nutrisi_form_open">
          <div className="flex flex-col gap-5">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-[13px] font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">Antropometri & TTV</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <FormField label="BB" value={dBB} onChange={setDBB} unit="Kg" placeholder="0" />
                <FormField label="LILA" value={dLILA} onChange={setDLILA} unit="Cm" placeholder="0" />
                <FormField label="TB/PB" value={dTBPB} onChange={setDTBPB} unit="Cm" placeholder="0" />
                <FormField label="TD" value={dTD} onChange={setDTD} unit="mmHg" placeholder="0" />
                <FormField label="HR" value={dHR} onChange={setDHR} unit="/mnt" placeholder="0" />
                <FormField label="RR" value={dRR} onChange={setDRR} unit="/mnt" placeholder="0" />
                <FormField label="Suhu" value={dSuhu} onChange={setDSuhu} unit="°C" placeholder="0" />
                <FormField label="SpO2" value={dSpO2} onChange={setDSpO2} unit="%" placeholder="0" />
                <FormField label="Alergi" value={dAlergi} onChange={setDAlergi} placeholder="Alergi..." className="lg:col-span-2" />
              </div>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-[13px] font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Skrining Gizi (MST)</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-28 shrink-0">Penurunan BB</label>
                  <input type="text" value={dSG1} onChange={e => setDSG1(e.target.value)} placeholder="tidak tahu/tidak=0, 0.5-5kg=1, 5-10kg=2, >10kg=3" className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white" />
                  <label className="text-xs font-semibold text-slate-600 w-12 shrink-0 ml-2">Nilai 1</label>
                  <input type="text" value={dNilai1} onChange={e => setDNilai1(e.target.value)} className="w-16 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white text-center" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 w-28 shrink-0">Asupan Makanan</label>
                  <input type="text" value={dSG2} onChange={e => setDSG2(e.target.value)} placeholder="berkurang=1, tidak=0" className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white" />
                  <label className="text-xs font-semibold text-slate-600 w-12 shrink-0 ml-2">Nilai 2</label>
                  <input type="text" value={dNilai2} onChange={e => setDNilai2(e.target.value)} className="w-16 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white text-center" />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <label className="text-xs font-bold text-brand-700 w-28 shrink-0">Total Skor</label>
                  <input type="text" value={dTotal} readOnly className="flex-1 border border-brand-300 rounded px-2 py-1.5 text-xs bg-brand-50 font-bold text-brand-700" />
                </div>
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
      );
      case 'anak': return (
        <TopFormContainer title="Form Input Skrining Nutrisi Anak (StrongKids)" persistenceKey="khanza_skrining_nutrisi_anak_form_open">
          <div className="flex flex-col gap-5">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-[13px] font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">Antropometri & TTV</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField label="BB" value={aBB} onChange={setABB} unit="Kg" placeholder="0" />
                <FormField label="TB/PB" value={aTBPB} onChange={setATBPB} unit="Cm" placeholder="0" />
                <FormField label="TD" value={aTD} onChange={setATD} unit="mmHg" placeholder="0" />
                <FormField label="HR" value={aHR} onChange={setAHR} unit="/mnt" placeholder="0" />
                <FormField label="RR" value={aRR} onChange={setARR} unit="/mnt" placeholder="0" />
                <FormField label="Suhu" value={aSuhu} onChange={setASuhu} unit="°C" placeholder="0" />
                <FormField label="SpO2" value={aSpO2} onChange={setASpO2} unit="%" placeholder="0" />
                <FormField label="Alergi" value={aAlergi} onChange={setAAlergi} placeholder="Alergi..." className="lg:col-span-2" />
              </div>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-[13px] font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Skrining StrongKids</h3>
              <div className="flex flex-col gap-3">
                <SelectField label="1. Penurunan BB" value={aSG1} onChange={setASG1} options={['Tidak', 'Ya']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2">
                  <span className="text-[11px] text-slate-400">(Penurunan BB 1 bulan terakhir)</span>
                  <span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {aN1}</span>
                </div>
                <SelectField label="2. Tampak Kurus" value={aSG2} onChange={setASG2} options={['Tidak', 'Ya']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2">
                  <span className="text-[11px] text-slate-400">(Apakah pasien tampak kurus?)</span>
                  <span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {aN2}</span>
                </div>
                <SelectField label="3. Diare/Muntah" value={aSG3} onChange={setASG3} options={['Tidak', 'Ya']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2">
                  <span className="text-[11px] text-slate-400">(Diare &gt;5x/hr/muntah &gt;3x/hr atau asupan berkurang)</span>
                  <span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {aN3}</span>
                </div>
                <SelectField label="4. Penyakit Risiko" value={aSG4} onChange={setASG4} options={['Tidak', 'Ya']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2">
                  <span className="text-[11px] text-slate-400">(Penyakit/keadaan yang menyebabkan risiko malnutrisi)</span>
                  <span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {aN4}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-1">
                  <label className="text-xs font-bold text-brand-700 w-28 shrink-0">Total Skor</label>
                  <input type="text" value={aTotal} readOnly className="w-16 border border-brand-300 rounded px-2 py-1.5 text-xs bg-brand-50 font-bold text-brand-700 text-center" />
                  <label className="text-xs font-bold text-slate-700 ml-4 shrink-0">Skor Nutrisi</label>
                  <input type="text" value={aSkorNutrisi} readOnly className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 font-semibold text-slate-700" />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <SelectField label="Diketahui Dietisien" value={aDiketahui} onChange={setADiketahui} options={['Tidak', 'Ya']} className="flex-1" />
                  <FormField label="Jam/Dokter" value={aKetDiketahui} onChange={setAKetDiketahui} placeholder="Jam dilaporkan / nama dokter..." className="flex-1" />
                </div>
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
      );
      case 'lansia': return (
        <TopFormContainer title="Form Input Skrining Nutrisi Lansia (MNA)" persistenceKey="khanza_skrining_nutrisi_lansia_form_open">
          <div className="flex flex-col gap-5">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-[13px] font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">Antropometri & TTV</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField label="BB" value={lBB} onChange={setLBB} unit="Kg" placeholder="0" />
                <FormField label="TB/PB" value={lTBPB} onChange={setLTBPB} unit="Cm" placeholder="0" />
                <FormField label="TD" value={lTD} onChange={setLTD} unit="mmHg" placeholder="0" />
                <FormField label="HR" value={lHR} onChange={setLHR} unit="/mnt" placeholder="0" />
                <FormField label="RR" value={lRR} onChange={setLRR} unit="/mnt" placeholder="0" />
                <FormField label="Suhu" value={lSuhu} onChange={setLSuhu} unit="°C" placeholder="0" />
                <FormField label="SpO2" value={lSpO2} onChange={setLSpO2} unit="%" placeholder="0" />
                <FormField label="Alergi" value={lAlergi} onChange={setLAlergi} placeholder="Alergi..." className="lg:col-span-2" />
              </div>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
              <h3 className="text-[13px] font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Skrining MNA</h3>
              <div className="flex flex-col gap-3">
                <SelectField label="A. Asupan Makan" value={lSG1} onChange={setLSG1}
                  options={['Asupan Makan Tidak Berkurang', 'Asupan Makan Agak Berkurang', 'Asupan Makan Sangat Berkurang']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2"><span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {lN1}</span></div>
                <SelectField label="B. Penurunan BB" value={lSG2} onChange={setLSG2}
                  options={['Tidak Ada Penurunan Berat Badan', 'Penurunan Berat Badan Antara 1 Hingga 3 Kg', 'Tidak Tahu', 'Penurunan Berat Badan Lebih Dari 3 Kg']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2"><span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {lN2}</span></div>
                <SelectField label="C. Mobilitas" value={lSG3} onChange={setLSG3}
                  options={['Dapat Bepergian Keluar Rumah', 'Mampu Bangun Dari Tempat Tidur/Kursi Tetapi Tidak Bepergian Keluar Rumah', 'Terbatas Dari Tempat Tidur Atau Kursi']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2"><span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {lN3}</span></div>
                <SelectField label="D. Psikologis" value={lSG4} onChange={setLSG4} options={['Tidak', 'Ya']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2"><span className="text-[11px] text-slate-400">(Tekanan psikologis/penyakit berat 3 bulan terakhir)</span><span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {lN4}</span></div>
                <SelectField label="E. Neuropsikologis" value={lSG5} onChange={setLSG5}
                  options={['Tidak Ada Gangguan Psikologis', 'Kepikunan Ringan', 'Depresi Berat Atau Kepikunan Berat']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2"><span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {lN5}</span></div>
                <SelectField label="F. IMT" value={lSG6} onChange={setLSG6}
                  options={['IMT >= 23', '21 Hingga < 23', '19 Hingga < 21', 'IMT < 19']} />
                <div className="flex items-center gap-2 ml-[104px] -mt-2"><span className="text-xs font-semibold text-brand-600 ml-auto">Nilai: {lN6}</span></div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-1">
                  <label className="text-xs font-bold text-brand-700 w-28 shrink-0">Total Skor</label>
                  <input type="text" value={lTotal} readOnly className="w-16 border border-brand-300 rounded px-2 py-1.5 text-xs bg-brand-50 font-bold text-brand-700 text-center" />
                  <label className="text-xs font-bold text-slate-700 ml-4 shrink-0">Skor Nutrisi</label>
                  <input type="text" value={lSkorNutrisi} readOnly className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 font-semibold text-slate-700" />
                </div>
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
      );
      case 'gizilanjut': return (
        <TopFormContainer title="Form Input Skrining Gizi Lanjutan" persistenceKey="khanza_skrining_gizi_lanjut_form_open">
          <div className="flex flex-col gap-5">
            <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
              <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">Data Skrining Gizi</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">BB</label>
                <input type="text" value={gBB} onChange={e => setGBB(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-20" placeholder="0" />
                <span className="text-[10px] text-slate-400 -ml-2 w-6">Kg</span>
                <label className="text-xs font-semibold text-slate-600 w-8 shrink-0">TB</label>
                <input type="text" value={gTB} onChange={e => setGTB(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 w-20" placeholder="0" />
                <span className="text-[10px] text-slate-400 -ml-2 w-6">Cm</span>
                <label className="text-xs font-semibold text-slate-600 w-8 shrink-0">IMT</label>
                <input type="text" value={gIMT} readOnly
                  className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 focus:outline-none focus:border-brand-500 w-20" />
                <label className="text-xs font-semibold text-slate-600 w-12 shrink-0">Alergi</label>
                <input type="text" value={gAlergi} onChange={e => setGAlergi(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[120px]" placeholder="Alergi makanan/obat..." />
              </div>
            </div>
            <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
              <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">Penilaian Skrining</h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Skor 1</label>
                  <span className="text-xs text-slate-700 w-[300px] shrink-0">1. Skor IMT /z Score</span>
                  <select value={gSkor1} onChange={e => setGSkor1(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]">
                    <option>IMT &gt; 20/z score &gt; 2</option>
                    <option>IMT 18,5-20/-2 =&lt; z score =&lt; 2</option>
                    <option>IMT &lt; 18,5/z score &lt; -2</option>
                  </select>
                  <label className="text-xs font-semibold text-slate-600">Skor :</label>
                  <input type="text" value={gSkor1Val} readOnly
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold" />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Skor 2</label>
                  <span className="text-xs text-slate-700 w-[300px] shrink-0">2. Skor kehilangan BB yang tidak direncanakan 3-6 bulan terakhir</span>
                  <select value={gSkor2} onChange={e => setGSkor2(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]">
                    <option>BB Hilang &lt; 5%</option>
                    <option>BB Hilang 5 - 10 %</option>
                    <option>BB Hilang &gt; 10 %</option>
                  </select>
                  <label className="text-xs font-semibold text-slate-600">Skor :</label>
                  <input type="text" value={gSkor2Val} readOnly
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold" />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Skor 3</label>
                  <span className="text-xs text-slate-700 w-[300px] shrink-0">3. Skor efek penyakit akut</span>
                  <select value={gSkor3} onChange={e => setGSkor3(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]">
                    <option>Ada asupan nutrisi &gt; 5 hari</option>
                    <option>Tidak ada asupan nutrisi &gt; 5 hari</option>
                  </select>
                  <label className="text-xs font-semibold text-slate-600">Skor :</label>
                  <input type="text" value={gSkor3Val} readOnly
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold" />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t border-brand-100/50 mt-1">
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Total Skor</label>
                  <input type="text" value={gTotal} readOnly
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 w-12 text-center font-bold text-brand-700" />
                  <label className="text-xs font-semibold text-slate-600 w-20 shrink-0">Kesimpulan</label>
                  <input type="text" value={gKesimpulan} readOnly
                    className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-slate-50 text-slate-700 flex-1 min-w-[200px]" />
                </div>
              </div>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
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
      );
    }
  };

  return (
    <>
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
          <input type="checkbox" className="accent-brand-500 w-4 h-4 cursor-pointer ml-2"
            checked={isClockRunning} onChange={e => setIsClockRunning(e.target.checked)} title="Centang untuk jam real-time" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white border-b border-slate-200 px-2 md:px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setIsTableExpanded(false); setSelectedRows([]); }}
              className={`px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap relative ${isActive ? 'text-brand-700 font-bold' : 'text-slate-500 hover:text-brand-600'}`}>
              {t.label}
              {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto bg-white pt-0 pb-2 relative">
        <div className="flex flex-col min-h-full w-full">
          {renderForm()}

          <div className={`flex flex-col transition-all duration-150 h-[1500px] ${isTableExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <DataTableMulti
              title={`Data ${tabs.find(t => t.id === activeTab)?.label || 'Skrining Nutrisi'}`}
              icon={<FaBed />}
              onRefresh={handleBottomSearch}
              columns={currentColumns}
              data={currentData}
              idKey="id"
              selectedIds={selectedRows}
              onSelectionChange={setSelectedRows}
              isLoading={isLoadingData}
              emptyMessage={`Tidak ada data ${tabs.find(t => t.id === activeTab)?.label || 'skrining nutrisi'} yang ditemukan.`}
            />
          </div>

          <AnimatePresence>
            {isTableExpanded && (<>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTableExpanded(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }}
                className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 p-4 shadow-2xl rounded-xl border border-slate-300 flex flex-col">
                <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-t-lg px-3 py-2 shrink-0">
                  <h3 className="font-bold text-slate-700 text-[13px]">Tabel Data {tabs.find(t => t.id === activeTab)?.label || 'Skrining Nutrisi'}</h3>
                  <button onClick={() => setIsTableExpanded(false)}
                    className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm">
                    <FaCompress className="text-[10px]" /> Perkecil
                  </button>
                </div>
                <div className="border border-slate-300 border-t-0 overflow-auto bg-white rounded-b-lg flex-1">
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

      <BottomActionPanel
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
