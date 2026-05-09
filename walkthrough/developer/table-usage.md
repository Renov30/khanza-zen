# Walkthrough: Implementing Smart Tables in Your Page

This guide explains how to use `DataTableMulti` and `DataTableSingle` components to quickly build interactive tables.

## Step 1: Import Types and Components

First, import the necessary parts in your page file.

```tsx
import DataTableMulti from "@/components/DataTableMulti";
import DataTableSingle from "@/components/DataTableSingle";
import { TableColumn } from "@/components/TableTypes";
```

## Step 2: Define Your Columns

Create a configuration array for your columns. This keeps your JSX clean and logic separated.

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

## Step 3: Set Up Selection State

Choose the state based on whether you want multi-select or single-select.

### For Multi-Select:
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
```

### For Single-Select:
```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
```

## Step 4: Render the Component

### Example using `DataTableMulti`

```tsx
<DataTableMulti
  title="Daftar Pasien"
  icon={<FaBed />}
  onRefresh={fetchData} // Optional
  columns={columns}
  data={data}
  idKey="no_rawat" 
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  isLoading={isLoading}
/>
```

### Example using `DataTableSingle`

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

## Step 5: Handling Actions

Use your state to perform actions (like printing, deleting, or navigating).

```tsx
<button 
  disabled={selectedIds.length === 0}
  onClick={() => console.log("Processing IDs:", selectedIds)}
>
  Proses Terpilih
</button>
```

---
> [!TIP]
> The `render` function in `TableColumn` gives you full control over how a cell looks, including adding links, icons, or custom formatting.
