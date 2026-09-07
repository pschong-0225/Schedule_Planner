import React, { useState, useRef, useEffect } from 'react';
import { PRIORITIES } from '../data/constants';
import { PriorityLevel } from '../types';

interface PriorityBadgeProps {
  level: PriorityLevel;
  onChange?: (newLevel: PriorityLevel) => void;
  size?: 'sm' | 'md';
  readOnly?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  level,
  onChange,
  size = 'sm',
  readOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const meta = PRIORITIES[level] || PRIORITIES.p3;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const textSize = size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  if (readOnly || !onChange) {
    return (
      <span
        id={`priority-tag-${level}`}
        style={{
          backgroundColor: meta.badgeBg,
          color: meta.badgeText,
          borderColor: meta.badgeBorder,
        }}
        className={`inline-flex items-center font-mono font-medium rounded border whitespace-nowrap select-none ${textSize}`}
        title={`${meta.label}: ${meta.description}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0"
          style={{ backgroundColor: meta.colorVar }}
        />
        {meta.level.toUpperCase()} · {meta.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        id={`priority-btn-${level}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        style={{
          backgroundColor: meta.badgeBg,
          color: meta.badgeText,
          borderColor: meta.badgeBorder,
        }}
        className={`inline-flex items-center font-mono font-medium rounded border hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap select-none ${textSize}`}
        title="点击快速切换优先级"
      >
        <span
          className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0"
          style={{ backgroundColor: meta.colorVar }}
        />
        <span>{meta.level.toUpperCase()}</span>
        <span className="ml-1 opacity-75 hidden sm:inline">· {meta.label.slice(0, 4)}</span>
        <span className="ml-1 text-[9px] opacity-60">▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-1 w-52 bg-[var(--paper-deep)] border border-[var(--line)] rounded shadow-lg z-50 p-1 text-left font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] font-mono text-[var(--ink-soft)] uppercase tracking-wider border-b border-[var(--line)] mb-1">
            设置优先级
          </div>
          {(['p1', 'p2', 'p3', 'p4'] as PriorityLevel[]).map((lvl) => {
            const pMeta = PRIORITIES[lvl];
            const isSelected = lvl === level;
            return (
              <button
                key={lvl}
                type="button"
                id={`priority-opt-${lvl}`}
                onClick={() => {
                  onChange(lvl);
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-2 px-2 py-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                  isSelected ? 'bg-[var(--paper)] font-medium' : 'hover:bg-[var(--paper)]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: pMeta.colorVar }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold" style={{ color: pMeta.colorVar }}>
                      {lvl.toUpperCase()} · {pMeta.label}
                    </span>
                    {isSelected && <span className="text-[10px] text-[var(--ink)]">✓</span>}
                  </div>
                  <p className="text-[10px] text-[var(--ink-soft)] leading-tight mt-0.5">
                    {pMeta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
