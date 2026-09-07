import { useState } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { PALETTE_COLORS, PaletteColor, getPaletteColor } from '../data/colors';
import { SubjectMeta } from '../types';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  currentColorId: string;
  onSelectColor: (colorId: string) => void;
}

export function ColorPickerModal({
  isOpen,
  onClose,
  title = 'Select Palette Color',
  currentColorId,
  onSelectColor,
}: ColorPickerModalProps) {
  if (!isOpen) return null;

  const activeColor = getPaletteColor(currentColorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div 
        className="w-full max-w-md bg-[#FBFBFA] rounded-xl border border-[var(--line)] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--ink-soft)]" />
            <h3 className="font-serif text-base font-semibold text-[var(--ink)] tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--ink-soft)] mb-4 font-sans">
          Choose from 28 curated stationery-inspired tones crafted for clean visual contrast.
        </p>

        {/* Current Active Preview */}
        <div 
          className="flex items-center justify-between px-3 py-2.5 rounded-lg mb-4 border transition-all"
          style={{ backgroundColor: activeColor.bg, borderColor: activeColor.border }}
        >
          <div className="flex items-center gap-2.5">
            <span 
              className="w-4 h-4 rounded-full shadow-xs border border-black/10" 
              style={{ backgroundColor: activeColor.hex }} 
            />
            <span className="text-xs font-mono font-medium" style={{ color: activeColor.badgeText }}>
              Current: {activeColor.name}
            </span>
          </div>
          <span className="text-[10px] font-mono opacity-70" style={{ color: activeColor.badgeText }}>
            {activeColor.hex}
          </span>
        </div>

        {/* Color Swatch Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-[260px] overflow-y-auto p-1 pr-2">
          {PALETTE_COLORS.map((c) => {
            const isSelected = c.id === currentColorId || c.hex.toLowerCase() === currentColorId.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelectColor(c.id);
                  onClose();
                }}
                title={`${c.name} (${c.hex})`}
                className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                  isSelected 
                    ? 'ring-2 ring-[var(--ink)] border-transparent scale-105 shadow-sm' 
                    : 'border-transparent hover:border-black/15 hover:scale-105'
                }`}
                style={{ backgroundColor: c.bg }}
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center shadow-xs border border-black/10 relative"
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                </div>
                <span 
                  className="text-[9px] font-mono tracking-tight text-center leading-tight truncate w-full"
                  style={{ color: c.badgeText }}
                >
                  {c.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-[var(--line)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono rounded-md border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[#F2F1EA] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface ManageAllColorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectMeta[];
  easySpaceColor: string;
  fengshuiColor: string;
  personalColor?: string;
  onUpdateSubjectColor: (subjectId: string, colorId: string) => void;
  onUpdateEasySpaceColor: (colorId: string) => void;
  onUpdateFengshuiColor: (colorId: string) => void;
  onUpdatePersonalColor?: (colorId: string) => void;
}

export function ManageAllColorsModal({
  isOpen,
  onClose,
  subjects,
  easySpaceColor,
  fengshuiColor,
  personalColor,
  onUpdateSubjectColor,
  onUpdateEasySpaceColor,
  onUpdateFengshuiColor,
  onUpdatePersonalColor,
}: ManageAllColorsModalProps) {
  const [activePickerTarget, setActivePickerTarget] = useState<{
    type: 'subject' | 'easyspace' | 'fengshui' | 'personal';
    id?: string;
    title: string;
    color: string;
  } | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
        <div 
          className="w-full max-w-lg bg-[#FBFBFA] rounded-xl border border-[var(--line)] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--ink)]" />
              <h3 className="font-serif text-base font-semibold text-[var(--ink)] tracking-tight">
                Schedule Color Customizer
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[var(--ink-soft)] mb-5 font-sans leading-relaxed">
            Customize the distinct color coding for each School subject and Work track (EasySpace & Fengshui). Choose from 28 stationery palette tones.
          </p>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {/* School Subjects */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-soft)] mb-2">
                School Subjects ({subjects.length})
              </div>
              <div className="space-y-1.5">
                {subjects.map((subj) => {
                  const color = getPaletteColor(subj.accent);
                  return (
                    <div 
                      key={subj.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-[var(--line)] bg-white hover:bg-[#FAF9F5] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-mono text-xs font-semibold text-[var(--ink)] shrink-0">
                          {subj.code}
                        </span>
                        <span className="text-xs text-[var(--ink-soft)] truncate">
                          {subj.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePickerTarget({
                          type: 'subject',
                          id: subj.id,
                          title: `${subj.code} · ${subj.title}`,
                          color: subj.accent
                        })}
                        className="px-2.5 py-1 text-[11px] font-mono rounded border border-[var(--line)] hover:border-black/30 transition-colors shrink-0 flex items-center gap-1.5"
                        style={{ backgroundColor: color.bg, color: color.badgeText }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
                        {color.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Work Tracks */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-soft)] mb-2">
                Work Tracks
              </div>
              <div className="space-y-1.5">
                {/* EasySpace */}
                {(() => {
                  const color = getPaletteColor(easySpaceColor);
                  return (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-[var(--line)] bg-white hover:bg-[#FAF9F5] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: color.hex }} />
                        <span className="font-serif text-xs font-semibold text-[var(--ink)]">EasySpace</span>
                        <span className="text-[11px] text-[var(--ink-soft)] font-mono">Working Hours & Events</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePickerTarget({
                          type: 'easyspace',
                          title: 'Work · EasySpace',
                          color: easySpaceColor
                        })}
                        className="px-2.5 py-1 text-[11px] font-mono rounded border border-[var(--line)] hover:border-black/30 transition-colors shrink-0 flex items-center gap-1.5"
                        style={{ backgroundColor: color.bg, color: color.badgeText }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
                        {color.name}
                      </button>
                    </div>
                  );
                })()}

                {/* Fengshui */}
                {(() => {
                  const color = getPaletteColor(fengshuiColor);
                  return (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-[var(--line)] bg-white hover:bg-[#FAF9F5] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: color.hex }} />
                        <span className="font-serif text-xs font-semibold text-[var(--ink)]">Fengshui</span>
                        <span className="text-[11px] text-[var(--ink-soft)] font-mono">Workspace Layout & Tasks</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePickerTarget({
                          type: 'fengshui',
                          title: 'Work · Fengshui',
                          color: fengshuiColor
                        })}
                        className="px-2.5 py-1 text-[11px] font-mono rounded border border-[var(--line)] hover:border-black/30 transition-colors shrink-0 flex items-center gap-1.5"
                        style={{ backgroundColor: color.bg, color: color.badgeText }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
                        {color.name}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--line)] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-mono rounded-md bg-[var(--ink)] text-white hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {activePickerTarget && (
        <ColorPickerModal
          isOpen={true}
          title={`Color for ${activePickerTarget.title}`}
          currentColorId={activePickerTarget.color}
          onSelectColor={(newColorId) => {
            if (activePickerTarget.type === 'subject' && activePickerTarget.id) {
              onUpdateSubjectColor(activePickerTarget.id, newColorId);
            } else if (activePickerTarget.type === 'easyspace') {
              onUpdateEasySpaceColor(newColorId);
            } else if (activePickerTarget.type === 'fengshui') {
              onUpdateFengshuiColor(newColorId);
            } else if (activePickerTarget.type === 'personal') {
              onUpdatePersonalColor(newColorId);
            }
            setActivePickerTarget(null);
          }}
          onClose={() => setActivePickerTarget(null)}
        />
      )}
    </>
  );
}
