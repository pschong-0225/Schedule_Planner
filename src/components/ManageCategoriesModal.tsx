import React, { useState } from 'react';
import { TaskCategory } from '../types';
import { PALETTE_COLORS } from '../data/colors';
import { generateId } from '../data/initialState';
import { X, Plus, Trash2, Tag } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: TaskCategory[];
  onAddCategory: (cat: TaskCategory) => void;
  onDeleteCategory: (catId: string) => void;
  categoryUsageCount: Record<string, number>;
}

const COMMON_EMOJIS = ['📝', '📚', '🧪', '👥', '📄', '📖', '💼', '📎', '🌿', '🎯', '💡', '⏰', '🔍', '💻', '🎨', '✈️'];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  categoryUsageCount,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
  const [color, setColor] = useState('c_teal');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const newCat: TaskCategory = {
      id: generateId('cat'),
      name: trimmed,
      icon,
      color,
      isDefault: false,
    };

    onAddCategory(newCat);
    setName('');
    setIcon('📌');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-sans text-left">
      <div
        className="w-full max-w-lg bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--paper-deep)] border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[var(--ink)]" />
            <h3 className="font-serif font-bold text-lg text-[var(--ink)]">Manage Task Categories</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Current Categories List */}
          <div>
            <label className="block text-xs font-mono text-[var(--ink-soft)] uppercase tracking-wider mb-2">
              Active Categories ({categories.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => {
                const count = categoryUsageCount[cat.id] || 0;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-[var(--line)] bg-[var(--paper-deep)]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-medium text-[var(--ink)] truncate">{cat.name}</span>
                      <span className="text-[10px] font-mono text-[var(--ink-soft)]">
                        ({count} {count === 1 ? 'task' : 'tasks'})
                      </span>
                    </div>

                    {!cat.isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCategory(cat.id);
                        }}
                        className="p-1 text-[var(--ink-soft)] hover:text-[var(--brick)] rounded cursor-pointer transition-colors flex-shrink-0"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Category Form */}
          <div className="border-t border-[var(--line)] pt-4">
            <label className="block text-xs font-mono text-[var(--ink-soft)] uppercase tracking-wider mb-2">
              Add Custom Category
            </label>

            <form onSubmit={handleAdd} className="space-y-3 bg-[var(--paper-deep)] p-3 rounded-lg border border-[var(--line)]">
              {/* Category Name & Emoji Picker */}
              <div className="flex items-center gap-2">
                {/* Selected Emoji preview */}
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center text-lg bg-[var(--paper)] border border-[var(--line)] rounded-lg">
                    {icon}
                  </span>
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Reading Review, Case Study, Chores..."
                  className="flex-1 text-xs px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none focus:border-[var(--ink)]"
                />

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="inline-flex items-center gap-1 bg-[var(--ink)] text-white text-xs font-mono px-3 py-2 rounded-lg hover:opacity-85 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Emoji quick presets */}
              <div>
                <span className="text-[11px] font-mono text-[var(--ink-soft)] block mb-1">Select Icon:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COMMON_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-7 h-7 flex items-center justify-center text-sm rounded border cursor-pointer ${
                        icon === em ? 'border-[var(--ink)] bg-[var(--paper)] shadow-xs' : 'border-[var(--line)] hover:border-[var(--ink-soft)]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Accent */}
              <div>
                <span className="text-[11px] font-mono text-[var(--ink-soft)] block mb-1">Color Palette:</span>
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-1 bg-white/40 rounded border border-[var(--line)]">
                  {PALETTE_COLORS.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setColor(pal.id)}
                      style={{ backgroundColor: pal.hex }}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                        color === pal.id ? 'ring-2 ring-[var(--ink)] ring-offset-1 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={pal.name}
                    />
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[var(--paper-deep)] border-t border-[var(--line)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs px-4 py-1.5 bg-[var(--paper)] border border-[var(--line)] rounded-lg text-[var(--ink)] hover:border-[var(--ink-soft)] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
