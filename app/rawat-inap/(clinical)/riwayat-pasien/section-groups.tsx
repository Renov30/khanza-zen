import { ReactNode } from "react";
import {
  FaStethoscope, FaProcedures, FaAmbulance, FaNotesMedical, FaClipboardList,
  FaUserMd, FaSyringe, FaBed, FaFlask, FaXRay, FaPrescription, FaPills,
  FaHeartbeat, FaBrain, FaTooth, FaEye, FaBaby, FaFemale, FaMale,
  FaWalking, FaWheelchair, FaUserInjured, FaLungs, FaInfoCircle, FaTint,
  FaBurn, FaWeight, FaChild, FaUserPlus, FaUserCheck, FaUserSlash,
  FaCheckCircle, FaClipboardCheck, FaHandHoldingHeart, FaLaptopMedical,
  FaChair, FaFileMedical, FaFileInvoiceDollar, FaCut, FaAppleAlt
} from "react-icons/fa";

export interface SectionDef {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface SectionGroupDef {
  id: string;
  label: string;
  sections: SectionDef[];
}

export const sectionGroups: SectionGroupDef[] = [
  {
    id: "umum",
    label: "UMUM",
    sections: [
      { id: "diagnosa", label: "Diagnosa/Penyakit (ICD 10)", icon: <FaStethoscope /> },
      { id: "prosedur", label: "Prosedur/Tidakan (ICD 9)", icon: <FaProcedures /> },
      { id: "triase", label: "Triase IGD/UGD", icon: <FaAmbulance /> },
    ],
  },
  {
    id: "pemeriksaan_catatan",
    label: "PEMERIKSAAN & CATATAN",
    sections: [
      { id: "catatan_dokter", label: "Catatan Dokter", icon: <FaNotesMedical /> },
      { id: "catatan_observasi_igd", label: "Catatan Observasi IGD", icon: <FaClipboardList /> },
      { id: "catatan_observasi_ranap", label: "Catatan Observasi Ranap", icon: <FaClipboardList /> },
      { id: "catatan_observasi_ranap_kebidanan", label: "Catatan Observasi Ranap Kebidanan", icon: <FaFemale /> },
      { id: "catatan_observasi_ranap_postpartum", label: "Catatan Observasi Ranap Post Partum", icon: <FaBaby /> },
      { id: "catatan_keperawatan_ralan", label: "Catatan Keperawatan Ralan", icon: <FaClipboardList /> },
      { id: "catatan_keperawatan_ranap", label: "Catatan Keperawatan Ranap", icon: <FaClipboardList /> },
      { id: "pemeriksaan_ralan", label: "Pemeriksaan Ralan", icon: <FaStethoscope /> },
      { id: "pemeriksaan_ranap", label: "Pemeriksaan Ranap", icon: <FaStethoscope /> },
      { id: "pemeriksaan_obstetri_ralan", label: "Pemeriksaan Obstetri Ralan", icon: <FaFemale /> },
      { id: "pemeriksaan_genekologi_ralan", label: "Pemeriksaan Genekologi Ralan", icon: <FaFemale /> },
      { id: "pemeriksaan_obstetri_ranap", label: "Pemeriksaan Obstetri Ranap", icon: <FaFemale /> },
      { id: "pemeriksaan_genekologi_ranap", label: "Pemeriksaan Genekologi Ranap", icon: <FaFemale /> },
      { id: "follow_up_dbd", label: "Follow Up DBD", icon: <FaTint /> },
      { id: "catatan_cek_gds", label: "Catatan Cek GDS", icon: <FaTint /> },
      { id: "penilaian_ulang_nyeri", label: "Penilaian Ulang Nyeri", icon: <FaUserInjured /> },
      { id: "monitoring_reaksi_tranfusi", label: "Monitoring Reaksi Tranfusi", icon: <FaTint /> },
      { id: "catatan_persalinan", label: "Catatan Persalinan", icon: <FaBaby /> },
    ],
  },
  {
    id: "tindakan",
    label: "TINDAKAN",
    sections: [
      { id: "tindakan_ralan_dokter", label: "Tindakan Ralan Dokter", icon: <FaUserMd /> },
      { id: "tindakan_ralan_paramedis", label: "Tindakan Ralan Paramedis", icon: <FaSyringe /> },
      { id: "tindakan_ralan_dokter_paramedis", label: "Tindakan Ralan Dokter & Paramedis", icon: <FaUserMd /> },
      { id: "tindakan_ranap_dokter", label: "Tindakan Ranap Dokter", icon: <FaUserMd /> },
      { id: "tindakan_ranap_paramedis", label: "Tindakan Ranap Paramedis", icon: <FaSyringe /> },
      { id: "tindakan_ranap_dokter_paramedis", label: "Tindakan Ranap Dokter & Paramedis", icon: <FaUserMd /> },
      { id: "penggunaan_kamar", label: "Penggunaan Kamar", icon: <FaBed /> },
    ],
  },
  {
    id: "operasi",
    label: "OPERASI / VK",
    sections: [
      { id: "operasi", label: "Operasi/VK", icon: <FaCut /> },
      { id: "operasi_lengkap", label: "Laporan Operasi", icon: <FaFileMedical /> },
    ],
  },
  {
    id: "radiologi_lab",
    label: "RADIOLOGI & LABORATORIUM",
    sections: [
      { id: "radiologi", label: "Pemeriksaan Radiologi", icon: <FaXRay /> },
      { id: "laboratorium", label: "Pemeriksaan Laborat", icon: <FaFlask /> },
      { id: "laboratorium_pa", label: "Laboratorium PA", icon: <FaFlask /> },
    ],
  },
  {
    id: "farmasi",
    label: "FARMASI",
    sections: [
      { id: "resep_pulang", label: "Resep Pulang", icon: <FaPrescription /> },
      { id: "retur_obat", label: "Retur Obat", icon: <FaPills /> },
      { id: "pemberian_obat", label: "Pemberian Obat/BHP/Alkes", icon: <FaSyringe /> },
      { id: "penggunaan_obat_operasi", label: "Penggunaan Obat/BHP Operasi", icon: <FaPills /> },
      { id: "gas_medik", label: "Gas Medik", icon: <FaLungs /> },
    ],
  },
  {
    id: "resume",
    label: "RESUME",
    sections: [
      { id: "resume_pasien", label: "Resume", icon: <FaFileMedical /> },
      { id: "resume_icu", label: "Resume ICU", icon: <FaHeartbeat /> },
      { id: "resume_mata", label: "Resume Mata", icon: <FaEye /> },
    ],
  },
  {
    id: "asuhan_keperawatan",
    label: "ASUHAN KEPERAWATAN",
    sections: [
      { id: "asuhan_keperawatan_igd", label: "Awal Keperawatan IGD", icon: <FaAmbulance /> },
      { id: "asuhan_keperawatan_ralan", label: "Awal Keperawatan Ralan Umum", icon: <FaClipboardList /> },
      { id: "asuhan_keperawatan_ralan_gigi", label: "Awal Keperawatan Ralan Gigi", icon: <FaTooth /> },
      { id: "asuhan_keperawatan_ralan_bayi", label: "Awal Keperawatan Ralan Bayi/Anak", icon: <FaBaby /> },
      { id: "asuhan_keperawatan_ranap_bayi", label: "Awal Keperawatan Ranap Bayi/Anak", icon: <FaBaby /> },
      { id: "asuhan_keperawatan_ralan_kandungan", label: "Awal Keperawatan Ralan Kandungan", icon: <FaFemale /> },
      { id: "asuhan_keperawatan_ralan_psikiatri", label: "Awal Keperawatan Ralan Psikiatri", icon: <FaBrain /> },
      { id: "asuhan_keperawatan_ralan_geriatri", label: "Awal Keperawatan Ralan Geriatri", icon: <FaWalking /> },
      { id: "asuhan_keperawatan_ranap", label: "Awal Keperawatan Ranap Umum", icon: <FaClipboardList /> },
      { id: "asuhan_keperawatan_ranap_kandungan", label: "Awal Keperawatan Ranap Kandungan", icon: <FaFemale /> },
    ],
  },
  {
    id: "asuhan_medis",
    label: "ASUHAN MEDIS",
    sections: [
      { id: "asuhan_medis_igd", label: "Awal Medis IGD", icon: <FaAmbulance /> },
      { id: "asuhan_medis_igd_psikiatri", label: "Awal Medis IGD Psikiatri", icon: <FaBrain /> },
      { id: "asuhan_medis_ralan", label: "Awal Medis Ralan Umum", icon: <FaClipboardList /> },
      { id: "asuhan_medis_ralan_kandungan", label: "Awal Medis Ralan Kandungan", icon: <FaFemale /> },
      { id: "asuhan_medis_ralan_bayi", label: "Awal Medis Ralan Bayi/Anak", icon: <FaBaby /> },
      { id: "asuhan_medis_ralan_tht", label: "Awal Medis Ralan THT", icon: <FaUserMd /> },
      { id: "asuhan_medis_ralan_psikiatri", label: "Awal Medis Ralan Psikiatri", icon: <FaBrain /> },
      { id: "asuhan_medis_ralan_penyakit_dalam", label: "Awal Medis Ralan Penyakit Dalam", icon: <FaStethoscope /> },
      { id: "asuhan_medis_ralan_mata", label: "Awal Medis Ralan Mata", icon: <FaEye /> },
      { id: "asuhan_medis_ralan_neurologi", label: "Awal Medis Ralan Neurologi", icon: <FaBrain /> },
      { id: "asuhan_medis_ralan_orthopedi", label: "Awal Medis Ralan Orthopedi", icon: <FaWalking /> },
      { id: "asuhan_medis_ralan_bedah", label: "Awal Medis Ralan Bedah", icon: <FaCut /> },
      { id: "asuhan_medis_ralan_bedah_mulut", label: "Awal Medis Ralan Bedah Mulut", icon: <FaTooth /> },
      { id: "asuhan_medis_ralan_geriatri", label: "Awal Medis Ralan Geriatri", icon: <FaWalking /> },
      { id: "asuhan_medis_ralan_kulit_kelamin", label: "Awal Medis Ralan Kulit & Kelamin", icon: <FaUserMd /> },
      { id: "asuhan_medis_ralan_paru", label: "Awal Medis Ralan Paru", icon: <FaLungs /> },
      { id: "asuhan_medis_ralan_fisik_rehab", label: "Awal Medis Ralan Fisik & Rehabilitasi", icon: <FaWalking /> },
      { id: "asuhan_medis_ranap", label: "Awal Medis Ranap Umum", icon: <FaClipboardList /> },
      { id: "asuhan_medis_ranap_kandungan", label: "Awal Medis Ranap Kandungan", icon: <FaFemale /> },
      { id: "asuhan_medis_ranap_paru", label: "Awal Medis Ranap Paru", icon: <FaLungs /> },
      { id: "asuhan_medis_hemodialisa", label: "Awal Medis Hemodialisa", icon: <FaTint /> },
    ],
  },
  {
    id: "rehab_penunjang",
    label: "REHAB & PENUNJANG",
    sections: [
      { id: "asuhan_fisioterapi", label: "Awal Fisioterapi", icon: <FaWalking /> },
      { id: "penilaian_terapi_wicara", label: "Penilaian Terapi Wicara", icon: <FaUserMd /> },
      { id: "penilaian_psikolog", label: "Penilaian Psikolog", icon: <FaBrain /> },
      { id: "hasil_usg", label: "Hasil USG Kandungan", icon: <FaBaby /> },
      { id: "hasil_usg_urologi", label: "Hasil USG Urologi", icon: <FaTint /> },
      { id: "hasil_usg_gynecologi", label: "Hasil USG Gynecologi", icon: <FaFemale /> },
      { id: "dokumentasi_eswl", label: "Dokumentasi Tindakan ESWL", icon: <FaFlask /> },
    ],
  },
  {
    id: "skrining_assemen",
    label: "SKRINING & ASSESMEN",
    sections: [
      { id: "pemantauan_ews_anak", label: "Pemantauan PEWS Anak", icon: <FaHeartbeat /> },
      { id: "pemantauan_ews_dewasa", label: "Pemantauan EWS Dewasa", icon: <FaHeartbeat /> },
      { id: "pemantauan_meows_obstetri", label: "Pemantauan MEOWS Obstetri", icon: <FaFemale /> },
      { id: "pemantauan_ews_neonatus", label: "Pemantauan EWS Neonatus", icon: <FaBaby /> },
      { id: "risiko_jatuh_dewasa", label: "Lanjutan Risiko Jatuh Dewasa", icon: <FaWalking /> },
      { id: "risiko_jatuh_anak", label: "Lanjutan Risiko Jatuh Anak", icon: <FaChild /> },
      { id: "risiko_jatuh_lansia", label: "Lanjutan Risiko Jatuh Lansia", icon: <FaWheelchair /> },
      { id: "risiko_jatuh_geriatri", label: "Lanjutan Risiko Jatuh Geriatri", icon: <FaWheelchair /> },
      { id: "risiko_jatuh_neonatus", label: "Lanjutan Risiko Jatuh Neonatus", icon: <FaBaby /> },
      { id: "risiko_jatuh_psikiatri", label: "Lanjutan Risiko Jatuh Psikiatri", icon: <FaBrain /> },
      { id: "skrining_fungsional", label: "Lanjutan Skrining Fungsional", icon: <FaClipboardCheck /> },
      { id: "risiko_dekubitus", label: "Risiko Dekubitus", icon: <FaBurn /> },
      { id: "skrining_tb", label: "Skrining Tuberkulosis", icon: <FaLungs /> },
      { id: "skrining_nutrisi_dewasa", label: "Skrining Nutrisi Dewasa", icon: <FaWeight /> },
      { id: "skrining_nutrisi_anak", label: "Skrining Nutrisi Anak", icon: <FaChild /> },
      { id: "skrining_nutrisi_lansia", label: "Skrining Nutrisi Lansia", icon: <FaWalking /> },
      { id: "skrining_gizi_lanjut", label: "Skrining Gizi Lanjut", icon: <FaAppleAlt /> },
      { id: "monitoring_gizi", label: "Monitoring Gizi", icon: <FaWeight /> },
      { id: "asuhan_gizi", label: "Asuhan Gizi", icon: <FaAppleAlt /> },
      { id: "edukasi_pasien", label: "Edukasi Pasien & Keluarga Rawat Jalan", icon: <FaClipboardList /> },
      { id: "perencanaan_pemulangan", label: "Perencanaan Pemulangan", icon: <FaClipboardList /> },
      { id: "uji_fungsi_kfr", label: "Uji Fungsi/Prosedur KFR", icon: <FaFlask /> },
      { id: "hemodialisa", label: "Hemodialisa", icon: <FaTint /> },
      { id: "penilaian_terminal", label: "Penilaian Pasien Terminal", icon: <FaUserInjured /> },
      { id: "penilaian_korban_kekerasan", label: "Penilaian Korban Kekerasan", icon: <FaUserInjured /> },
      { id: "penilaian_kecemasan_anak", label: "Penilaian Kecemasan Ranap Anak", icon: <FaChild /> },
      { id: "penilaian_penyakit_menular", label: "Penilaian Pasien Penyakit Menular", icon: <FaTint /> },
      { id: "penilaian_keracunan", label: "Penilaian Pasien Keracunan", icon: <FaTint /> },
    ],
  },
  {
    id: "checklist_ok",
    label: "CHECKLIST OK",
    sections: [
      { id: "checklist_pre_operasi", label: "Check List Pre Operasi", icon: <FaClipboardCheck /> },
      { id: "signin_sebelum_anestesi", label: "Sign-In Sebelum Anestesi", icon: <FaCheckCircle /> },
      { id: "timeout_sebelum_insisi", label: "Time-Out Sebelum Insisi", icon: <FaCheckCircle /> },
      { id: "signout_sebelum_menutup_luka", label: "Sign-Out Sebelum Menutup Luka", icon: <FaCheckCircle /> },
      { id: "checklist_post_operasi", label: "Check List Post Operasi", icon: <FaClipboardCheck /> },
      { id: "penilaian_pre_operasi", label: "Penilaian Pre Operasi", icon: <FaUserMd /> },
      { id: "penilaian_pre_anestesi", label: "Penilaian Pre Anestesi", icon: <FaUserMd /> },
      { id: "skor_aldrette", label: "Skor Aldrette Pasca Anestesi", icon: <FaHeartbeat /> },
      { id: "skor_steward", label: "Skor Steward Pasca Anestesi", icon: <FaHeartbeat /> },
      { id: "skor_bromage", label: "Skor Bromage Pasca Anestesi", icon: <FaHeartbeat /> },
      { id: "kriteria_masuk_hcu", label: "Check List Kriteria Masuk HCU", icon: <FaUserPlus /> },
      { id: "kriteria_keluar_hcu", label: "Check List Kriteria Keluar HCU", icon: <FaUserCheck /> },
      { id: "kriteria_masuk_icu", label: "Check List Kriteria Masuk ICU", icon: <FaUserPlus /> },
      { id: "kriteria_keluar_icu", label: "Check List Kriteria Keluar ICU", icon: <FaUserCheck /> },
      { id: "pre_induksi", label: "Penilaian Pre Induksi", icon: <FaSyringe /> },
    ],
  },
  {
    id: "farmasi_klinik",
    label: "FARMASI KLINIK",
    sections: [
      { id: "rekonsiliasi_obat", label: "Rekonsiliasi Obat", icon: <FaClipboardCheck /> },
      { id: "konseling_farmasi", label: "Konseling Farmasi", icon: <FaHandHoldingHeart /> },
      { id: "pelayanan_informasi_obat", label: "Pelayanan Informasi Obat", icon: <FaLaptopMedical /> },
      { id: "konsultasi_medik", label: "Konsultasi Medik", icon: <FaUserMd /> },
    ],
  },
  {
    id: "tambahan",
    label: "TAMBAHAN GERIATRI & PSIKIATRI",
    sections: [
      { id: "tambahan_geriatri", label: "Tambahan Pasien Geriatri", icon: <FaWalking /> },
      { id: "tambahan_bunuh_diri", label: "Tambahan Bunuh Diri", icon: <FaUserSlash /> },
      { id: "tambahan_perilaku_kekerasan", label: "Tambahan Perilaku Kekerasan", icon: <FaUserInjured /> },
      { id: "tambahan_melarikan_diri", label: "Tambahan Melarikan Diri", icon: <FaWalking /> },
    ],
  },
  {
    id: "lain_lain",
    label: "LAIN-LAIN",
    sections: [
      { id: "transfer_antar_ruang", label: "Transfer Antar Ruang", icon: <FaChair /> },
      { id: "pengkajian_restrain", label: "Pengkajian Restrain", icon: <FaUserSlash /> },
      { id: "berkas_digital", label: "Berkas Digital Perawatan", icon: <FaFileMedical /> },
      { id: "tambahan_biaya", label: "Tambahan Biaya", icon: <FaFileInvoiceDollar /> },
      { id: "potongan_biaya", label: "Potongan Biaya", icon: <FaFileInvoiceDollar /> },
    ],
  },
];

export const allSectionIds = sectionGroups.flatMap(g => g.sections.map(s => s.id));
