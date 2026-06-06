"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopFormContainerProps {
  title?: string;
  defaultOpen?: boolean;
  persistenceKey?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export default function TopFormContainer({
  title = "Input Data",
  defaultOpen = false,
  persistenceKey,
  isOpen: controlledOpen,
  onToggle,
  children
}: TopFormContainerProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(() => {
    if (typeof window !== "undefined" && persistenceKey) {
      const saved = localStorage.getItem(persistenceKey);
      if (saved !== null) return JSON.parse(saved);
    }
    return defaultOpen;
  });

  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else if (!isControlled) {
      const newState = !internalOpen;
      setInternalOpen(newState);
      if (typeof window !== "undefined" && persistenceKey) {
        localStorage.setItem(persistenceKey, JSON.stringify(newState));
      }
    }
  };

  return (
    <div className="bg-white z-0 shrink-0 flex flex-col dark:bg-slate-800">
      {!isControlled && (
        <button
          onClick={handleToggle}
          className="bg-white border-b border-slate-200 px-4 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors flex items-center gap-2 shrink-0 w-full text-left dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
        >
          <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span className="tracking-wide">{isOpen ? 'Sembunyikan' : 'Tampilkan'} {title}</span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-white dark:bg-slate-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
