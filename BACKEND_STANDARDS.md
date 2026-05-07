# SIMRS Khanza Web — Backend & Data Fetching Standards

> Dokumen ini adalah panduan wajib untuk pengembangan logika backend, akses database, dan pengambilan data pada SIMRS Khanza Web.
> AI dan Developer **harus** mengikuti standar ini agar kode konsisten, aman, dan mudah dipelihara.

---

## 1. Arsitektur Data Fetching: Server Actions

Seluruh pengambilan data dari database **harus** menggunakan Next.js **Server Actions**, bukan Route Handlers (API Routes) manual, kecuali ada kebutuhan khusus untuk integrasi pihak ketiga.

**Aturan:**
- File action harus berada di folder `lib/actions/`.
- File **harus** dimulai dengan direktif `"use server";`.
- Fungsi harus bersifat asinkron (`async`).

---

## 2. Struktur Query SQL

### 2.1 Parameterized Queries (Keamanan)
❌ **JANGAN** menggabungkan string langsung (SQL Injection risk).
✅ **SELALU** gunakan placeholder `?`.

```typescript
// ✅ BENAR
const [rows] = await db.execute("SELECT * FROM pasien WHERE no_rkm_medis = ?", [noRM]);
```

### 2.2 Standar JOIN (Referensi Java)
Gunakan JOIN yang sama dengan versi Java Khanza untuk konsistensi data.
- `reg_periksa` JOIN `pasien` pada `no_rkm_medis`.
- `pemeriksaan_ranap` JOIN `reg_periksa` pada `no_rawat`.

### 2.3 Filter Audit Trail
Untuk tabel yang memiliki audit trail (seperti `pemeriksaan_ranap`), selalu tambahkan filter status aktif:
```sql
LEFT JOIN pemeriksaan_ranap_audit_trail 
  ON pemeriksaan_ranap.no_rawat = pemeriksaan_ranap_audit_trail.no_rawat 
  AND pemeriksaan_ranap.tgl_perawatan = pemeriksaan_ranap_audit_trail.tgl_perawatan 
  AND pemeriksaan_ranap.jam_rawat = pemeriksaan_ranap_audit_trail.jam_rawat 
WHERE 
  (pemeriksaan_ranap_audit_trail.status = 'aktif' OR pemeriksaan_ranap_audit_trail.status IS NULL)
```

### 2.4 Urutan Data (Sorting)
Default urutan data adalah **terbaru ke terlama**.
```sql
ORDER BY tgl_perawatan DESC, jam_rawat DESC
```

---

## 3. Format Response Action

Seluruh fungsi action harus mengembalikan objek dengan struktur yang seragam agar mudah ditangani oleh Client Component.

```typescript
export async function getContohData() {
  try {
    const [rows] = await db.execute("...");
    return { 
      success: true, 
      data: formattedRows 
    };
  } catch (error: any) {
    console.error("Error context:", error);
    return { 
      success: false, 
      message: "Pesan error untuk user",
      error: error.message // Untuk debugging
    };
  }
}
```

---

## 4. Penanganan Tipe Data (Serialization)

Next.js Server Actions tidak bisa mengirim objek `Date` langsung ke client. Semua tanggal/waktu harus dikonversi ke string di sisi server.

```typescript
const formattedRows = rows.map((row: any) => ({
  ...row,
  tgl_perawatan: row.tgl_perawatan instanceof Date 
    ? row.tgl_perawatan.toISOString().split("T")[0] 
    : row.tgl_perawatan,
}));
```

---

## 5. Integrasi di Client Component (`use client`)

### 5.1 Fetching dengan `useEffect` & `useCallback`
Gunakan `useCallback` agar fungsi fetch stabil dan tidak menyebabkan *re-render* tak terbatas saat dimasukkan ke *dependency array*.

```tsx
const fetchData = useCallback(async (id: string) => {
  setIsLoading(true);
  const result = await getActionData(id);
  if (result.success) {
    setData(result.data);
  }
  setIsLoading(false);
}, []);

useEffect(() => {
  if (id) fetchData(id);
}, [id, fetchData]);
```

### 5.2 State Management
Gunakan state terpisah untuk data, loading, dan pencarian:
- `const [data, setData] = useState([]);`
- `const [isLoading, setIsLoading] = useState(false);`
- `const [keyword, setKeyword] = useState('');`

---

## 6. Penamaan Fungsi

- `get...` : Mengambil data (Read). Contoh: `getPemeriksaanRanap`.
- `create...` / `save...` : Menambah data (Create).
- `update...` : Mengubah data (Update).
- `delete...` : Menghapus data (Delete).

---

## 7. Checklist Review Backend

Sebelum menyelesaikan fitur baru, pastikan:

- [ ] Menggunakan Server Action (`"use server"`) di folder `lib/actions/`.
- [ ] SQL menggunakan parameterized query (`?`).
- [ ] Implementasi Audit Trail sudah benar (untuk tabel terkait).
- [ ] Sorting sudah dari yang terbaru (`DESC`).
- [ ] Semua objek `Date` sudah dikonversi ke string.
- [ ] Mengembalikan format `{ success, data, message }`.
- [ ] Loading state ditampilkan di UI saat proses fetch berlangsung.
