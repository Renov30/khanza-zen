"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaHistory, FaClipboardList, FaNotesMedical, FaCheckSquare, FaSquare, FaBars, FaPrint, FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaUserMd, FaPrescription, FaFlask, FaXRay, FaSyringe, FaProcedures, FaBed, FaStethoscope, FaHeartbeat, FaBrain, FaTooth, FaEye, FaBaby, FaFemale, FaMale, FaWalking, FaWheelchair, FaUserInjured, FaAmbulance, FaPills } from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';
import DataTableMulti from '@/components/DataTableMulti';
import { TableColumn } from '@/components/TableTypes';
import {
  getRiwayatKunjungan, getRiwayatSoapie, getRiwayatPerawatanPasien,
  getDiagnosaPasien, getProsedurPasien, getTriaseIGD,
  getPemeriksaanRanapRiwayat, getTindakanRanapDokter,
  getTindakanRanapParamedis, getPenggunaanKamar, getResumeRanap,
  getOperasiPasien, getRadiologiPasien, getLaboratPasien, getPemberianObat,
  getPasienInfo, getPatientInfoByNoRawat
} from '@/lib/actions/ranap';

interface KunjunganRow {
  id: string; no_rawat: string; tgl_registrasi: string; jam_reg: string;
  kd_dokter: string; nm_dokter: string; umur: string; nm_poli: string;
  png_jawab: string; dpjp: string;
  referrals: Array<{ nm_dokter: string; nm_poli: string }>;
  kamar_inap: Array<{ tgl_masuk: string; jam_masuk: string; nm_bangsal: string }>;
}

interface SoapEntry {
  status: string; tglJam: string; petugas: string; profesi: string;
  subjektif: string; objektif: string; pemeriksaan: string; alergi: string;
  asesmen: string; plan: string; instruksi: string; evaluasi: string;
  verifikasi: string; tgl_verifikasi: string;
}

interface SoapGroup { tglReg: string; no_rawat: string; entries: SoapEntry[]; }

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
    diagnosa: true, prosedur: true, triase: true,
    pemeriksaan: true, tindakan_dokter: true, tindakan_paramedis: true,
    kamar: true, resume: true, operasi: true,
    radiologi: true, laborat: true, obat: true,
  });

  const [resolvedNoRM, setResolvedNoRM] = useState(noRMParam);
  const [resolvedNmPasien, setResolvedNmPasien] = useState(nmPasienParam);
  const [showPasienInfo, setShowPasienInfo] = useState(false);
  const [pasienInfo, setPasienInfo] = useState<any>(null);

  const [isClockRunning, setIsClockRunning] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
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
      operasi: getOperasiPasien, radiologi: getRadiologiPasien,
      laborat: getLaboratPasien, obat: getPemberianObat,
    };
    const fetcher = fetchers[sectionId];
    if (fetcher) {
      const result = await fetcher(noRawat);
      if (result.success) {
        setSectionData(prev => ({ ...prev, [sectionId]: result.data }));
      }
    }
    setLoadingSection(null);
  }, []);

  useEffect(() => {
    setMounted(true);

    const initFromNoRawat = async () => {
      if (noRawatParam) {
        const patientRes = await getPatientInfoByNoRawat(noRawatParam);
        if (patientRes.success && patientRes.data) {
          setSelectedVisit(noRawatParam);
          setResolvedNoRM(patientRes.data.no_rkm_medis);
          setResolvedNmPasien(patientRes.data.nm_pasien);
          const infoRes = await getPasienInfo(patientRes.data.no_rkm_medis);
          if (infoRes.success && infoRes.data) setPasienInfo(infoRes.data);
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

  if (!mounted) return null;

  const handleBottomSearch = () => {
    if (activeTab === "kunjungan") fetchKunjungan();
    else if (activeTab === "soapie") fetchSoapie();
    else if (activeTab === "perawatan") fetchPerawatan();
  };

  const kunjunganColumns: TableColumn[] = [
    { header: 'No.Rawat', key: 'no_rawat', className: 'text-brand-600 font-bold', width: '140px' },
    { header: 'Tanggal', key: 'tgl_registrasi', width: '100px' },
    { header: 'Jam', key: 'jam_reg', width: '80px' },
    { header: 'Kd.Dokter', key: 'kd_dokter', width: '80px' },
    { header: 'Dokter Dituju/DPJP', key: 'nm_dokter', width: '200px', render: (row: any) => (
      <div>
        <div>{row.nm_dokter}</div>
        {row.dpjp && <div className="text-[10px] text-brand-500">DPJP: {row.dpjp}</div>}
      </div>
    )},
    { header: 'Umur', key: 'umur', width: '60px' },
    { header: 'Poliklinik/Kamar', key: 'nm_poli', width: '140px', render: (row: any) => (
      <div>
        <div>{row.nm_poli}</div>
        {row.kamar_inap?.length > 0 && <div className="text-[10px] text-slate-500">{row.kamar_inap.map((k: any) => k.nm_bangsal).join(', ')}</div>}
      </div>
    )},
    { header: 'Jenis Bayar', key: 'png_jawab', width: '100px' },
  ];

  const sectionDefs: PerawatanSection[] = [
    { id: 'diagnosa', label: 'Diagnosa (ICD 10)', icon: <FaStethoscope />,
      fetchData: getDiagnosaPasien,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Kode</th><th className="p-2 border text-left">Diagnosa</th><th className="p-2 border text-left">Status</th><th className="p-2 border text-left">Dokter</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.kd_penyakit}</td><td className="p-2 border">{d.nm_penyakit}</td><td className="p-2 border">{d.status}</td><td className="p-2 border">{d.nm_dokter}</td></tr>))}</tbody></table>
    )},
    { id: 'prosedur', label: 'Prosedur/Tindakan (ICD 9)', icon: <FaProcedures />,
      fetchData: getProsedurPasien,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Kode</th><th className="p-2 border text-left">Prosedur</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.kd_icd9}</td><td className="p-2 border">{d.nm_icd9_1}</td></tr>))}</tbody></table>
    )},
    { id: 'triase', label: 'Triase IGD', icon: <FaAmbulance />,
      fetchData: getTriaseIGD,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Pemeriksaan</th><th className="p-2 border text-left">Hasil</th><th className="p-2 border text-left">Petugas</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.nama_pemeriksaan || d.pemeriksaan}</td><td className="p-2 border">{d.hasil}</td><td className="p-2 border">{d.nm_pegawai}</td></tr>))}</tbody></table>
    )},
    { id: 'pemeriksaan', label: 'Pemeriksaan Ranap', icon: <FaHeartbeat />,
      fetchData: getPemeriksaanRanapRiwayat,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Tgl</th><th className="p-2 border text-left">Jam</th><th className="p-2 border text-left">Subjektif</th><th className="p-2 border text-left">Objek</th><th className="p-2 border text-left">Asesmen</th><th className="p-2 border text-left">Plan</th><th className="p-2 border text-left">Petugas</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.tgl_perawatan}</td><td className="p-2 border">{d.jam_rawat}</td><td className="p-2 border max-w-[200px] truncate">{d.keluhan}</td><td className="p-2 border max-w-[200px] truncate">{d.pemeriksaan}</td><td className="p-2 border max-w-[150px] truncate">{d.penilaian}</td><td className="p-2 border max-w-[150px] truncate">{d.rtl}</td><td className="p-2 border whitespace-nowrap">{d.nm_pegawai}</td></tr>))}</tbody></table>
    )},
    { id: 'tindakan_dokter', label: 'Tindakan Ranap Dokter', icon: <FaUserMd />,
      fetchData: getTindakanRanapDokter,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Tgl</th><th className="p-2 border text-left">Tindakan</th><th className="p-2 border text-right">Biaya</th><th className="p-2 border text-left">Dokter</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.tgl_perawatan}</td><td className="p-2 border">{d.nm_perawatan}</td><td className="p-2 border text-right">{d.biaya_rawat ? Number(d.biaya_rawat).toLocaleString() : '-'}</td><td className="p-2 border">{d.nm_dokter}</td></tr>))}</tbody></table>
    )},
    { id: 'tindakan_paramedis', label: 'Tindakan Ranap Paramedis', icon: <FaUserInjured />,
      fetchData: getTindakanRanapParamedis,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Tgl</th><th className="p-2 border text-left">Tindakan</th><th className="p-2 border text-right">Biaya</th><th className="p-2 border text-left">Petugas</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.tgl_perawatan}</td><td className="p-2 border">{d.nm_perawatan}</td><td className="p-2 border text-right">{d.biaya_rawat ? Number(d.biaya_rawat).toLocaleString() : '-'}</td><td className="p-2 border">{d.nm_petugas}</td></tr>))}</tbody></table>
    )},
    { id: 'kamar', label: 'Penggunaan Kamar', icon: <FaBed />,
      fetchData: getPenggunaanKamar,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Kamar</th><th className="p-2 border text-left">Masuk</th><th className="p-2 border text-left">Keluar</th><th className="p-2 border text-right">Lama</th><th className="p-2 border text-right">Biaya</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.kamar}</td><td className="p-2 border">{d.tgl_masuk} {d.jam_masuk}</td><td className="p-2 border">{d.tgl_keluar && d.tgl_keluar !== '0000-00-00' ? `${d.tgl_keluar} ${d.jam_keluar}` : '-'}</td><td className="p-2 border text-right">{d.lama || '-'}</td><td className="p-2 border text-right">{d.ttl_biaya ? Number(d.ttl_biaya).toLocaleString() : '-'}</td></tr>))}</tbody></table>
    )},
    { id: 'resume', label: 'Resume Pasien Ranap', icon: <FaClipboardList />,
      fetchData: getResumeRanap,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : data.map((d: any, i: number) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1">
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Tanggal Resume:</span><span>{d.tgl_resume}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Diagnosa Utama:</span><span className="font-bold text-brand-700">{d.diagnosa_utama}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Diagnosa Sekunder:</span><span>{d.diagnosa_sekunder || '-'}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Prosedur Utama:</span><span>{d.prosedur_utama || '-'}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Prosedur Sekunder:</span><span>{d.prosedur_sekunder || '-'}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Tgl Keluar:</span><span>{d.tgl_keluar} {d.jam_keluar}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Status Keluar:</span><span className="font-semibold">{d.status_keluar}</span></div>
          <div className="flex gap-2"><span className="font-semibold text-slate-500 w-32">Dokter:</span><span>{d.nm_dokter}</span></div>
        </div>
    ))},
    { id: 'operasi', label: 'Operasi/VK', icon: <FaProcedures />,
      fetchData: getOperasiPasien,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Tgl</th><th className="p-2 border text-left">Jam</th><th className="p-2 border text-left">Tindakan</th><th className="p-2 border text-left">Status</th><th className="p-2 border text-left">Dokter Utama</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.tgl_operasi}</td><td className="p-2 border">{d.jam_mulai} - {d.jam_selesai}</td><td className="p-2 border">{d.nm_perawatan}</td><td className="p-2 border">{d.status_operasi}</td><td className="p-2 border">{d.dokter_utama}</td></tr>))}</tbody></table>
    )},
    { id: 'radiologi', label: 'Pemeriksaan Radiologi', icon: <FaXRay />,
      fetchData: getRadiologiPasien,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Tgl</th><th className="p-2 border text-left">Pemeriksaan</th><th className="p-2 border text-right">Biaya</th><th className="p-2 border text-left">Dokter</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.tgl_periksa}</td><td className="p-2 border">{d.nm_perawatan}</td><td className="p-2 border text-right">{d.biaya ? Number(d.biaya).toLocaleString() : '-'}</td><td className="p-2 border">{d.nm_dokter || d.nm_petugas}</td></tr>))}</tbody></table>
    )},
    { id: 'laborat', label: 'Pemeriksaan Laboratorium', icon: <FaFlask />,
      fetchData: getLaboratPasien,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Tgl</th><th className="p-2 border text-left">Pemeriksaan</th><th className="p-2 border text-right">Biaya</th><th className="p-2 border text-left">Dokter</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.tgl_periksa}</td><td className="p-2 border">{d.nm_perawatan}</td><td className="p-2 border text-right">{d.biaya ? Number(d.biaya).toLocaleString() : '-'}</td><td className="p-2 border">{d.nm_dokter || d.nm_petugas}</td></tr>))}</tbody></table>
    )},
    { id: 'obat', label: 'Pemberian Obat/BHP/Alkes', icon: <FaPills />,
      fetchData: getPemberianObat,
      render: (data) => data.length === 0 ? <span className="text-slate-400 italic">Tidak ada data</span> : (
        <table className="w-full text-xs border-collapse"><thead><tr className="bg-slate-100 text-slate-600 font-semibold"><th className="p-2 border text-left">Tgl</th><th className="p-2 border text-left">Nama Obat</th><th className="p-2 border text-right">Jumlah</th><th className="p-2 border text-right">Harga</th><th className="p-2 border text-right">Subtotal</th></tr></thead><tbody>{data.map((d: any, i: number) => (<tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="p-2 border">{d.tgl_perawatan}</td><td className="p-2 border">{d.nama_brng}</td><td className="p-2 border text-right">{d.jumlah}</td><td className="p-2 border text-right">{d.harga_satuan ? Number(d.harga_satuan).toLocaleString() : '-'}</td><td className="p-2 border text-right font-semibold">{d.subtotal ? Number(d.subtotal).toLocaleString() : '-'}</td></tr>))}</tbody></table>
    )},
  ];

  return (
    <>
      {/* Bar Info Pasien + Clock */}
      <div className="bg-white border-b border-slate-200 p-3 shrink-0 flex flex-wrap gap-2 items-center text-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <label className="font-semibold text-slate-600 shrink-0">Pasien :</label>
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-35 sm:w-33 bg-slate-50 focus:outline-none focus:border-brand-500" value={noRawatParam || resolvedNoRM} readOnly />
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-20 sm:w-16 bg-slate-50 focus:outline-none focus:border-brand-500" value={resolvedNoRM} readOnly placeholder="No. RM" />
        </div>
        <div className="flex items-center gap-1 w-full md:w-auto">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 flex-1 lg:w-75 sm:w-35 bg-slate-50 focus:outline-none focus:border-brand-500" value={resolvedNmPasien} readOnly placeholder="Nama Pasien" />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto w-full sm:w-auto">
          <label className="font-semibold text-slate-600">Tanggal :</label>
          <input type="date" className="border border-slate-300 rounded px-2 py-1 mr-1 focus:outline-none w-full sm:w-27 focus:border-brand-500"
            value={currentDate} onChange={e => { if (!isClockRunning) setCurrentDate(e.target.value); }} readOnly={isClockRunning} />
          <input type="time" step="1" className="border border-slate-300 rounded px-2 py-1 text-xs w-27 focus:outline-none focus:border-brand-500 bg-white"
            value={currentTime} onChange={e => { if (!isClockRunning) setCurrentTime(e.target.value); }} readOnly={isClockRunning} />
          <input type="checkbox" className="accent-brand-500 w-4 h-4 cursor-pointer ml-2"
            checked={isClockRunning} onChange={e => setIsClockRunning(e.target.checked)} title="Centang untuk jam real-time" />
        </div>
      </div>

      {/* Toggle Data Pasien */}
      <button onClick={() => setShowPasienInfo(!showPasienInfo)}
        className="bg-white border-b border-slate-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors flex items-center gap-2 shrink-0">
        {showPasienInfo ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
        {showPasienInfo ? "Sembunyikan" : "Tampilkan"} Data Pasien
      </button>

      {/* Panel Data Pasien */}
      <AnimatePresence>
        {showPasienInfo && pasienInfo && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-white border-b border-slate-200 shrink-0 overflow-hidden">
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
                    <span className="font-semibold text-slate-500">{label}</span>
                    <span className="text-slate-800">{value || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab */}
      <div className="flex bg-white border-b border-slate-200 px-2 md:px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {[
          { id: "kunjungan", label: "Riwayat Kunjungan" },
          { id: "soapie", label: "Riwayat S.O.A.P.I.E" },
          { id: "perawatan", label: "Riwayat Perawatan" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap relative ${activeTab === tab.id ? "text-brand-700 font-bold" : "text-slate-500 hover:text-brand-600"}`}>
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
                <div className="text-center py-8 text-slate-400 text-xs italic">Tidak ada data SOAPIE ditemukan.</div>
              ) : soapieData.map((group, gi) => (
                <div key={gi} className="mb-6">
                  <div className="flex items-center gap-3 mb-3 text-xs">
                    <span className="font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">Tgl.Reg: {group.tglReg}</span>
                    <span className="font-semibold text-slate-600">No.Rawat: {group.no_rawat}</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 text-[11px] font-bold text-slate-600 grid grid-cols-12 gap-0">
                      <div className="col-span-1 p-2 border-r border-slate-200 text-center">Status</div>
                      <div className="col-span-1 p-2 border-r border-slate-200">Tgl, Jam</div>
                      <div className="col-span-2 p-2 border-r border-slate-200">PPA</div>
                      <div className="col-span-4 p-2 border-r border-slate-200">Hasil Asesmen & Pelayanan</div>
                      <div className="col-span-2 p-2 border-r border-slate-200">Instruksi / IPA</div>
                      <div className="col-span-2 p-2">Verifikasi DPJP</div>
                    </div>
                    {group.entries.map((entry, ei) => (
                      <div key={ei} className={`grid grid-cols-12 gap-0 text-xs border-t border-slate-200 ${ei % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                        <div className="col-span-1 p-2 border-r border-slate-200 text-center font-semibold text-brand-700">{entry.status}</div>
                        <div className="col-span-1 p-2 border-r border-slate-200 text-slate-600">{entry.tglJam}</div>
                        <div className="col-span-2 p-2 border-r border-slate-200">
                          <div className="font-semibold text-slate-700">{entry.petugas}</div>
                          <div className="text-slate-500 text-[11px]">{entry.profesi}</div>
                        </div>
                        <div className="col-span-4 p-2 border-r border-slate-200">
                          <div className="space-y-1">
                            {entry.subjektif && <div><span className="font-semibold text-slate-500">S:</span> {entry.subjektif}</div>}
                            {entry.objektif && <div><span className="font-semibold text-slate-500">O:</span> <span className="text-[11px]">{entry.objektif}</span></div>}
                            {entry.asesmen && <div><span className="font-semibold text-slate-500">A:</span> {entry.asesmen}</div>}
                            {entry.plan && <div><span className="font-semibold text-slate-500">P:</span> {entry.plan}</div>}
                          </div>
                        </div>
                        <div className="col-span-2 p-2 border-r border-slate-200 text-slate-600">{entry.instruksi || '-'}</div>
                        <div className="col-span-2 p-2">
                          {entry.verifikasi ? (
                            <span className="text-green-600 font-semibold text-[11px] bg-green-50 px-2 py-0.5 rounded-full">
                              Terverifikasi {entry.tgl_verifikasi}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum Verifikasi</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "perawatan" && (
            <motion.div key="perawatan" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
              className="flex-1 flex overflow-hidden">
              {/* Sidebar Kiri - Checkbox Sections */}
              <motion.div initial={false} animate={{ width: sidebarOpen ? 260 : 40 }}
                className="bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
                <div className="p-2 border-b border-slate-100 flex items-center gap-2 h-10">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-brand-50 rounded text-brand-700 shrink-0">
                    <FaBars className="text-xs" />
                  </button>
                  {sidebarOpen && <span className="text-xs font-bold text-brand-700 truncate">Pilih Data</span>}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
                    {sectionDefs.map((sec) => (
                      <button key={sec.id} onClick={() => setCheckedSections(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                        className={`flex items-center gap-2 px-2 py-1.5 w-full text-left text-xs rounded transition-colors ${checkedSections[sec.id] ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
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
                    <span className="font-semibold text-slate-600">Pilih Kunjungan:</span>
                    <select value={selectedVisit} onChange={e => setSelectedVisit(e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500">
                      {perawatanVisits.map((v: any, i: number) => (
                        <option key={i} value={v.no_rawat}>{v.no_rawat} - {v.tgl_registrasi} ({v.nm_poli})</option>
                      ))}
                    </select>
                  </div>
                )}

                {!selectedVisit ? (
                  <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 italic">
                    Pilih kunjungan pasien untuk menampilkan data perawatan lengkap
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Detail Registrasi */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                        <FaClipboardList className="text-brand-500" /> Detail Registrasi
                      </h3>
                      <div className="text-xs text-slate-500 italic">
                        No. Rawat: {selectedVisit}
                      </div>
                    </div>

                    {/* Data Sections */}
                    {sectionDefs.filter(sec => checkedSections[sec.id]).map((sec) => (
                      <div key={sec.id} className="bg-white rounded-lg border border-slate-200 p-4">
                        <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
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

      {/* BottomActionPanel */}
      <BottomActionPanel
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
            <span className="font-semibold text-slate-600 text-xs">Filter :</span>
            {filterModes.map((opt) => (
              <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="filterMode" value={opt.id}
                  checked={filterMode === opt.id} onChange={() => setFilterMode(opt.id)}
                  className="accent-brand-500 w-3.5 h-3.5" />
                <span className={`text-xs ${filterMode === opt.id ? "font-bold text-brand-700" : "text-slate-600"}`}>{opt.label}</span>
              </label>
            ))}
            {filterMode === "norawat" && (
              <input type="text" value={filterNoRawat} onChange={e => setFilterNoRawat(e.target.value)}
                placeholder="No. Rawat..." className="border border-slate-300 rounded px-2 py-1 text-xs w-40 focus:outline-none focus:border-brand-500" />
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
