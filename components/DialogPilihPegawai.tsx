"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaSync } from "react-icons/fa";
import { ActionButton } from "@/components/BottomActionPanel";
import { cariPegawai } from "@/lib/actions/ranap";

interface PegawaiRow {
  nik: string;
  nama: string;
  jk: string;
  jabatan: string;
  departemen: string;
  bidang: string;
}

interface DialogPilihPegawaiProps {
  open: boolean;
  onClose: () => void;
  onSelect: (nik: string, nama: string) => void;
}

export default function DialogPilihPegawai({ open, onClose, onSelect }: DialogPilihPegawaiProps) {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState<PegawaiRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async (kw: string = "") => {
    setIsLoading(true);
    try {
      const result = await cariPegawai(kw);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      setKeyword("");
      fetchData("");
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open, fetchData]);

  const handleSearch = () => fetchData(keyword);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-12 bottom-12 left-12 right-12 lg:top-16 lg:bottom-16 lg:left-24 lg:right-24 z-50 bg-white shadow-2xl rounded-xl border border-slate-300 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-brand-100 to-slate-50 border-b border-brand-100 rounded-t-xl px-4 py-2 shrink-0">
              <h3 className="font-bold text-brand-800 text-sm flex items-center gap-2 tracking-wide">
                <FaSearch className="text-brand-600" />
                Pencarian Data Pegawai
              </h3>
              <ActionButton
                icon={<FaTimes />}
                label="Keluar"
                isExit
                onClick={onClose}
              />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-white">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-400 gap-3">
                  <FaSync className="animate-spin text-brand-500 text-xl" />
                  <span className="text-sm">Mengambil data...</span>
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                  Tidak ada data pegawai ditemukan.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead className="sticky top-0 z-10 text-slate-600 shadow-sm backdrop-blur-md bg-white/95 border-b-2 border-brand-500">
                    <tr>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-200 w-10 text-center">No.</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-200">NIP</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-200">Nama</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-200 w-12">J.K.</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-200">Jabatan</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-200">Departemen</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-200">Bidang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr
                        key={row.nik}
                        onClick={() => onSelect(row.nik, row.nama)}
                        className={`border-b border-slate-100 cursor-pointer transition-all duration-200
                          ${i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                          hover:bg-brand-50 hover:shadow-[inset_4px_0_0_0_var(--color-brand-500)]`}
                      >
                        <td className="py-2 px-3 text-slate-500 text-center border-r border-slate-100">{i + 1}</td>
                        <td className="py-2 px-3 text-brand-600 font-semibold border-r border-slate-100">{row.nik}</td>
                        <td className="py-2 px-3 text-slate-800 font-semibold border-r border-slate-100">{row.nama}</td>
                        <td className="py-2 px-3 text-center border-r border-slate-100">{row.jk}</td>
                        <td className="py-2 px-3 border-r border-slate-100">{row.jabatan}</td>
                        <td className="py-2 px-3 border-r border-slate-100">{row.departemen}</td>
                        <td className="py-2 px-3">{row.bidang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Search Bar Bawah */}
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-3 shrink-0">
              <label className="text-xs font-semibold text-slate-600 shrink-0">Key Word :</label>
              <input
                ref={searchInputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari NIP, Nama, Jabatan, Departemen..."
                className="flex-1 min-w-[200px] border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 bg-white"
              />
              <ActionButton
                icon={<FaSearch />}
                label="Cari"
                variant="primary"
                onClick={handleSearch}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
