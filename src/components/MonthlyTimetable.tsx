import React, { useState } from 'react';
import { PlannerState, SubjectMeta } from '../types';
import { BASE_SUBJECTS, SHORT_DAYS } from '../data/constants';
import { getColorHex, getColorBg, getPaletteColor } from '../data/colors';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, Palette } from 'lucide-react';
import { ManageAllColorsModal } from './ColorPickerModal';

interface DatedItem {
  date: string;
  label: string;
  accent: string;
  source?: string;
  type?: string;
  categoryTrack: 'school' | 'work';
}

interface WeeklyItem {
  day: string;
  time: string;
  venue?: string;
  label: string;
  accent: string;
  categoryTrack: 'school' | 'work';
}

interface MonthlyTimetableProps {
  state: PlannerState;
  scope?: 'all' | 'school' | 'work';
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  id?: string;
  onUpdateSubjectColor?: (subjectId: string, colorId: string) => void;
  onUpdateEasySpaceColor?: (colorId: string) => void;
  onUpdateFengshuiColor?: (colorId: string) => void;
  onUpdatePersonalColor?: (colorId: string) => void;
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  if (isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export const MonthlyTimetable: React.FC<MonthlyTimetableProps> = ({
  state,
  scope = 'all',
  title = 'Monthly Overview',
  closable = false,
  onClose,
  id = 'monthlyPanel',
  onUpdateSubjectColor,
  onUpdateEasySpaceColor,
  onUpdateFengshuiColor,
  onUpdatePersonalColor,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'school' | 'work'>(scope);
  const [calendarOffset, setCalendarOffset] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  // Subjects
  const allSubjects: SubjectMeta[] = [...BASE_SUBJECTS, ...(state.customSubjects || [])];

  const easySpaceColor = state.easyspace.color || 'ochre';
  const fengshuiColor = state.fengshui.color || 'plum';
  const personalColor = state.personal?.color || 'sage';

  const datedItems: DatedItem[] = [];
  const weeklyItems: WeeklyItem[] = [];

  // 1. School items
  allSubjects.forEach((s) => {
    const data = state.subjects[s.id];
    if (!data) return;

    (data.assignments || []).forEach((a) => {
      if (a.due) {
        datedItems.push({
          date: a.due,
          label: `${s.code ? s.code + ' · ' : ''}${a.title || 'Assignment'}`,
          accent: s.accent,
          source: s.code || s.title,
          type: a.type,
          categoryTrack: 'school',
        });
      }
      (a.tasks || []).forEach((t) => {
        if (t.due && t.due !== a.due) {
          datedItems.push({
            date: t.due,
            label: `${s.code || ''} [Task] ${t.text}`,
            accent: s.accent,
            source: s.code || s.title,
            categoryTrack: 'school',
          });
        }
      });
    });

    (data.timetable || []).forEach((row) => {
      if (row.day || row.time) {
        weeklyItems.push({
          day: row.day,
          time: row.time,
          venue: row.venue,
          label: s.code || s.title,
          accent: s.accent,
          categoryTrack: 'school',
        });
      }
    });
  });

  (state.school.customNodes || []).forEach((n) => {
    const data = state.genericNodes[n.id];
    if (data && data.due) {
      datedItems.push({
        date: data.due,
        label: n.title,
        accent: n.accent,
        source: 'School',
        categoryTrack: 'school',
      });
    }
    (data?.timetable || []).forEach((row) => {
      if (row.day || row.time) {
        weeklyItems.push({
          day: row.day,
          time: row.time,
          venue: row.venue,
          label: n.title,
          accent: n.accent,
          categoryTrack: 'school',
        });
      }
    });
  });

  // 2. Work items
  (state.easyspace.events || []).forEach((ev) => {
    if (ev.date) {
      datedItems.push({
        date: ev.date,
        label: `EasySpace · ${ev.requirement ? ev.requirement.slice(0, 26) : 'Event'}`,
        accent: easySpaceColor,
        source: 'Work (EasySpace)',
        categoryTrack: 'work',
      });
    }
  });

  (state.easyspace.hours || []).forEach((h) => {
    if (h.day || h.time) {
      weeklyItems.push({
        day: h.day,
        time: h.time,
        venue: h.remark || '',
        label: 'EasySpace',
        accent: easySpaceColor,
        categoryTrack: 'work',
      });
    }
  });

  (state.fengshui.tasks || []).forEach((t) => {
    if (t.due) {
      datedItems.push({
        date: t.due,
        label: `Fengshui · ${t.text.slice(0, 24)}`,
        accent: fengshuiColor,
        source: 'Work (Fengshui)',
        categoryTrack: 'work',
      });
    }
  });

  (state.work.customNodes || []).forEach((n) => {
    const data = state.genericNodes[n.id];
    if (data && data.due) {
      datedItems.push({
        date: data.due,
        label: n.title,
        accent: n.accent,
        source: 'Work',
        categoryTrack: 'work',
      });
    }
    (data?.timetable || []).forEach((row) => {
      if (row.day || row.time) {
        weeklyItems.push({
          day: row.day,
          time: row.time,
          venue: row.venue,
          label: n.title,
          accent: n.accent,
          categoryTrack: 'work',
        });
      }
    });
  });

  // Filter according to active tab
  const filteredDated = activeTab === 'all' 
    ? datedItems 
    : datedItems.filter((i) => i.categoryTrack === activeTab);

  const filteredWeekly = activeTab === 'all'
    ? weeklyItems
    : weeklyItems.filter((i) => i.categoryTrack === activeTab);

  // Month calculations
  const now = new Date();
  const baseDate = new Date(now.getFullYear(), now.getMonth() + calendarOffset, 1);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[month];
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay: Record<number, DatedItem[]> = {};
  filteredDated.forEach((it) => {
    if (!it.date) return;
    const d = new Date(it.date + 'T00:00:00');
    if (isNaN(d.getTime())) return;
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!byDay[dayNum]) byDay[dayNum] = [];
      byDay[dayNum].push(it);
    }
  });

  const upcomingSorted = [...filteredDated]
    .filter((it) => it.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const dayMap: Record<string, number> = {
    Monday: 0, Mon: 0, 周一: 0,
    Tuesday: 1, Tue: 1, 周二: 1,
    Wednesday: 2, Wed: 2, 周三: 2,
    Thursday: 3, Thu: 3, 周四: 3,
    Friday: 4, Fri: 4, 周五: 4,
    Saturday: 5, Sat: 5, 周六: 5,
    Sunday: 6, Sun: 6, 周日: 6,
  };

  const weeklySorted = [...filteredWeekly].sort((a, b) => {
    const oa = dayMap[a.day] ?? 7;
    const ob = dayMap[b.day] ?? 7;
    if (oa !== ob) return oa - ob;
    return (a.time || '').localeCompare(b.time || '');
  });

  return (
    <div
      id={id}
      className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6 rounded-xl text-left mb-8 shadow-xs"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="font-serif font-bold text-xl text-[var(--ink)] tracking-tight">{title}</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Tabs: All, School, Work */}
          <div className="inline-flex rounded-lg border border-[var(--line)] bg-white p-0.5 text-xs font-mono">
            {(['all', 'school', 'work'] as const).map((tab) => {
              const label = tab === 'all' ? 'All' : tab === 'school' ? 'School' : 'Work';
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer capitalize ${
                    isActive
                      ? 'bg-[var(--ink)] text-white font-medium shadow-xs'
                      : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Color Customizer Trigger */}
          {onUpdateSubjectColor && (
            <button
              type="button"
              onClick={() => setIsColorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-white text-xs font-mono text-[var(--ink)] hover:bg-[#F2F1EA] transition-colors shadow-2xs cursor-pointer"
              title="Customize colors for school subjects and work schedules"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--ochre)]" />
              <span>Colors</span>
            </button>
          )}

          {closable && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs px-2.5 py-1 border border-[var(--line)] rounded-md text-[var(--ink-soft)] hover:text-[var(--brick)] hover:border-[var(--brick)] cursor-pointer"
            >
              Close ×
            </button>
          )}
        </div>
      </div>

      {/* Color Legend for Visual Differentiation */}
      <div className="flex items-center gap-2 flex-wrap mb-4 text-xs font-mono bg-white/70 border border-[var(--line)] px-3 py-2 rounded-lg">
        <span className="text-[var(--ink-soft)] text-[11px] uppercase tracking-wider font-semibold">Legend:</span>
        {allSubjects.map((s) => {
          const col = getPaletteColor(s.accent);
          return (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border"
              style={{ backgroundColor: col.bg, borderColor: col.border, color: col.badgeText }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.hex }} />
              {s.code || s.title}
            </span>
          );
        })}
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border"
          style={{ 
            backgroundColor: getColorBg(easySpaceColor), 
            borderColor: getPaletteColor(easySpaceColor).border, 
            color: getPaletteColor(easySpaceColor).badgeText 
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(easySpaceColor) }} />
          EasySpace
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border"
          style={{ 
            backgroundColor: getColorBg(fengshuiColor), 
            borderColor: getPaletteColor(fengshuiColor).border, 
            color: getPaletteColor(fengshuiColor).badgeText 
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(fengshuiColor) }} />
          Fengshui
        </span>
      </div>

      {/* Calendar Month Controls */}
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={() => {
            setCalendarOffset(calendarOffset - 1);
            setSelectedDay(null);
          }}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink-soft)] cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-mono text-sm font-semibold text-[var(--ink)] min-w-[140px] text-center">
          {currentMonthName} {year}
        </span>
        <button
          type="button"
          onClick={() => {
            setCalendarOffset(calendarOffset + 1);
            setSelectedDay(null);
          }}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink-soft)] cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {calendarOffset !== 0 && (
          <button
            type="button"
            onClick={() => {
              setCalendarOffset(0);
              setSelectedDay(null);
            }}
            className="font-mono text-xs px-2 py-1 rounded-md border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
          >
            Today
          </button>
        )}
        <span className="font-mono text-[11px] text-[var(--ink-soft)] ml-auto hidden sm:inline">
          Click any date to see daily tasks & schedule
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((head) => (
          <div
            key={head}
            className="text-center font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-soft)] pb-1"
          >
            {head}
          </div>
        ))}

        {/* Empty placeholder cells */}
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[58px] bg-transparent" />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = calendarOffset === 0 && dayNum === now.getDate();
          const isSelected = selectedDay === dayNum;
          const items = byDay[dayNum] || [];

          return (
            <button
              type="button"
              key={`day-${dayNum}`}
              onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
              className={`min-h-[60px] border p-1.5 rounded-lg text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-[var(--ink)] ring-2 ring-[var(--ink)] bg-[#ECEAE2] shadow-sm font-bold'
                  : isToday
                  ? 'border-[var(--ink)] border-2 shadow-xs bg-white font-bold'
                  : 'border-[var(--line)] bg-[var(--paper)] hover:border-black/35 hover:bg-white/80'
              }`}
              title={`Click to view tasks for ${currentMonthName} ${dayNum}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`font-mono text-[11px] ${isSelected || isToday ? 'text-[var(--ink)] font-bold' : 'text-[var(--ink-soft)]'}`}>
                  {dayNum}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]" />
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {items.slice(0, 4).map((it, idx) => {
                  const hex = getColorHex(it.accent);
                  return (
                    <span
                      key={idx}
                      className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs shrink-0"
                      style={{ backgroundColor: hex }}
                      title={`${it.label} (${it.categoryTrack})`}
                    />
                  );
                })}
                {items.length > 4 && (
                  <span className="font-mono text-[9px] text-[var(--ink-soft)] font-semibold">
                    +{items.length - 4}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Tasks Panel (Clicking any date displays that day's tasks) */}
      {selectedDay !== null && (() => {
        const selectedDateObj = new Date(year, month, selectedDay);
        const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const shortWeekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedWeekday = weekdayNames[selectedDateObj.getDay()];
        const selectedShortWeekday = shortWeekdayNames[selectedDateObj.getDay()];

        const dayTasks = byDay[selectedDay] || [];
        const dayRecurring = filteredWeekly.filter((w) => {
          if (!w.day) return false;
          const dLower = w.day.toLowerCase().trim();
          return (
            dLower === selectedWeekday.toLowerCase() ||
            dLower === selectedShortWeekday.toLowerCase()
          );
        });

        return (
          <div className="mb-6 p-4 sm:p-5 rounded-xl border border-[var(--ink)] bg-white shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[var(--teal)]" />
                <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
                  {selectedWeekday}, {currentMonthName} {selectedDay}, {year}
                </h3>
                <span className="font-mono text-xs text-[var(--ink-soft)] bg-[var(--paper-deep)] px-2.5 py-0.5 rounded border border-[var(--line)]">
                  {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} due
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-xs font-mono text-[var(--ink-soft)] hover:text-[var(--ink)] px-2 py-1 rounded border border-[var(--line)] hover:bg-[#F2F1EA] cursor-pointer"
              >
                Close ×
              </button>
            </div>

            {dayTasks.length === 0 && dayRecurring.length === 0 ? (
              <p className="font-mono text-xs text-[var(--ink-soft)] py-4 text-center bg-[var(--paper-deep)] rounded-lg border border-[var(--line)]">
                No tasks, deadlines, or recurring classes scheduled for this date.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Specific Tasks on this day */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink)]">
                      Tasks & Deadlines ({dayTasks.length})
                    </span>
                  </div>
                  {dayTasks.length === 0 ? (
                    <p className="font-mono text-xs text-[var(--ink-soft)] bg-[var(--paper-deep)] p-3 rounded-lg border border-[var(--line)]">
                      No due dates or deadlines on this day.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {dayTasks.map((it, idx) => {
                        const col = getPaletteColor(it.accent);
                        return (
                          <li
                            key={idx}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-lg border text-xs font-mono bg-[var(--paper-deep)]"
                            style={{ borderColor: col.border }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="text-[var(--ink)] font-medium truncate">
                                {it.label}
                              </span>
                            </div>
                            <span
                              className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 font-medium"
                              style={{
                                backgroundColor: col.bg,
                                borderColor: col.border,
                                color: col.badgeText,
                              }}
                            >
                              {it.source || it.categoryTrack}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Recurring Classes & Routines on this weekday */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink)]">
                      Timetable Schedule for {selectedWeekday} ({dayRecurring.length})
                    </span>
                  </div>
                  {dayRecurring.length === 0 ? (
                    <p className="font-mono text-xs text-[var(--ink-soft)] bg-[var(--paper-deep)] p-3 rounded-lg border border-[var(--line)]">
                      No recurring timetable schedule on {selectedWeekday}s.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {dayRecurring.map((item, idx) => {
                        const col = getPaletteColor(item.accent);
                        return (
                          <li
                            key={idx}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-lg border text-xs font-mono bg-[var(--paper-deep)]"
                            style={{ borderColor: col.border }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="text-[var(--ink-soft)] shrink-0 font-semibold">
                                {item.time}
                              </span>
                              <span className="text-[var(--ink)] font-medium truncate">
                                {item.label}
                                {item.venue ? ` · ${item.venue}` : ''}
                              </span>
                            </div>
                            <span
                              className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 font-medium"
                              style={{
                                backgroundColor: col.bg,
                                borderColor: col.border,
                                color: col.badgeText,
                              }}
                            >
                              {item.categoryTrack}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Sub-columns: Weekly Schedule & Upcoming Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[var(--line)]">
        {/* Weekly Schedule */}
        <div>
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--ink-soft)] mb-2.5 font-semibold">
            <Clock className="w-3.5 h-3.5 text-[var(--teal)]" />
            <span>Weekly Schedule ({activeTab.toUpperCase()})</span>
          </div>
          {weeklySorted.length === 0 ? (
            <p className="text-xs text-[var(--ink-soft)] font-mono py-4 text-center bg-white rounded-lg border border-[var(--line)]">
              No weekly items scheduled for this section.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--line)] bg-[var(--paper)] rounded-lg border border-[var(--line)] px-3 max-h-56 overflow-y-auto">
              {weeklySorted.map((item, idx) => {
                const col = getPaletteColor(item.accent);
                return (
                  <li key={idx} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="font-bold px-2 py-0.5 rounded text-[11px] border shrink-0"
                        style={{
                          backgroundColor: col.bg,
                          borderColor: col.border,
                          color: col.badgeText,
                        }}
                      >
                        {item.day || '—'}
                      </span>
                      <span className="text-[var(--ink-soft)] shrink-0">{item.time}</span>
                      <div className="text-[var(--ink)] truncate ml-1 font-medium">
                        {item.label}
                        {item.venue ? ` · ${item.venue}` : ''}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Upcoming Deadlines & Events */}
        <div>
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--ink-soft)] mb-2.5 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-[var(--brick)]" />
            <span>Upcoming Deadlines & Milestones</span>
          </div>
          {upcomingSorted.length === 0 ? (
            <p className="text-xs text-[var(--ink-soft)] font-mono py-4 text-center bg-white rounded-lg border border-[var(--line)]">
              No upcoming deadlines in this section.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--line)] bg-[var(--paper)] rounded-lg border border-[var(--line)] px-3 max-h-56 overflow-y-auto">
              {upcomingSorted.slice(0, 8).map((item, idx) => {
                const days = daysUntil(item.date);
                let tagColor = 'var(--ink-soft)';
                let tagText = '';
                if (days !== null) {
                  if (days < 0) {
                    tagColor = '#9B3C30';
                    tagText = 'Overdue';
                  } else if (days === 0) {
                    tagColor = '#9B3C30';
                    tagText = 'Due Today';
                  } else if (days <= 3) {
                    tagColor = '#A37227';
                    tagText = `${days}d left`;
                  } else {
                    tagColor = '#2F5D54';
                    tagText = `${days}d left`;
                  }
                }

                const hex = getColorHex(item.accent);

                return (
                  <li key={idx} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[var(--ink-soft)] shrink-0 font-medium">{item.date}</span>
                      <span className="text-[var(--ink)] truncate font-medium">{item.label}</span>
                    </div>
                    {tagText && (
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[var(--line)] ml-2 shrink-0 font-semibold bg-white"
                        style={{ color: tagColor }}
                      >
                        {tagText}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Color Customizer Modal */}
      {isColorModalOpen && onUpdateSubjectColor && onUpdateEasySpaceColor && onUpdateFengshuiColor && (
        <ManageAllColorsModal
          isOpen={isColorModalOpen}
          onClose={() => setIsColorModalOpen(false)}
          subjects={allSubjects}
          easySpaceColor={easySpaceColor}
          fengshuiColor={fengshuiColor}
          onUpdateSubjectColor={onUpdateSubjectColor}
          onUpdateEasySpaceColor={onUpdateEasySpaceColor}
          onUpdateFengshuiColor={onUpdateFengshuiColor}
        />
      )}
    </div>
  );
};

