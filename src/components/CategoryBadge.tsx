import React, { useState, useRef, useEffect } from 'react';
import { TaskCategory } from '../types';

interface CategoryBadgeProps {
  categoryId?: string;
  categories: TaskCategory[];
  onChange?: (newCategoryId: string) => void;
  size?: 'sm' | 'md';
  readOnly?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  categoryId,
  categories,
  onChange,
  size = 'sm',
  readOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const category = categories.find((c) => c.id === categoryId) || categories[0];

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

  if (!category) return null;

  if (readOnly || !onChange) {
    return (
      <span
        id={`category-tag-${category.id}`}
        style={{
          borderColor: `var(--line)`,
        }}
        className={`inline-flex items-center gap-1 font-mono rounded border bg-[var(--paper)] text-[var(--ink)] whitespace-nowrap select-none ${textSize}`}
      >
        <span>{category.icon}</span>
        <span>{category.name}</span>
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        id={`category-btn-${category.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`inline-flex items-center gap-1 font-mono rounded border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors cursor-pointer whitespace-nowrap select-none ${textSize}`}
        title="点击修改分类"
      >
        <span>{category.icon}</span>
        <span>{category.name}</span>
        <span className="text-[9px] text-[var(--ink-soft)] opacity-70">▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-1 w-48 bg-[var(--paper-deep)] border border-[var(--line)] rounded shadow-lg z-50 p-1 text-left font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] font-mono text-[var(--ink-soft)] uppercase tracking-wider border-b border-[var(--line)] mb-1">
            选择任务分类
          </div>
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {categories.map((cat) => {
              const isSelected = cat.id === category.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`cat-select-${cat.id}`}
                  onClick={() => {
                    onChange(cat.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                    isSelected ? 'bg-[var(--paper)] font-medium text-[var(--ink)]' : 'hover:bg-[var(--paper)] text-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {isSelected && <span className="text-[10px] text-[var(--ink)] font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
