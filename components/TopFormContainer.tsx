"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface TopFormContainerProps {
  title?: string;
  defaultOpen?: boolean;
  persistenceKey?: string;
  children: React.ReactNode;
}

export default function TopFormContainer({
  title = "Input Data",
  defaultOpen = false,
  persistenceKey,
  children
}: TopFormContainerProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined" && persistenceKey) {
      const saved = localStorage.getItem(persistenceKey);
      if (saved !== null) return JSON.parse(saved);
    }
    return defaultOpen;
  });

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof window !== "undefined" && persistenceKey) {
      localStorage.setItem(persistenceKey, JSON.stringify(newState));
    }
  };

  return (
    <div className="bg-white shadow-sm z-0 shrink-0 flex flex-col">
      {/* Tombol Toggle / Header */}
      <button
        onClick={handleToggle}
        className="bg-white border-b border-slate-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors flex items-center gap-2 shrink-0 w-full text-left"
      >
        {isOpen ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
        <span className="tracking-wide">{isOpen ? 'Sembunyikan' : 'Tampilkan'} {title}</span>
      </button>

      {/* Konten yang Dapat Dilipat */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-b border-slate-200"
          >
            <div className="p-3 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
