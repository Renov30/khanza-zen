# SIMRS Khanza Web — UI Standards & Best Practices

> Dokumen ini adalah panduan wajib untuk semua pengembangan UI pada SIMRS Khanza Web.
> Setiap halaman baru dan setiap perubahan UI **harus** konsisten dengan standar ini.

---

## 1. Sistem Warna (Brand Color)

Seluruh halaman menggunakan variabel `brand-*` yang didefinisikan di `globals.css`.
Warna dasar saat ini adalah **emerald** (hijau) — dapat diubah secara global hanya di satu file.

| Penggunaan          | Variabel                        | Contoh                                 |
|---------------------|---------------------------------|----------------------------------------|
| Aksen utama         | `brand-600`                     | Tombol primer, link aktif              |
| Background hover    | `brand-50`                      | Hover pada baris tabel, sidebar item   |
| Teks judul halaman  | `brand-800`                     | Header halaman                         |
| Border aktif/focus  | `brand-500`                     | Focus ring input                       |
| Card section khusus | `brand-50/40` + `brand-100/50`  | Card TTV pada halaman pemeriksaan      |

**Aturan:**
- ❌ Jangan pakai warna keras langsung (e.g. `bg-green-600`, `text-emerald-700`).
- ✅ Selalu gunakan `brand-*` agar bisa diubah tema secara global.

---

## 2. Layout Formulir

### 2.1 Label di Atas Input (Top-Aligned Labels) — **STANDAR WAJIB**

```tsx
// ✅ BENAR — label di atas input
<div className="flex flex-col gap-1.5">
  <label className="text-xs font-semibold text-slate-600">Nama Field</label>
  <input className="border border-slate-300 rounded px-2 py-1.5 text-xs bg-white
    focus:outline-none focus:border-brand-500" />
</div>

// ❌ SALAH — label di samping input (gaya desktop lama)
<div className="flex items-center gap-2">
  <label className="w-24 text-right text-xs">Nama :</label>
  <input className="..." />
</div>
```

**Alasan:** Label di atas input lebih mudah dipindai mata secara vertikal (riset *eyetracking*) dan otomatis responsive tanpa masalah label terpotong.

### 2.2 FormSection — Komponen Wrapper Konsisten

Gunakan `<FormSection>` untuk membungkus setiap baris/seksi form, bukan `<div>` dengan styling manual.

```tsx
import FormSection from "@/components/FormSection";

// ✅ BENAR — pakai komponen FormSection
<FormSection className="flex flex-wrap items-center gap-2">
  ... konten ...
</FormSection>

// ❌ SALAH — styling container manual
<div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
  ... konten ...
</div>
```

**Aturan:**
- `FormSection` memberi styling konsisten: `bg-slate-50/50 p-3 rounded-lg border border-slate-200`
- Bisa ditambah `className` tambahan untuk layout (e.g. `flex flex-wrap items-center gap-2`)
- Cocok untuk info bar, petugas bar, atau grup field apapun

### 2.3 Info Bar Inline (Horizontal) — **PENGECUALIAN**

Hanya untuk **info bar read-only** yang bersifat sekilas (info pasien, petugas, tanggal), label boleh di samping input.
Jangan gunakan pola ini untuk form input aktif — form input tetap harus label di atas (section 2.1).

```tsx
<FormSection className="flex flex-wrap items-center gap-2">
  <div className="flex items-center gap-2">
    <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">
      No.Rawat
    </label>
    <input ... readOnly />
  </div>
  <input ... readOnly placeholder="RM" />
  <input ... readOnly placeholder="Nama" />
  <div className="ml-auto flex items-center gap-2">
    <label className="text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0">
      Tanggal
    </label>
    <input type="date" ... />
    <input type="time" ... />
  </div>
</FormSection>
```

**Pola label:**
- Setiap label: `text-xs font-semibold text-slate-600 w-20 sm:w-24 shrink-0`
- Gap label→field: `gap-2`
- Input yang berdiri sendiri tanpa label: langsung `<input>` tanpa wrapper `<div>`

### 2.3.1 Info Pasien Wajib di Dalam Panel Input

Info bar pasien (no. rawat, RM, nama, tanggal) **harus** ditempatkan di dalam `TopFormContainer` (panel input yang bisa dilipat), **bukan** sebagai bar terpisah di atas tab navigasi.

```
✅ BENAR — info pasien di dalam form panel (seperti halaman Pemeriksaan/CPPT)
┌─ Tabs ──────────────────────┐
│ Tab1 │ Tab2 │ Tab3           │
├──────────────────────────────┤
│ ▼ Sembunyikan Form Input     │
│ ┌──────────────────────────┐ │
│ │ Nama Pasien [input] ...  │ │
│ │ ... field input ...       │ │
│ └──────────────────────────┘ │
│ ┌─ Tabel Data ─────────────┐ │
│ │ ...                       │ │
└──────────────────────────────┘

❌ SALAH — info pasien di bar terpisah di atas tab
┌─ Info Pasien ────────────────┐
│ Nama Pasien [input] ...      │
├─ Tabs ───────────────────────┤
│ Tab1 │ Tab2 │ Tab3           │
├──────────────────────────────┤
│ Form Input ...               │
└──────────────────────────────┘
```

**Aturan:**
- Info pasien ditempatkan sebagai `FormSection` pertama di dalam konten `TopFormContainer`
- Dengan demikian, info pasien ikut terlipat saat form ditutup (konsisten dengan perilaku form)

### 2.4 Pengelompokan Logis (Logical Grouping)

Form yang kompleks **harus** dikelompokkan dalam section/card terpisah:

```tsx
{/* Section dengan judul dan background berbeda */}
<div className="bg-brand-50/40 p-4 rounded-lg border border-brand-100/50">
  <h3 className="text-[13px] font-bold text-brand-700 mb-3 flex items-center gap-2
    border-b border-brand-100 pb-2">
    <FaIcon className="text-brand-500" /> Judul Section
  </h3>
  {/* ... konten ... */}
</div>
```

### 2.5 Grid Responsif untuk Formulir

| Ukuran layar | Kolom grid form       |
|--------------|----------------------|
| Mobile       | `grid-cols-1`        |
| Tablet       | `grid-cols-2`        |
| Desktop      | `grid-cols-3` s/d `grid-cols-5` |

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* ... field items ... */}
</div>
```

---

## 3. Input Waktu (Time Input)

### ❌ JANGAN — 3 kotak terpisah untuk Jam, Menit, Detik
```tsx
<input className="w-12" defaultValue="09" />
<input className="w-12" defaultValue="26" />
<input className="w-12" defaultValue="25" />
```

### ✅ GUNAKAN — 1 input time native
```tsx
<input type="time" step="1"
  className="border border-slate-300 rounded px-2 py-1 text-xs
    focus:outline-none focus:border-brand-500 bg-white"
  defaultValue="09:26:25" />
```

**Keuntungan:** Satu klik, satu elemen. Mendukung *spinner* bawaan browser, hemat ruang, konsisten.

---

## 4. Enter-to-Next-Field Navigation

Navigasi Enter digunakan di form input aktif untuk memindahkan fokus ke field berikutnya, agar pengguna tidak perlu menekan Tab atau klik manual.

### 4.1 Handler Function

Semua halaman form menggunakan satu pola `handleEnterKeyDown` yang didefinisikan sebagai **fungsi biasa** di dalam komponen (bukan `useCallback` — karena dependency-nya nol).

```tsx
const handleEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const form = (e.currentTarget as HTMLElement).closest('[data-form]');
    if (!form) return;
    const inputs = form.querySelectorAll<HTMLInputElement>('input:not([readonly])');
    const currentIdx = Array.from(inputs).indexOf(e.currentTarget as HTMLInputElement);
    if (currentIdx >= 0 && currentIdx < inputs.length - 1) {
      inputs[currentIdx + 1].focus();
    }
  }
};
```

### 4.2 Container

Setiap tab/section form yang menerapkan Enter navigation harus memiliki **wrapper `div` dengan atribut `data-form`** sebagai batas pencarian field.

```tsx
<div data-form="nama-form" className="flex flex-col gap-5">
  {/* ... field-field ... */}
</div>
```

Nilai `data-form` bisa berupa `"gizi"`, `"skrining"`, `"diet"`, atau identifier lain sesuai halaman.

### 4.3 Pemasangan pada Input

Setter `onKeyDown={handleEnterKeyDown}` dipasang pada setiap **single-line `<input>`** yang:
- Tidak `readOnly`
- Bukan `<textarea>` (multi-line tidak pakai Enter nav karena Enter digunakan untuk newline)
- Bukan `<select>`

```tsx
<FormField label="BB" value={bb} onChange={setBB} unit="Kg" onKeyDown={handleEnterKeyDown} />
<input type="text" value={...} onChange={...} onKeyDown={handleEnterKeyDown} />
```

### 4.4 Aturan

- ❌ **Jangan** pasang `handleEnterKeyDown` pada `<textarea>` — Enter di textarea digunakan untuk baris baru.
- ❌ **Jangan** pasang `handleEnterKeyDown` pada input `readOnly` — tidak berguna dan membingungkan.
- ✅ **Pastikan** semua `<input>` dalam satu form punya `onKeyDown={handleEnterKeyDown}` agar navigasi konsisten.
- ✅ **Pastikan** container dengan `data-form` mencakup semua input dalam satu logical form (satu tab/satu panel).
- ✅ Jika tab memiliki beberapa section terpisah, cukup satu `data-form` per tab.

---

## 5. Desain Tab (Tab Navigation)

### Gaya Standar: Underline Tab (Modern Minimalis)

```tsx
<button className={`px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap
  relative ${isActive
    ? 'text-brand-700 font-bold'
    : 'text-slate-500 hover:text-brand-600'
  }`}
>
  {label}
  {isActive && (
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
  )}
</button>
```

**Aturan:**
- ❌ Jangan pakai tab bergaya kotak/border (`rounded-t-lg border border-b-0`)
- ✅ Gunakan tab teks + garis bawah (*underline indicator*) untuk kesan lega dan modern

---

## 6. Hierarki Tombol Aksi (Button Hierarchy)

### Tombol Primer (Primary) — Tindakan Utama (Simpan)
```tsx
<Button className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm">
  <FaSave /> Simpan
</Button>
```

### Tombol Sekunder (Secondary) — Tindakan Biasa
```tsx
<Button variant="outline" className="border-slate-200 hover:border-brand-400
  hover:bg-brand-50 text-slate-700 font-bold">
  <FaPrint /> Cetak
</Button>
```

### Tombol Bahaya (Danger) — Tindakan Destruktif
```tsx
<Button variant="outline" className="border-red-200 hover:border-red-400
  hover:bg-red-50 text-red-700 font-bold">
  <FaTrash /> Hapus
</Button>
```

### Tombol Keluar — Wajib Gaya Exit

Tombol "Keluar" **harus** menggunakan gaya exit/merah konsisten di seluruh aplikasi:

```tsx
// ✅ BENAR — pakai ActionButton dengan isExit (recommended)
import { ActionButton } from "@/components/BottomActionPanel";

<ActionButton icon={<FaTimes />} label="Keluar" isExit onClick={handleClose} />

// ✅ BENAR — atau manual dengan class yang sama
<Button variant="outline"
  className="bg-white border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 font-bold">
  <FaTimes /> Keluar
</Button>
```

```tsx
// ❌ SALAH — pakai warna netral/brand untuk tombol keluar
<Button className="bg-brand-600 text-white">Keluar</Button>
```

**Aturan:**
- Tombol "Keluar" selalu ditempatkan di pojok kanan.
- Gunakan `ActionButton` dari `BottomActionPanel` dengan prop `isExit` jika tersedia.
- Warna merah konsisten: `border-red-200`, `hover:border-red-400`, `hover:bg-red-50`, `text-red-700`.
- Hanya **satu** tombol primer per section.
- Tombol yang sering dipakai (Simpan) = warna solid mencolok.
- Tombol yang jarang dipakai (Hapus, Keluar) = outline/subtle.

---

## 7. Tabel Data

### Header Sticky
Semua tabel data **harus** memiliki header `sticky top-0` agar kolom tetap terlihat saat di-scroll.

### Zebra Striping
```tsx
className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
```

### Hover State
```tsx
className="hover:bg-brand-50 hover:shadow-[inset_3px_0_0_0_var(--color-brand-500)]"
```

### Link dalam Tabel
Data yang bisa diklik (seperti No. Rawat) harus menggunakan `<Link>` dengan style:
```tsx
<Link className="text-brand-600 hover:text-brand-800 hover:underline font-bold">
```

### Empty State
```tsx
<tr>
  <td colSpan={N} className="py-8 text-center text-slate-400 italic">
    Belum ada data...
  </td>
</tr>
```

---

## 8. Sidebar (Collapsible)

Sidebar pada halaman detail (seperti Riwayat Perawatan) harus bisa dilipat (*collapse*):

- **Terbuka:** Lebar `260px`, menampilkan ikon + label.
- **Tertutup:** Lebar `40px`, hanya menampilkan tombol toggle.
- **Toggle:** Tombol hamburger (`FaBars`) di pojok kiri atas sidebar.
- **Animasi:** Gunakan `motion.div` dari Framer Motion.

---

## 9. Page Header

Setiap halaman konten memiliki header gradient:

```tsx
<div className="bg-gradient-to-r from-brand-100 to-slate-50 px-4 py-1
  border-b border-brand-100 flex items-center justify-between shadow-sm z-10 shrink-0">
  <h2 className="text-brand-800 font-bold text-sm flex items-center gap-2 tracking-wide">
    <PageIcon className="text-brand-600" />
    Judul Halaman
  </h2>
</div>
```

---

## 10. Toolbar (Top Navigation Bar)

Toolbar adalah navigasi horizontal paling atas dengan gradient brand.

### Style
- Background gradient: `from-brand-700 via-brand-600 to-brand-800`
- Items di-**center** menggunakan `w-full + justify-center`
- Logo dan judul "SIMRS-KHANZA" di kiri (jika ada), menu/tombol di tengah dan kanan

```tsx
<div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 ...">
  <div className="flex items-center w-full justify-center gap-4">
    {/* items centered */}
  </div>
</div>
```

---

## 11. Shortcut Bar (Second Navigation Row)

Baris kedua setelah toolbar, berisi shortcut menu + profil.

### Style
- Background `bg-white dark:bg-slate-900`, border bottom
- **Items**: "Menu" tetap di kiri, shortcut items di center, profil di kanan
- Layout: `flex items-center justify-center gap-1`
- Label icon berada di **samping kanan icon** (`flex-row`, bukan `flex-col`)
- Text size: `text-[10px] md:text-xs`
- Padding minimal: `px-2 py-1.5`, gap: `gap-1.5 md:gap-2`

### Avatar & ProfileMenu
- Avatar: `w-7 h-7` (small)
- Dropdown icons: `text-[11px]`
- Padding dropdown items: `px-3 py-2`
- Trigger button hanya menampilkan **username** (tanpa "Online" status, tanpa jabatan)

```tsx
// Shortcut item pattern
<button className="flex items-center gap-1.5 text-[10px] md:text-xs ...">
  <FaIcon className="text-[11px]" />
  <span>Label</span>
</button>

// Avatar pattern
<Image className="w-7 h-7 rounded-full object-cover" ... />
```

---

## 12. Bottom Action Panel (`BottomActionPanel`)

### Struktur:
1. **Baris Filter** — Status, Periode tanggal, Pencarian + **Record count** (di sebelah kanan kolom pencarian).
2. **Baris Tombol** — Tombol aksi (Simpan, Baru, Ganti, Hapus, Cetak, Semua, Keluar).

### Props
| Prop             | Type                        | Default    | Description                                    |
|------------------|-----------------------------|------------|------------------------------------------------|
| `buttonsAlign`   | `"center"` \| `"left"`      | `"center"` | Alignment untuk baris filter dan tombol        |
| `hideStandardButtons` | `boolean`             | `false`    | Sembunyikan tombol standar                     |
| `customButtons`  | `React.ReactNode`           | —          | Tombol kustom (kiri)                           |
| `leftFilters`    | `React.ReactNode`           | —          | Filter kustom (kiri)                           |
| `extraFilters`   | `React.ReactNode`           | —          | Filter tambahan                                |

### Record Count
- Ditampilkan di **baris filter**, di samping kanan kolom pencarian
- Format: `Record : <angka>` dengan `text-[11px]`

### Aligment
- `buttonsAlign="center"` (default): Filter dan tombol di-`justify-center`
- `buttonsAlign="left"`: Filter dan tombol di-`justify-start`

### Aturan Tombol
- Tombol "Simpan" = **primer** (solid `bg-brand-600 text-white`)
- Tombol "Hapus" = **danger** (`border-red-200`)
- Tombol lain = **sekunder** (outline standar)
- Tombol "Keluar" = merah, di paling kanan

### ActionButton Component
```tsx
<ActionButton
  onClick={handleAction}
  icon={<FaIcon className="..." />}
  label="Label"
  variant="primary"      // primary | secondary | danger
  isExit                 // untuk tombol keluar (warna merah)
  title="Tooltip (Shortcut)"
/>
```

Variant mapping:
| Variant    | Style                                                       |
|------------|-------------------------------------------------------------|
| `primary`  | `bg-brand-600 hover:bg-brand-700 text-white`                |
| `secondary`| `border-slate-300 hover:border-brand-400 text-slate-700`    |
| `danger`   | `border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700` |
| `isExit`   | Sama dengan danger + kelas khusus `hover:bg-red-100`        |

---

## 13. Dashboard (Home Page)

Halaman `/` menampilkan dua mode yang bisa dipilih user:

### 1. Full Wallpaper View
- Wallpaper penuh sebagai latar belakang
- Logo instansi + nama RS + gradient overlay
- Shortcut bar di atas

### 2. Dashboard View
- Wallpaper tetap muncul sebagai **subtle background** (`opacity-7`)
- Menampilkan:
  - **Metric Cards** (grid 3–5 kolom): jumlah pasien, kunjungan, dll.
  - **Chart Ringkasan** (bar chart)
  - **Jadwal Jaga** (tabel dokter jaga)
  - **Pengumuman** (daftar pengumuman)
- Toggle antar mode disimpan di `localStorage` key `"showWallpaper"`
- Toggle button tersedia di dalam page

---

## 14. Layout

Hanya **Classic Mode** yang tersedia. Zen mode telah dihapus.

### Struktur Layout
```
┌─────────────────────────────────┐
│ Toolbar (brand gradient)        │  ← `from-brand-700 via-brand-600 to-brand-800`
├─────────────────────────────────┤
│ Shortcut Bar (icons + label)    │  ← bg-white, centered items, "Menu" left, profile right
├─────────────────────────────────┤
│ Page Header (gradient)          │  ← `from-brand-100 to-slate-50`
├─────────────────────────────────┤
│                                 │
│  Konten Halaman (flex-1)        │
│                                 │
├─────────────────────────────────┤
│ Bottom Action Panel             │  ← filter + action buttons
└─────────────────────────────────┘
```

### Area Konten
- Container: `flex-1 overflow-hidden` (scroll di child)
- Background: `bg-brand-50/30`
- Tidak ada sidebar navigasi (navigasi via shortcut bar horizontal)

### Dashboard / Page Header
- Dashboard wallpaper bisa di-toggle antara full wallpaper dan dashboard view
- Page header gradient `from-brand-100 to-slate-50` di setiap halaman konten

---

## 15. Riwayat Perawatan (Riwayat Pasien)

Halaman riwayat pasien memiliki 3 tab: Riwayat Kunjungan, Riwayat SOAPIE, dan Riwayat Perawatan.

### Riwayat Perawatan Tab
- Sidebar kiri collapsible dengan **checkbox** untuk memilih section data
- 70+ section data (diagnosa, prosedur, triase, pemeriksaan, catatan dokter, observasi, keperawatan, EWS, risiko jatuh, operasi, penunjang, farmasi, dll.)
- Data di-fetch per section saat checkbox diaktifkan
- Renderer: `renderTable` (tabular) dan `renderForm` (key-value form)
- Section selector di visit picker (pilih kunjungan berdasarkan no_rawat)

### Renderer Patterns
```tsx
// Table renderer (data tabular)
const renderTable = (data, columns) => (
  <table className="w-full text-xs border-collapse">
    <thead>
      <tr className="bg-slate-100 font-semibold">
        {columns.map(col => <th key={col.key} className="p-2 border text-left">{col.label}</th>)}
      </tr>
    </thead>
    <tbody>
      {data.map((row, i) => (
        <tr className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
          {columns.map(col => <td key={col.key} className="p-2 border">{row[col.key]}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

// Form renderer (assessment / key-value)
const renderForm = (data) => data.map(row => (
  <div className="bg-white border rounded-lg p-3 text-xs space-y-1">
    {Object.entries(row).filter(...).map(([key, val]) => (
      <div className="flex gap-2">
        <span className="font-semibold w-32 capitalize">{key.replace(/_/g, ' ')}:</span>
        <span>{val ?? '-'}</span>
      </div>
    ))}
  </div>
));
```

---

## 16. Responsive Design

### Breakpoints (Tailwind CSS default):
| Breakpoint | Lebar     | Target Device   |
|-----------|-----------|-----------------|
| default   | < 640px   | Mobile          |
| `sm:`     | ≥ 640px   | Tablet kecil    |
| `md:`     | ≥ 768px   | Tablet          |
| `lg:`     | ≥ 1024px  | Desktop         |
| `xl:`     | ≥ 1280px  | Desktop besar   |

### Aturan:
- Semua form harus **minimal 1 kolom** di mobile.
- Tabel horizontal scroll diperbolehkan tetapi header harus tetap `sticky`.
- Input dengan `w-fixed` harus punya fallback `flex-1` di mobile.

---

## 17. Animasi & Transisi

- **Page enter:** `framer-motion` scale + opacity.
- **Sidebar toggle:** `motion.div` animate width.
- **Tab switch:** Tidak perlu animasi berat — cukup `transition-colors`.
- **Button press:** `active:scale-95` untuk efek sentuh.

---

## 18. Spacing & Typography

| Elemen             | Font Size        | Weight     |
|--------------------|------------------|------------|
| Judul halaman      | `text-sm` (14px) | `font-bold`|
| Label form         | `text-xs` (12px) | `font-semibold` |
| Isi input          | `text-xs` (12px) | normal     |
| Section title      | `text-[13px]`    | `font-bold`|
| Tabel header       | `text-xs` (12px) | `font-bold`|
| Tabel body         | `text-xs` (12px) | normal     |
| Tombol aksi        | `text-[11px]`    | `font-bold`|
| Shortcut bar text  | `text-[10px] md:text-xs` | `font-semibold` |
| Dropdown icon      | `text-[11px]`    | —          |

**Spacing:**
- Gap antar form field: `gap-4` (16px)
- Padding dalam card: `p-3` s/d `p-4`
- Padding input: `px-2 py-1.5`
- Padding shortcut item: `px-2 py-1.5`
- Gap shortcut items: `gap-1.5 md:gap-2`

---

## 19. Referensi Implementasi: Halaman Pemeriksaan / CPPT

> Halaman `app/rawat-inap/(clinical)/pemeriksaan/page.tsx` adalah **acuan utama** untuk semua halaman input data CRUD.
> Setiap pola di bawah ini **harus** ditiru oleh halaman input data lainnya.

### 19.1 Arsitektur Halaman

```
┌─ Tabs (underline navigation) ──────────────────────────────┐
│ Tab1 │ Tab2 │ Pemeriksaan / CPPT │ Tab4                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─ px-2 sm:px-4 md:px-6 lg:px-8 ───────────────────────┐  │
│  │ ▼ Sembunyikan Form Input (TopFormContainer)            │  │
│  │ ┌───────────────────────────────────────────────────┐ │  │
│  │ │ [Info Pasien Read-only] No.Rawat | RM | Nama      │ │  │
│  │ │ [Tanggal & Jam — real-time clock]                │ │  │
│  │ │                                                     │ │  │
│  │ │ ┌─ SOAPIE ────────┐  ┌─ Alergi/Asesmen/Plan ────┐ │ │  │
│  │ │ │ Subjek          │  │ Alergi                    │ │ │  │
│  │ │ │ Objek           │  │ Asesmen                   │ │ │  │
│  │ │ └─────────────────┘  │ Plan                      │ │ │  │
│  │ │ ┌─ TTV ───────────┐  │ Instruksi                 │ │ │  │
│  │ │ │ Suhu│Tensi│BB   │  │ Evaluasi                  │ │ │  │
│  │ │ │ TB  │RR   │Nadi │  └───────────────────────────┘ │ │  │
│  │ │ │ SpO2│GCS  │Kes  │  ┌─ Shortcut ────────────────┐ │ │  │
│  │ │ └─────────────────┘  │ Riwayat│Resume│SOAP        │ │ │  │
│  │ │ [Dilakukan Oleh]    └─────────────────────────────┘ │ │  │
│  │ └───────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─ Riwayat Pemeriksaan / CPPT (DataTableMulti) — FULL WIDTH ─┐│
│ │ [checkbox] No | No.Rawat | Nama | ...                        ││
│ └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤ │
│ BottomActionPanel (filter periode + search + buttons)         │
└─────────────────────────────────────────────────────────────┘
```

**Aturan Full-Width Table:**
- Container form memiliki padding: `px-2 sm:px-4 md:px-6 lg:px-8` — membungkus warning banner + `TopFormContainer`
- Tabel data (`DataTableMulti`) berada **di luar** container berpadding = full-width (ujung ke ujung)
- Tabel tidak memiliki `rounded-*` — tepinya rata dengan kontainer halaman
- `DataTableMulti` root div: `flex flex-col flex-1 overflow-hidden h-full` (tanpa `rounded-xl`)

### 19.2 Tab Navigation dengan Mapping Label

Gunakan mapping dari label display → tab ID agar tab aktif konsisten:

```tsx
// File: app/rawat-inap/(clinical)/pemeriksaan/page.tsx:647-674
{[
  "Penanganan Dokter",
  "Petugas",
  "Dokter & Petugas",
  "Pemeriksaan / CPPT",
  "Pemeriksaan Obstetri",
  "Pemeriksaan Ginekologi",
].map((tab) => {
  const tabId = tab.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isActive = activeTab === (tab === "Pemeriksaan / CPPT" ? "cppt" : tabId);
  return (
    <button
      key={tab}
      onClick={() => setActiveTab(tab === "Pemeriksaan / CPPT" ? "cppt" : tabId)}
      className={`px-1.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs
        font-semibold transition-all whitespace-nowrap relative
        ${isActive ? "text-brand-700 dark:text-brand-400 font-bold"
          : "text-slate-500 dark:text-slate-400 hover:text-brand-600"}`}
    >
      {tab}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
      )}
    </button>
  );
})}
```

**Aturan:**
- Tab yang belum diimplementasikan tampilkan pesan: `"Menu {tab} belum tersedia (Demo)"` (lihat `:1304-1308`)
- Cukup gunakan `setActiveTab` — routing per-tab tidak perlu URL-based

### 19.3 TopFormContainer — Collapsible Form Panel

Semua form input harus menggunakan `TopFormContainer` yang bisa dilipat:

```tsx
import TopFormContainer from "@/components/TopFormContainer";

// Controlled mode dengan localStorage persistence:
const [formOpen, setFormOpen] = useState(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("khanza_cppt_form_open");
    if (saved !== null) return JSON.parse(saved);
  }
  return true; // default: form terbuka
});

const toggleForm = useCallback(() => {
  setFormOpen((prev) => {
    const next = !prev;
    if (typeof window !== "undefined")
      localStorage.setItem("khanza_cppt_form_open", JSON.stringify(next));
    return next;
  });
}, []);

<TopFormContainer
  title="Form Input Pemeriksaan / CPPT"
  isOpen={formOpen}
>
  {/* konten form */}
</TopFormContainer>
```

### 19.4 Info Pasien — Read-Only Header Bar

Info pasien (no. rawat, RM, nama) **harus read-only** dan ditempatkan sebagai `FormSection` pertama di dalam `TopFormContainer`:

```tsx
<FormSection className="flex flex-wrap items-center gap-x-3 gap-y-1">
  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 shrink-0">
      Pasien
    </label>
    <input type="text" readOnly
      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1
        w-14 sm:w-20 lg:w-35 bg-slate-50 dark:bg-slate-700 text-xs
        focus:outline-none focus:border-brand-500"
      value={noRawat} />
    <input type="text" readOnly placeholder="RM"
      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1
        w-12 sm:w-14 lg:w-18 bg-slate-50 dark:bg-slate-700 text-xs
        focus:outline-none focus:border-brand-500"
      value={noRM} />
    <input type="text" readOnly placeholder="Nama"
      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1
        w-24 sm:w-28 lg:w-70 bg-slate-50 dark:bg-slate-700 text-xs
        focus:outline-none focus:border-brand-500"
      value={namaPasien} />
  </div>
  <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300
      w-10 sm:w-12 shrink-0">Tanggal</label>
    <input type="date" readOnly
      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1
        text-xs w-26 sm:w-28 focus:outline-none focus:border-brand-500
        bg-white dark:bg-slate-700"
      value={currentDate} />
    <input type="time" step="1" readOnly
      className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1
        text-xs w-22 sm:w-24 focus:outline-none focus:border-brand-500
        bg-white dark:bg-slate-700"
      value={currentTime} />
    <input type="checkbox" className="accent-brand-500 w-3.5 h-3.5 opacity-60 shrink-0"
      checked={isClockRunning} disabled title="Jam selalu real-time" />
  </div>
</FormSection>
```

### 19.5 Real-Time Clock Pattern

Gunakan interval 1 detik untuk jam real-time dengan opsi pause (saat edit data lama):

```tsx
// File: app/rawat-inap/(clinical)/pemeriksaan/page.tsx:243-267
const [isClockRunning, setIsClockRunning] = useState(true);
const [currentDate, setCurrentDate] = useState(today);
const [currentTime, setCurrentTime] = useState(
  new Date().toTimeString().slice(0, 8),
);
const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
```

**Aturan:**
- Clock berjalan saat `isClockRunning === true` (default input baru)
- Saat populate form dari row data lama, set `isClockRunning = false` agar tanggal/jam bisa diedit
- Saat reset form (tombol Baru), nyalakan clock kembali
- Tampilkan checkbox disabled yang menunjukkan status clock (centang = real-time)

### 19.6 Form Layout Dua Kolom (Responsif)

Form kompleks dengan grup SOAPIE + TTV + Asesmen menggunakan layout **flex column → row di xl**:

```tsx
<div className="flex flex-col xl:flex-row gap-4">
  {/* Kiri: SOAP + TTV */}
  <div className="flex-1 flex flex-col gap-4 min-w-0">
    {/* SOAP section */}
    <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border
      border-brand-100/50 dark:border-slate-600 p-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-1.5 sm:gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300
            w-12 sm:w-16 shrink-0 pt-2">Subjek</label>
          <textarea className="border border-slate-300 dark:border-slate-600
            rounded p-1.5 sm:p-2 flex-1 resize-y min-h-[50px] sm:min-h-[60px]
            focus:outline-none focus:border-brand-500 text-xs
            bg-white dark:bg-slate-700 dark:text-slate-100" />
        </div>
        <div className="flex items-start gap-1.5 sm:gap-2">
          <label className="...">Objek</label>
          <textarea className="..." />
        </div>
      </div>
    </div>
    {/* TTV section — 3-column grid */}
    <div className="bg-brand-50/40 dark:bg-slate-700/40 rounded-lg border
      border-brand-100/50 dark:border-slate-600 p-3">
      <div data-form="pemeriksaan" className="flex flex-col gap-2">
        {/* 3-column grid rows untuk vital signs */}
      </div>
    </div>
  </div>

  {/* Kanan: Alergi, Asesmen, Plan, Instruksi, Evaluasi */}
  <div className="flex-1 min-w-0 bg-brand-50/40 dark:bg-slate-700/40 rounded-lg
    border border-brand-100/50 dark:border-slate-600 p-3">
    {/* textarea fields */}
  </div>

  {/* Shortcut panel */}
  <div className="xl:w-38 shrink-0 bg-brand-50/40 dark:bg-slate-700/40 rounded-lg
    border border-brand-100/50 dark:border-slate-600 p-3">
    <h3 className="text-[13px] font-bold text-brand-700 dark:text-brand-400 mb-2
      flex items-center gap-2 border-b border-brand-100 dark:border-slate-600 pb-1.5">
      Shortcut
    </h3>
    <div className="flex flex-row flex-wrap xl:flex-col gap-2">
      {/* action buttons */}
    </div>
  </div>
</div>
```

### 19.7 Grid Input TTV (Vital Signs) — 3 Kolom

Setiap baris TTV menggunakan `grid grid-cols-2 sm:grid-cols-3 gap-2`:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
  <div className="flex items-center gap-1.5 min-w-0">
    <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600
      dark:text-slate-300 w-12 sm:w-16 shrink-0">
      Suhu<span className="hidden sm:inline"> (°C)</span>
    </label>
    <input type="text" placeholder="°C"
      className="border border-slate-300 dark:border-slate-600 rounded
        px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none
        focus:border-brand-500 text-xs bg-white dark:bg-slate-700
        dark:text-slate-100"
      onKeyDown={handleEnterKeyDown} />
  </div>
  <div className="flex items-center gap-1.5 min-w-0">
    <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600
      dark:text-slate-300 w-14 sm:w-20 shrink-0">
      Tensi<span className="hidden sm:inline"> (mmHg)</span>
    </label>
    <input type="text" placeholder="mmHg" className="..."
      onKeyDown={handleEnterKeyDown} />
  </div>
  <div className="flex items-center gap-1.5 min-w-0">
    <label className="text-[10px] sm:text-[11px] font-semibold text-slate-600
      dark:text-slate-300 w-12 sm:w-16 shrink-0">
      Berat<span className="hidden sm:inline"> (Kg)</span>
    </label>
    <input type="text" placeholder="Kg" className="..."
      onKeyDown={handleEnterKeyDown} />
  </div>
</div>
```

**Aturan:**
- Label unit dalam `<span className="hidden sm:inline">` agar di mobile tidak penuh
- Setiap input punya `onKeyDown={handleEnterKeyDown}` untuk navigasi Enter
- Input TTV adalah `<input type="text">` biasa (bukan number) — biarkan server validasi

### 19.8 Shortcut Panel (Sidebar Actions)

Letakkan shortcut aksi di panel terpisah di sebelah kanan form (desktop) atau di bawah (mobile):

```tsx
<div className="xl:w-38 shrink-0 bg-brand-50/40 dark:bg-slate-700/40 rounded-lg
  border border-brand-100/50 dark:border-slate-600 p-3">
  <h3 className="text-[13px] font-bold text-brand-700 dark:text-brand-400 mb-2
    flex items-center gap-2 border-b border-brand-100 dark:border-slate-600 pb-1.5">
    Shortcut
  </h3>
  <div className="flex flex-row flex-wrap xl:flex-col gap-2">
    <Button variant="outline" size="sm"
      className="flex-1 xl:flex-none xl:w-full justify-center xl:justify-start
        h-7.5 font-bold text-[10px] sm:text-[11px] transition-all active:scale-95
        bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50
        text-slate-700 dark:bg-slate-700 dark:border-slate-600
        dark:hover:border-brand-400 dark:hover:bg-slate-700 dark:text-slate-200">
      <span className="text-sm"><FaHistory /></span>
      <span>Riwayat</span>
      <span className="hidden xl:inline"> Pasien</span>
    </Button>
  </div>
</div>
```

### 19.9 DataTableMulti — Inline Data Table Full-Width (tanpa rounded)

Gunakan `DataTableMulti` komponen untuk menampilkan data CRUD. Tabel full-width (tanpa padding container) dan tanpa rounded corners.

**Root component `DataTableMulti.tsx`** — tidak boleh ada `rounded-*`:
```tsx
<div className="flex flex-col flex-1 overflow-hidden h-full">
  {/* title bar + table body */}
</div>
```

**Penggunaan di halaman** — tabel di luar div padding form:
```tsx
// Container form (dengan padding)
<div className="px-2 sm:px-4 md:px-6 lg:px-8">
  <TopFormContainer title="Form Input ..." isOpen={formOpen}>
    {/* ... */}
  </TopFormContainer>
</div>

// Tabel full-width (tanpa padding)
<div className="flex flex-col flex-1 min-h-0 ...">
  <DataTableMulti
    title="Riwayat Pemeriksaan / CPPT"
    icon={<FaBed />}
    onRefresh={handleRefresh}
    onTitleClick={toggleForm}
    titleChevronOpen={formOpen}
    columns={columns}
    data={pemeriksaanData}
    idKey="id"
    selectedIds={selectedRows}
    onSelectionChange={setSelectedRows}
    isLoading={isLoadingData}
    emptyMessage="Tidak ada data yang ditemukan."
    onRowClick={(row) => { /* populate form */ }}
  />
</div>

// Expanded (full-screen) table via AnimatePresence
<AnimatePresence>
  {isTableExpanded && (
    <>
      <motion.div ... className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
        onClick={() => setIsTableExpanded(false)} />
      <motion.div ... className="fixed inset-0 ... z-50 ... flex flex-col">
        <div className="flex items-center justify-between ...">
          <h3 className="font-bold text-slate-700 text-[13px]">
            Tabel Riwayat Pemeriksaan / CPPT
          </h3>
          <button onClick={() => setIsTableExpanded(false)}>
            <FaCompress /> Perkecil
          </button>
        </div>
        <DataTableMulti columns={columns} data={pemeriksaanData} ... />
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 19.10 Warning/Alert Banner (AnimatePresence)

Banner peringatan yang muncul/menghilang dengan animasi:

```tsx
<AnimatePresence>
  {isWarningActive && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mx-2 mt-2 px-4 py-3 bg-red-50 dark:bg-red-900/20
        border border-red-200 dark:border-red-800 rounded-lg
        flex items-start gap-3 shadow-sm"
    >
      <FaExclamationTriangle className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
      <div className="text-xs text-red-700 dark:text-red-300">
        <p className="font-semibold">Judul Peringatan</p>
        <p className="mt-0.5">{message}</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### 19.11 Modal Konfirmasi (Alasan Dialog)

Gunakan dialog konfirmasi — bukan `alert()` — untuk aksi Ganti/Hapus:

```tsx
<AnimatePresence>
  {alasanDialog.open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-slate-900/30 backdrop-blur-sm"
      onClick={() => setAlasanDialog({ ...alasanDialog, open: false })}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl
          border border-slate-300 dark:border-slate-700
          w-[calc(100%-2rem)] sm:w-96 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-3">
          {mode === "ganti" ? "Masukkan alasan edit data:" : "Masukkan alasan hapus data:"}
        </h3>
        <textarea className="border border-slate-300 dark:border-slate-600
          rounded p-2 w-full h-20 resize-none focus:outline-none
          focus:border-brand-500 text-xs bg-white dark:bg-slate-700
          dark:text-slate-100" placeholder="Alasan..." />
        <div className="flex justify-end gap-2 mt-3">
          <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700
            hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300
            dark:border-slate-600 rounded text-xs font-semibold
            text-slate-600 dark:text-slate-300">Batal</button>
          <button className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600
            text-white rounded text-xs font-semibold">Konfirmasi</button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 19.12 Dialog Pilih Pegawai

Gunakan komponen `DialogPilihPegawai` untuk memilih pegawai:

```tsx
import DialogPilihPegawai from "@/components/DialogPilihPegawai";

const [dialogPegawaiOpen, setDialogPegawaiOpen] = useState(false);

const handlePilihPegawai = (nik: string, nama: string) => {
  setPegawaiNik(nik);
  setPegawaiNama(nama);
  setDialogPegawaiOpen(false);
};

<DialogPilihPegawai
  open={dialogPegawaiOpen}
  onClose={() => setDialogPegawaiOpen(false)}
  onSelect={handlePilihPegawai}
/>
```

### 19.13 Modal Pemilihan Data Historis

Modal untuk memilih data historis yang bisa mengisi form (contoh: 5 SOAP Terakhir):

```tsx
<AnimatePresence>
  {showModal && (
    <motion.div ... className="fixed inset-0 z-50 flex items-center justify-center
      bg-slate-900/30 backdrop-blur-sm">
      <motion.div ... className="w-[720px] max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaHistory className="text-brand-500" /> Judul Modal
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {data.length} data ditemukan — klik baris untuk mengisi form
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>...</TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} onClick={() => selectRow(row)}
                    className="cursor-pointer">...</TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Tutup</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 19.14 Select Dropdown untuk Opsi Tetap

Gunakan `<select>` untuk opsi yang tetap (bukan data dinamis), dengan value default `""`:

```tsx
<select className="border border-slate-300 dark:border-slate-600 rounded
  px-1.5 sm:px-2 py-1.5 flex-1 min-w-0 focus:outline-none
  focus:border-brand-500 text-xs bg-white dark:bg-slate-700
  dark:text-slate-100"
  value={formValue} onChange={(e) => setFormValue(e.target.value)}
>
  <option value="">-</option>
  <option value="Compos Mentis">Compos Mentis</option>
  <option value="Somnolence">Somnolence</option>
  <option value="Sopor">Sopor</option>
  <option value="Coma">Coma</option>
</select>
```

### 19.15 Form State Management Pattern

```tsx
// 1. Reset form — kosongkan semua state + clock real-time
const resetForm = () => {
  setFormField1("");
  setFormField2("");
  // ... reset semua field
  setSelectedRowIdx(null);
  setIsEditMode(false);
  if (isClockRunning) {
    const now = new Date();
    setCurrentDate(now.toISOString().split("T")[0]);
    setCurrentTime(now.toTimeString().slice(0, 8));
  }
};

// 2. Populate form dari row yang dipilih
const populateFormFromRow = (row: RowType, idx: number) => {
  setFormField1(row.field1 || "");
  setFormField2(row.field2 || "");
  // ... semua field
  setCurrentDate(row.tgl_perawatan || today);
  setCurrentTime(row.jam_rawat || "00:00:00");
  setSelectedRowIdx(idx);
  setIsEditMode(true);
};

// 3. Cek form kosong
const isFormEmpty = () => {
  return !formField1.trim() && !formField2.trim() && ...;
};

// 4. Validasi sebelum simpan
const handleSave = async () => {
  if (/* kondisi blok */) { alert("Tidak dapat menyimpan..."); return; }
  if (isFormEmpty()) { alert("Isi minimal satu data terlebih dahulu!"); return; }
  if (!pegawaiNik.trim()) { alert("Dokter/Paramedis masih kosong!"); return; }
  // ... simpan data
};
```

### 19.16 Column Definitions untuk DataTableMulti

Definisikan kolom sebagai array `TableColumn[]` di luar komponen (tidak perlu re-render):

```tsx
import { TableColumn } from "@/components/TableTypes";

const columns: TableColumn[] = [
  {
    header: "No.Rawat",
    key: "no_rawat",
    className: "text-brand-600 font-bold hover:underline",
    width: "140px",
  },
  {
    header: "Nama Pasien",
    key: "nm_pasien",
    className: "text-slate-800 dark:text-slate-100 font-bold",
    width: "200px",
  },
  { header: "Tgl.Rawat", key: "tgl_perawatan", width: "100px" },
  { header: "Subjek", key: "keluhan", width: "180px", className: "truncate" },
  // ...
];
```

### 19.17 Dilakukan Oleh (Pegawai) — Read-Only + Picker

Tampilkan NIP dan nama pegawai dalam input read-only dengan tombol edit untuk memilih:

```tsx
<FormSection className="flex flex-wrap items-center gap-1 sm:gap-2">
  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300
    shrink-0 whitespace-nowrap">Dilakukan Oleh</label>
  <input type="text" readOnly
    className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1
      w-14 sm:w-16 bg-slate-50 dark:bg-slate-700 text-xs
      focus:outline-none focus:border-brand-500"
    value={pegawaiNik} />
  <input type="text" readOnly
    className="border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1
      w-20 sm:w-28 lg:w-60 bg-slate-50 dark:bg-slate-700 text-xs
      focus:outline-none focus:border-brand-500"
    value={pegawaiNama} />
  <button onClick={() => setDialogPegawaiOpen(true)}
    className="p-1 text-brand-500 hover:bg-brand-50 rounded border border-transparent
      hover:border-brand-200 transition-colors shrink-0"
    title="Pilih Petugas">
    <FaEdit />
  </button>
</FormSection>
```

---

## 20. Checklist Review UI

Sebelum menyelesaikan halaman baru, pastikan:

- [ ] Menggunakan `brand-*` untuk semua warna utama
- [ ] Label form berada di **atas** input, bukan di samping
- [ ] Input waktu menggunakan `<input type="time">`
- [ ] Enter-to-next-field navigation aktif di semua single-line `<input>` (kecuali `readOnly`)
- [ ] Setiap tab/section form memiliki `data-form` container untuk Enter navigation
- [ ] Tab menggunakan gaya *underline*, bukan kotak
- [ ] Hanya ada **1 tombol primer** per section
- [ ] Tabel memiliki header sticky dan zebra striping
- [ ] Halaman responsive di mobile (cek `grid-cols-1` fallback)
- [ ] Sidebar bisa dilipat (jika ada)
- [ ] Animasi halus menggunakan Framer Motion
- [ ] BottomActionPanel menggunakan `buttonsAlign` yang sesuai (`"left"` untuk halaman CRUD, `"center"` untuk halaman daftar)
- [ ] Record count ditempatkan di baris filter (sebelah kanan pencarian), bukan di baris tombol
- [ ] Shortcut bar menggunakan `flex-row` untuk label & icon, text `text-[10px] md:text-xs`
- [ ] Avatar berukuran `w-7 h-7`, dropdown icons `text-[11px]`
- [ ] Info pasien ditempatkan di dalam `TopFormContainer` (bukan bar terpisah)
- [ ] Form menggunakan real-time clock dengan interval 1 detik
- [ ] Aksi Ganti/Hapus menggunakan modal konfirmasi (bukan `alert()`)
- [ ] Kolom tabel didefinisikan sebagai `TableColumn[]` di luar komponen
- [ ] Pegawai dipilih melalui `DialogPilihPegawai` (read-only input + tombol edit)
- [ ] Form layout menggunakan flex-column di mobile dan flex-row di desktop (`xl:flex-row`)
- [ ] Grid input menggunakan `grid-cols-2 sm:grid-cols-3` untuk vital signs / field pendek
- [ ] Label unit teks pendek menggunakan `hidden sm:inline` untuk hemat ruang mobile
- [ ] Tabel data full-width (di luar div padding form, tanpa `px-*` dari container utama)
- [ ] `DataTableMulti` tanpa `rounded-*` (root div: `overflow-hidden` tanpa `rounded-xl`)
- [ ] Halaman input data: padding form diterapkan via wrapper div, bukan container utama
- [ ] Form padding wrapper: `<div className="px-2 sm:px-4 md:px-6 lg:px-8">` membungkus `TopFormContainer` (tabel data di luar wrapper)
- [ ] Patient info menggunakan pola CPPT: label "Pasien" + 3 input (noRawat, RM, Nama) dalam satu baris, label "Tanggal" + date + time di grup terpisah — semua rata kiri dengan `flex flex-wrap` agar turun ke bawah otomatis saat layar kecil
