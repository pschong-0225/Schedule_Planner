import React from 'react';
import { WorkEvent, WorkHour } from '../types';
import { generateId } from '../data/initialState';
import { Plus, Trash2, Calendar, Clock, Briefcase, ArrowLeft } from 'lucide-react';

interface EasySpaceDetailProps {
  hours: WorkHour[];
  events: WorkEvent[];
  colorHex?: string;
  onUpdateHours: (hours: WorkHour[]) => void;
  onUpdateEvents: (events: WorkEvent[]) => void;
  onBackToWork?: () => void;
}

export const EasySpaceDetail: React.FC<EasySpaceDetailProps> = ({
  hours,
  events,
  colorHex = '#C97A3E',
  onUpdateHours,
  onUpdateEvents,
  onBackToWork,
}) => {
  const handleHourChange = (idx: number, field: keyof WorkHour, value: string) => {
    const updated = [...hours];
    updated[idx] = { ...updated[idx], [field]: value };
    onUpdateHours(updated);
  };

  const handleAddHour = () => {
    onUpdateHours([
      ...hours,
      { id: generateId('hr'), day: '', date: '', time: '', remark: '' },
    ]);
  };

  const handleDeleteHour = (idx: number) => {
    onUpdateHours(hours.filter((_, i) => i !== idx));
  };

  const handleEventDateChange = (id: string, date: string) => {
    onUpdateEvents(events.map((e) => (e.id === id ? { ...e, date } : e)));
  };

  const handleEventReqChange = (id: string, requirement: string) => {
    onUpdateEvents(events.map((e) => (e.id === id ? { ...e, requirement } : e)));
  };

  const handleDeleteEvent = (id: string) => {
    onUpdateEvents(events.filter((e) => e.id !== id));
  };

  const handleAddEvent = () => {
    onUpdateEvents([
      ...events,
      { id: generateId('ev'), date: '', requirement: '' },
    ]);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div
        className="border-b-4 pb-4 bg-[var(--paper-deep)] p-5 rounded-xl border border-[var(--line)] shadow-xs"
        style={{ borderBottomColor: colorHex }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {onBackToWork && (
              <button
                type="button"
                onClick={onBackToWork}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] bg-white border border-[var(--line)] hover:bg-[#F2F1EA] transition-all shadow-2xs cursor-pointer mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Work</span>
              </button>
            )}
            <div className="flex items-center gap-2 mb-1" style={{ color: colorHex }}>
              <Briefcase className="w-4 h-4" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Work Track · EasySpace
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              EasySpace
            </h1>
          </div>

          <div className="font-mono text-xs text-[var(--ink-soft)] bg-white border border-[var(--line)] p-2.5 rounded-lg">
            <span>{hours.length} Working Shifts · {events.length} Events</span>
          </div>
        </div>
      </div>

      {/* 1. Working Hours Table: Weekday, Date, Time, Remark */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Working Hours
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            Schedule shifts with Weekday, Date, Time & Remark
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--ink-soft)] text-left">
                <th className="py-2.5 px-2 w-32">Weekday (星期几)</th>
                <th className="py-2.5 px-2 w-36">Date (日期)</th>
                <th className="py-2.5 px-2 w-44">Time (时间)</th>
                <th className="py-2.5 px-2">Remark (备注)</th>
                <th className="py-2.5 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {hours.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--ink-soft)] font-mono">
                    No working hours logged yet. Click "Add Working Hours Row" below.
                  </td>
                </tr>
              ) : (
                hours.map((row, idx) => (
                  <tr key={row.id || idx} className="border-b border-[var(--line)] hover:bg-white/60 transition-colors">
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.day}
                        onChange={(e) => handleHourChange(idx, 'day', e.target.value)}
                        placeholder="e.g. Monday / Mon"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="date"
                        value={row.date || ''}
                        onChange={(e) => handleHourChange(idx, 'date', e.target.value)}
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) => handleHourChange(idx, 'time', e.target.value)}
                        placeholder="e.g. 09:00–18:00"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.remark || ''}
                        onChange={(e) => handleHourChange(idx, 'remark', e.target.value)}
                        placeholder="e.g. On-site desk, client check-in"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteHour(idx)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded text-[var(--ink-soft)] hover:text-[var(--brick)] hover:bg-black/5 transition-colors cursor-pointer"
                        title="Delete shift session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleAddHour}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink)] hover:text-black bg-white border border-[var(--line)] px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--teal)]" />
          <span>Add Working Hours Row</span>
        </button>
      </div>

      {/* 2. Events & Deadlines Section */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Events & Deadlines
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            {events.length} Upcoming {events.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-xs font-mono text-[var(--ink-soft)] py-6 text-center bg-white rounded-lg border border-[var(--line)]">
              No events or deadlines recorded. Click "Add Event / Deadline" below.
            </p>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="border border-[var(--line)] bg-white p-4 rounded-xl shadow-xs hover:border-black/20 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="w-4 h-4 text-[var(--teal)]" />
                    <span className="text-xs font-mono text-[var(--ink-soft)]">Date / Deadline:</span>
                    <input
                      type="date"
                      value={ev.date}
                      onChange={(e) => handleEventDateChange(ev.id, e.target.value)}
                      className="bg-[var(--paper-deep)] border border-[var(--line)] rounded px-2 py-1 text-xs font-mono text-[var(--ink)] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-1 text-[var(--ink-soft)] hover:text-[var(--brick)] rounded cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={ev.requirement}
                  onChange={(e) => handleEventReqChange(ev.id, e.target.value)}
                  placeholder="Event details, requirements, attendee notes, deliverables..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-[var(--paper-deep)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)] resize-y"
                />
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={handleAddEvent}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink)] hover:text-black bg-white border border-[var(--line)] px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--teal)]" />
          <span>+ Add Event / Deadline</span>
        </button>
      </div>
    </div>
  );
};

