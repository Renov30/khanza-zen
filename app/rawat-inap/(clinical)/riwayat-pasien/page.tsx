"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaHistory, FaClipboardList, FaNotesMedical, FaCheckSquare, FaSquare, FaBars, FaPrint, FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaUserMd, FaPrescription, FaFlask, FaXRay, FaSyringe, FaProcedures, FaBed, FaStethoscope, FaHeartbeat, FaBrain, FaTooth, FaEye, FaBaby, FaFemale, FaMale, FaWalking, FaWheelchair, FaUserInjured, FaAmbulance, FaPills, FaLungs } from 'react-icons/fa';
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
} from '@/lib/actions/ranap';
import QRCodeDisplay from '@/components/QRCodeDisplay';

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
  const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>({
    triase: true, catatan_dokter: true, pemeriksaan_ralan: true, pemeriksaan: true,
    catatan_observasi_ranap: true, catatan_keperawatan_ranap: true,
    diagnosa: true, prosedur: true, kamar: true, resume: true, operasi: true,
    radiologi: true, laborat: true, obat: true,
  });

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

  const fetchSectionData = useCallback(async (noRawat: string, sectionId: string) => {
    setLoadingSection(sectionId);
    const fetchers: Record<string, (nr: string) => Promise<any>> = {
      diagnosa: getDiagnosaPasien, prosedur: getProsedurPasien,
      triase: getTriaseIGD, pemeriksaan: getPemeriksaanRanapRiwayat,
      tindakan_dokter: getTindakanRanapDokter,
      tindakan_paramedis: getTindakanRanapParamedis,
      kamar: getPenggunaanKamar, resume: getResumeRanap,
      operasi: getOperasiLengkap, radiologi: getRadiologiPasien,
      laborat: getLaboratPasien, obat: getPemberianObat,
      tindakan_ralan_dokter: getTindakanRalanDokter,
      tindakan_ralan_paramedis: getTindakanRalanParamedis,
      tindakan_ralan_dokter_paramedis: getTindakanRalanDokterParamedis,
      tindakan_ranap_dokter_paramedis: getTindakanRanapDokterParamedis,
      penggunaan_obat_operasi: getPenggunaanObatOperasi,
      resume_ralan: getResumePasien,
      resume_icu: getResumeICU,
      resume_mata: getResumeMata,
      berkas_digital: getBerkasDigital,
    };
    const fetcher = fetchers[sectionId];
    if (fetcher) {
      const result = await fetcher(noRawat);
      if (result.success) {
        setSectionData(prev => ({ ...prev, [sectionId]: result.data }));
      }
    } else {
      // Gunakan getSectionData untuk seksi yang tidak punya fetcher spesifik
      const result = await getSectionData(sectionId, noRawat);
      if (result.success) {
        setSectionData(prev => ({ ...prev, [sectionId]: result.data }));
      }
    }
    setLoadingSection(null);
  }, []);

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

  useEffect(() => {
    if (selectedVisit) {
      const enabled = Object.entries(checkedSections).filter(([, v]) => v).map(([k]) => k);
      enabled.forEach(s => fetchSectionData(selectedVisit, s));
    }
  }, [selectedVisit, checkedSections, fetchSectionData]);

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
              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900'}>
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

  const sectionDefs: PerawatanSection[] = [
    { id: 'diagnosa', label: 'Diagnosa/Penyakit (ICD 10)', icon: <FaStethoscope />,
      fetchData: getDiagnosaPasien,
      render: (data) => renderTable(data, [
        { key: 'kd_penyakit', label: 'Kode' }, { key: 'nm_penyakit', label: 'Diagnosa' },
        { key: 'status', label: 'Status' }, { key: 'nm_dokter', label: 'Dokter' },
      ])},
    { id: 'prosedur', label: 'Prosedur/Tindakan (ICD 9)', icon: <FaProcedures />,
      fetchData: getProsedurPasien,
      render: (data) => renderTable(data, [
        { key: 'kd_icd9', label: 'Kode' }, { key: 'nm_icd9_1', label: 'Prosedur' },
      ])},
    { id: 'triase', label: 'Triase IGD/UGD', icon: <FaAmbulance />,
      fetchData: getTriaseIGD,
      render: (data) => renderTable(data, [
        { key: 'nama_pemeriksaan', label: 'Pemeriksaan', render: (v: any, r: any) => v || r.pemeriksaan },
        { key: 'hasil', label: 'Hasil' }, { key: 'nm_pegawai', label: 'Petugas' },
      ])},
    { id: 'catatan_dokter', label: 'Catatan Dokter', icon: <FaNotesMedical />,
      fetchData: (nr: string) => getSectionData('catatan_dokter', nr),
      render: (data) => renderTable(data, [
        { key: 'tanggal', label: 'Tanggal', render: (v: any, r: any) => `${v || ''} ${r.jam || ''}` },
        { key: 'kd_dokter', label: 'Kode' }, { key: 'nm_dokter', label: 'Dokter' },
        { key: 'catatan', label: 'Catatan' },
      ])},
    { id: 'pemeriksaan_ralan', label: 'Pemeriksaan Ralan', icon: <FaHeartbeat />,
      fetchData: (nr: string) => getSectionData('pemeriksaan_ralan', nr),
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl', render: (v: any, r: any) => `${v || ''} ${r.jam_rawat || ''}` },
        { key: 'keluhan', label: 'Subjektif' }, { key: 'pemeriksaan', label: 'Objek' },
        { key: 'penilaian', label: 'Asesmen' }, { key: 'rtl', label: 'Plan' },
        { key: 'nm_pegawai', label: 'Petugas' },
      ])},
    { id: 'pemeriksaan_obstetri_ralan', label: 'Pemeriksaan Obstetri Ralan', icon: <FaFemale />,
      fetchData: (nr: string) => getSectionData('pemeriksaan_obstetri_ralan', nr),
      render: (data) => renderForm(data)},
    { id: 'pemeriksaan_genekologi_ralan', label: 'Pemeriksaan Genekologi Ralan', icon: <FaFemale />,
      fetchData: (nr: string) => getSectionData('pemeriksaan_genekologi_ralan', nr),
      render: (data) => renderForm(data)},
    { id: 'pemeriksaan', label: 'Pemeriksaan Ranap', icon: <FaHeartbeat />,
      fetchData: getPemeriksaanRanapRiwayat,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl', render: (v: any, r: any) => `${v || ''} ${r.jam_rawat || ''}` },
        { key: 'keluhan', label: 'Subjektif' }, { key: 'pemeriksaan', label: 'Objek' },
        { key: 'penilaian', label: 'Asesmen' }, { key: 'rtl', label: 'Plan' },
        { key: 'nm_pegawai', label: 'Petugas' },
      ])},
    { id: 'pemeriksaan_obstetri_ranap', label: 'Pemeriksaan Obstetri Ranap', icon: <FaFemale />,
      fetchData: (nr: string) => getSectionData('pemeriksaan_obstetri_ranap', nr),
      render: (data) => renderForm(data)},
    { id: 'pemeriksaan_genekologi_ranap', label: 'Pemeriksaan Genekologi Ranap', icon: <FaFemale />,
      fetchData: (nr: string) => getSectionData('pemeriksaan_genekologi_ranap', nr),
      render: (data) => renderForm(data)},
    { id: 'catatan_observasi_ranap', label: 'Catatan Observasi Ranap', icon: <FaNotesMedical />,
      fetchData: (nr: string) => getSectionData('catatan_observasi_ranap', nr),
      render: (data) => renderTable(data, [
        { key: 'tgl_observasi', label: 'Tgl' }, { key: 'jam_observasi', label: 'Jam' },
        { key: 'hasil_observasi', label: 'Hasil' }, { key: 'nip', label: 'Petugas' },
      ])},
    { id: 'catatan_observasi_ranap_kebidanan', label: 'Observasi Ranap Kebidanan', icon: <FaFemale />,
      fetchData: (nr: string) => getSectionData('catatan_observasi_ranap_kebidanan', nr),
      render: (data) => renderForm(data)},
    { id: 'catatan_observasi_ranap_postpartum', label: 'Observasi Post Partum', icon: <FaBaby />,
      fetchData: (nr: string) => getSectionData('catatan_observasi_ranap_postpartum', nr),
      render: (data) => renderForm(data)},
    { id: 'catatan_keperawatan_ranap', label: 'Catatan Keperawatan Ranap', icon: <FaNotesMedical />,
      fetchData: (nr: string) => getSectionData('catatan_keperawatan_ranap', nr),
      render: (data) => renderForm(data)},
    { id: 'catatan_observasi_igd', label: 'Catatan Observasi IGD', icon: <FaAmbulance />,
      fetchData: (nr: string) => getSectionData('catatan_observasi_igd', nr),
      render: (data) => renderForm(data)},
    { id: 'catatan_keperawatan_ralan', label: 'Catatan Keperawatan Ralan', icon: <FaNotesMedical />,
      fetchData: (nr: string) => getSectionData('catatan_keperawatan_ralan', nr),
      render: (data) => renderForm(data)},
    { id: 'follow_up_dbd', label: 'Follow Up DBD', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('follow_up_dbd', nr),
      render: (data) => renderForm(data)},
    { id: 'catatan_cek_gds', label: 'Catatan Cek GDS', icon: <FaFlask />,
      fetchData: (nr: string) => getSectionData('catatan_cek_gds', nr),
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl', render: (v: any, r: any) => `${v || ''} ${r.jam_rawat || ''}` },
        { key: 'gds', label: 'GDS' }, { key: 'nip', label: 'Petugas' },
      ])},
    { id: 'penilaian_ulang_nyeri', label: 'Penilaian Ulang Nyeri', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('penilaian_ulang_nyeri', nr),
      render: (data) => renderForm(data)},
    { id: 'monitoring_reaksi_tranfusi', label: 'Monitoring Reaksi Tranfusi', icon: <FaPills />,
      fetchData: (nr: string) => getSectionData('monitoring_reaksi_tranfusi', nr),
      render: (data) => renderForm(data)},
    { id: 'catatan_persalinan', label: 'Catatan Persalinan', icon: <FaBaby />,
      fetchData: (nr: string) => getSectionData('catatan_persalinan', nr),
      render: (data) => renderForm(data)},

    // Tindakan
    { id: 'tindakan_dokter', label: 'Tindakan Ranap Dokter', icon: <FaUserMd />,
      fetchData: getTindakanRanapDokter,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl' }, { key: 'nm_perawatan', label: 'Tindakan' },
        { key: 'biaya_rawat', label: 'Biaya', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
        { key: 'nm_dokter', label: 'Dokter' },
      ])},
    { id: 'tindakan_paramedis', label: 'Tindakan Ranap Paramedis', icon: <FaUserInjured />,
      fetchData: getTindakanRanapParamedis,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl' }, { key: 'nm_perawatan', label: 'Tindakan' },
        { key: 'biaya_rawat', label: 'Biaya', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
        { key: 'nm_petugas', label: 'Petugas' },
      ])},
    { id: 'tindakan_ralan_dokter', label: 'Tindakan Ralan Dokter', icon: <FaUserMd />,
      fetchData: getTindakanRalanDokter,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl', render: (v: any, r: any) => `${v || ''} ${r.jam_rawat || ''}` },
        { key: 'nm_perawatan', label: 'Tindakan' }, { key: 'nm_dokter', label: 'Dokter' },
      ])},
    { id: 'tindakan_ralan_paramedis', label: 'Tindakan Ralan Paramedis', icon: <FaUserInjured />,
      fetchData: getTindakanRalanParamedis,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl', render: (v: any, r: any) => `${v || ''} ${r.jam_rawat || ''}` },
        { key: 'nm_perawatan', label: 'Tindakan' }, { key: 'nama', label: 'Paramedis' },
      ])},
    { id: 'tindakan_ralan_dokter_paramedis', label: 'Tindakan Ralan Dokter & Paramedis', icon: <FaUserMd />,
      fetchData: getTindakanRalanDokterParamedis,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl', render: (v: any, r: any) => `${v || ''} ${r.jam_rawat || ''}` },
        { key: 'nm_perawatan', label: 'Tindakan' }, { key: 'nm_dokter', label: 'Dokter' },
        { key: 'nama', label: 'Paramedis' },
      ])},
    { id: 'tindakan_ranap_dokter_paramedis', label: 'Tindakan Ranap Dokter & Paramedis', icon: <FaUserMd />,
      fetchData: getTindakanRanapDokterParamedis,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl', render: (v: any, r: any) => `${v || ''} ${r.jam_rawat || ''}` },
        { key: 'nm_perawatan', label: 'Tindakan' }, { key: 'nm_dokter', label: 'Dokter' },
        { key: 'nama', label: 'Paramedis' },
      ])},
    { id: 'kamar', label: 'Penggunaan Kamar', icon: <FaBed />,
      fetchData: getPenggunaanKamar,
      render: (data) => renderTable(data, [
        { key: 'kamar', label: 'Kamar' }, { key: 'tgl_masuk', label: 'Masuk', render: (v: any, r: any) => `${v || ''} ${r.jam_masuk || ''}` },
        { key: 'tgl_keluar', label: 'Keluar', render: (v: any, r: any) => (v && v !== '0000-00-00') ? `${v} ${r.jam_keluar || ''}` : '-' },
        { key: 'lama', label: 'Lama', align: 'right' },
        { key: 'ttl_biaya', label: 'Biaya', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
      ])},
    { id: 'operasi', label: 'Operasi/VK', icon: <FaProcedures />,
      fetchData: getOperasiLengkap,
      render: (data) => renderTable(data, [
        { key: 'tgl_operasi', label: 'Tgl' }, { key: 'jam_mulai', label: 'Jam', render: (v: any, r: any) => `${v || ''} - ${r.jam_selesai || ''}` },
        { key: 'nm_perawatan', label: 'Tindakan' }, { key: 'status_operasi', label: 'Status' },
        { key: 'dokter_utama', label: 'Dokter Utama' },
      ])},

    // Penunjang
    { id: 'radiologi', label: 'Pemeriksaan Radiologi', icon: <FaXRay />,
      fetchData: getRadiologiPasien,
      render: (data) => renderTable(data, [
        { key: 'tgl_periksa', label: 'Tgl' }, { key: 'nm_perawatan', label: 'Pemeriksaan' },
        { key: 'biaya', label: 'Biaya', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
        { key: 'nm_dokter', label: 'Dokter', render: (v: any, r: any) => v || r.nm_petugas || '-' },
      ])},
    { id: 'laborat', label: 'Pemeriksaan Laboratorium', icon: <FaFlask />,
      fetchData: getLaboratPasien,
      render: (data) => renderTable(data, [
        { key: 'tgl_periksa', label: 'Tgl' }, { key: 'nm_perawatan', label: 'Pemeriksaan' },
        { key: 'biaya', label: 'Biaya', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
        { key: 'nm_dokter', label: 'Dokter', render: (v: any, r: any) => v || r.nm_petugas || '-' },
      ])},
    { id: 'hasil_usg', label: 'Hasil USG Kandungan', icon: <FaBaby />,
      fetchData: (nr: string) => getSectionData('hasil_usg', nr),
      render: (data) => renderForm(data)},
    { id: 'hasil_usg_urologi', label: 'Hasil USG Urologi', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('hasil_usg_urologi', nr),
      render: (data) => renderForm(data)},
    { id: 'hasil_usg_gynecologi', label: 'Hasil USG Gynecologi', icon: <FaFemale />,
      fetchData: (nr: string) => getSectionData('hasil_usg_gynecologi', nr),
      render: (data) => renderForm(data)},
    { id: 'dokumentasi_eswl', label: 'Dokumentasi Tindakan ESWL', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('dokumentasi_eswl', nr),
      render: (data) => renderForm(data)},

    // Obat & Farmasi
    { id: 'obat', label: 'Pemberian Obat/BHP/Alkes', icon: <FaPills />,
      fetchData: getPemberianObat,
      render: (data) => renderTable(data, [
        { key: 'tgl_perawatan', label: 'Tgl' }, { key: 'nama_brng', label: 'Nama Obat' },
        { key: 'jumlah', label: 'Jml', align: 'right' },
        { key: 'harga_satuan', label: 'Harga', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
        { key: 'subtotal', label: 'Subtotal', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
      ])},
    { id: 'resep_pulang', label: 'Resep Pulang', icon: <FaPrescription />,
      fetchData: (nr: string) => getSectionData('resep_pulang', nr),
      render: (data) => renderTable(data, [
        { key: 'kode_brng', label: 'Kode' }, { key: 'nama_brng', label: 'Obat' },
        { key: 'dosis', label: 'Dosis' }, { key: 'jml_barang', label: 'Jumlah', render: (v: any, r: any) => `${v || 0} ${r.kode_sat || ''}` },
      ])},
    { id: 'gas_medik', label: 'Gas Medik', icon: <FaPills />,
      fetchData: (nr: string) => getSectionData('gas_medik', nr),
      render: (data) => renderTable(data, [
        { key: 'tanggal', label: 'Tgl' }, { key: 'nm_obat', label: 'Gas Medik' },
        { key: 'jumlah', label: 'Jml', align: 'right' },
        { key: 'hargasatuan', label: 'Harga', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
      ])},
    { id: 'penggunaan_obat_operasi', label: 'Penggunaan Obat/BHP Operasi', icon: <FaPills />,
      fetchData: getPenggunaanObatOperasi,
      render: (data) => renderTable(data, [
        { key: 'tanggal', label: 'Tgl' }, { key: 'nama_brng', label: 'Obat' },
        { key: 'jumlah', label: 'Jml', align: 'right' },
      ])},
    { id: 'rekonsiliasi_obat', label: 'Rekonsiliasi Obat', icon: <FaPills />,
      fetchData: (nr: string) => getSectionData('rekonsiliasi_obat', nr),
      render: (data) => renderForm(data)},
    { id: 'konseling_farmasi', label: 'Konseling Farmasi', icon: <FaPills />,
      fetchData: (nr: string) => getSectionData('konseling_farmasi', nr),
      render: (data) => renderForm(data)},
    { id: 'pelayanan_informasi_obat', label: 'Pelayanan Informasi Obat', icon: <FaPills />,
      fetchData: (nr: string) => getSectionData('pelayanan_informasi_obat', nr),
      render: (data) => renderForm(data)},

    // Biaya
    { id: 'tambahan_biaya', label: 'Tambahan Biaya', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('tambahan_biaya', nr),
      render: (data) => renderTable(data, [
        { key: 'nama_biaya', label: 'Nama Tambahan' },
        { key: 'besar_biaya', label: 'Besar', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
      ])},
    { id: 'potongan_biaya', label: 'Potongan Biaya', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('potongan_biaya', nr),
      render: (data) => renderTable(data, [
        { key: 'nama_pengurangan', label: 'Nama Potongan' },
        { key: 'besar_pengurangan', label: 'Besar', align: 'right', render: (v: any) => v ? Number(v).toLocaleString() : '-' },
      ])},

    // Resume
    { id: 'resume', label: 'Resume Pasien Ranap', icon: <FaClipboardList />,
      fetchData: getResumeRanap,
      render: (data) => data.length === 0 ? <span className="text-slate-400 dark:text-slate-500 italic">Tidak ada data</span> : data.map((d: any, i: number) => (
        <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-1">
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Tanggal Resume:</span><span>{d.tgl_resume}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Diagnosa Utama:</span><span className="font-bold text-brand-700 dark:text-brand-400">{d.diagnosa_utama}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Diagnosa Sekunder:</span><span>{d.diagnosa_sekunder || '-'}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Prosedur Utama:</span><span>{d.prosedur_utama || '-'}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Prosedur Sekunder:</span><span>{d.prosedur_sekunder || '-'}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Tgl Keluar:</span><span>{d.tgl_keluar} {d.jam_keluar}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Status Keluar:</span><span className="font-semibold">{d.status_keluar}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 dark:text-slate-400 w-32">Dokter:</span><span>{d.nm_dokter}</span></div>
        </div>
      ))},
    { id: 'resume_ralan', label: 'Resume Pasien Ralan', icon: <FaClipboardList />,
      fetchData: getResumePasien,
      render: (data) => renderForm(data)},
    { id: 'resume_icu', label: 'Resume ICU', icon: <FaClipboardList />,
      fetchData: getResumeICU,
      render: (data) => renderForm(data)},
    { id: 'resume_mata', label: 'Resume Mata', icon: <FaEye />,
      fetchData: getResumeMata,
      render: (data) => renderForm(data)},

    // EWS & Skor
    { id: 'pemantauan_ews_anak', label: 'Pemantauan PEWS Anak', icon: <FaHeartbeat />,
      fetchData: (nr: string) => getSectionData('pemantauan_ews_anak', nr),
      render: (data) => renderForm(data)},
    { id: 'pemantauan_ews_dewasa', label: 'Pemantauan EWS Dewasa', icon: <FaHeartbeat />,
      fetchData: (nr: string) => getSectionData('pemantauan_ews_dewasa', nr),
      render: (data) => renderForm(data)},
    { id: 'pemantauan_meows_obstetri', label: 'Pemantauan MEOWS Obstetri', icon: <FaHeartbeat />,
      fetchData: (nr: string) => getSectionData('pemantauan_meows_obstetri', nr),
      render: (data) => renderForm(data)},
    { id: 'pemantauan_ews_neonatus', label: 'Pemantauan EWS Neonatus', icon: <FaHeartbeat />,
      fetchData: (nr: string) => getSectionData('pemantauan_ews_neonatus', nr),
      render: (data) => renderForm(data)},
    { id: 'pre_induksi', label: 'Penilaian Pre Induksi', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('pre_induksi', nr),
      render: (data) => renderForm(data)},
    { id: 'checklist_pre_operasi', label: 'Check List Pre Operasi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('checklist_pre_operasi', nr),
      render: (data) => renderForm(data)},
    { id: 'checklist_post_operasi', label: 'Check List Post Operasi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('checklist_post_operasi', nr),
      render: (data) => renderForm(data)},
    { id: 'signin_sebelum_anestesi', label: 'Sign-In Sebelum Anestesi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('signin_sebelum_anestesi', nr),
      render: (data) => renderForm(data)},
    { id: 'timeout_sebelum_insisi', label: 'Time-Out Sebelum Insisi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('timeout_sebelum_insisi', nr),
      render: (data) => renderForm(data)},
    { id: 'signout_sebelum_menutup_luka', label: 'Sign-Out Sebelum Menutup Luka', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('signout_sebelum_menutup_luka', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_pre_operasi', label: 'Penilaian Pre Operasi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('penilaian_pre_operasi', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_pre_anestesi', label: 'Penilaian Pre Anestesi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('penilaian_pre_anestesi', nr),
      render: (data) => renderForm(data)},
    { id: 'skor_aldrette', label: 'Skor Aldrette Pasca Anestesi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('skor_aldrette', nr),
      render: (data) => renderForm(data)},
    { id: 'skor_steward', label: 'Skor Steward Pasca Anestesi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('skor_steward', nr),
      render: (data) => renderForm(data)},
    { id: 'skor_bromage', label: 'Skor Bromage Pasca Anestesi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('skor_bromage', nr),
      render: (data) => renderForm(data)},
    { id: 'kriteria_masuk_hcu', label: 'Kriteria Masuk HCU', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('kriteria_masuk_hcu', nr),
      render: (data) => renderForm(data)},
    { id: 'kriteria_keluar_hcu', label: 'Kriteria Keluar HCU', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('kriteria_keluar_hcu', nr),
      render: (data) => renderForm(data)},
    { id: 'kriteria_masuk_icu', label: 'Kriteria Masuk ICU', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('kriteria_masuk_icu', nr),
      render: (data) => renderForm(data)},
    { id: 'kriteria_keluar_icu', label: 'Kriteria Keluar ICU', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('kriteria_keluar_icu', nr),
      render: (data) => renderForm(data)},

    // Risiko Jatuh
    { id: 'risiko_jatuh_dewasa', label: 'Risiko Jatuh Dewasa', icon: <FaWalking />,
      fetchData: (nr: string) => getSectionData('risiko_jatuh_dewasa', nr),
      render: (data) => renderForm(data)},
    { id: 'risiko_jatuh_anak', label: 'Risiko Jatuh Anak', icon: <FaBaby />,
      fetchData: (nr: string) => getSectionData('risiko_jatuh_anak', nr),
      render: (data) => renderForm(data)},
    { id: 'risiko_jatuh_lansia', label: 'Risiko Jatuh Lansia', icon: <FaWalking />,
      fetchData: (nr: string) => getSectionData('risiko_jatuh_lansia', nr),
      render: (data) => renderForm(data)},
    { id: 'risiko_jatuh_geriatri', label: 'Risiko Jatuh Geriatri', icon: <FaWalking />,
      fetchData: (nr: string) => getSectionData('risiko_jatuh_geriatri', nr),
      render: (data) => renderForm(data)},
    { id: 'risiko_jatuh_neonatus', label: 'Risiko Jatuh Neonatus', icon: <FaBaby />,
      fetchData: (nr: string) => getSectionData('risiko_jatuh_neonatus', nr),
      render: (data) => renderForm(data)},
    { id: 'risiko_jatuh_psikiatri', label: 'Risiko Jatuh Psikiatri', icon: <FaWalking />,
      fetchData: (nr: string) => getSectionData('risiko_jatuh_psikiatri', nr),
      render: (data) => renderForm(data)},
    { id: 'skrining_fungsional', label: 'Skrining Fungsional', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('skrining_fungsional', nr),
      render: (data) => renderForm(data)},
    { id: 'risiko_dekubitus', label: 'Risiko Dekubitus', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('risiko_dekubitus', nr),
      render: (data) => renderForm(data)},

    // Konsultasi & Edukasi
    { id: 'konsultasi_medik', label: 'Konsultasi Medik', icon: <FaUserMd />,
      fetchData: (nr: string) => getSectionData('konsultasi_medik', nr),
      render: (data) => renderForm(data)},
    { id: 'transfer_antar_ruang', label: 'Transfer Antar Ruang', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('transfer_antar_ruang', nr),
      render: (data) => renderForm(data)},
    { id: 'pengkajian_restrain', label: 'Pengkajian Restrain', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('pengkajian_restrain', nr),
      render: (data) => renderForm(data)},
    { id: 'edukasi_pasien', label: 'Edukasi Pasien Terintegrasi', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('edukasi_pasien', nr),
      render: (data) => renderForm(data)},
    { id: 'perencanaan_pemulangan', label: 'Perencanaan Pemulangan', icon: <FaClipboardList />,
      fetchData: (nr: string) => getSectionData('perencanaan_pemulangan', nr),
      render: (data) => renderForm(data)},
    { id: 'skrining_tb', label: 'Skrining Tuberkulosis', icon: <FaLungs />,
      fetchData: (nr: string) => getSectionData('skrining_tb', nr),
      render: (data) => renderForm(data)},

    // Penilaian Khusus
    { id: 'penilaian_terminal', label: 'Penilaian Pasien Terminal', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('penilaian_terminal', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_korban_kekerasan', label: 'Penilaian Korban Kekerasan', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('penilaian_korban_kekerasan', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_kecemasan_anak', label: 'Penilaian Kecemasan Anak', icon: <FaBaby />,
      fetchData: (nr: string) => getSectionData('penilaian_kecemasan_anak', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_penyakit_menular', label: 'Penilaian Penyakit Menular', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('penilaian_penyakit_menular', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_keracunan', label: 'Penilaian Keracunan', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('penilaian_keracunan', nr),
      render: (data) => renderForm(data)},
    { id: 'tambahan_geriatri', label: 'Tambahan Geriatri', icon: <FaWalking />,
      fetchData: (nr: string) => getSectionData('tambahan_geriatri', nr),
      render: (data) => renderForm(data)},
    { id: 'tambahan_bunuh_diri', label: 'Tambahan Bunuh Diri', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('tambahan_bunuh_diri', nr),
      render: (data) => renderForm(data)},
    { id: 'tambahan_perilaku_kekerasan', label: 'Tambahan Perilaku Kekerasan', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('tambahan_perilaku_kekerasan', nr),
      render: (data) => renderForm(data)},
    { id: 'tambahan_melarikan_diri', label: 'Tambahan Melarikan Diri', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('tambahan_melarikan_diri', nr),
      render: (data) => renderForm(data)},

    // Penunjang Medis
    { id: 'uji_fungsi_kfr', label: 'Uji Fungsi/Prosedur KFR', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('uji_fungsi_kfr', nr),
      render: (data) => renderForm(data)},
    { id: 'hemodialisa', label: 'Hemodialisa', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('hemodialisa', nr),
      render: (data) => renderForm(data)},

    // Berkas Digital
    { id: 'berkas_digital', label: 'Berkas Digital Perawatan', icon: <FaClipboardList />,
      fetchData: getBerkasDigital,
      render: (data) => data.length === 0 ? <span className="text-slate-400 dark:text-slate-500 italic">Tidak ada data</span> : (
        <div className="space-y-1">
          {data.map((d: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2">
              <span className="font-semibold text-brand-600">{d.nama_berkas || d.kode_berkas}</span>
              <span className="text-slate-400">-</span>
              <span>{d.tgl_perawatan}</span>
              {d.lokasi_file && <a href={d.lokasi_file} target="_blank" rel="noopener noreferrer" className="ml-auto text-brand-500 hover:text-brand-700 underline">Lihat</a>}
            </div>
          ))}
        </div>
      )},

    // Awal Keperawatan (ditampilkan sebagai form)
    { id: 'asuhan_keperawatan_igd', label: 'Awal Keperawatan IGD', icon: <FaAmbulance />,
      fetchData: (nr: string) => getSectionData('asuhan_keperawatan_igd', nr),
      render: (data) => renderForm(data)},
    { id: 'asuhan_keperawatan_ralan', label: 'Awal Keperawatan Ralan', icon: <FaUserInjured />,
      fetchData: (nr: string) => getSectionData('asuhan_keperawatan_ralan', nr),
      render: (data) => renderForm(data)},
    { id: 'asuhan_keperawatan_ranap', label: 'Awal Keperawatan Ranap', icon: <FaUserInjured />,
      fetchData: (nr: string) => getSectionData('asuhan_keperawatan_ranap', nr),
      render: (data) => renderForm(data)},

    // Awal Medis
    { id: 'asuhan_medis_igd', label: 'Awal Medis IGD', icon: <FaUserMd />,
      fetchData: (nr: string) => getSectionData('asuhan_medis_igd', nr),
      render: (data) => renderForm(data)},
    { id: 'asuhan_medis_ralan', label: 'Awal Medis Ralan', icon: <FaUserMd />,
      fetchData: (nr: string) => getSectionData('asuhan_medis_ralan', nr),
      render: (data) => renderForm(data)},
    { id: 'asuhan_medis_ranap', label: 'Awal Medis Ranap', icon: <FaUserMd />,
      fetchData: (nr: string) => getSectionData('asuhan_medis_ranap', nr),
      render: (data) => renderForm(data)},

    // Fisioterapi & Rehab
    { id: 'asuhan_fisioterapi', label: 'Awal Fisioterapi', icon: <FaWalking />,
      fetchData: (nr: string) => getSectionData('asuhan_fisioterapi', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_terapi_wicara', label: 'Penilaian Terapi Wicara', icon: <FaProcedures />,
      fetchData: (nr: string) => getSectionData('penilaian_terapi_wicara', nr),
      render: (data) => renderForm(data)},
    { id: 'penilaian_psikolog', label: 'Penilaian Psikolog', icon: <FaBrain />,
      fetchData: (nr: string) => getSectionData('penilaian_psikolog', nr),
      render: (data) => renderForm(data)},
  ];

  return (
    <>
      {/* Bar Info Pasien + Clock */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 shrink-0 flex flex-wrap gap-2 items-center text-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <label className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">Pasien :</label>
          <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 flex-1 lg:w-33 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-500" value={noRawatParam || resolvedNoRM} readOnly />
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 flex-1 lg:w-16 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-500" value={resolvedNoRM} readOnly placeholder="No. RM" />
        </div>
        <div className="flex items-center gap-1 w-full md:w-auto">
          <input type="text" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 flex-1 lg:w-70 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-500" value={resolvedNmPasien} readOnly placeholder="Nama Pasien" />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto w-full sm:w-auto">
          <label className="font-semibold text-slate-600 dark:text-slate-300">Tanggal :</label>
          <input type="date" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 mr-1 focus:outline-none w-full sm:w-27 focus:border-brand-500 bg-white dark:bg-slate-700"
            value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
          <input type="time" step="1" className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs w-27 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
            value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
          <input type="checkbox" className="accent-brand-500 w-4 h-4 ml-2 opacity-60"
            checked={isClockRunning} disabled title="Jam selalu real-time" />
        </div>
      </div>

      {/* Toggle Data Pasien */}
      <button onClick={() => setShowPasienInfo(!showPasienInfo)}
        className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shrink-0">
        {showPasienInfo ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
        {showPasienInfo ? "Sembunyikan" : "Tampilkan"} Data Pasien
      </button>

      {/* Panel Data Pasien */}
      <AnimatePresence>
        {showPasienInfo && pasienInfo && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden">
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
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
          </motion.div>
        )}
      </AnimatePresence>

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

                      <div key={ei} className={`grid grid-cols-12 gap-0 text-xs border-t border-slate-200 dark:border-slate-700 ${ei % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50/50 dark:bg-slate-900"}`}>
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
              className="flex-1 flex overflow-hidden">
              {/* Sidebar Kiri - Checkbox Sections */}
              <motion.div initial={false} animate={{ width: sidebarOpen ? 260 : 40 }}
                className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shrink-0">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 h-10">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-brand-50 rounded text-brand-700 shrink-0">
                    <FaBars className="text-xs" />
                  </button>
                  {sidebarOpen && <span className="text-xs font-bold text-brand-700 truncate">Pilih Data</span>}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
                    <button onClick={() => {
                      const allChecked = sectionDefs.every(s => checkedSections[s.id]);
                      const newState: Record<string, boolean> = {};
                      sectionDefs.forEach(s => { newState[s.id] = !allChecked; });
                      setCheckedSections(newState);
                    }}
                      className="flex items-center gap-2 px-2 py-1.5 w-full text-left text-xs rounded transition-colors bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400 font-semibold mb-1 border border-brand-200 dark:border-slate-600">
                      {sectionDefs.every(s => checkedSections[s.id]) ? <FaCheckSquare className="text-brand-500 shrink-0" /> : <FaSquare className="text-slate-400 shrink-0" />}
                      <span>{sectionDefs.every(s => checkedSections[s.id]) ? 'Hapus Semua' : 'Pilih Semua'}</span>
                    </button>
                    {sectionDefs.map((sec) => (
                      <button key={sec.id} onClick={() => setCheckedSections(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                        className={`flex items-center gap-2 px-2 py-1.5 w-full text-left text-xs rounded transition-colors ${checkedSections[sec.id] ? "bg-brand-50 dark:bg-slate-700 text-brand-700 dark:text-brand-400 font-semibold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
                        {checkedSections[sec.id] ? <FaCheckSquare className="text-brand-500 shrink-0" /> : <FaSquare className="text-slate-300 shrink-0" />}
                        <span className="truncate">{sec.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Panel Kanan */}
              <div className="flex-1 overflow-auto p-4">
                {/* Visit Selector */}
                {perawatanVisits.length > 0 && (
                  <div className="mb-4 flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Pilih Kunjungan:</span>
                    <select value={selectedVisit} onChange={e => setSelectedVisit(e.target.value)}
                      className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-slate-100">
                      {perawatanVisits.map((v: any, i: number) => (
                        <option key={i} value={v.no_rawat}>{v.no_rawat} - {v.tgl_registrasi} ({v.nm_poli})</option>
                      ))}
                    </select>
                  </div>
                )}

                {!selectedVisit ? (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                    Pilih kunjungan pasien untuk menampilkan data perawatan lengkap
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Detail Registrasi */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <h3 className="text-[13px] font-bold text-brand-700 dark:text-brand-400 mb-3 flex items-center gap-2 border-b border-brand-100 dark:border-slate-600 pb-2">
                        <FaClipboardList className="text-brand-500" /> Detail Registrasi
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                        No. Rawat: {selectedVisit}
                      </div>
                    </div>

                    {/* Data Sections */}
                    {sectionDefs.filter(sec => checkedSections[sec.id]).map((sec) => (
                      <div key={sec.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="text-[13px] font-bold text-brand-700 dark:text-brand-400 mb-3 flex items-center gap-2 border-b border-brand-100 dark:border-slate-600 pb-2">
                          <span className="text-brand-500 text-sm">{sec.icon}</span> {sec.label}
                        </h3>
                        {loadingSection === sec.id ? (
                          <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
                        ) : (
                          sec.render(sectionData[sec.id] || [])
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
