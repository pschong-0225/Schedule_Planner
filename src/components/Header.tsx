import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { QUOTES } from '../data/constants';
import { RefreshCw, Database, Download, Upload, RotateCcw, Sparkles, Cloud, CloudCheck, CloudOff } from 'lucide-react';

interface HeaderProps {
  currentPage?: string;
  onNavigate?: (page: any) => void;
  onNavigateHome?: () => void;
  onOpenCategoryModal?: () => void;
  totalPendingP1Count?: number;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  onOpenColorCustomizer?: () => void;
  cloudStatus?: 'synced' | 'saving' | 'offline' | 'loading';
  lastSyncedTime?: string;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onNavigateHome,
  onOpenCategoryModal,
  totalPendingP1Count,
  onExportData,
  onImportData,
  onResetData,
  onOpenColorCustomizer,
  cloudStatus = 'synced',
  lastSyncedTime,
  onManualSync,
}) => {
  const [currentQuote, setCurrentQuote] = useState<Quote>(QUOTES[0]);
  const [showBackupMenu, setShowBackupMenu] = useState(false);

  useEffect(() => {
    const rand = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setCurrentQuote(rand);
  }, []);

  const handleNextQuote = () => {
    const remaining = QUOTES.filter((q) => q.main !== currentQuote.main);
    const next = remaining[Math.floor(Math.random() * remaining.length)] || QUOTES[0];
    setCurrentQuote(next);
  };

  const handleGoHome = () => {
    if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('home');
  };

  return (
    <header className="border-b border-[var(--line)] pb-5 mb-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Title & Interactive Motivational Quote Subheading */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-3">
            <h1
              onClick={handleGoHome}
              className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)] tracking-tight cursor-pointer hover:opacity-85 transition-opacity select-none"
              title="Return to Schedule Planner Home"
            >
              Schedule Planner
            </h1>
          </div>

          {/* Motivational Quote Subheading - clicking gives a new quote */}
          <button
            type="button"
            onClick={handleNextQuote}
            className="group flex items-start gap-2 text-left py-1 pr-2 rounded-md hover:bg-black/[0.03] transition-colors cursor-pointer"
            title="Click to get an inspiring quote"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--ochre)] shrink-0 mt-0.5 group-hover:rotate-12 transition-transform" />
            <div className="leading-snug">
              <span className="font-sans text-xs sm:text-sm text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors">
                "{currentQuote.main}"
              </span>
              <span className="ml-1.5 text-xs text-[var(--ink-soft)] font-sans hidden sm:inline">
                · {currentQuote.sub}
              </span>
            </div>
            <RefreshCw className="w-3 h-3 text-[var(--ink-soft)] opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-all shrink-0 mt-0.5" />
          </button>
        </div>

        {/* Right: Database Cloud Status, CADYCHONG badge & Data Menu */}
        <div className="flex items-center gap-2 shrink-0 pt-1 flex-wrap sm:flex-nowrap">
          {/* Cloud Database Persistence Indicator */}
          <div
            onClick={onManualSync}
            title={
              cloudStatus === 'saving'
                ? 'Syncing to database...'
                : cloudStatus === 'synced'
                ? `Saved to Database Firestore${lastSyncedTime ? ` (${lastSyncedTime})` : ''}. Click to resync.`
                : 'Offline mode (saved in browser). Click to retry database sync.'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono transition-all cursor-pointer select-none ${
              cloudStatus === 'saving'
                ? 'bg-[var(--paper-deep)] border-[var(--ochre)] text-[var(--ochre)]'
                : cloudStatus === 'synced'
                ? 'bg-[#EBF3F0] border-[#91B5AB] text-[#2F5D54]'
                : 'bg-[#FBEBE8] border-[#E8BAB5] text-[#9B3C30]'
            }`}
          >
            {cloudStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden md:inline">Saving to DB...</span>
              </>
            ) : cloudStatus === 'synced' ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-[#2F5D54]" />
                <span className="hidden md:inline">Database Saved</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-[#9B3C30]" />
                <span className="hidden md:inline">Local Cache</span>
              </>
            )}
          </div>

          {/* CADYCHONG Badge */}
          <div className="font-serif tracking-widest text-xs font-semibold px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--paper-deep)] text-[var(--ink)] shadow-2xs select-none">
            CADYCHONG
          </div>

          {/* Data Backup & Settings Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="p-1.5 rounded-md border border-[var(--line)] bg-[var(--paper-deep)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-black/20 transition-colors"
              title="Database & Data Backup"
            >
              <Database className="w-4 h-4" />
            </button>

            {showBackupMenu && (
              <div
                className="absolute right-0 mt-1.5 w-60 bg-[#FDFCF7] border border-[var(--line)] rounded-lg shadow-xl z-50 p-1.5 font-mono text-xs animate-in fade-in zoom-in-95 duration-100 text-left"
                onClick={() => setShowBackupMenu(false)}
              >
                <div className="px-2.5 py-1.5 border-b border-[var(--line)] text-[11px] text-[var(--ink-soft)]">
                  <div className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[var(--teal)]" />
                    <span>Cloud Database</span>
                  </div>
                  <div className="mt-0.5 text-[10px]">Firestore Persistent Storage</div>
                </div>

                {onManualSync && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBackupMenu(false);
                      onManualSync();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#F2F1EA] rounded text-left text-[var(--ink)] my-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[var(--teal)]" />
                    <span>Sync to Database Now</span>
                  </button>
                )}

                {onOpenColorCustomizer && (
                  <button
                    type="button"
                    onClick={onOpenColorCustomizer}
                    className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#F2F1EA] rounded text-left text-[var(--ink)] mb-1"
                  >
                    <span className="text-sm">🎨</span>
                    <span>Palette Customizer</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onExportData}
                  className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#F2F1EA] rounded text-left text-[var(--ink)]"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--teal)]" />
                  <span>Export Backup (JSON)</span>
                </button>

                <label className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#F2F1EA] rounded text-left text-[var(--ink)] cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[var(--ochre)]" />
                  <span>Import Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportData}
                    className="hidden"
                  />
                </label>

                <div className="my-1 border-t border-[var(--line)]" />

                <button
                  type="button"
                  onClick={onResetData}
                  className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#FBEBE8] rounded text-left text-[#9B3C30]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Sample Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

