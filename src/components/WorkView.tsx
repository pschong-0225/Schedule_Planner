import React, { useState } from 'react';
import { CustomNodeInfo, PlannerState } from '../types';
import { getNextAccent } from '../data/constants';
import { generateId } from '../data/initialState';
import { getColorHex, getPaletteColor } from '../data/colors';
import { MonthlyTimetable } from './MonthlyTimetable';
import { Plus, Trash2, Calendar, Briefcase, Compass, ArrowRight } from 'lucide-react';

interface WorkViewProps {
  state: PlannerState;
  onNavigate: (page: string, extra?: { id?: string; loc?: string }) => void;
  onAddCustomNode: (node: CustomNodeInfo) => void;
  onDeleteCustomNode: (nodeId: string) => void;
  onUpdateWorkColor?: (key: 'easyspace' | 'fengshui', colorId: string) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  state,
  onNavigate,
  onAddCustomNode,
  onDeleteCustomNode,
  onUpdateWorkColor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const easySpaceCol = getPaletteColor(state.easyspace?.color || 'c_ochre');
  const fengshuiCol = getPaletteColor(state.fengshui?.color || 'c_sage');

  const handleAddConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const accentInfo = getNextAccent((state.work.customNodes?.length || 0) + 2);
    const newNode: CustomNodeInfo = {
      id: generateId('work_node'),
      title: newTitle.trim(),
      accent: accentInfo.accent,
    };

    onAddCustomNode(newNode);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ochre)] bg-[var(--paper-deep)] px-2 py-0.5 rounded border border-[var(--line)]">
                Professional & Career
              </span>
              <span className="font-mono text-xs text-[var(--ink-soft)]">
                EasySpace, Feng Shui & Custom Projects
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              Work Hub
            </h1>
          </div>
        </div>
      </div>

      {/* 1. Work Timetable directly displayed */}
      <div>
        <MonthlyTimetable
          state={state}
          scope="work"
          title="Work Timetable & Monthly Schedule"
          closable={false}
          id="workMonthlyTimetable"
        />
      </div>

      {/* 2. Grid of Work Tracks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Work Streams
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            Select a workspace to view working hours, events and checklists
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* EasySpace Tile */}
          <div
            onClick={() => onNavigate('easyspace')}
            style={{ borderTopColor: easySpaceCol.hex }}
            className="group border border-[var(--line)] border-t-4 bg-[var(--paper-deep)] p-5 rounded-xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-black/25 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1"
                  style={{
                    backgroundColor: easySpaceCol.bg,
                    borderColor: easySpaceCol.border,
                    color: easySpaceCol.badgeText,
                  }}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Working Hours & Events</span>
                </span>
                <span className="font-mono text-xs text-[var(--ink-soft)] flex items-center gap-1 group-hover:text-[var(--ink)]">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <h2 className="font-serif font-bold text-2xl text-[var(--ink)] mb-2">
                EasySpace
              </h2>
              <p className="font-mono text-xs text-[var(--ink-soft)]">
                {state.easyspace?.hours?.length || 0} scheduled shifts · {state.easyspace?.events?.length || 0} events & deadlines
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--line)] font-mono text-xs text-[var(--ink-soft)] flex justify-between">
              <span>Shift Log & Details</span>
              <span className="text-[var(--ink)] font-semibold">View Details →</span>
            </div>
          </div>

          {/* Feng Shui Tile */}
          <div
            onClick={() => onNavigate('fengshui')}
            style={{ borderTopColor: fengshuiCol.hex }}
            className="group border border-[var(--line)] border-t-4 bg-[var(--paper-deep)] p-5 rounded-xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-black/25 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1"
                  style={{
                    backgroundColor: fengshuiCol.bg,
                    borderColor: fengshuiCol.border,
                    color: fengshuiCol.badgeText,
                  }}
                >
                  <Compass className="w-3 h-3" />
                  <span>Planning & Space</span>
                </span>
                <span className="font-mono text-xs text-[var(--ink-soft)] flex items-center gap-1 group-hover:text-[var(--ink)]">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <h2 className="font-serif font-bold text-2xl text-[var(--ink)] mb-2">
                风水 (Feng Shui)
              </h2>
              <p className="font-mono text-xs text-[var(--ink-soft)]">
                Setup checklist · {state.fengshui?.tasks?.length || 0} items ({state.fengshui?.progress || 0}% complete)
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--line)]">
              <div className="w-full bg-white h-2 rounded-full border border-[var(--line)] overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${state.fengshui?.progress || 0}%`,
                    backgroundColor: fengshuiCol.hex,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Custom Work Nodes */}
          {(state.work.customNodes || []).map((n) => {
            const nodeCol = getPaletteColor(n.accent);
            return (
              <div
                key={n.id}
                onClick={() => onNavigate('generic', { id: n.id, loc: 'work' })}
                style={{ borderTopColor: nodeCol.hex }}
                className="group border border-[var(--line)] border-t-4 bg-[var(--paper-deep)] p-5 rounded-xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-black/25 transition-all cursor-pointer relative flex flex-col justify-between"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomNode(n.id);
                  }}
                  className="absolute top-3 right-3 text-[var(--ink-soft)] hover:text-[var(--brick)] p-1 transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <span
                    className="font-mono text-xs font-bold uppercase block mb-1"
                    style={{ color: nodeCol.badgeText }}
                  >
                    Custom Project
                  </span>
                  <h2 className="font-serif font-bold text-2xl text-[var(--ink)] mb-2">{n.title}</h2>
                  <p className="font-mono text-xs text-[var(--ink-soft)]">
                    Schedule, deadlines and priority tasks
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--line)] font-mono text-xs text-[var(--ink-soft)] flex justify-between">
                  <span>Project details</span>
                  <span className="text-[var(--ink)] font-semibold">Enter →</span>
                </div>
              </div>
            );
          })}

          {/* Add Custom Project Card */}
          {isAdding ? (
            <form
              onSubmit={handleAddConfirm}
              className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 rounded-xl flex flex-col justify-between gap-3 text-left shadow-xs"
            >
              <div className="space-y-2">
                <span className="font-mono text-xs text-[var(--ink)] font-bold block uppercase tracking-wider">
                  New Work Project
                </span>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Client Pitch, Side Venture..."
                  autoFocus
                  className="w-full text-xs p-2 bg-white border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 text-xs font-mono py-1.5 border border-[var(--line)] rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="flex-1 text-xs font-mono py-1.5 bg-[var(--ink)] text-white rounded-lg hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="min-h-[170px] border border-dashed border-[var(--line)] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] hover:bg-white/50 transition-all cursor-pointer"
            >
              <Plus className="w-6 h-6 text-[var(--ochre)]" />
              <span className="font-mono text-xs font-semibold">+ Add Work Project</span>
              <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                Custom workspace with tasks and schedule
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

