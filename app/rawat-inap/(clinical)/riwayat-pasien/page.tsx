"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaHistory, FaClipboardList, FaNotesMedical, FaCheckSquare, FaSquare, FaBars, FaPrint, FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaUserMd, FaPrescription, FaFlask, FaXRay, FaSyringe, FaProcedures, FaBed, FaStethoscope, FaHeartbeat, FaBrain, FaTooth, FaEye, FaBaby, FaFemale, FaMale, FaWalking, FaWheelchair, FaUserInjured, FaAmbulance, FaPills, FaLungs, FaInfoCircle } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';
import {
  getRiwayatKunjungan, getRiwayatSoapie, getRiwayatPerawatanPasien,
  getDiagnosaPasien, getProsedurPasien, getTriaseIGD,
  getPemeriksaanRanapRiwayat, getTindakanRanapDokter,
  getTindakanRanapParamedis, getPenggunaanKamar, getResumeRanap,
  getOperasiPasien, getRadiologiPasien, getLaboratPasien, getPemberianObat,
  getPasienInfo, getPatientInfoByNoRawat,
  getLoggedInPegawai, cekApakahDPJP,
  verifikasiSoapRanap, hapusVerifikasiSoapRanap,
  bulkVerifikasiSoapRanap, hapusBulkVerifikasiSoapRanap,
  getDaftarDPJP,
  getSectionData,
  getOperasiLengkap, getBerkasDigital,
  getTindakanRalanDokter, getTindakanRalanParamedis,
  getTindakanRalanDokterParamedis, getTindakanRanapDokterParamedis,
  getPenggunaanObatOperasi, getResumePasien, getResumeICU, getResumeMata,
  getAsuhanGiziRanap, getMonitoringGiziRanap,
  getSkriningGiziLanjutRanap, getSkriningNutrisiRanap,
  getSkriningNutrisiAnakRanap, getSkriningNutrisiLansiaRanap,
  getReturObat, getLaboratPAPasien, getCatatanADIMEGiziRanap,
} from '@/lib/actions/ranap';
import FormSection from "@/components/FormSection";
import QRCodeDisplay from '@/components/QRCodeDisplay';
import SectionsSidebar from './SectionsSidebar';
import { renderSection } from './section-renderers';
import { sectionGroups, allSectionIds } from './section-groups';

async function fetchSectionData(sectionId: string, noRawat: string) {
  const specialized: Record<string, (noRawat: string) => Promise<{ success: boolean; data: any[] }>> = {
    diagnosa: getDiagnosaPasien,
    prosedur: getProsedurPasien,
    triase: getTriaseIGD,
    pemeriksaan_ranap: getPemeriksaanRanapRiwayat,
    tindakan_ranap_dokter: getTindakanRanapDokter,
    tindakan_ranap_paramedis: getTindakanRanapParamedis,
    penggunaan_kamar: getPenggunaanKamar,
    operasi: getOperasiPasien,
    operasi_lengkap: getOperasiLengkap,
    radiologi: getRadiologiPasien,
    laboratorium: getLaboratPasien,
    pemberian_obat: getPemberianObat,
    berkas_digital: getBerkasDigital,
    resume_pasien: getResumePasien,
    resume_icu: getResumeICU,
    resume_mata: getResumeMata,
    tindakan_ralan_dokter: getTindakanRalanDokter,
    tindakan_ralan_paramedis: getTindakanRalanParamedis,
    tindakan_ralan_dokter_paramedis: getTindakanRalanDokterParamedis,
    tindakan_ranap_dokter_paramedis: getTindakanRanapDokterParamedis,
    penggunaan_obat_operasi: getPenggunaanObatOperasi,
    skrining_nutrisi_dewasa: (nr: string) => getSkriningNutrisiRanap(nr),
    skrining_nutrisi_anak: (nr: string) => getSkriningNutrisiAnakRanap(nr),
    skrining_nutrisi_lansia: (nr: string) => getSkriningNutrisiLansiaRanap(nr),
    skrining_gizi_lanjut: (nr: string) => getSkriningGiziLanjutRanap(nr),
    monitoring_gizi: (nr: string) => getMonitoringGiziRanap(nr),
    asuhan_gizi: (nr: string) => getAsuhanGiziRanap(nr),
    catatan_adime_gizi: (nr: string) => getCatatanADIMEGiziRanap(nr),
    retur_obat: getReturObat,
    laboratorium_pa: getLaboratPAPasien,
  };
  const fn = specialized[sectionId];
  if (fn) return fn(noRawat);
  return getSectionData(sectionId, noRawat);
}

interface KunjunganRow {
  id: string; rowType: string; no_rawat: string; tgl: string; jam: string;
  kd_dokter: string; nm_dokter: string; umur: string; poli_kamar: string;
  png_jawab: string;
}

interface SoapEntry {
  status: string; tglJam: string; petugas: string; profesi: string;
  subjektif: string; objektif: string; pemeriksaan: string; alergi: string;
  asesmen: string; plan: string; instruksi: string; evaluasi: string;
  verifikasi: string; tgl_verifikasi: string;
}

interface SoapGroup { tglReg: string; no_rawat: string; dpjp: Array<{ kd_dokter: string; nm_dokter: string }>; entries: SoapEntry[]; }

interface PerawatanSection {
  id: string; label: string; icon: React.ReactNode;
  fetchData: (noRawat: string) => Promise<any>;
  render: (data: any[]) => React.ReactNode;
}

const filterModes = [
  { id: "5terakhir", label: "5 Riwayat Terakhir" },
  { id: "semua", label: "Semua Riwayat" },
  { id: "tanggal", label: "Tanggal" },
  { id: "norawat", label: "No.Rawat" },
];

function PatientInfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-slate-500 dark:text-slate-400 text-[10px]">{label}</span>
      <span className="text-slate-800 dark:text-slate-100 text-[11px]">{value || '-'}</span>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden animate-pulse">
      <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-40" />
      </div>
      <div className="p-3 bg-white dark:bg-slate-800/50 space-y-2">
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-5/6" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
      </div>
    </div>
  );
}

function RiwayatPasienContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get("noRawat") || "";
  const noRMParam = searchParams.get("noRM") || "";
  const nmPasienParam = searchParams.get("nama") || "";

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("kunjungan");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [filterMode, setFilterMode] = useState(noRawatParam ? "norawat" : "5terakhir");
  const [filterNoRawat, setFilterNoRawat] = useState(noRawatParam);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [tglAwal, setTglAwal] = useState(new Date().toISOString().split('T')[0]);
  const [tglAkhir, setTglAkhir] = useState(new Date().toISOString().split('T')[0]);

  const [kunjunganData, setKunjunganData] = useState<KunjunganRow[]>([]);
  const [soapieData, setSoapieData] = useState<SoapGroup[]>([]);
  const [perawatanVisits, setPerawatanVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<string>("");
  const [sectionData, setSectionData] = useState<Record<string, any[]>>({});
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  // Sidebar checkbox state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>({});

  const [resolvedNoRM, setResolvedNoRM] = useState(noRMParam);
  const [resolvedNmPasien, setResolvedNmPasien] = useState(nmPasienParam);
  const [showPasienInfo, setShowPasienInfo] = useState(false);
  const [pasienInfo, setPasienInfo] = useState<any>(null);

  // User info + DPJP
  const [pegawaiNik, setPegawaiNik] = useState('');
  const [pegawaiNama, setPegawaiNama] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [dpjpCache, setDpjpCache] = useState<Record<string, string[]>>({});
  const [verifLoading, setVerifLoading] = useState<string | null>(null);

  // Confirm dialog untuk verifikasi
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string;
    action: () => Promise<void>;
  }>({ open: false, title: '', message: '', action: async () => {} });

  const [isClockRunning, setIsClockRunning] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 8));
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFetchKeyRef = useRef('');
  const autoDetectDoneRef = useRef<Record<string, boolean>>({});

  // Per-section loading states
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [fetchingSections, setFetchingSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isLoadingData) {
      loadingTimerRef.current = setTimeout(() => setShowLoadingOverlay(true), 1000);
    } else {
      if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null; }
      setShowLoadingOverlay(false);
    }
    return () => { if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current); };
  }, [isLoadingData]);

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

  // Auto-detect section yang punya data saat perawatan tab dibuka
  useEffect(() => {
    if (activeTab !== 'perawatan' || !selectedVisit) return;
    if (autoDetectDoneRef.current[selectedVisit]) return;
    autoDetectDoneRef.current[selectedVisit] = true;

    const run = async () => {
      setIsAutoDetecting(true);
      const results: Record<string, any[]> = {};
      const sectionsWithData: string[] = [];
      const BATCH_SIZE = 15;

      for (let i = 0; i < allSectionIds.length; i += BATCH_SIZE) {
        const batch = allSectionIds.slice(i, i + BATCH_SIZE);
        // Mark all sections in this batch as "fetching"
        setFetchingSections(prev => {
          const next = { ...prev };
          batch.forEach(id => { next[id] = true; });
          return next;
        });
        const responses = await Promise.allSettled(
          batch.map(id => fetchSectionData(id, selectedVisit))
        );
        for (let j = 0; j < batch.length; j++) {
          const id = batch[j];
          const res = responses[j];
          if (res.status === 'fulfilled' && res.value.success && res.value.data.length > 0) {
            results[id] = res.value.data;
            sectionsWithData.push(id);
          }
        }
        // Clear fetching state for this batch
        setFetchingSections(prev => {
          const next = { ...prev };
          batch.forEach(id => { delete next[id]; });
          return next;
        });
      }

      setIsAutoDetecting(false);

      if (sectionsWithData.length === 0) return;

      const newChecked: Record<string, boolean> = {};
      sectionsWithData.forEach(id => { newChecked[id] = true; });
      setSectionData(prev => ({ ...prev, ...results }));
      setCheckedSections(newChecked);
    };
    run();
  }, [activeTab, selectedVisit]);

  // Fetch data untuk section yang dicentang
  useEffect(() => {
    if (!selectedVisit) return;
    const checkedIds = Object.entries(checkedSections)
      .filter(([_, v]) => v)
      .map(([id]) => id)
      .sort();
    const fetchKey = checkedIds.join(',') + '|' + selectedVisit;

    // Skip jika auto-detection sudah menyediakan data untuk semua section yang dicentang
    if (checkedIds.length > 0 && checkedIds.every(id => id in sectionData)) {
      if (fetchKey !== prevFetchKeyRef.current) {
        prevFetchKeyRef.current = fetchKey;
      }
      return;
    }

    if (fetchKey === prevFetchKeyRef.current) return;
    prevFetchKeyRef.current = fetchKey;

    if (checkedIds.length === 0) { setSectionData({}); return; }

    const fetchAll = async () => {
      const results: Record<string, any[]> = {};
      for (const sectionId of checkedIds) {
        setFetchingSections(prev => ({ ...prev, [sectionId]: true }));
        try {
          const res = await fetchSectionData(sectionId, selectedVisit);
          results[sectionId] = res.success ? res.data : [];
        } catch { results[sectionId] = []; }
        setFetchingSections(prev => ({ ...prev, [sectionId]: false }));
      }
      setSectionData(prev => ({ ...prev, ...results }));
    };
    fetchAll();
  }, [checkedSections, selectedVisit, sectionData]);

  const fetchKunjungan = useCallback(async () => {
    setIsLoadingData(true);
    const result = await getRiwayatKunjungan(resolvedNoRM, filterMode, tglAwal, tglAkhir, filterNoRawat);
    if (result.success) {
      const mapped = result.data.map((row: any, i: number) => ({ ...row, id: `kunj-${i}` }));
      setKunjunganData(mapped);
    }
    setIsLoadingData(false);
  }, [resolvedNoRM, filterMode, tglAwal, tglAkhir, filterNoRawat]);

  const fetchSoapie = useCallback(async () => {
    setIsLoadingData(true);
    const result = await getRiwayatSoapie(resolvedNoRM, filterMode, tglAwal, tglAkhir, filterNoRawat);
    if (result.success) setSoapieData(result.data);
    setIsLoadingData(false);
  }, [resolvedNoRM, filterMode, tglAwal, tglAkhir, filterNoRawat]);

  const fetchPerawatan = useCallback(async () => {
    setIsLoadingData(true);
    const result = await getRiwayatPerawatanPasien(resolvedNoRM, filterMode, tglAwal, tglAkhir, filterNoRawat);
    if (result.success) {
      setPerawatanVisits(result.data);
      if (result.data.length > 0 && !selectedVisit) {
        setSelectedVisit(result.data[0].no_rawat);
      }
    }
    setIsLoadingData(false);
  }, [resolvedNoRM, filterMode, tglAwal, tglAkhir, filterNoRawat]);

  useEffect(() => {
    setMounted(true);

    const initFromNoRawat = async () => {
      // Fetch logged-in user info
      const pegRes = await getLoggedInPegawai();
      if (pegRes.success && pegRes.data) {
        setPegawaiNik(pegRes.data.nik);
        setPegawaiNama(pegRes.data.nama);
        setIsAdmin(!!pegRes.data.is_admin);
      }

      if (noRawatParam) {
        const patientRes = await getPatientInfoByNoRawat(noRawatParam);
        if (patientRes.success && patientRes.data) {
          setSelectedVisit(noRawatParam);
          setResolvedNoRM(patientRes.data.no_rkm_medis);
          setResolvedNmPasien(patientRes.data.nm_pasien);
          const infoRes = await getPasienInfo(patientRes.data.no_rkm_medis);
          if (infoRes.success && infoRes.data) setPasienInfo(infoRes.data);
          // Pre-cache DPJP
          const dpjpRes = await getDaftarDPJP(noRawatParam);
          if (dpjpRes.success) {
            setDpjpCache(prev => ({ ...prev, [noRawatParam]: dpjpRes.data.map((d: any) => d.kd_dokter) }));
          }
        }
      } else if (noRMParam) {
        setResolvedNoRM(noRMParam);
        setResolvedNmPasien(nmPasienParam);
        const res = await getPasienInfo(noRMParam);
        if (res.success && res.data) setPasienInfo(res.data);
      }
    };
    initFromNoRawat();
  }, [noRawatParam, noRMParam]);

  useEffect(() => {
    if (activeTab === "kunjungan") fetchKunjungan();
    else if (activeTab === "soapie") fetchSoapie();
    else if (activeTab === "perawatan") fetchPerawatan();
  }, [activeTab, fetchKunjungan, fetchSoapie, fetchPerawatan]);

  // Cache DPJP per no_rawat saat soapieData berubah
  useEffect(() => {
    soapieData.forEach(async (group) => {
      if (!dpjpCache[group.no_rawat]) {
        const res = await getDaftarDPJP(group.no_rawat);
        if (res.success) {
          setDpjpCache(prev => ({ ...prev, [group.no_rawat]: res.data.map((d: any) => d.kd_dokter) }));
        }
      }
    });
  }, [soapieData]);

  // Handlers verifikasi
  const handleBulkVerifikasi = async (noRawat: string, tglPerawatan: string) => {
    setVerifLoading(`bulk-${noRawat}-${tglPerawatan}`);
    const res = await bulkVerifikasiSoapRanap(noRawat, tglPerawatan);
    if (res.success) {
      if (res.message !== "Semua SOAP sudah diverifikasi") {
        alert(res.message);
      }
      fetchSoapie();
    } else {
      alert(res.message);
    }
    setVerifLoading(null);
  };

  const handleBulkHapus = async (noRawat: string, tglPerawatan: string) => {
    setVerifLoading(`bulkhapus-${noRawat}-${tglPerawatan}`);
    const res = await hapusBulkVerifikasiSoapRanap(noRawat, tglPerawatan);
    if (res.success) {
      if (res.terhapus > 0) alert(res.message);
      fetchSoapie();
    } else {
      alert(res.message);
    }
    setVerifLoading(null);
  };

  const isUserDPJP = (noRawat: string): boolean => {
    const dpjpList = dpjpCache[noRawat] || [];
    return isAdmin || dpjpList.includes(pegawaiNik);
  };

  if (!mounted) return null;

  const handleBottomSearch = () => {
    if (activeTab === "kunjungan") fetchKunjungan();
    else if (activeTab === "soapie") fetchSoapie();
    else if (activeTab === "perawatan") fetchPerawatan();
  };

  const kunjunganColumns: TableColumn[] = [
    { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold', width: '140px' },
    { header: 'Tanggal', key: 'tgl', width: '100px' },
    { header: 'Jam', key: 'jam', width: '80px' },
    { header: 'Kd.Dokter', key: 'kd_dokter', width: '80px' },
    { header: 'Dokter Dituju/DPJP', key: 'nm_dokter', width: '200px', render: (row: any) => {
      let prefix = '';
      if (row.rowType === 'rujukan') prefix = 'Rujukan: ';
      else if (row.rowType === 'kamar') prefix = 'DPJP: ';
      return <div><span className="text-[10px] text-slate-400 dark:text-slate-500">{prefix}</span>{row.nm_dokter}</div>;
    }},
    { header: 'Umur', key: 'umur', width: '60px' },
    { header: 'Poliklinik/Kamar', key: 'poli_kamar', width: '160px' },
    { header: 'Jenis Bayar', key: 'png_jawab', width: '100px' },
  ];

  const renderForm = (data: any[], labelKey = 'nama', valueKey = 'nilai') => {
    if (data.length === 0) return <span className="text-slate-400 dark:text-slate-500 italic">Tidak ada data</span>;
    return data.map((row: any, i: number) => (
      <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-1">
        {Object.entries(row).filter(([k]) => !['no_rawat', 'nip', 'kd_dokter', 'kd_petugas', 'status'].includes(k)).map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400 w-32 capitalize">{key.replace(/_/g, ' ')}:</span>
            <span>{val !== null && val !== undefined && val !== '0000-00-00' ? String(val) : '-'}</span>
          </div>
        ))}
      </div>
    ));
  };

  const renderTable = (data: any[], columns: { key: string; label: string; align?: string; render?: (v: any, row: any) => React.ReactNode }[]) => {
    if (data.length === 0) return <span className="text-slate-400 dark:text-slate-500 italic">Tidak ada data</span>;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              {columns.map((col) => (
                <th key={col.key} className={`p-2 border dark:border-slate-700 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className='bg-white dark:bg-slate-800'>
                {columns.map((col) => (
                  <td key={col.key} className={`p-2 border dark:border-slate-700 ${col.align === 'right' ? 'text-right' : ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] !== null && row[col.key] !== undefined && row[col.key] !== '0000-00-00' ? String(row[col.key]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // sectionDefs will be defined in future implementation

  return (
    <>


      {/* Tab */}
      <div className="flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-2 md:px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {[
          { id: "kunjungan", label: "Riwayat Kunjungan" },
          { id: "soapie", label: "Riwayat S.O.A.P.I.E" },
          { id: "perawatan", label: "Riwayat Perawatan" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap relative ${activeTab === tab.id ? "text-brand-700 dark:text-brand-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-brand-600"}`}>
            {tab.label}
            {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          {activeTab === "kunjungan" && (
            <motion.div key="kunjungan" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
              className="flex-1 overflow-auto p-4">
              <div className="mb-3">
                <FormSection className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 shrink-0">Pasien</label>
                    <input type="text" readOnly
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-14 sm:w-20 lg:w-35 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={noRawatParam || resolvedNoRM} />
                    <input type="text" readOnly placeholder="RM"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-12 sm:w-14 lg:w-18 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={resolvedNoRM} />
                    <input type="text" readOnly placeholder="Nama"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-24 sm:w-28 lg:w-70 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={resolvedNmPasien} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-14 shrink-0">Tanggal</label>
                    <input type="date"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-26 sm:w-28 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                      value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
                    <input type="time" step="1"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-22 sm:w-24 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                      value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
                    <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0"
                      checked={isClockRunning} disabled title="Jam selalu real-time" />
                    <button onClick={() => setShowPasienInfo(true)}
                      className="ml-1 px-2 py-1 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded transition-colors flex items-center gap-1.5 shrink-0">
                      <FaInfoCircle className="text-[11px]" /> Data Pasien
                    </button>
                  </div>
                </FormSection>
              </div>
              <DataTableMulti
                title="Riwayat Kunjungan"
                icon={<FaHistory />}
                onRefresh={handleBottomSearch}
                columns={kunjunganColumns}
                data={kunjunganData}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
                isLoading={isLoadingData}
                emptyMessage="Tidak ada riwayat kunjungan ditemukan."
              />
            </motion.div>
          )}

          {activeTab === "soapie" && (
            <motion.div key="soapie" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
              className="flex-1 overflow-auto p-4">
              <div className="mb-3">
                <FormSection className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 shrink-0">Pasien</label>
                    <input type="text" readOnly
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-14 sm:w-20 lg:w-35 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={noRawatParam || resolvedNoRM} />
                    <input type="text" readOnly placeholder="RM"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-12 sm:w-14 lg:w-18 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={resolvedNoRM} />
                    <input type="text" readOnly placeholder="Nama"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-24 sm:w-28 lg:w-70 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={resolvedNmPasien} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-14 shrink-0">Tanggal</label>
                    <input type="date"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-26 sm:w-28 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                      value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
                    <input type="time" step="1"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-22 sm:w-24 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                      value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
                    <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0"
                      checked={isClockRunning} disabled title="Jam selalu real-time" />
                    <button onClick={() => setShowPasienInfo(true)}
                      className="ml-1 px-2 py-1 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded transition-colors flex items-center gap-1.5 shrink-0">
                      <FaInfoCircle className="text-[11px]" /> Data Pasien
                    </button>
                  </div>
                </FormSection>
              </div>
              {isLoadingData ? (
                <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : soapieData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs italic">Tidak ada data SOAPIE ditemukan.</div>
              ) : soapieData.map((group, gi) => {
                const userCanVerify = isUserDPJP(group.no_rawat);
                const dpjpNames = group.dpjp?.map((d: any) => d.nm_dokter).join(', ') || '-';
                return (
                <div key={gi} className="mb-6">
                  <div className="flex items-center gap-3 mb-3 text-xs flex-wrap">
                    <span className="font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-slate-700 px-3 py-1 rounded-full">Tgl.Reg: {group.tglReg}</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">No.Rawat: {group.no_rawat}</span>
                    <span className="text-slate-500 dark:text-slate-400 italic text-[11px]">DPJP: {dpjpNames}</span>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 grid grid-cols-12 gap-0">
                      <div className="col-span-1 p-2 border-r border-slate-200 dark:border-slate-700 text-center">Status</div>
                      <div className="col-span-1 p-2 border-r border-slate-200 dark:border-slate-700">Tgl, Jam</div>
                      <div className="col-span-2 p-2 border-r border-slate-200 dark:border-slate-700">PPA</div>
                      <div className="col-span-4 p-2 border-r border-slate-200 dark:border-slate-700">Hasil Asesmen & Pelayanan</div>
                      <div className="col-span-2 p-2 border-r border-slate-200 dark:border-slate-700">Instruksi / IPA</div>
                      <div className="col-span-2 p-2">Verifikasi DPJP</div>
                    </div>
                    {group.entries.map((entry, ei) => (

                      <div key={ei} className="grid grid-cols-12 gap-0 text-xs border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <div className="col-span-1 p-2 border-r border-slate-200 dark:border-slate-700 text-center font-semibold text-brand-700 dark:text-brand-400">{entry.status}</div>
                        <div className="col-span-1 p-2 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{entry.tglJam}</div>
                        <div className="col-span-2 p-2 border-r border-slate-200 dark:border-slate-700">
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{entry.petugas}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">{entry.profesi}</div>
                        </div>
                        <div className="col-span-4 p-2 border-r border-slate-200 dark:border-slate-700">
                          <div className="space-y-1">
                            {entry.subjektif && <div><span className="font-semibold text-slate-500 dark:text-slate-400">S:</span> {entry.subjektif}</div>}
                            {entry.objektif && <div><span className="font-semibold text-slate-500 dark:text-slate-400">O:</span> <span className="text-[11px]">{entry.objektif}</span></div>}
                            {entry.asesmen && <div><span className="font-semibold text-slate-500 dark:text-slate-400">A:</span> {entry.asesmen}</div>}
                            {entry.plan && <div><span className="font-semibold text-slate-500 dark:text-slate-400">P:</span> {entry.plan}</div>}
                          </div>
                        </div>
                        <div className="col-span-2 p-2 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{entry.instruksi || '-'}</div>
                        <div className="col-span-2 p-2 flex flex-col items-center gap-1">
                          {entry.verifikasi ? (
                            <>
                              <QRCodeDisplay
                                value={entry.verifikasi}
                                size={80}
                                label={entry.verifikasi}
                                sublabel={entry.tgl_verifikasi}
                              />
                              {(userCanVerify || isAdmin) && (
                                <button
                                  onClick={() => {
                                    const tgl = entry.tglJam.split(' ')[0];
                                    const jam = entry.tglJam.split(' ')[1] || '';
                                    setConfirmDialog({
                                      open: true,
                                      title: 'Hapus Verifikasi',
                                      message: `Hapus verifikasi SOAP untuk ${tgl} ${jam}?`,
                                      action: async () => {
                                        const res = await hapusVerifikasiSoapRanap(group.no_rawat, tgl, jam);
                                        if (!res.success) alert(res.message);
                                        fetchSoapie();
                                      },
                                    });
                                  }}
                                  className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors">
                                  Hapus
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-slate-400 dark:text-slate-500 italic text-[11px] mb-1">Belum Verifikasi</span>
                              {userCanVerify && (
                                <button
                                  onClick={() => {
                                    const parts = entry.tglJam.split(' ');
                                    const tgl = parts[0];
                                    const jam = parts[1] || '';
                                    setConfirmDialog({
                                      open: true,
                                      title: 'Verifikasi SOAP',
                                      message: `Verifikasi SOAP untuk ${tgl} ${jam}?`,
                                      action: async () => {
                                        const res = await verifikasiSoapRanap(group.no_rawat, tgl, jam);
                                        if (!res.success) alert(res.message);
                                        fetchSoapie();
                                      },
                                    });
                                  }}
                                  className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">
                                  Verifikasi
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Bulk actions per group */}
                  {userCanVerify && group.entries.some(e => !e.verifikasi) && (
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            open: true,
                            title: 'Verifikasi Semua',
                            message: `Verifikasi semua SOAP yang belum diverifikasi pada tanggal ini?`,
                            action: async () => {
                              await handleBulkVerifikasi(group.no_rawat, group.tglReg);
                            },
                          });
                        }}
                        disabled={verifLoading === `bulk-${group.no_rawat}-${group.tglReg}`}
                        className="text-[10px] px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50">
                        {verifLoading === `bulk-${group.no_rawat}-${group.tglReg}` ? 'Memverifikasi...' : 'Verifikasi Semua SOAP'}
                      </button>
                      {group.entries.some(e => e.verifikasi) && (
                        <button
                          onClick={() => {
                            setConfirmDialog({
                              open: true,
                              title: 'Hapus Semua Verifikasi',
                              message: `Hapus semua verifikasi SOAP pada tanggal ini?`,
                              action: async () => {
                                await handleBulkHapus(group.no_rawat, group.tglReg);
                              },
                            });
                          }}
                          disabled={verifLoading === `bulkhapus-${group.no_rawat}-${group.tglReg}`}
                          className="text-[10px] px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50">
                          {verifLoading === `bulkhapus-${group.no_rawat}-${group.tglReg}` ? 'Menghapus...' : 'Hapus Semua Verifikasi'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );})}
            </motion.div>
          )}

          {activeTab === "perawatan" && (
            <motion.div key="perawatan" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
              className="flex-1 flex overflow-hidden relative">
              {/* Sidebar */}
              <SectionsSidebar
                checkedSections={checkedSections}
                setCheckedSections={setCheckedSections}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />

              {/* Main content area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header info */}
                <div className="p-3 pb-0 shrink-0">
                  <FormSection className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 shrink-0">Pasien</label>
                      <input type="text" readOnly
                        className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-14 sm:w-20 lg:w-35 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                        value={noRawatParam || resolvedNoRM} />
                      <input type="text" readOnly placeholder="RM"
                        className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-12 sm:w-14 lg:w-18 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                        value={resolvedNoRM} />
                      <input type="text" readOnly placeholder="Nama"
                        className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 w-24 sm:w-28 lg:w-70 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                        value={resolvedNmPasien} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-14 shrink-0">Tanggal</label>
                      <input type="date"
                        className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-26 sm:w-28 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                        value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
                      <input type="time" step="1"
                        className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-xs w-22 sm:w-24 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                        value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
                      <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0"
                        checked={isClockRunning} disabled title="Jam selalu real-time" />
                      <button onClick={() => setShowPasienInfo(true)}
                        className="ml-1 px-2 py-1 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded transition-colors flex items-center gap-1.5 shrink-0">
                        <FaInfoCircle className="text-[11px]" /> Data Pasien
                      </button>
                    </div>
                  </FormSection>
                </div>

                {/* Visit picker */}
                <div className="px-3 py-2 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">Kunjungan:</label>
                    <select
                      value={selectedVisit}
                      onChange={e => setSelectedVisit(e.target.value)}
                      className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs bg-white dark:bg-slate-700 min-w-[200px] focus:outline-none focus:border-brand-500"
                    >
                      <option value="">Pilih Kunjungan</option>
                      {perawatanVisits.map((v: any, i: number) => (
                        <option key={i} value={v.no_rawat}>
                          {v.no_rawat} — {v.tgl_registrasi} ({v.nm_dokter || '-'})
                        </option>
                      ))}
                    </select>
                    {selectedVisit && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        {perawatanVisits.find((v: any) => v.no_rawat === selectedVisit)?.nm_pasien || ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Section content */}
                <div className="flex-1 overflow-y-auto p-3 pt-0 custom-scrollbar space-y-4">
                  {/* Informasi Umum Pasien — always visible */}
                  {pasienInfo && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          Informasi Umum Pasien
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                          <PatientInfoField label="Pasien" value={`${pasienInfo.no_rkm_medis} — ${pasienInfo.nm_pasien}`} />
                          <PatientInfoField label="J.K." value={pasienInfo.jk} />
                          <PatientInfoField label="Tempat & Tgl.Lahir" value={`${pasienInfo.tmp_lahir}, ${pasienInfo.tgl_lahir || '-'}`} />
                          <PatientInfoField label="Alamat" value={pasienInfo.alamat} />
                          <PatientInfoField label="G.D." value={pasienInfo.gol_darah} />
                          <PatientInfoField label="Nama Ibu Kandung" value={pasienInfo.nm_ibu} />
                          <PatientInfoField label="NIK/No.KTP" value={pasienInfo.no_ktp} />
                          <PatientInfoField label="No.HP" value={pasienInfo.no_tlp} />
                          <PatientInfoField label="Agama" value={pasienInfo.agama} />
                          <PatientInfoField label="Stts.Nikah" value={pasienInfo.stts_nikah} />
                          <PatientInfoField label="Pendidikan" value={pasienInfo.pendidikan} />
                          <PatientInfoField label="Bahasa" value={pasienInfo.bahasa} />
                          <PatientInfoField label="Cacat Fisik" value={pasienInfo.cacat_fisik} />
                          <PatientInfoField label="Pekerjaan" value={pasienInfo.pekerjaan} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-detection scanning indicator */}
                  {isAutoDetecting && Object.keys(checkedSections).length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 italic px-1">
                      <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                      Memindai data pasien...
                    </div>
                  )}

                  {/* Checked sections */}
                  {Object.entries(checkedSections).filter(([_, checked]) => checked).map(([sectionId]) => {
                    const sectionInfo = allSectionIds.includes(sectionId)
                      ? sectionGroups.flatMap(g => g.sections).find(s => s.id === sectionId)
                      : null;
                    const isLoading = fetchingSections[sectionId];
                    const hasData = sectionId in sectionData;
                    // Show skeleton while loading and data isn't available yet
                    if (isLoading && !hasData) {
                      return <SectionSkeleton key={sectionId} />;
                    }
                    return (
                      <div key={sectionId} id={`section-${sectionId}`} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                            {sectionInfo?.label || sectionId}
                          </span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800/50">
                          {renderSection(sectionId, sectionData[sectionId] || [])}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Data Pasien */}
      <AnimatePresence>
        {showPasienInfo && pasienInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setShowPasienInfo(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 w-[calc(100%-2rem)] sm:w-[600px] max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <FaInfoCircle className="text-brand-500" /> Data Pasien
                </h3>
                <button onClick={() => setShowPasienInfo(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors">
                  <FaTimes className="text-xs" />
                </button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs">
                  {[
                    ["No. RM", pasienInfo.no_rkm_medis],
                    ["Nama Pasien", pasienInfo.nm_pasien],
                    ["Jenis Kelamin", pasienInfo.jk],
                    ["Tempat Lahir", pasienInfo.tmp_lahir],
                    ["Tanggal Lahir", pasienInfo.tgl_lahir],
                    ["Agama", pasienInfo.agama],
                    ["Gol. Darah", pasienInfo.gol_darah],
                    ["Status Nikah", pasienInfo.stts_nikah],
                    ["Pendidikan", pasienInfo.pendidikan],
                    ["Pekerjaan", pasienInfo.pekerjaan],
                    ["Alamat", pasienInfo.alamat],
                    ["Ibu Kandung", pasienInfo.nm_ibu],
                    ["No. KTP", pasienInfo.no_ktp],
                    ["No. HP", pasienInfo.no_tlp],
                    ["Bahasa", pasienInfo.bahasa],
                    ["Cacat Fisik", pasienInfo.cacat_fisik],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="text-slate-800 dark:text-slate-100">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end px-5 py-3 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => setShowPasienInfo(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 w-96 p-5"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-2">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">{confirmDialog.message}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                  Batal
                </button>
                <button onClick={async () => {
                  await confirmDialog.action();
                  setConfirmDialog(prev => ({ ...prev, open: false }));
                }}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold transition-colors">
                  Konfirmasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {showLoadingOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {}}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 px-8 py-6 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Memuat data...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BottomActionPanel */}
      <BottomActionPanel buttonsAlign="left"
        recordCount={activeTab === "kunjungan" ? kunjunganData.length : activeTab === "soapie" ? soapieData.length : 0}
        onExit={() => router.back()}
        searchValue={searchKeyword}
        onSearchChange={setSearchKeyword}
        onSearch={handleBottomSearch}
        dateStart={tglAwal}
        dateEnd={tglAkhir}
        onDateStartChange={setTglAwal}
        onDateEndChange={setTglAkhir}
        extraFilters={
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-slate-600 dark:text-slate-300 text-xs">Filter :</span>
            {filterModes.map((opt) => (
              <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="filterMode" value={opt.id}
                  checked={filterMode === opt.id} onChange={() => setFilterMode(opt.id)}
                  className="accent-brand-500 w-3.5 h-3.5" />
                <span className={`text-xs ${filterMode === opt.id ? "font-bold text-brand-700 dark:text-brand-400" : "text-slate-600 dark:text-slate-300"}`}>{opt.label}</span>
              </label>
            ))}
            {filterMode === "norawat" && (
              <input type="text" value={filterNoRawat} onChange={e => setFilterNoRawat(e.target.value)}
                placeholder="No. Rawat..." className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs w-40 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700" />
            )}
          </div>
        }
      />
    </>
  );
}

export default function RiwayatPasienPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <RiwayatPasienContent />
    </Suspense>
  );
}
