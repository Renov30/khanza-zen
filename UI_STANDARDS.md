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

## 19. Checklist Review UI

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
