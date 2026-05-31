"use client";

import React, { useState } from 'react';

export interface TabData {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabbedTableProps {
  tabs: TabData[];
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
  hideTabBar?: boolean;
}

export default function TabbedTable({ tabs, defaultTabId, onTabChange, hideTabBar = false }: TabbedTableProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onTabChange) onTabChange(id);
  };

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {!hideTabBar && (
        <div className="flex gap-1 px-4 mt-2 mb-0 shrink-0 border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 text-xs transition-all relative whitespace-nowrap ${
                activeTab === tab.id 
                  ? "font-bold text-brand-700" 
                  : "font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? 'h-full' : 'hidden'}>{tab.content}</div>
        ))}
      </div>
    </div>
  );
}
