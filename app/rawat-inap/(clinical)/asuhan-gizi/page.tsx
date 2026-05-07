"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaUtensils, FaSearch, FaChevronDown, FaChevronUp, FaClipboardList
} from 'react-icons/fa';
import BottomActionPanel from '@/components/BottomActionPanel';

// Demo data for table
const demoData = [
  {
    noRawat: '2025/10/23/000065', noRM: '617244', nama: 'Tn. Sukarji', jk: 'L',
    tglLahir: '1959-06-22', tglAsuhan: '2025-10-23', bb: 55, tb: 155, imt: 22.9,
    lla: 0, tl: 0, ulna: 0, llaU: 0, bbIdeal: 0, bbU: 0, tbU: 0, bbTb: 0, llaUPersen: 0,
    subjektif: 'A p51.1.b Leukosit : 13.5 10^3/...',
    fisikKlinis: 'Status Gizi : normalMual dan nyeri ...',
    telur: false, susuSapi: false, kacang: false, gluten: false,
    udang: false, ikan: false, hazelnut: false,
    polaMakan: '3x makan utama',
    riwayatPersonal: '', diagnosaGizi: '', intervensiGizi: '',
    instruksi: '', monitoringEvaluasi: '', petugas: 'ayu',
    namaPetugas: 'Ukhuwwatun Hasanah Pristari Rahayu, S.Gz',
  },
];

// Allergy item component
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

function AsuhannGiziContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '2025/10/23/000065';

  const [mounted, setMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [bb, setBb] = useState('55');
  const [tb, setTb] = useState('155');
  const [imt, setImt] = useState('22.9');
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

  // Allergy state
  const [alergiTelur, setAlergiTelur] = useState(false);
  const [alergiSusuSapi, setAlergiSusuSapi] = useState(false);
  const [alergiKacang, setAlergiKacang] = useState(false);
  const [alergiGluten, setAlergiGluten] = useState(false);
  const [alergiUdang, setAlergiUdang] = useState(false);
  const [alergiIkan, setAlergiIkan] = useState(false);
  const [alergiHazelnut, setAlergiHazelnut] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Input helper component - Updated to UI_STANDARDS.md (Top-Aligned)
  const FormField = ({ label, value, onChange, unit, placeholder, type = 'text', readOnly = false, className = "" }: {
    label: string; value: string; onChange?: (v: string) => void; unit?: string; placeholder?: string; type?: string; readOnly?: boolean; className?: string
  }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
        {label}
        {unit && <span className="text-[10px] text-slate-400 font-normal uppercase">{unit}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors ${readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  );

  const FormTextarea = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white resize-y min-h-[80px]"
      />
    </div>
  );

  const formContent = (
    <div className="space-y-6">
      {/* Patient Data Summary Section */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="No. Rawat" value={noRawatParam} readOnly />
          <FormField label="No. RM" value="617244" readOnly />
          <FormField label="Nama Pasien" value="Tn. Sukarji" readOnly />
          <FormField label="Tgl. Lahir" value="1959-06-22" readOnly />
          <FormField label="Jenis Kelamin" value="Laki-Laki" readOnly />
          <FormField label="Diagnosa Awal" value="pneumonia / pasien umum" className="lg:col-span-2" readOnly />
          <FormField label="Tanggal Asuhan" value="2026-04-30" type="date" />
        </div>
      </div>

      {/* Antropometri Section */}
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

      {/* Pemeriksaan Fisik & Biokimia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormTextarea label="Pemeriksaan Biokimia" value={biokimia} onChange={setBiokimia} placeholder="Masukkan hasil lab/biokimia..." />
        <FormTextarea label="Pemeriksaan Fisik / Klinis" value={fisikKlinis} onChange={setFisikKlinis} placeholder="Masukkan kondisi fisik/klinis pasien..." />
      </div>

      {/* Riwayat Gizi & Personal */}
      <div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
        <h3 className="text-[13px] font-bold text-brand-700 mb-4 flex items-center gap-2 border-b border-brand-100 pb-2">
          Riwayat Gizi & Diet
        </h3>
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-600 block mb-3">Alergi Makanan :</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-12 px-2">
              {/* Kolom Kiri */}
              <div className="space-y-1">
                <AllergyItem label="Telur" value={alergiTelur} onChange={setAlergiTelur} />
                <AllergyItem label="Susu Sapi & Produk Olahannya" value={alergiSusuSapi} onChange={setAlergiSusuSapi} />
                <AllergyItem label="Kacang Kedelai / Tanah" value={alergiKacang} onChange={setAlergiKacang} />
                <AllergyItem label="Gluten / Gandum" value={alergiGluten} onChange={setAlergiGluten} />
              </div>
              {/* Kolom Kanan */}
              <div className="space-y-1">
                <AllergyItem label="Udang" value={alergiUdang} onChange={setAlergiUdang} />
                <AllergyItem label="Ikan" value={alergiIkan} onChange={setAlergiIkan} />
                <AllergyItem label="Hazelnut / Almond" value={alergiHazelnut} onChange={setAlergiHazelnut} />
                <div className="h-5 invisible md:block" aria-hidden="true" /> {/* Spacer penyeimbang */}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-brand-100/30">
            <FormField label="Pola Makan" value={polaMakan} onChange={setPolaMakan} placeholder="Contoh: 3x makan utama, porsi habis" />
            <FormField label="Riwayat Personal" value={riwayatPersonal} onChange={setRiwayatPersonal} placeholder="Riwayat penyakit keluarga/personal..." />
          </div>
        </div>
      </div>

      {/* Clinical Diagnosis & Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormTextarea label="Diagnosa Gizi (ADIME)" value={diagnosaGizi} onChange={setDiagnosaGizi} />
        <FormTextarea label="Intervensi Gizi" value={intervensiGizi} onChange={setIntervensiGizi} />
        <FormTextarea label="Instruksi Medis" value={instruksi} onChange={setInstruksi} />
        <FormTextarea label="Monitoring & Evaluasi" value={monitoringEvaluasi} onChange={setMonitoringEvaluasi} />
      </div>

      {/* Petugas Section */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[250px]">
          <FormField label="Petugas Pengisi Asuhan" value="Ukhuwwatun Hasanah Pristari Rahayu, S.Gz" readOnly />
        </div>
        <button className="h-[38px] px-4 bg-white border border-slate-300 rounded text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-2 text-xs font-bold shadow-sm">
          <FaSearch className="text-[10px]" /> Cari Petugas
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1 border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0">
        <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
          <FaUtensils className="text-brand-600" />
          Data Asuhan Gizi Pasien
        </h2>
      </div>

      {/* Toggle Button - above table when form is closed */}
      {!isFormOpen && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-white border-b border-slate-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors flex items-center gap-2 shrink-0 w-full text-left"
        >
          <FaChevronDown className="text-[10px]" />
          <span className="tracking-wide">Tampilkan Input Data</span>
        </button>
      )}

      {/* Collapsible Input Form - expands from top, replacing table */}
      <AnimatePresence initial={false}>
        {isFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="overflow-hidden border-b border-slate-200 flex flex-col flex-1"
          >
            <div className="p-3 bg-white overflow-y-auto custom-scrollbar flex-1">
              {formContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - below form when form is open */}
      {isFormOpen && (
        <button
          onClick={() => setIsFormOpen(false)}
          className="bg-white border-b border-slate-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors flex items-center gap-2 shrink-0 w-full text-left"
        >
          <FaChevronUp className="text-[10px]" />
          <span className="tracking-wide">Sembunyikan Input Data</span>
        </button>
      )}

      {/* Data Table - takes remaining space, hidden when form is open */}
      <div className={`flex-1 overflow-auto ${isFormOpen ? 'hidden' : 'block'}`}>
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead className="sticky top-0 bg-slate-100 border-b border-slate-300 z-10 shadow-sm text-slate-600">
            <tr>
              {[
                'No.Rawat', 'No.RM', 'Nama Pasien', 'J.K.', 'Tgl.Lahir', 'Tgl.Asuhan',
                'BB(Kg)', 'TB(Cm)', 'IMT(Kg/m²)', 'LLA(Cm)', 'TL(Cm)', 'ULNA(Cm)',
                'LLA/U(%)', 'BB Ideal(Kg)', 'BB/U(%)', 'TB/U(%)', 'BB/TB(%)', 'LLA/U(SD)',
                'Subjektif', 'Fisik/Klinis',
                'Telur', 'Susu Sapi', 'Kacang', 'Gluten', 'Udang', 'Ikan', 'Hazelnut',
                'Pola Makan'
              ].map(h => (
                <th key={h} className="py-2 px-3 border-r border-slate-300 font-semibold last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demoData.map((row, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'} hover:bg-brand-50 hover:shadow-[inset_3px_0_0_0_var(--color-brand-500)] transition-colors cursor-pointer`}>
                <td className="py-2 px-3 border-r border-slate-200 text-brand-600 font-bold">{row.noRawat}</td>
                <td className="py-2 px-3 border-r border-slate-200">{row.noRM}</td>
                <td className="py-2 px-3 border-r border-slate-200">{row.nama}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.jk}</td>
                <td className="py-2 px-3 border-r border-slate-200">{row.tglLahir}</td>
                <td className="py-2 px-3 border-r border-slate-200">{row.tglAsuhan}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.bb}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.tb}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.imt}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.lla}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.tl}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.ulna}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.llaU}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.bbIdeal}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.bbU}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.tbU}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.bbTb}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">{row.llaUPersen}</td>
                <td className="py-2 px-3 border-r border-slate-200 max-w-[200px] truncate">{row.subjektif}</td>
                <td className="py-2 px-3 border-r border-slate-200 max-w-[200px] truncate">{row.fisikKlinis}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.telur ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.susuSapi ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.kacang ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.gluten ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.udang ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.ikan ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3 border-r border-slate-200 text-center">{row.hazelnut ? 'Ya' : 'Tidak'}</td>
                <td className="py-2 px-3">{row.polaMakan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Bottom Action Panel - always at bottom */}
      <BottomActionPanel
        recordCount={1}
        onExit={() => router.push('/rawat-inap')}
      />
    </>
  );
}

export default function AsuhannGiziPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <AsuhannGiziContent />
    </Suspense>
  );
}
