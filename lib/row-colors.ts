export type RowClassFn = (
  row: any,
  index: number,
  isSelected: boolean,
) => string;

const COLORS = {
  /** Pasien sudah pulang (tgl_keluar terisi) */
  discharged: "bg-green-100 text-slate-700 dark:bg-green-900/50 dark:text-green-300",
  /** Pasien meninggal */
  meninggal: "bg-slate-300 text-white dark:bg-slate-600 dark:text-slate-200",
  /** Pasien pindah kamar */
  pindahKamar: "bg-amber-100 text-slate-700 dark:bg-amber-900/50 dark:text-amber-300",
  /** Pasien pulang paksa */
  pulangPaksa: "bg-orange-100 text-slate-700 dark:bg-orange-900/50 dark:text-orange-300",
  /** Pasien APS / Atas Permintaan Sendiri */
  aps: "bg-green-100 text-slate-700 dark:bg-green-900/50 dark:text-green-300",
  /** Baris sedang dipilih/diklik (non-meninggal) */
  selected:
    "bg-brand-50 shadow-[inset_4px_0_0_0_var(--color-brand-500)] text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  /** Baris sedang dipilih dengan status meninggal */
  selectedMeninggal:
    "bg-brand-50 shadow-[inset_4px_0_0_0_var(--color-brand-500)] text-red-600 dark:bg-slate-700 dark:text-red-400",
};

const DEFAULT = "text-slate-700 dark:text-slate-200";

export const ranapRowClass: RowClassFn = (row, i, isSelected) => {
  const { stts_pulang, tgl_keluar } = row;

  if (isSelected) {
    if (stts_pulang === "Meninggal") return COLORS.selectedMeninggal;
    return COLORS.selected;
  }

  if (stts_pulang === "Meninggal") return COLORS.meninggal;
  if (stts_pulang === "Pindah Kamar") return COLORS.pindahKamar;
  if (stts_pulang === "Pulang Paksa") return COLORS.pulangPaksa;
  if (stts_pulang === "Atas Permintaan Sendiri" || stts_pulang === "APS")
    return COLORS.aps;
  if (tgl_keluar && tgl_keluar !== "" && tgl_keluar !== "0000-00-00")
    return COLORS.discharged;

  return DEFAULT;
};
