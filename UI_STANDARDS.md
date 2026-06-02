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

## 4. Desain Tab (Tab Navigation)

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

## 5. Hierarki Tombol Aksi (Button Hierarchy)

### 5.1 Tombol Primer (Primary) — Tindakan Utama (Simpan)
```tsx
<Button className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm">
  <FaSave /> Simpan
</Button>
```

### 5.2 Tombol Sekunder (Secondary) — Tindakan Biasa
```tsx
<Button variant="outline" className="border-slate-200 hover:border-brand-400
  hover:bg-brand-50 text-slate-700 font-bold">
  <FaPrint /> Cetak
</Button>
```

### 5.3 Tombol Bahaya (Danger) — Tindakan Destruktif
```tsx
<Button variant="outline" className="border-red-200 hover:border-red-400
  hover:bg-red-50 text-red-700 font-bold">
  <FaTrash /> Hapus
</Button>
```

### 5.4 Tombol Keluar — Wajib Gaya Exit

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
- Tombol "Keluar" selalu ditempatkan di pojok kanan, terpisah secara visual.
- Gunakan `ActionButton` dari `BottomActionPanel` dengan prop `isExit` jika tersedia.
- Warna merah konsisten: `border-red-200`, `hover:border-red-400`, `hover:bg-red-50`, `text-red-700`.
- Hanya **satu** tombol primer per section.
- Tombol yang sering dipakai (Simpan) = warna solid mencolok.
- Tombol yang jarang dipakai (Hapus, Keluar) = outline/subtle.

---

## 6. Tabel Data

### 6.1 Header Sticky
Semua tabel data **harus** memiliki header `sticky top-0` agar kolom tetap terlihat saat di-scroll.

### 6.2 Zebra Striping
```tsx
className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
```

### 6.3 Hover State
```tsx
className="hover:bg-brand-50 hover:shadow-[inset_3px_0_0_0_var(--color-brand-500)]"
```

### 6.4 Link dalam Tabel
Data yang bisa diklik (seperti No. Rawat) harus menggunakan `<Link>` dengan style:
```tsx
<Link className="text-brand-600 hover:text-brand-800 hover:underline font-bold">
```

### 6.5 Empty State
```tsx
<tr>
  <td colSpan={N} className="py-8 text-center text-slate-400 italic">
    Belum ada data...
  </td>
</tr>
```

---

## 7. Sidebar (Collapsible)

Sidebar pada halaman detail (seperti Pemeriksaan Rawat Inap) harus bisa dilipat (*collapse*):

- **Terbuka:** Lebar `224px`, menampilkan ikon + label + search bar.
- **Tertutup:** Lebar `48px`, hanya menampilkan ikon. Tooltip muncul saat hover.
- **Toggle:** Tombol hamburger (`FaBars`) di pojok kiri atas sidebar.
- **Animasi:** Gunakan `motion.div` dari Framer Motion.

---

## 8. Halaman Page Header

Setiap halaman konten memiliki header:

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

## 9. Bottom Action Panel (`BottomActionPanel`)

### Struktur:
1. **Baris Filter** — Periode tanggal + Pencarian search (atas).
2. **Baris Tombol** — Tombol aksi + Record count + Keluar (bawah).

### Aturan:
- Tombol "Simpan" = **primer** (solid `bg-brand-600 text-white`).
- Tombol "Hapus" = **danger** (`border-red-200`).
- Tombol lain = **sekunder** (outline standar).
- Tombol "Keluar" = terpisah di kanan.

---

## 10. Responsive Design

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

## 11. Animasi & Transisi

- **Page enter:** `framer-motion` scale + opacity.
- **Sidebar toggle:** `motion.div` animate width.
- **Tab switch:** Tidak perlu animasi berat — cukup `transition-colors`.
- **Button press:** `active:scale-95` untuk efek sentuh.

---

## 12. Spacing & Typography

| Elemen             | Font Size        | Weight     |
|--------------------|------------------|------------|
| Judul halaman      | `text-sm` (14px) | `font-bold`|
| Label form         | `text-xs` (12px) | `font-semibold` |
| Isi input          | `text-xs` (12px) | normal     |
| Section title      | `text-[13px]`    | `font-bold`|
| Tabel header       | `text-xs` (12px) | `font-bold`|
| Tabel body         | `text-xs` (12px) | normal     |
| Tombol aksi        | `text-[11px]`    | `font-bold`|

**Spacing:**
- Gap antar form field: `gap-4` (16px)
- Padding dalam card: `p-3` s/d `p-4`
- Padding input: `px-2 py-1.5`

---

## 13. Checklist Review UI

Sebelum menyelesaikan halaman baru, pastikan:

- [ ] Menggunakan `brand-*` untuk semua warna utama
- [ ] Label form berada di **atas** input, bukan di samping
- [ ] Input waktu menggunakan `<input type="time">`
- [ ] Tab menggunakan gaya *underline*, bukan kotak
- [ ] Hanya ada **1 tombol primer** per section
- [ ] Tabel memiliki header sticky dan zebra striping
- [ ] Halaman responsive di mobile (cek `grid-cols-1` fallback)
- [ ] Sidebar bisa dilipat (jika ada)
- [ ] Animasi halus menggunakan Framer Motion
