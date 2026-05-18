"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaHistory,
  FaSearch,
  FaUserInjured,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaStethoscope,
  FaNotesMedical,
  FaClipboardList,
  FaCheckSquare,
  FaSquare,
  FaBars,
  FaPrint,
  FaTimes,
} from "react-icons/fa";
import { ActionButton } from "@/components/BottomActionPanel";
import BottomActionPanel from "@/components/BottomActionPanel";

// Demo data
const demoKunjungan = [
  {
    no: 1,
    noRawat: "2025/10/23/000065",
    tgl: "2025-10-23",
    jam: "10:40:20",
    kdDokter: "dr.desi",
    dokter: "dr. Veronica Noveni Dea Paula",
    umur: "55 Th",
    poli: "IGDK IGD",
    bayar: "BPJS",
  },
  {
    no: 2,
    noRawat: "2025/10/23/000065",
    tgl: "2025-10-23",
    jam: "13:07:20",
    kdDokter: "dr.andris",
    dokter: "dr. Andris Sangodian, Sp.PD",
    umur: "55 Th",
    poli: "Cub 128 GABRIEL",
    bayar: "BPJS",
  },
];

const demoSoap = [
  {
    tglReg: "2025-10-23",
    noRawat: "2025/10/23/000065",
    entries: [
      {
        status: "Ranap",
        tglJam: "2025-10-23 12:15:51",
        petugas: "dr.desi",
        profesi: "dr. Veronica Noveni Dea Paula",
        soap: "Menerima advice dr.Andris,Dr.PD,\nJu UGD Inj D4 Jam\nRanplex 1x1 jam\nBi Kg Inj jam\n1x TIV inj.it.",
        instruksi: "Advice dr.Andris,Dr.PD,",
        ipa: "",
      },
      {
        status: "Ranap",
        tglJam: "2025-10-23 18:04:06",
        petugas: "yunita.k",
        profesi: "Yunita Keu, Amd. Kep",
        soap: "S : Pasien mengatakan Batuk be dahak(+), Mual(+), Pusing(+), BAB/BAK(+), Mu/Mi baik(+)\nO : Nl. sedang\nTensi : 114/91\nNadi(Imnt) : 92\nRespirasi(Imnt) : 22\nSuhu(C) : 36\nTinggi(Cm) : -\nBerat(Kg) : -\nSpO2(%) : 99\nGCS(E,V,M) : 15\nAlergi :\nKesadaran : Compos Mentis",
        instruksi: "",
        ipa: "",
      },
    ],
  },
];

const perawatanMenuItems = [
  "Semua",
  "Diagnosa Penyakit (ICD 10)",
  "Prosedur/Tindakan (ICD 9)",
  "Triase (IGD) Lab",
  "Awal Keperawatan IGD",
  "Awal Keperawatan Ralan Umum",
  "Awal Keperawatan Ralan Gigi",
  "Awal Keperawatan Ralan Bayi/Anak",
  "Awal Keperawatan Ranap Bayi/Anak",
  "Awal Keperawatan Ralan Kandungan",
  "Awal Keperawatan Ranap Kebidanan",
  "Awal Keperawatan Ralan Geriatri",
  "Awal Fisioterapi",
  "Penilaian Terapi Wicara",
  "Penilaian Psikolog",
  "Konsultasi Medik",
  "Awal Keperawatan Ranap Umum",
  "Awal Medis IGD",
  "Awal Medis IGD Psikiatri",
  "Awal Medis Ralan Umum",
  "Awal Medis Ralan Kandungan",
  "Awal Medis Ralan Bayi/Anak",
  "Awal Medis Ralan THT",
  "Awal Medis Ralan Psikiatri",
  "Awal Medis Ralan Penyakit Dalam",
  "Awal Medis Ralan Mata",
  "Awal Medis Ralan Neurologi",
  "Awal Medis Ralan Orthopedi",
  "Awal Medis Ralan Bedah",
  "Awal Medis Ralan Bedah Mulut",
];

const demoPerawatanDetail = {
  noRawat: "2025/10/23/000065",
  noReg: "007",
  tglRegistrasi: "2025-10-23 10:40:00",
  umurDaftar: "55 th",
  unitPoli: "IGD",
  dokterPoli: "dr. Veronica Noveni Dea Paula",
  dpjpRanap: "1. dr. Andris Sangodian, Sp.PD",
  caraBayar: "BPJS",
  pj: "Musminah",
  alamatPJ: "KAMP WANDESAY KAY, WANDESAY KAY, Sormasang, Manokw",
  hubPJ: "SUAMI",
  status: "Ranap",
  caramasuk: "Jalan",
  transportasi: "Sendiri",
  alasanKedatangan: "Datang Sendiri",
  keadaan: "MRS TRIASE Biru",
};

function RiwayatPasienContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRMParam = searchParams.get("noRM") || "617211";
  const nmPasienParam = searchParams.get("nama") || "Tn. Sukarji";

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("kunjungan");
  const [showPatientData, setShowPatientData] = useState(false);
  const [filterMode, setFilterMode] = useState("5terakhir");
  const [tgl1, setTgl1] = useState("2026-04-01");
  const [tgl2, setTgl2] = useState("2026-04-30");
  const [checkedMenu, setCheckedMenu] = useState<Record<string, boolean>>(
    Object.fromEntries(perawatanMenuItems.map((m) => [m, m === "Semua"])),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const toggleMenu = (item: string) => {
    if (item === "Semua") {
      const newVal = !checkedMenu["Semua"];
      setCheckedMenu(
        Object.fromEntries(perawatanMenuItems.map((m) => [m, newVal])),
      );
    } else {
      setCheckedMenu((prev) => ({
        ...prev,
        [item]: !prev[item],
        Semua: false,
      }));
    }
  };

  const tabs = [
    { id: "kunjungan", label: "Riwayat Kunjungan" },
    { id: "soapie", label: "Riwayat S.O.A.P.I.E" },
    { id: "perawatan", label: "Riwayat Perawatan" },
  ];

  return (
    <>
      {/* Header Halaman */}
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1 border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
          <FaHistory className="text-brand-600" />
          <span className="truncate">Riwayat Perawatan Rawat Inap</span>
        </h2>
      </div>

      {/* Bar Info Pasien */}
      <div className="bg-white border-b border-slate-200 p-3 shrink-0 flex flex-wrap gap-4 items-center text-xs">
        <div className="flex items-center gap-1">
          <label className="font-semibold text-slate-600">Pasien :</label>
          <input
            type="text"
            className="border border-slate-300 rounded px-2 py-1 w-20 bg-slate-50"
            value={noRMParam}
            readOnly
          />
          <input
            type="text"
            className="border border-slate-300 rounded px-2 py-1 flex-1 min-w-[120px] bg-slate-50"
            value={nmPasienParam}
            readOnly
          />
          <button className="px-2 py-1 text-brand-600 hover:bg-brand-50 rounded border border-brand-200">
            <FaSearch className="text-xs" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <label className="font-semibold text-slate-600">J.K :</label>
          <input
            type="text"
            className="border border-slate-300 rounded px-2 py-1 w-10 bg-slate-50"
            defaultValue="L"
            readOnly
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="font-semibold text-slate-600">
            Tempat & Tgl.Lahir :
          </label>
          <input
            type="text"
            className="border border-slate-300 rounded px-2 py-1 w-24 bg-slate-50"
            defaultValue="Blora"
            readOnly
          />
          <input
            type="text"
            className="border border-slate-300 rounded px-2 py-1 w-28 bg-slate-50"
            defaultValue="1959-06-22"
            readOnly
          />
        </div>
      </div>

      {/* Toggle Data Pasien */}
      <button
        onClick={() => setShowPatientData(!showPatientData)}
        className="bg-white border-b border-slate-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors flex items-center gap-2 shrink-0"
      >
        {showPatientData ? (
          <FaChevronUp className="text-[10px]" />
        ) : (
          <FaChevronDown className="text-[10px]" />
        )}
        {showPatientData ? "Sembunyikan" : "Tampilkan"} Data Pasien
      </button>

      {/* Data Pasien yang Dapat Diperluas */}
      <AnimatePresence>
        {showPatientData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white border-b border-slate-200 shrink-0 overflow-hidden"
          >
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  ["No. RM", noRMParam],
                  ["Nama", nmPasienParam],
                  ["Jenis Kelamin", "Laki-laki"],
                  ["Tempat Lahir", "Blora"],
                  ["Tgl. Lahir", "1959-06-22"],
                  ["Agama", "Islam"],
                  ["Gol. Darah", "O"],
                  ["Status Nikah", "MENIKAH"],
                  ["Pendidikan", "SLTA"],
                  ["Alamat", "Jl. Contoh No. 123, Sormasang"],
                  ["Ibu Kandung", "Suminah"],
                  ["No. KTP", "3312xxxxxxxx"],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-500">
                      {label}
                    </span>
                    <span className="text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab */}
      <div className="flex bg-white border-b border-slate-200 px-3 shrink-0 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap relative ${
              activeTab === tab.id
                ? "text-brand-700 font-bold"
                : "text-slate-500 hover:text-brand-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          {/* Tab 1: Riwayat Kunjungan */}
          {activeTab === "kunjungan" && (
            <motion.div
              key="kunjungan"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-auto"
            >
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-300 z-10 shadow-sm text-slate-600">
                  <tr>
                    {[
                      "No",
                      "No.Rawat",
                      "Tanggal",
                      "Jam",
                      "Kd.Dokter",
                      "Dokter Dituju/DPJP",
                      "Umur",
                      "Poliklinik/Kamar",
                      "Jenis Bayar",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-2 px-3 border-r border-slate-300 font-semibold last:border-r-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demoKunjungan.map((row, i) => (
                    <tr
                      key={i}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50/80"} hover:bg-brand-50 transition-colors cursor-pointer`}
                    >
                      <td className="py-2 px-3 border-r border-slate-200 text-center">
                        {row.no}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-brand-600 font-bold">
                        {row.noRawat}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {row.tgl}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {row.jam}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {row.kdDokter}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {row.dokter}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {row.umur}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        {row.poli}
                      </td>
                      <td className="py-2 px-3">{row.bayar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Tab 2: Riwayat S.O.A.P.I.E */}
          {activeTab === "soapie" && (
            <motion.div
              key="soapie"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-auto p-4"
            >
              {demoSoap.map((group, gi) => (
                <div key={gi} className="mb-6">
                  <div className="flex items-center gap-3 mb-3 text-xs">
                    <span className="font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                      Tgl.Reg: {group.tglReg}
                    </span>
                    <span className="font-semibold text-slate-600">
                      No.Rawat: {group.noRawat}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Header CPPT */}
                    <div className="bg-slate-100 text-[11px] font-bold text-slate-600 grid grid-cols-12 gap-0">
                      <div className="col-span-1 p-2 border-r border-slate-200 text-center">
                        Status
                      </div>
                      <div className="col-span-1 p-2 border-r border-slate-200">
                        Tgl, Jam
                      </div>
                      <div className="col-span-2 p-2 border-r border-slate-200">
                        Profesional Pemberi Asuhan
                      </div>
                      <div className="col-span-4 p-2 border-r border-slate-200">
                        Hasil Asesmen Pasien dan Pemberian Pelayanan
                      </div>
                      <div className="col-span-2 p-2 border-r border-slate-200">
                        Instruksi / IPA
                      </div>
                      <div className="col-span-2 p-2">
                        Review & Verifikasi DPJP
                      </div>
                    </div>
                    {/* Entri CPPT */}
                    {group.entries.map((entry, ei) => (
                      <div
                        key={ei}
                        className={`grid grid-cols-12 gap-0 text-xs border-t border-slate-200 ${ei % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <div className="col-span-1 p-2 border-r border-slate-200 text-center font-semibold text-brand-700">
                          {entry.status}
                        </div>
                        <div className="col-span-1 p-2 border-r border-slate-200 text-slate-600">
                          {entry.tglJam}
                        </div>
                        <div className="col-span-2 p-2 border-r border-slate-200">
                          <div className="font-semibold text-slate-700">
                            {entry.petugas}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {entry.profesi}
                          </div>
                        </div>
                        <div className="col-span-4 p-2 border-r border-slate-200 whitespace-pre-wrap break-words">
                          {entry.soap}
                        </div>
                        <div className="col-span-2 p-2 border-r border-slate-200 text-slate-600">
                          {entry.instruksi || "-"}
                        </div>
                        <div className="col-span-2 p-2 text-slate-400 italic text-[11px]">
                          -
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tab 3: Riwayat Perawatan */}
          {activeTab === "perawatan" && (
            <motion.div
              key="perawatan"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Sidebar Kiri dengan Checkbox */}
              <motion.div
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 40 }}
                className="bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0"
              >
                <div className="p-2 border-b border-slate-100 flex items-center gap-2 h-10">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 hover:bg-brand-50 rounded text-brand-700 shrink-0"
                  >
                    <FaBars className="text-xs" />
                  </button>
                  {sidebarOpen && (
                    <span className="text-xs font-bold text-brand-700 truncate">
                      Pilih Data
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
                    {perawatanMenuItems.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleMenu(item)}
                        className={`flex items-center gap-2 px-2 py-1.5 w-full text-left text-xs rounded transition-colors ${
                          checkedMenu[item]
                            ? "bg-brand-50 text-brand-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {checkedMenu[item] ? (
                          <FaCheckSquare className="text-brand-500 shrink-0" />
                        ) : (
                          <FaSquare className="text-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Panel Detail Kanan */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {/* Kartu Detail Registrasi */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                      <FaClipboardList className="text-brand-500" /> Detail
                      Registrasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {[
                        ["No. Rawat", demoPerawatanDetail.noRawat],
                        ["No. Registrasi", demoPerawatanDetail.noReg],
                        [
                          "Tanggal Registrasi",
                          demoPerawatanDetail.tglRegistrasi,
                        ],
                        ["Umur Saat Daftar", demoPerawatanDetail.umurDaftar],
                        ["Unit/Poliklinik", demoPerawatanDetail.unitPoli],
                        ["Dokter Poli", demoPerawatanDetail.dokterPoli],
                        ["DPJP Ranap", demoPerawatanDetail.dpjpRanap],
                        ["Cara Bayar", demoPerawatanDetail.caraBayar],
                        ["Penanggung Jawab", demoPerawatanDetail.pj],
                        ["Alamat P.J.", demoPerawatanDetail.alamatPJ],
                        ["Hubungan P.J.", demoPerawatanDetail.hubPJ],
                        ["Status", demoPerawatanDetail.status],
                      ].map(([label, value]) => (
                        <div key={label} className="flex gap-2">
                          <span className="font-semibold text-slate-500 min-w-[130px]">
                            {label}
                          </span>
                          <span className="text-slate-400">:</span>
                          <span className="text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kartu Detail Perawatan */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2 border-b border-brand-100 pb-2">
                      <FaNotesMedical className="text-brand-500" /> Detail
                      Perawatan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {[
                        ["Cara Masuk", demoPerawatanDetail.caramasuk],
                        ["Transportasi", demoPerawatanDetail.transportasi],
                        [
                          "Alasan Kedatangan",
                          demoPerawatanDetail.alasanKedatangan,
                        ],
                        ["Keadaan", demoPerawatanDetail.keadaan],
                      ].map(([label, value]) => (
                        <div key={label} className="flex gap-2">
                          <span className="font-semibold text-slate-500 min-w-[130px]">
                            {label}
                          </span>
                          <span className="text-slate-400">:</span>
                          <span className="text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Placeholder untuk modul asesmen yang dipilih */}
                  <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 italic">
                    Pilih modul asesmen pada panel kiri untuk menampilkan data
                    perawatan lengkap
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Panel Aksi Bawah dengan Filter */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex flex-wrap items-center gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { id: "5terakhir", label: "5 Riwayat Terakhir" },
            { id: "semua", label: "Semua Riwayat" },
            { id: "tanggal", label: "Tanggal" },
            { id: "norawat", label: "No.Rawat" },
          ].map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <input
                type="radio"
                name="filterMode"
                value={opt.id}
                checked={filterMode === opt.id}
                onChange={() => setFilterMode(opt.id)}
                className="accent-brand-500 w-3.5 h-3.5"
              />
              <span
                className={
                  filterMode === opt.id
                    ? "font-bold text-brand-700"
                    : "text-slate-600"
                }
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {filterMode === "tanggal" && (
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-slate-400" />
            <input
              type="date"
              value={tgl1}
              onChange={(e) => setTgl1(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
            />
            <span className="text-slate-400">s.d</span>
            <input
              type="date"
              value={tgl2}
              onChange={(e) => setTgl2(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        {filterMode === "norawat" && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">No.Rawat :</span>
            <input
              type="text"
              placeholder="Masukkan No. Rawat..."
              className="border border-slate-300 rounded px-2 py-1 w-40 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2 px-2 border-l border-slate-200 ml-2">
          <span className="text-slate-500 font-semibold whitespace-nowrap">
            Pencarian :
          </span>
          <input
            type="text"
            placeholder="Cari data di sini..."
            className="border border-slate-300 rounded px-2 py-1 w-40 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ActionButton
            icon={<FaSearch className="drop-shadow-sm" />}
            label="Tampilkan"
            variant="primary"
          />
          <ActionButton
            icon={<FaTimes className="text-red-500 drop-shadow-sm" />}
            label="Keluar"
            isExit
            onClick={() => router.back()}
          />
        </div>
      </div>
    </>
  );
}

export default function RiwayatPasienPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex justify-center text-brand-500">
          Memuat data...
        </div>
      }
    >
      <RiwayatPasienContent />
    </Suspense>
  );
}
