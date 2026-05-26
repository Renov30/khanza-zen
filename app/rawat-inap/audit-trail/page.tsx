"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaHistory, FaTimes, FaSearch, FaSync, FaExpand, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getPemeriksaanRanapAuditTrail, getDetailPemeriksaanRanap } from '@/lib/actions/ranap';
import { TableColumn } from '@/components/TableTypes';
import DataTableMulti from '@/components/DataTableMulti';

interface AuditRow {
  id?: string;
  no_rawat: string; no_rkm_medis: string; nm_pasien: string;
  tgl_perawatan: string; jam_rawat: string;
  created_at: string; created_by: string;
  updated_at: string; updated_by: string; ket_edit: string;
  deleted_at: string; deleted_by: string; ket_hapus: string;
  status: string;
}

interface DetailData {
  suhu_tubuh: string; tensi: string; nadi: string; respirasi: string;
  tinggi: string; berat: string; spo2: string; gcs: string; kesadaran: string;
  keluhan: string; pemeriksaan: string; alergi: string;
  penilaian: string; rtl: string; instruksi: string; evaluasi: string;
  nip: string; nm_pegawai: string; jbtn: string;
}

const columns: TableColumn[] = [
  { header: 'No.Rawat', key: 'no_rawat', width: '140px', className: 'text-brand-600 font-bold' },
  { header: 'No.R.M.', key: 'no_rkm_medis', width: '70px', className: 'text-brand-600 font-semibold' },
  { header: 'Nama Pasien', key: 'nm_pasien', width: '180px', className: 'font-bold text-slate-800' },
  { header: 'Tgl.Rawat', key: 'tgl_perawatan', width: '100px' },
  { header: 'Jam', key: 'jam_rawat', width: '80px' },
  { header: 'Created At', key: 'created_at', width: '160px' },
  { header: 'Created By', key: 'created_by', width: '100px' },
  { header: 'Updated At', key: 'updated_at', width: '160px' },
  { header: 'Updated By', key: 'updated_by', width: '100px' },
  { header: 'Ket.Edit', key: 'ket_edit', width: '150px', className: 'truncate' },
  { header: 'Deleted At', key: 'deleted_at', width: '160px' },
  { header: 'Deleted By', key: 'deleted_by', width: '100px' },
  { header: 'Ket.Hapus', key: 'ket_hapus', width: '150px', className: 'truncate' },
  { header: 'Status', key: 'status', width: '100px' },
];

function statusBadge(status: string) {
  if (status === 'aktif') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Aktif</span>;
  if (status === 'direvisi') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">Direvisi</span>;
  if (status === 'dibatalkan') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Dibatalkan</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status || '-'}</span>;
}

function AuditTrailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noRawatParam = searchParams.get('noRawat') || '';
  const tglAwalParam = searchParams.get('tglAwal') || '';
  const tglAkhirParam = searchParams.get('tglAkhir') || '';

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AuditRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [tglAwal, setTglAwal] = useState(tglAwalParam || today);
  const [tglAkhir, setTglAkhir] = useState(tglAkhirParam || today);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detail modal
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchData = useCallback(async (kw: string = '', ta: string = '', tb: string = '', pg: number = 1) => {
    setIsLoading(true);
    try {
      const result = await getPemeriksaanRanapAuditTrail(noRawatParam, kw, ta, tb, pg, pageSize);
      if (result.success && result.data) {
        const mapped = result.data.map((row: any, i: number) => ({
          ...row,
          id: `${row.tgl_perawatan}-${row.jam_rawat}-${((result.page || 1) - 1) * pageSize + i}`,
        }));
        setData(mapped);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
        setPage(result.page || 1);
      } else {
        setData([]);
        setTotal(0);
        setTotalPages(1);
        setPage(1);
      }
    } catch {
      setData([]);
    }
    setIsLoading(false);
  }, [noRawatParam]);

  useEffect(() => {
    setMounted(true);
    fetchData(searchKeyword, tglAwal, tglAkhir, 1);
  }, []);

  const handleSearch = () => fetchData(searchKeyword, tglAwal, tglAkhir, 1);
  const goToPage = (p: number) => fetchData(searchKeyword, tglAwal, tglAkhir, p);

  const handleRowClick = async (row: any) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    try {
      const result = await getDetailPemeriksaanRanap(row.no_rawat, row.tgl_perawatan, row.jam_rawat);
      if (result.success && result.data) {
        setDetailData(result.data);
      } else {
        setDetailData(null);
      }
    } catch {
      setDetailData(null);
    }
    setIsLoadingDetail(false);
  };

  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex items-center gap-3 shadow-sm">
        <FaHistory className="text-brand-600 text-lg" />
        <h1 className="font-bold text-slate-800 text-sm">Audit Trail Pemeriksaan / CPPT Rawat Inap</h1>
        {noRawatParam && (
          <div className="flex items-center gap-2 ml-4 text-xs">
            <span className="font-semibold text-slate-500">Filter No.Rawat:</span>
            <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded font-mono">{noRawatParam}</span>
          </div>
        )}
        <button onClick={() => router.back()}
          className="ml-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <FaTimes /> Tutup
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 flex flex-wrap items-center gap-2">
        <label className="text-[11px] font-semibold text-slate-600">Periode:</label>
        <input type="date" className="border border-slate-300 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:border-brand-500"
          value={tglAwal} onChange={e => setTglAwal(e.target.value)} />
        <span className="text-slate-400">s/d</span>
        <input type="date" className="border border-slate-300 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:border-brand-500"
          value={tglAkhir} onChange={e => setTglAkhir(e.target.value)} />
        <div className="flex gap-1 flex-1 justify-end">
          <input type="text" className="border border-slate-300 rounded px-2 py-1 text-xs w-48 focus:outline-none focus:border-brand-500"
            placeholder="Cari no.rawat, nama, status..."
            value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
          <button onClick={handleSearch}
            className="px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors">
            <FaSearch /> Cari
          </button>
          <button onClick={() => fetchData(searchKeyword, tglAwal, tglAkhir, 1)}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors">
            <FaSync className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-3">
        <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-sm h-full flex flex-col">
          <DataTableMulti
            columns={columns}
            data={data}
            idKey="id"
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isLoading={isLoading}
            emptyMessage="Tidak ada data audit trail yang ditemukan."
            onRowClick={handleRowClick}
          />
        </div>

        {/* Pagination */}
        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
          <span>Total: {total} data (hal. {page} dari {totalPages})</span>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
              className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
                  <button onClick={() => goToPage(p)}
                    className={`px-2.5 py-1 border rounded transition-colors ${p === page ? 'bg-brand-500 text-white border-brand-500 font-bold' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
              className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Legend Status */}
        <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
          <span className="font-semibold">Keterangan Status:</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" /> Aktif</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Direvisi</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Dibatalkan</span>
          <span className="text-slate-400 ml-auto">Klik baris untuk melihat detail pemeriksaan</span>
        </div>
      </div>

      {/* Detail Modal — meniru getData() dari AtRawatInap.java */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
          onClick={() => setIsDetailOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-[600px] max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-brand-50 to-white">
              <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                <FaExpand className="text-brand-500" /> Detail Pemeriksaan
              </h3>
              <button onClick={() => setIsDetailOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-5">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <FaSync className="animate-spin mr-2" /> Memuat data...
                </div>
              ) : detailData ? (
                <div className="space-y-4 text-xs">
                  {/* SOAPIE */}
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="font-bold text-slate-500">Subjek (S):</span><p className="mt-0.5 text-slate-800 whitespace-pre-wrap bg-slate-50 p-2 rounded border">{detailData.keluhan || '-'}</p></div>
                    <div><span className="font-bold text-slate-500">Alergi:</span><p className="mt-0.5 text-slate-800 whitespace-pre-wrap bg-slate-50 p-2 rounded border">{detailData.alergi || '-'}</p></div>
                    <div><span className="font-bold text-slate-500">Objek (O):</span><p className="mt-0.5 text-slate-800 whitespace-pre-wrap bg-slate-50 p-2 rounded border">{detailData.pemeriksaan || '-'}</p></div>
                    <div><span className="font-bold text-slate-500">Instruksi:</span><p className="mt-0.5 text-slate-800 whitespace-pre-wrap bg-slate-50 p-2 rounded border">{detailData.instruksi || '-'}</p></div>
                    <div><span className="font-bold text-slate-500">Asesmen (A):</span><p className="mt-0.5 text-slate-800 whitespace-pre-wrap bg-slate-50 p-2 rounded border">{detailData.penilaian || '-'}</p></div>
                    <div><span className="font-bold text-slate-500">Evaluasi:</span><p className="mt-0.5 text-slate-800 whitespace-pre-wrap bg-slate-50 p-2 rounded border">{detailData.evaluasi || '-'}</p></div>
                  </div>
                  <div><span className="font-bold text-slate-500">Plan (P):</span><p className="mt-0.5 text-slate-800 whitespace-pre-wrap bg-slate-50 p-2 rounded border">{detailData.rtl || '-'}</p></div>

                  {/* TTV */}
                  <div className="bg-brand-50/40 p-3 rounded-lg border border-brand-100/50">
                    <h4 className="font-bold text-brand-700 mb-2 text-[11px]">Tanda-Tanda Vital</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div><span className="font-semibold text-slate-500">Suhu:</span> {detailData.suhu_tubuh || '-'} °C</div>
                      <div><span className="font-semibold text-slate-500">Tensi:</span> {detailData.tensi || '-'} mmHg</div>
                      <div><span className="font-semibold text-slate-500">Nadi:</span> {detailData.nadi || '-'} /mnt</div>
                      <div><span className="font-semibold text-slate-500">Respirasi:</span> {detailData.respirasi || '-'} /mnt</div>
                      <div><span className="font-semibold text-slate-500">Tinggi:</span> {detailData.tinggi || '-'} Cm</div>
                      <div><span className="font-semibold text-slate-500">Berat:</span> {detailData.berat || '-'} Kg</div>
                      <div><span className="font-semibold text-slate-500">SpO2:</span> {detailData.spo2 || '-'} %</div>
                      <div><span className="font-semibold text-slate-500">GCS:</span> {detailData.gcs || '-'}</div>
                      <div><span className="font-semibold text-slate-500">Kesadaran:</span> {detailData.kesadaran || '-'}</div>
                    </div>
                  </div>

                  {/* Petugas */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="font-semibold text-slate-500">NIP:</span> {detailData.nip || '-'}</div>
                      <div><span className="font-semibold text-slate-500">Nama:</span> {detailData.nm_pegawai || '-'}</div>
                      <div><span className="font-semibold text-slate-500">Jabatan:</span> {detailData.jbtn || '-'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400">Data pemeriksaan tidak ditemukan (mungkin sudah dihapus)</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditTrailRawatInap() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-brand-500">Memuat data...</div>}>
      <AuditTrailContent />
    </Suspense>
  );
}
