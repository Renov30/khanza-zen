"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaBed,
  FaExpand,
  FaCompress,
  FaExclamationTriangle,
  FaHistory,
  FaClipboardList,
  FaFileAlt,
  FaEdit,
} from "react-icons/fa";
import FormSection from "@/components/FormSection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import BottomActionPanel from "@/components/BottomActionPanel";
import TopFormContainer from "@/components/TopFormContainer";
import {
  getPatientInfoByNoRawat,
  getPemeriksaanRanap,
  getLoggedInPegawai,
  simpanPemeriksaanRanap,
  editPemeriksaanRanap,
  hapusPemeriksaanRanap,
  cekVerifSOAPSebelumnya,
  get5SoapTerakhir,
} from "@/lib/actions/ranap";
import DataTableMulti from "@/components/DataTableMulti";
import DialogPilihPegawai from "@/components/DialogPilihPegawai";
import { TableColumn } from "@/components/TableTypes";

interface PemeriksaanRow {
  id?: string;
  no_rawat: string;
  no_rkm_medis: string;
  nm_pasien: string;
  tgl_perawatan: string;
  jam_rawat: string;
  suhu_tubuh: string;
  tensi: string;
  nadi: string;
  respirasi: string;
  tinggi: string;
  berat: string;
  spo2: string;
  gcs: string;
  kesadaran: string;
  keluhan: string;
  pemeriksaan: string;
  alergi: string;
  penilaian: string;
  rtl: string;
  instruksi: string;
  evaluasi: string;
  nip: string;
  nm_pegawai: string;
  jabatan: string;
}

const columns: TableColumn[] = [
  {
    header: "No.Rawat",
    key: "no_rawat",
    className: "text-brand-600 font-bold hover:underline",
    width: "140px",
  },
  {
    header: "No.R.M.",
    key: "no_rkm_medis",
    className: "text-brand-600 font-semibold",
    width: "70px",
  },
  {
    header: "Nama Pasien",
    key: "nm_pasien",
    className: "text-slate-800 dark:text-slate-100 font-bold",
    width: "200px",
  },
  { header: "Tgl.Rawat", key: "tgl_perawatan", width: "100px" },
  { header: "Jam", key: "jam_rawat", width: "80px" },
  { header: "Suhu(C)", key: "suhu_tubuh", width: "80px" },
  { header: "Tensi", key: "tensi", width: "80px" },
  { header: "Nadi(/mnt)", key: "nadi", width: "80px" },
  { header: "Respirasi(/mnt)", key: "respirasi", width: "112px" },
  { header: "Tinggi(Cm)", key: "tinggi", width: "90px" },
  { header: "Berat(Kg)", key: "berat", width: "80px" },
  { header: "SpO2(%)", key: "spo2", width: "80px" },
  { header: "GCS(E,V,M)", key: "gcs", width: "90px" },
  { header: "Kesadaran", key: "kesadaran", width: "140px" },
  { header: "Subjek", key: "keluhan", width: "180px", className: "truncate" },
  {
    header: "Objek",
    key: "pemeriksaan",
    width: "180px",
    className: "truncate",
  },
  { header: "Alergi", key: "alergi", width: "180px", className: "truncate" },
  {
    header: "Asesmen",
    key: "penilaian",
    width: "180px",
    className: "truncate",
  },
  { header: "Plan", key: "rtl", width: "180px", className: "truncate" },
  {
    header: "Instruksi",
    key: "instruksi",
    width: "180px",
    className: "truncate",
  },
  {
    header: "Evaluasi",
    key: "evaluasi",
    width: "180px",
    className: "truncate",
  },
  { header: "NIP", key: "nip", width: "100px" },
  { header: "Dokter/Paramedis", key: "nm_pegawai", width: "160px" },
  { header: "Profesi/Jabatan", key: "jabatan", width: "130px" },
];

function PemeriksaanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get("noRawat") || "";

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("cppt");
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Patient info
  const [noRawat] = useState(noRawatParam);
  const [noRM, setNoRM] = useState("");
  const [namaPasien, setNamaPasien] = useState("");
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Pemeriksaan data
  const [pemeriksaanData, setPemeriksaanData] = useState<PemeriksaanRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // BottomPanel filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [tglAwal, setTglAwal] = useState(today);
  const [tglAkhir, setTglAkhir] = useState(today);

  // Logged-in pegawai info
  const [pegawaiNik, setPegawaiNik] = useState("");
  const [pegawaiNama, setPegawaiNama] = useState("");

  // Edit state
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Verifikasi SOAP sebelumnya
  const [isVerifBlocked, setIsVerifBlocked] = useState(false);
  const [verifBlockMessage, setVerifBlockMessage] = useState("");
  const [isCheckingVerif, setIsCheckingVerif] = useState(false);

  // 5 SOAP Terakhir modal
  const [showSoap5Modal, setShowSoap5Modal] = useState(false);
  const [soap5Data, setSoap5Data] = useState<any[]>([]);
  const [isLoadingSoap5, setIsLoadingSoap5] = useState(false);

  // Alasan dialog
  const [alasanDialog, setAlasanDialog] = useState<{
    open: boolean;
    mode: "ganti" | "hapus";
  }>({ open: false, mode: "ganti" });
  const [alasanText, setAlasanText] = useState("");

  // Dialog pilih pegawai
  const [dialogPegawaiOpen, setDialogPegawaiOpen] = useState(false);

  const handlePilihPegawai = (nik: string, nama: string) => {
    setPegawaiNik(nik);
    setPegawaiNama(nama);
    setDialogPegawaiOpen(false);
  };

  // Form state — SOAPIE + TTV
  const [formKeluhan, setFormKeluhan] = useState("");
  const [formPemeriksaan, setFormPemeriksaan] = useState("");
  const [formAlergi, setFormAlergi] = useState("");
  const [formPenilaian, setFormPenilaian] = useState("");
  const [formRtl, setFormRtl] = useState("");
  const [formInstruksi, setFormInstruksi] = useState("");
  const [formEvaluasi, setFormEvaluasi] = useState("");
  const [formSuhu, setFormSuhu] = useState("");
  const [formTensi, setFormTensi] = useState("");
  const [formNadi, setFormNadi] = useState("");
  const [formRespirasi, setFormRespirasi] = useState("");
  const [formTinggi, setFormTinggi] = useState("");
  const [formBerat, setFormBerat] = useState("");
  const [formSpo2, setFormSpo2] = useState("");
  const [formGcs, setFormGcs] = useState("");
  const [formKesadaran, setFormKesadaran] = useState("");

  // Form open/close state (toggled via table title click)
  const [formOpen, setFormOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("khanza_cppt_form_open");
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });

  const toggleForm = useCallback(() => {
    setFormOpen((prev: boolean) => {
      const next = !prev;
      if (typeof window !== "undefined")
        localStorage.setItem("khanza_cppt_form_open", JSON.stringify(next));
      return next;
    });
  }, []);

  // Real-time clock
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [currentDate, setCurrentDate] = useState(today);
  const [currentTime, setCurrentTime] = useState(
    new Date().toTimeString().slice(0, 8),
  );
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clock effect
  useEffect(() => {
    if (isClockRunning) {
      const tick = () => {
        const now = new Date();
        setCurrentDate(now.toISOString().split("T")[0]);
        setCurrentTime(now.toTimeString().slice(0, 8));
      };
      tick();
      clockRef.current = setInterval(tick, 1000);
    } else if (clockRef.current) {
      clearInterval(clockRef.current);
      clockRef.current = null;
    }
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, [isClockRunning]);

  const fetchPatientInfo = useCallback(async (nrw: string) => {
    if (!nrw.trim()) return;
    setIsLoadingPatient(true);
    try {
      const result = await getPatientInfoByNoRawat(nrw);
      if (result.success && result.data) {
        setNoRM(result.data.no_rkm_medis);
        setNamaPasien(result.data.nm_pasien);
      } else {
        setNoRM("");
        setNamaPasien("");
      }
    } catch {
      setNoRM("");
      setNamaPasien("");
    }
    setIsLoadingPatient(false);
  }, []);

  const fetchPemeriksaan = useCallback(
    async (nrw: string, kw: string = "", ta: string = "", tb: string = "") => {
      if (!nrw.trim()) return;
      setIsLoadingData(true);
      try {
        const result = await getPemeriksaanRanap(nrw, kw, ta, tb);
        if (result.success && result.data) {
          const mappedData = result.data.map((row: any, i: number) => ({
            ...row,
            id: `${row.tgl_perawatan}-${row.jam_rawat}-${i}`,
          }));
          setPemeriksaanData(mappedData);
        } else setPemeriksaanData([]);
      } catch {
        setPemeriksaanData([]);
      }
      setIsLoadingData(false);
    },
    [],
  );

  const fetchPegawaiInfo = useCallback(async () => {
    try {
      const result = await getLoggedInPegawai();
      if (result.success && result.data) {
        setPegawaiNik(result.data.nik);
        setPegawaiNama(result.data.nama);
      }
    } catch {}
  }, []);

  const handleShow5Soap = useCallback(async () => {
    if (!noRM.trim() || !pegawaiNik.trim()) {
      alert(
        "Maaf, Silahkan pilih dulu pasien dan petugas/dokter pemberi asuhan...!!!",
      );
      return;
    }
    setIsLoadingSoap5(true);
    setShowSoap5Modal(true);
    try {
      const result = await get5SoapTerakhir(noRM, pegawaiNik);
      if (result.success) setSoap5Data(result.data || []);
      else setSoap5Data([]);
    } catch {
      setSoap5Data([]);
    }
    setIsLoadingSoap5(false);
  }, [noRM, pegawaiNik]);

  const selectFromSoap5 = (row: any) => {
    if (row) {
      setFormKeluhan(row.keluhan || "");
      setFormPemeriksaan(row.pemeriksaan || "");
      setFormPenilaian(row.penilaian || "");
      setFormRtl(row.rtl || "");
      setFormInstruksi(row.instruksi || "");
      setFormEvaluasi(row.evaluasi || "");
    }
    setShowSoap5Modal(false);
  };

  const checkVerifSebelumnya = useCallback(async (nrw: string) => {
    if (!nrw.trim()) return;
    setIsCheckingVerif(true);
    try {
      const result = await cekVerifSOAPSebelumnya(nrw);
      if (result.success && !result.allowed) {
        setIsVerifBlocked(true);
        setVerifBlockMessage(
          result.message || "SOAP sebelumnya belum diverifikasi",
        );
      } else {
        setIsVerifBlocked(false);
        setVerifBlockMessage("");
      }
    } catch {
      setIsVerifBlocked(false);
      setVerifBlockMessage("");
    }
    setIsCheckingVerif(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchPegawaiInfo();
    if (noRawatParam) {
      fetchPatientInfo(noRawatParam);
      checkVerifSebelumnya(noRawatParam);
    }
  }, [
    noRawatParam,
    fetchPatientInfo,
    fetchPemeriksaan,
    fetchPegawaiInfo,
    checkVerifSebelumnya,
  ]);

  useEffect(() => {
    if (noRawat) fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
  }, [noRawat, searchKeyword, tglAwal, tglAkhir]);

  const handleEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = (e.currentTarget as HTMLElement).closest("[data-form]");
      if (!form) return;
      const inputs = form.querySelectorAll<HTMLInputElement>(
        "input:not([readonly])",
      );
      const currentIdx = Array.from(inputs).indexOf(
        e.currentTarget as HTMLInputElement,
      );
      if (currentIdx >= 0 && currentIdx < inputs.length - 1) {
        inputs[currentIdx + 1].focus();
      }
    }
  };

  const resetForm = () => {
    setFormKeluhan("");
    setFormPemeriksaan("");
    setFormAlergi("");
    setFormPenilaian("");
    setFormRtl("");
    setFormInstruksi("");
    setFormEvaluasi("");
    setFormSuhu("");
    setFormTensi("");
    setFormNadi("");
    setFormRespirasi("");
    setFormTinggi("");
    setFormBerat("");
    setFormSpo2("");
    setFormGcs("");
    setFormKesadaran("");
    setSelectedRowIdx(null);
    setIsEditMode(false);
    if (isClockRunning) {
      const now = new Date();
      setCurrentDate(now.toISOString().split("T")[0]);
      setCurrentTime(now.toTimeString().slice(0, 8));
    }
  };

  const populateFormFromRow = (row: PemeriksaanRow, idx: number) => {
    setFormKeluhan(row.keluhan || "");
    setFormPemeriksaan(row.pemeriksaan || "");
    setFormAlergi(row.alergi || "");
    setFormPenilaian(row.penilaian || "");
    setFormRtl(row.rtl || "");
    setFormInstruksi(row.instruksi || "");
    setFormEvaluasi(row.evaluasi || "");
    setFormSuhu(row.suhu_tubuh || "");
    setFormTensi(row.tensi || "");
    setFormNadi(row.nadi || "");
    setFormRespirasi(row.respirasi || "");
    setFormTinggi(row.tinggi || "");
    setFormBerat(row.berat || "");
    setFormSpo2(row.spo2 || "");
    setFormGcs(row.gcs || "");
    setFormKesadaran(row.kesadaran || "");
    setCurrentDate(row.tgl_perawatan || today);
    setCurrentTime(row.jam_rawat || "00:00:00");
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
    return (
      !formKeluhan.trim() &&
      !formPemeriksaan.trim() &&
      !formSuhu.trim() &&
      !formTensi.trim() &&
      !formAlergi.trim() &&
      !formTinggi.trim() &&
      !formBerat.trim() &&
      !formRespirasi.trim() &&
      !formNadi.trim() &&
      !formGcs.trim() &&
      !formRtl.trim() &&
      !formPenilaian.trim() &&
      !formInstruksi.trim() &&
      !formSpo2.trim() &&
      !formEvaluasi.trim()
    );
  };

  // Handlers

  const handleSave = async () => {
    if (isVerifBlocked) {
      alert(
        "Tidak dapat menyimpan: SOAP sebelumnya belum diverifikasi. Harap selesaikan verifikasi terlebih dahulu.",
      );
      return;
    }
    if (isFormEmpty()) {
      alert("Isi minimal satu data pemeriksaan terlebih dahulu!");
      return;
    }
    if (!pegawaiNik.trim()) {
      alert("Dokter/Paramedis masih kosong!");
      return;
    }
    setIsSaving(true);
    try {
      const result = await simpanPemeriksaanRanap(getFormData());
      if (result.success) {
        resetForm();
        fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
      } else {
        alert(result.message || "Gagal menyimpan data");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    }
    setIsSaving(false);
  };

  const handleNew = () => {
    resetForm();
    setSelectedRows([]);
  };

  const handleReplace = async () => {
    if (isVerifBlocked && isEditMode) {
      alert(
        "Tidak dapat mengganti: SOAP sebelumnya belum diverifikasi. Harap selesaikan verifikasi terlebih dahulu.",
      );
      return;
    }
    if (selectedRowIdx === null) {
      alert("Silahkan pilih data yang mau diganti dari tabel terlebih dahulu!");
      return;
    }
    if (isFormEmpty()) {
      alert("Isi minimal satu data pemeriksaan terlebih dahulu!");
      return;
    }
    if (!pegawaiNik.trim()) {
      alert("Dokter/Paramedis masih kosong!");
      return;
    }
    setAlasanText("");
    setAlasanDialog({ open: true, mode: "ganti" });
  };

  const confirmReplace = async () => {
    if (!alasanText.trim()) {
      alert("Alasan tidak boleh kosong!");
      return;
    }
    setAlasanDialog({ open: false, mode: "ganti" });
    setIsSaving(true);
    try {
      const row = pemeriksaanData[selectedRowIdx!];
      const result = await editPemeriksaanRanap(
        {
          no_rawat: row.no_rawat,
          tgl_perawatan: row.tgl_perawatan,
          jam_rawat: row.jam_rawat,
        },
        getFormData(),
        alasanText.trim(),
      );
      if (result.success) {
        resetForm();
        fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
      } else {
        alert(result.message || "Gagal mengubah data");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    const idsToDelete = selectedRows;
    if (idsToDelete.length === 0) {
      alert("Silahkan centang data yang mau dihapus terlebih dahulu!");
      return;
    }
    setAlasanText("");
    setAlasanDialog({ open: true, mode: "hapus" });
  };

  const confirmDelete = async () => {
    if (!alasanText.trim()) {
      alert("Alasan tidak boleh kosong!");
      return;
    }
    setAlasanDialog({ open: false, mode: "hapus" });
    const idsToDelete = selectedRows;
    setIsSaving(true);
    try {
      for (const id of idsToDelete) {
        const row = pemeriksaanData.find((r) => r.id === id);
        if (!row) continue;
        const result = await hapusPemeriksaanRanap(
          row.no_rawat,
          row.tgl_perawatan,
          row.jam_rawat,
          alasanText.trim(),
          pegawaiNik,
        );
        if (!result.success) {
          alert(
            result.message ||
              `Gagal menghapus data ${row.tgl_perawatan} ${row.jam_rawat}`,
          );
        }
      }
      setSelectedRows([]);
      resetForm();
      fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    }
    setIsSaving(false);
  };

  const handlePrint = () => {
    const url = `/rawat-inap/print/cppt?noRawat=${encodeURIComponent(noRawat)}&tglAwal=${encodeURIComponent(tglAwal)}&tglAkhir=${encodeURIComponent(tglAkhir)}`;
    window.open(url, "_blank");
  };

  const handleBottomSearch = () =>
    fetchPemeriksaan(noRawat, searchKeyword, tglAwal, tglAkhir);

  if (!mounted) return null;

  return (
    <>
      {/* Tab */}
      <div className="flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-1 sm:px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {[
          "Penanganan Dokter",
          "Petugas",
          "Dokter & Petugas",
          "Pemeriksaan / CPPT",
          "Pemeriksaan Obstetri",
          "Pemeriksaan Ginekologi",
        ].map((tab) => {
          const tabId = tab.toLowerCase().replace(/[^a-z0-9]/g, "");
          const isActive =
            activeTab === (tab === "Pemeriksaan / CPPT" ? "cppt" : tabId);
          return (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab === "Pemeriksaan / CPPT" ? "cppt" : tabId)
              }
              className={`px-1.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap relative ${isActive ? "text-brand-700 dark:text-brand-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-brand-600"}`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Konten Tab */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 pt-0 pb-2 relative">
        {activeTab === "cppt" && (
          <div className="flex flex-col min-h-full w-full max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            {/* Warning banner jika SOAP sebelumnya belum diverifikasi */}
            <AnimatePresence>
              {isVerifBlocked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-2 mt-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 shadow-sm"
                >
                  <FaExclamationTriangle className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-red-700 dark:text-red-300">
                    <p className="font-semibold">
                      SOAP Sebelumnya Belum Diverifikasi
                    </p>
                    <p className="mt-0.5">{verifBlockMessage}</p>
                    <p className="mt-1 text-red-500 dark:text-red-400">
                      Harap selesaikan verifikasi SOAP pada tanggal sebelumnya
                      sebelum mengisi SOAP baru.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <TopFormContainer
              title="Form Input Pemeriksaan / CPPT"
              isOpen={formOpen}
            >
              <div
                className={`flex flex-col gap-5 ${isVerifBlocked ? "opacity-50 pointer-events-none select-none" : ""}`}
              >
                {/* Info Pasien & Tanggal */}
                <FormSection className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-7 sm:w-10 shrink-0">
                      Pasien
                    </label>
                    <input
                      type="text"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1 w-20 sm:w-24 lg:w-auto bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={noRawat}
                      readOnly
                    />
                    <input
                      type="text"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1 w-12 sm:w-14 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={isLoadingPatient ? "..." : noRM}
                      readOnly
                      placeholder="RM"
                    />
                    <input
                      type="text"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1 flex-1 min-w-0 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none focus:border-brand-500"
                      value={isLoadingPatient ? "Memuat..." : namaPasien}
                      readOnly
                      placeholder="Nama"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-8 sm:w-12 shrink-0">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1 text-xs w-28 sm:w-32 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                      value={currentDate}
                      onChange={(e) => {
                        if (!isClockRunning) setCurrentDate(e.target.value);
                      }}
                      readOnly={isClockRunning}
                    />
                    <input
                      type="time"
                      step="1"
                      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1 text-xs w-24 sm:w-28 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-700"
                      value={currentTime}
                      onChange={(e) => {
                        if (!isClockRunning) setCurrentTime(e.target.value);
                      }}
                      readOnly={isClockRunning}
                    />
                    <input
                      type="checkbox"
                      className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0"
                      checked={isClockRunning}
                      disabled
                      title="Jam selalu real-time"
                    />
                  </div>
                </FormSection>
                {/* SOAP, Alergi & TTV */}
                <div className="flex flex-col xl:flex-row gap-4">
                  {/* Kiri: SOAP, TTV */}
                  <div className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0 pt-2">
                            Subjek
                          </label>
                          <textarea
                            className="border border-slate-300 dark:border-slate-600 rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px] focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                            placeholder="Keluhan pasien..."
                            value={formKeluhan}
                            onChange={(e) => setFormKeluhan(e.target.value)}
                          />
                        </div>
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0 pt-2">
                            Objek
                          </label>
                          <textarea
                            className="border border-slate-300 dark:border-slate-600 rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px] focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                            placeholder="Hasil pemeriksaan..."
                            value={formPemeriksaan}
                            onChange={(e) => setFormPemeriksaan(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    {/* TTV */}
                    <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
                      <div
                        data-form="pemeriksaan"
                        className="flex flex-col gap-2"
                      >
                        {/* Row 1: Suhu, Tensi, Berat */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0">
                              Suhu
                              <span className="hidden sm:inline"> (°C)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="°C"
                              value={formSuhu}
                              onChange={(e) => setFormSuhu(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-14 sm:w-20 shrink-0">
                              Tensi
                              <span className="hidden sm:inline"> (mmHg)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="mmHg"
                              value={formTensi}
                              onChange={(e) => setFormTensi(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0">
                              Berat
                              <span className="hidden sm:inline"> (Kg)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="Kg"
                              value={formBerat}
                              onChange={(e) => setFormBerat(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                        </div>
                        {/* Row 2: TB, RR, Nadi */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0">
                              TB<span className="hidden sm:inline"> (Cm)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="Cm"
                              value={formTinggi}
                              onChange={(e) => setFormTinggi(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-14 sm:w-20 shrink-0">
                              RR
                              <span className="hidden sm:inline"> (/mnt)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="/mnt"
                              value={formRespirasi}
                              onChange={(e) => setFormRespirasi(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0">
                              Nadi
                              <span className="hidden sm:inline"> (/mnt)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="/mnt"
                              value={formNadi}
                              onChange={(e) => setFormNadi(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                        </div>
                        {/* Row 3: SpO2, GCS, Kesadaran */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0">
                              SpO2<span className="hidden sm:inline"> (%)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="%"
                              value={formSpo2}
                              onChange={(e) => setFormSpo2(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-14 sm:w-20 shrink-0">
                              GCS
                              <span className="hidden sm:inline"> (E,V,M)</span>
                            </label>
                            <input
                              type="text"
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              placeholder="E,V,M"
                              value={formGcs}
                              onChange={(e) => setFormGcs(e.target.value)}
                              onKeyDown={handleEnterKeyDown}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0">
                              Kesadaran
                            </label>
                            <select
                              className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                              value={formKesadaran}
                              onChange={(e) => setFormKesadaran(e.target.value)}
                            >
                              <option value="">-</option>
                              <option value="Compos Mentis">
                                Compos Mentis
                              </option>
                              <option value="Somnolence">Somnolence</option>
                              <option value="Sopor">Sopor</option>
                              <option value="Coma">Coma</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tengah: Alergi, Asesmen, Plan, Instruksi, Evaluasi */}
                  <div className="flex-1 min-w-0 bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0 pt-2">
                          Alergi
                        </label>
                        <textarea
                          className="border border-slate-300 dark:border-slate-600 rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px] focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                          placeholder="Alergi pasien..."
                          value={formAlergi}
                          onChange={(e) => setFormAlergi(e.target.value)}
                        />
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0 pt-2">
                          Asesmen
                        </label>
                        <textarea
                          className="border border-slate-300 dark:border-slate-600 rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px] focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                          placeholder="Diagnosis/Asesmen..."
                          value={formPenilaian}
                          onChange={(e) => setFormPenilaian(e.target.value)}
                        />
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0 pt-2">
                          Plan
                        </label>
                        <textarea
                          className="border border-slate-300 dark:border-slate-600 rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px] focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                          placeholder="Rencana tindakan..."
                          value={formRtl}
                          onChange={(e) => setFormRtl(e.target.value)}
                        />
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0 pt-2">
                          Instruksi
                        </label>
                        <textarea
                          className="border border-slate-300 dark:border-slate-600 rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px] focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                          placeholder="Instruksi medis..."
                          value={formInstruksi}
                          onChange={(e) => setFormInstruksi(e.target.value)}
                        />
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 sm:w-16 shrink-0 pt-2">
                          Evaluasi
                        </label>
                        <textarea
                          className="border border-slate-300 dark:border-slate-600 rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px] focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                          placeholder="Evaluasi tindakan..."
                          value={formEvaluasi}
                          onChange={(e) => setFormEvaluasi(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Shortcut */}
                  <div className="xl:w-38 shrink-0 bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border border-brand-100/50 dark:border-slate-600 p-3">
                    <h3 className="text-[13px] font-bold text-brand-700 dark:text-brand-400 mb-2 flex items-center gap-2 border-b border-brand-100 dark:border-slate-600 pb-1.5">
                      Shortcut
                    </h3>
                    <div className="flex flex-row flex-wrap xl:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!noRM.trim()) {
                            alert("Silahkan pilih pasien terlebih dahulu");
                            return;
                          }
                          window.open(
                            `/rawat-inap/riwayat-pasien?noRawat=${encodeURIComponent(noRawat)}&noRM=${encodeURIComponent(noRM)}&nama=${encodeURIComponent(namaPasien)}`,
                            "_blank",
                          );
                        }}
                        title="Riwayat Pasien"
                        className="flex-1 xl:flex-none xl:w-full justify-center xl:justify-start h-7.5 font-bold text-[10px] sm:text-[11px] transition-all active:scale-95 bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-brand-400 dark:hover:bg-slate-700 dark:text-slate-200"
                      >
                        <span className="text-sm">
                          <FaHistory />
                        </span>{" "}
                        <span>Riwayat</span>
                        <span className="hidden xl:inline"> Pasien</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!noRM.trim()) {
                            alert("Silahkan pilih pasien terlebih dahulu");
                            return;
                          }
                          window.open(
                            `/rawat-inap/riwayat-pasien?noRawat=${encodeURIComponent(noRawat)}&noRM=${encodeURIComponent(noRM)}&nama=${encodeURIComponent(namaPasien)}`,
                            "_blank",
                          );
                        }}
                        title="Resume Pasien"
                        className="flex-1 xl:flex-none xl:w-full justify-center xl:justify-start h-7.5 font-bold text-[10px] sm:text-[11px] transition-all active:scale-95 bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-brand-400 dark:hover:bg-slate-700 dark:text-slate-200"
                      >
                        <span className="text-sm">
                          <FaClipboardList />
                        </span>{" "}
                        <span>Resume</span>
                        <span className="hidden xl:inline"> Pasien</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShow5Soap}
                        title="5 SOAP Terakhir"
                        className="flex-1 xl:flex-none xl:w-full justify-center xl:justify-start h-7.5 font-bold text-[10px] sm:text-[11px] transition-all active:scale-95 bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-brand-400 dark:hover:bg-slate-700 dark:text-slate-200"
                      >
                        <span className="text-sm">
                          <FaFileAlt />
                        </span>{" "}
                        <span>5 SOAP</span>
                        <span className="hidden xl:inline"> Terakhir</span>
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Petugas */}
                <FormSection>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:w-24 shrink-0">
                      Dilakukan Oleh
                    </label>
                    <div className="flex gap-1 w-full sm:flex-1">
                      <input
                        type="text"
                        className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 w-20 sm:w-24 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700"
                        value={pegawaiNik}
                        readOnly
                      />
                      <input
                        type="text"
                        className="border border-slate-300 dark:border-slate-600 rounded px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none focus:border-brand-500 text-xs bg-slate-50 dark:bg-slate-700"
                        value={pegawaiNama}
                        readOnly
                      />
                      <button
                        onClick={() => setDialogPegawaiOpen(true)}
                        className="px-2 text-brand-500 hover:bg-brand-50 rounded border border-transparent hover:border-brand-200 transition-colors shrink-0"
                        title="Pilih Petugas"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </FormSection>
              </div>
            </TopFormContainer>

            {/* Tabel Inline */}
            <div
              className={`flex flex-col flex-1 min-h-0 transition-all duration-150 ${isTableExpanded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <DataTableMulti
                title="Riwayat Pemeriksaan / CPPT"
                icon={<FaBed />}
                onRefresh={handleBottomSearch}
                onTitleClick={toggleForm}
                titleChevronOpen={formOpen}
                columns={columns}
                data={pemeriksaanData}
                idKey="id"
                selectedIds={selectedRows}
                onSelectionChange={setSelectedRows}
                isLoading={isLoadingData}
                emptyMessage="Tidak ada data pemeriksaan yang ditemukan."
                onRowClick={(row: any) => {
                  const idx = pemeriksaanData.findIndex((r) => r.id === row.id);
                  if (idx >= 0) populateFormFromRow(row, idx);
                }}
              />
            </div>

            {/* Modal Tabel Diperluas */}
            <AnimatePresence>
              {isTableExpanded && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
                    onClick={() => setIsTableExpanded(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 sm:top-8 sm:bottom-8 sm:left-8 sm:right-8 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-slate-50 dark:bg-slate-900 p-2 sm:p-4 shadow-2xl rounded-none sm:rounded-xl border-0 sm:border border-slate-300 dark:border-slate-700 flex flex-col"
                  >
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-t-lg px-3 py-2 shrink-0">
                      <h3 className="font-bold text-slate-700 dark:text-slate-200 text-[13px]">
                        Tabel Riwayat Pemeriksaan / CPPT
                      </h3>
                      <button
                        onClick={() => setIsTableExpanded(false)}
                        className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                      >
                        <FaCompress className="text-[10px]" /> Perkecil
                      </button>
                    </div>
                    <div className="border border-slate-300 dark:border-slate-700 border-t-0 overflow-auto bg-white dark:bg-slate-800 rounded-b-lg flex-1">
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
                </>
              )}
            </AnimatePresence>

            {/* Modal 5 SOAP Terakhir */}
            <AnimatePresence>
              {showSoap5Modal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
                  onClick={() => setShowSoap5Modal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] md:w-[720px] max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FaHistory className="text-brand-500" /> 5 SOAP
                          Terakhir
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {soap5Data.length} data ditemukan — klik baris untuk
                          mengisi form
                        </span>
                      </CardHeader>
                      <CardContent className="p-0">
                        {isLoadingSoap5 ? (
                          <div className="flex justify-center py-12 text-sm text-muted-foreground">
                            Memuat data...
                          </div>
                        ) : soap5Data.length === 0 ? (
                          <div className="flex justify-center py-12 text-sm text-muted-foreground">
                            Tidak ada data SOAP ditemukan untuk petugas ini
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[90px]">
                                    Tanggal
                                  </TableHead>
                                  <TableHead className="w-[65px]">
                                    Jam
                                  </TableHead>
                                  <TableHead>Subjek</TableHead>
                                  <TableHead>Objek</TableHead>
                                  <TableHead>Asesmen</TableHead>
                                  <TableHead>Plan</TableHead>
                                  <TableHead>Instruksi</TableHead>
                                  <TableHead>Evaluasi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {soap5Data.map((row: any, i: number) => (
                                  <TableRow
                                    key={i}
                                    onClick={() => selectFromSoap5(row)}
                                    className="cursor-pointer"
                                  >
                                    <TableCell className="font-medium whitespace-nowrap">
                                      {row.tgl_perawatan}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      {row.jam_rawat}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[110px]">
                                      {row.keluhan || "-"}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[110px]">
                                      {row.pemeriksaan || "-"}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[110px]">
                                      {row.penilaian || "-"}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[110px]">
                                      {row.rtl || "-"}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[110px]">
                                      {row.instruksi || "-"}
                                    </TableCell>
                                    <TableCell className="truncate max-w-[110px]">
                                      {row.evaluasi || "-"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowSoap5Modal(false)}
                        >
                          Tutup
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab !== "cppt" && (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
            Menu {activeTab.toUpperCase()} belum tersedia (Demo)
          </div>
        )}
      </div>

      {/* Dialog Alasan untuk Ganti/Hapus */}
      <AnimatePresence>
        {alasanDialog.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setAlasanDialog({ ...alasanDialog, open: false })}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 w-[calc(100%-2rem)] sm:w-96 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-3">
                {alasanDialog.mode === "ganti"
                  ? "Masukkan alasan edit data:"
                  : "Masukkan alasan hapus data:"}
              </h3>
              <textarea
                className="border border-slate-300 dark:border-slate-600 rounded p-2 w-full h-20 resize-none focus:outline-none focus:border-brand-500 text-xs bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="Alasan..."
                value={alasanText}
                onChange={(e) => setAlasanText(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() =>
                    setAlasanDialog({ ...alasanDialog, open: false })
                  }
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={
                    alasanDialog.mode === "ganti"
                      ? confirmReplace
                      : confirmDelete
                  }
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold transition-colors"
                >
                  Konfirmasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog Pilih Pegawai */}
      <DialogPilihPegawai
        open={dialogPegawaiOpen}
        onClose={() => setDialogPegawaiOpen(false)}
        onSelect={handlePilihPegawai}
      />

      {/* Fitur 1 & 2: BottomPanel dengan filter periode + pencarian */}
      <BottomActionPanel buttonsAlign="left"
        recordCount={pemeriksaanData.length}
        onSave={handleSave}
        onNew={handleNew}
        onReplace={handleReplace}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onExit={() => router.push("/rawat-inap")}
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
    <Suspense
      fallback={
        <div className="p-8 flex justify-center text-brand-500">
          Memuat data...
        </div>
      }
    >
      <PemeriksaanContent />
    </Suspense>
  );
}
