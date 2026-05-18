# Walkthrough: Menggunakan Tabel Interaktif di Halaman Anda

Panduan ini menjelaskan cara menggunakan komponen `DataTableMulti` dan `DataTableSingle` untuk membangun tabel interaktif dengan cepat.

## Langkah 1: Import Tipe dan Komponen

Pertama, import bagian yang diperlukan di file halaman Anda.

```tsx
import DataTableMulti from "@/components/DataTableMulti";
import DataTableSingle from "@/components/DataTableSingle";
import { TableColumn } from "@/components/TableTypes";
```

## Langkah 2: Definisikan Kolom

Buat array konfigurasi untuk kolom Anda. Ini menjaga JSX tetap bersih dan logika terpisah.

```tsx
const columns: TableColumn[] = [
  { header: "No. Rawat", key: "no_rawat", className: "font-bold text-brand-600" },
  { header: "Nama Pasien", key: "nm_pasien" },
  { 
    header: "Status", 
    key: "stts_pulang",
    render: (row) => (
      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
        {row.stts_pulang}
      </span>
    )
  },
];
```

## Langkah 3: Siapkan State Seleksi

Pilih state berdasarkan kebutuhan: multi-select atau single-select.

### Untuk Multi-Select:
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
```

### Untuk Single-Select:
```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
```

## Langkah 4: Render Komponen

### Contoh menggunakan `DataTableMulti`

```tsx
<DataTableMulti
  title="Daftar Pasien"
  icon={<FaBed />}
  onRefresh={fetchData} // Opsional
  columns={columns}
  data={data}
  idKey="no_rawat" 
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  isLoading={isLoading}
/>
```

### Contoh menggunakan `DataTableSingle`

```tsx
<DataTableSingle
  title="Detail Pasien"
  icon={<FaUser />}
  columns={columns}
  data={data}
  idKey="no_rawat"
  selectedId={selectedId}
  onSelectionChange={setSelectedId}
  isLoading={isLoading}
/>
```

## Langkah 5: Menangani Aksi

Gunakan state untuk melakukan aksi (seperti mencetak, menghapus, atau navigasi).

```tsx
<button 
  disabled={selectedIds.length === 0}
  onClick={() => console.log("Memproses ID:", selectedIds)}
>
  Proses Terpilih
</button>
```

---
> [!TIP]
> Fungsi `render` di `TableColumn` memberi Anda kendali penuh atas tampilan sel, termasuk menambahkan tautan, ikon, atau format kustom.
