import React, { useState } from 'react';
import { PlannerState, SubjectMeta } from '../types';
import { BASE_SUBJECTS, getNextAccent } from '../data/constants';
import { generateId } from '../data/initialState';
import { getColorHex, getPaletteColor } from '../data/colors';
import { MonthlyTimetable } from './MonthlyTimetable';
import { Plus, Trash2, Calendar, BookOpen, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface SchoolViewProps {
  state: PlannerState;
  onSelectSubject: (subjectId: string) => void;
  onAddCustomSubject: (subject: SubjectMeta) => void;
  onDeleteSubject: (subjectId: string) => void;
  onUpdateSubjectColor?: (subjectId: string, colorId: string) => void;
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  if (isNaN(due.getTime())) return null;
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

export const SchoolView: React.FC<SchoolViewProps> = ({
  state,
  onSelectSubject,
  onAddCustomSubject,
  onDeleteSubject,
  onUpdateSubjectColor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const allSubjects: SubjectMeta[] = React.useMemo(() => {
    if (state.courses && state.courses.length > 0) {
      const courseIds = new Set(state.courses.map((c) => c.id));
      const extraCustom = (state.customSubjects || []).filter((s) => !courseIds.has(s.id));
      if (extraCustom.length > 0) {
        return [...state.courses, ...extraCustom];
      }
      return state.courses;
    }
    return [...BASE_SUBJECTS, ...(state.customSubjects || [])];
  }, [state.courses, state.customSubjects]);

  // Auto-detect overall progress across all subjects (Points 3, 7, 8)
  let grandTotalTasks = 0;
  let grandCompletedTasks = 0;

  allSubjects.forEach((s) => {
    const data = state.subjects[s.id];
    if (!data) return;
    (data.assignments || []).forEach((a) => {
      grandTotalTasks += (a.tasks || []).length;
      grandCompletedTasks += (a.tasks || []).filter((t) => t.done).length;
    });
  });

  const overallProgressPercent = grandTotalTasks === 0 ? 0 : Math.round((grandCompletedTasks / grandTotalTasks) * 100);

  const handleAddConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const accentInfo = getNextAccent(allSubjects.length);
    const newSubj: SubjectMeta = {
      id: generateId('subj'),
      code: newCode.trim() || '—',
      title: newTitle.trim(),
      accent: accentInfo.accent,
      accentSoft: accentInfo.accentSoft,
      isCustom: true,
    };

    onAddCustomSubject(newSubj);
    setNewCode('');
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 text-left">
      {/* School Header with Auto-Detecting Overall Progress Bar */}
      <div className="border-b border-[var(--line)] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--teal)] bg-[var(--paper-deep)] px-2 py-0.5 rounded border border-[var(--line)]">
                Academics
              </span>
              <span className="font-mono text-xs text-[var(--ink-soft)]">
                {allSubjects.length} Registered Courses
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              School
            </h1>
          </div>

          {/* Auto-detecting Overall Progress Bar across all 4+ subjects */}
          <div className="bg-[var(--paper-deep)] border border-[var(--line)] p-3.5 rounded-xl min-w-[280px] shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-[var(--ink)] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--teal)]" />
                <span>Overall School Progress</span>
              </span>
              <span className="font-bold text-sm text-[var(--ink)]">{overallProgressPercent}%</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[var(--line)] shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${overallProgressPercent}%`,
                  backgroundColor: '#2F5D54',
                }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-[var(--ink-soft)] mt-1.5">
              <span>{grandCompletedTasks} of {grandTotalTasks} tasks done</span>
              <span>All {allSubjects.length} subjects</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. School Timetable directly displayed at top per user request */}
      <div>
        <MonthlyTimetable
          state={state}
          scope="school"
          title="School Timetable & Monthly Schedule"
          closable={false}
          id="schoolMonthlyTimetable"
          onUpdateSubjectColor={onUpdateSubjectColor}
        />
      </div>

      {/* 2. Course Sections / Subjects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Courses & Assignment Tracks
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allSubjects.map((s) => {
            const data = state.subjects[s.id] || { timetable: [], assignments: [] };
            const col = getPaletteColor(s.accent);

            // Compute summaries
            let nearestDue: string | null = null;
            let daysLeft: number | null = null;
            let totalTasks = 0;
            let doneTasks = 0;

            data.assignments.forEach((a) => {
              totalTasks += a.tasks.length;
              doneTasks += a.tasks.filter((t) => t.done).length;
              if (a.due) {
                if (nearestDue === null || a.due < nearestDue) {
                  nearestDue = a.due;
                }
              }
            });

            if (nearestDue) {
              daysLeft = daysUntil(nearestDue);
            }

            const isUrgent = daysLeft !== null && daysLeft <= 3;

            return (
              <div
                key={s.id}
                onClick={() => onSelectSubject(s.id)}
                style={{
                  borderTopColor: col.hex,
                }}
                className="group border border-[var(--line)] border-t-4 bg-[var(--paper-deep)] p-5 rounded-xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-black/25 transition-all cursor-pointer relative flex flex-col justify-between"
              >
                {confirmDeleteId === s.id ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 bg-white border border-[var(--brick)] shadow-lg rounded-lg p-2 flex items-center gap-2 z-30"
                  >
                    <span className="text-[11px] font-mono text-[var(--brick)] font-bold whitespace-nowrap">
                      Delete course?
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubject(s.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2 py-0.5 bg-[var(--brick)] text-white rounded text-[11px] font-mono font-medium hover:opacity-90 cursor-pointer whitespace-nowrap"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(null);
                      }}
                      className="px-2 py-0.5 bg-black/5 text-[var(--ink)] rounded text-[11px] font-mono hover:bg-black/10 cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(s.id);
                    }}
                    className="absolute top-3 right-3 text-[var(--ink-soft)] hover:text-[var(--brick)] p-1.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: col.bg,
                        borderColor: col.border,
                        color: col.badgeText,
                      }}
                    >
                      {s.code}
                    </span>
                    <span className="font-mono text-xs text-[var(--ink-soft)] flex items-center gap-1 group-hover:text-[var(--ink)]">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[var(--ink)] mb-3 leading-snug line-clamp-2">
                    {s.title}
                  </h3>
                </div>

                {/* Course Info Footer */}
                <div className="pt-3 border-t border-[var(--line)] text-xs font-mono flex items-center justify-between text-[11px]">
                  <span className="text-[var(--ink-soft)]">
                    {data.assignments.length} assessment{data.assignments.length === 1 ? '' : 's'} · {totalTasks} tasks
                  </span>
                  {nearestDue ? (
                    <span
                      className={`px-1.5 py-0.5 rounded font-medium border ${
                        isUrgent
                          ? 'bg-[#FBEBE8] text-[#9B3C30] border-[#E8BAB5]'
                          : 'bg-white text-[var(--ink)] border-[var(--line)]'
                      }`}
                    >
                      {nearestDue} {daysLeft !== null && (daysLeft >= 0 ? `· ${daysLeft}d left` : '· Overdue')}
                    </span>
                  ) : (
                    <span className="text-[var(--ink-soft)]">No deadline</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Course Card or Form */}
          {isAdding ? (
            <form
              onSubmit={handleAddConfirm}
              className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 rounded-xl flex flex-col justify-between gap-3 text-left shadow-xs"
            >
              <div className="space-y-2">
                <span className="font-mono text-xs text-[var(--ink)] font-bold block uppercase tracking-wider">
                  Add New Course
                </span>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Course Code, e.g. ACC1010"
                  className="w-full text-xs p-2 bg-white border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-none font-mono"
                />
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Course Title, e.g. Financial Accounting"
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
                  Add Course
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="min-h-[170px] border border-dashed border-[var(--line)] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] hover:bg-white/50 transition-all cursor-pointer"
            >
              <Plus className="w-6 h-6 text-[var(--teal)]" />
              <span className="font-mono text-xs font-semibold">+ Add New Course</span>
              <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                Will auto-link into timetable & progress
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

