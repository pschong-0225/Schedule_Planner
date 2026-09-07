import React, { useState } from 'react';
import { Assignment, PriorityLevel, SubjectData, SubjectMeta, TaskCategory, TimetableRow } from '../types';
import { ASSIGNMENT_TEMPLATES } from '../data/constants';
import { generateId } from '../data/initialState';
import { getPaletteColor } from '../data/colors';
import { TaskItem } from './TaskItem';
import { TaskAddRow } from './TaskAddRow';
import { PriorityBadge } from './PriorityBadge';
import { Plus, Trash2, Calendar, Clock, BookOpen, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface SubjectDetailViewProps {
  subject: SubjectMeta;
  data: SubjectData;
  categories: TaskCategory[];
  fullPlannerState: any;
  onUpdateTimetable: (newTt: TimetableRow[]) => void;
  onUpdateAssignments: (newAsg: Assignment[]) => void;
  onDeleteSubject?: () => void;
  onBackToSchool: () => void;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subject,
  data,
  categories,
  onUpdateTimetable,
  onUpdateAssignments,
  onDeleteSubject,
  onBackToSchool,
}) => {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false);

  // Compute total task stats for auto-detecting progress bar
  let totalTasks = 0;
  let completedTasks = 0;
  data.assignments.forEach((a) => {
    totalTasks += a.tasks.length;
    completedTasks += a.tasks.filter((t) => t.done).length;
  });
  const subjectProgressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const subjectCol = getPaletteColor(subject.accent);

  // Timetable helpers
  const handleTimetableChange = (idx: number, field: keyof TimetableRow, value: string) => {
    const updated = [...data.timetable];
    updated[idx] = { ...updated[idx], [field]: value };
    onUpdateTimetable(updated);
  };

  const handleAddTimetableRow = () => {
    onUpdateTimetable([...data.timetable, { day: '', time: '', venue: '', remark: '' }]);
  };

  const handleDeleteTimetableRow = (idx: number) => {
    const updated = data.timetable.filter((_, i) => i !== idx);
    onUpdateTimetable(updated);
  };

  // Assignment helpers
  const handleAssignmentTitleChange = (asgId: string, title: string) => {
    const updated = data.assignments.map((a) => (a.id === asgId ? { ...a, title } : a));
    onUpdateAssignments(updated);
  };

  const handleAssignmentDueChange = (asgId: string, due: string) => {
    const updated = data.assignments.map((a) => (a.id === asgId ? { ...a, due } : a));
    onUpdateAssignments(updated);
  };

  const handleAssignmentPriorityChange = (asgId: string, priority: PriorityLevel) => {
    const updated = data.assignments.map((a) => (a.id === asgId ? { ...a, priority } : a));
    onUpdateAssignments(updated);
  };

  const handleDeleteAssignment = (asgId: string) => {
    const updated = data.assignments.filter((a) => a.id !== asgId);
    onUpdateAssignments(updated);
  };

  const handleAddAssignmentWithTemplate = (templateKey: string) => {
    const tmpl = ASSIGNMENT_TEMPLATES.find((t) => t.key === templateKey) || ASSIGNMENT_TEMPLATES[0];
    const newAsg: Assignment = {
      id: generateId('asg'),
      title: `${tmpl.label} ${data.assignments.length + 1}`,
      type: tmpl.key,
      due: '',
      priority: tmpl.defaultPriority || 'p2',
      tasks: [],
    };
    onUpdateAssignments([...data.assignments, newAsg]);
    setShowTemplatePicker(false);
  };

  // Task helpers for specific assignment
  const handleToggleTask = (asgId: string, taskId: string) => {
    const updated = data.assignments.map((a) => {
      if (a.id !== asgId) return a;
      return {
        ...a,
        tasks: a.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                done: !t.done,
                completedAt: !t.done ? new Date().toISOString() : undefined,
              }
            : t
        ),
      };
    });
    onUpdateAssignments(updated);
  };

  const handleUpdateTaskText = (asgId: string, taskId: string, text: string) => {
    const updated = data.assignments.map((a) => {
      if (a.id !== asgId) return a;
      return {
        ...a,
        tasks: a.tasks.map((t) => (t.id === taskId ? { ...t, text } : t)),
      };
    });
    onUpdateAssignments(updated);
  };

  const handleUpdateTaskPriority = (asgId: string, taskId: string, priority: PriorityLevel) => {
    const updated = data.assignments.map((a) => {
      if (a.id !== asgId) return a;
      return {
        ...a,
        tasks: a.tasks.map((t) => (t.id === taskId ? { ...t, priority } : t)),
      };
    });
    onUpdateAssignments(updated);
  };

  const handleUpdateTaskCategory = (asgId: string, taskId: string, categoryId: string) => {
    const updated = data.assignments.map((a) => {
      if (a.id !== asgId) return a;
      return {
        ...a,
        tasks: a.tasks.map((t) => (t.id === taskId ? { ...t, categoryId } : t)),
      };
    });
    onUpdateAssignments(updated);
  };

  const handleUpdateTaskDue = (asgId: string, taskId: string, due: string) => {
    const updated = data.assignments.map((a) => {
      if (a.id !== asgId) return a;
      return {
        ...a,
        tasks: a.tasks.map((t) => (t.id === taskId ? { ...t, due: due || undefined } : t)),
      };
    });
    onUpdateAssignments(updated);
  };

  const handleDeleteTask = (asgId: string, taskId: string) => {
    const updated = data.assignments.map((a) => {
      if (a.id !== asgId) return a;
      return {
        ...a,
        tasks: a.tasks.filter((t) => t.id !== taskId),
      };
    });
    onUpdateAssignments(updated);
  };

  const handleAddTask = (
    asgId: string,
    taskData: { text: string; priority: PriorityLevel; categoryId: string; due?: string }
  ) => {
    const newTask = {
      id: generateId('tsk'),
      text: taskData.text,
      done: false,
      priority: taskData.priority,
      categoryId: taskData.categoryId,
      due: taskData.due,
      createdAt: new Date().toISOString(),
    };

    const updated = data.assignments.map((a) => {
      if (a.id !== asgId) return a;
      return {
        ...a,
        tasks: [...a.tasks, newTask],
      };
    });
    onUpdateAssignments(updated);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header with Back Button and Auto-Detecting Progress Bar */}
      <div
        className="border-b-4 pb-4 bg-[var(--paper-deep)] p-5 rounded-xl border border-[var(--line)] shadow-xs"
        style={{ borderBottomColor: subjectCol.hex }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={onBackToSchool}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] bg-white border border-[var(--line)] hover:bg-[#F2F1EA] transition-all shadow-2xs cursor-pointer mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to School</span>
            </button>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: subjectCol.bg,
                  borderColor: subjectCol.border,
                  color: subjectCol.badgeText,
                }}
              >
                {subject.code}
              </span>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
                {subject.title}
              </h1>
            </div>
          </div>

          {/* Auto-detecting Subject Progress Bar */}
          <div className="bg-white border border-[var(--line)] p-3.5 rounded-lg min-w-[240px] shadow-2xs">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-[var(--ink-soft)] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--teal)]" />
                <span>Assignment Progress</span>
              </span>
              <span className="font-bold text-[var(--ink)]">{subjectProgressPercent}%</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-[var(--paper-deep)] h-2.5 rounded-full overflow-hidden border border-[var(--line)]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${subjectProgressPercent}%`,
                  backgroundColor: subjectCol.hex,
                }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-[var(--ink-soft)] mt-1.5">
              <span>{completedTasks} completed</span>
              <span>{totalTasks} total tasks</span>
            </div>
          </div>
        </div>

        {onDeleteSubject && (
          <div className="pt-3 mt-3 border-t border-[var(--line)] flex justify-end">
            {confirmDeleteCourse ? (
              <div className="flex items-center gap-2 bg-[#FBEBE8] border border-[#E8BAB5] px-3 py-1.5 rounded-lg flex-wrap">
                <span className="text-xs font-mono text-[var(--brick)] font-semibold">
                  Confirm delete "{subject.title}" ({subject.code})?
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteSubject()}
                  className="px-2.5 py-1 bg-[var(--brick)] text-white rounded text-xs font-mono font-medium hover:opacity-90 cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteCourse(false)}
                  className="px-2.5 py-1 bg-white border border-[var(--line)] text-[var(--ink)] rounded text-xs font-mono hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteCourse(true)}
                className="text-xs font-mono text-[var(--brick)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Course</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECTION 1: ASSIGNMENT TRACK (Displayed first per user request) */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6 rounded-xl space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Assignment Track
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--ink-soft)] bg-white px-2.5 py-1 rounded border border-[var(--line)]">
            {data.assignments.length} assessment {data.assignments.length === 1 ? 'module' : 'modules'}
          </span>
        </div>

        {/* Assignment Cards */}
        <div className="space-y-4">
          {data.assignments.map((asg) => {
            const tmpl =
              ASSIGNMENT_TEMPLATES.find((t) => t.key === asg.type) || ASSIGNMENT_TEMPLATES[0];
            const completedCount = asg.tasks.filter((t) => t.done).length;
            const asgProgress = asg.tasks.length === 0 ? 0 : Math.round((completedCount / asg.tasks.length) * 100);

            return (
              <div
                key={asg.id}
                className="border border-[var(--line)] bg-[var(--paper)] rounded-xl p-4 sm:p-5 shadow-xs transition-all hover:border-black/20"
              >
                {/* Assignment Head */}
                <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[var(--line)] pb-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                    <span className="text-xl" title={tmpl.label}>
                      {tmpl.icon}
                    </span>
                    <input
                      type="text"
                      value={asg.title}
                      onChange={(e) => handleAssignmentTitleChange(asg.id, e.target.value)}
                      placeholder="Assignment title..."
                      className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] bg-transparent border-none focus:bg-white px-1.5 py-0.5 rounded flex-1 focus:outline-none focus:ring-1 focus:ring-[var(--line)]"
                    />
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-[var(--line)] bg-[var(--paper-deep)] text-[var(--ink-soft)] shrink-0">
                      {tmpl.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                    {/* Due Date */}
                    <div className="flex items-center gap-1 bg-white border border-[var(--line)] rounded px-2.5 py-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                      <span className="text-[11px] text-[var(--ink-soft)]">Due:</span>
                      <input
                        type="date"
                        value={asg.due}
                        onChange={(e) => handleAssignmentDueChange(asg.id, e.target.value)}
                        className="bg-transparent border-none text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
                        title="Due date"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(asg.id)}
                      className="p-1.5 text-[var(--ink-soft)] hover:text-[var(--brick)] rounded cursor-pointer transition-colors"
                      title="Delete assessment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Assignment Specific Progress Bar (Increases % when each task is checked) */}
                <div className="bg-white/80 border border-[var(--line)] p-2.5 rounded-lg mb-3">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[var(--ink-soft)]">
                      Progress: <strong className="text-[var(--ink)]">{completedCount}</strong> of <strong className="text-[var(--ink)]">{asg.tasks.length}</strong> tasks done
                    </span>
                    <span className="font-bold text-[var(--ink)]">{asgProgress}%</span>
                  </div>
                  <div className="w-full bg-[var(--paper-deep)] h-2 rounded-full overflow-hidden border border-[var(--line)]">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${asgProgress}%`,
                        backgroundColor: subjectCol.hex,
                      }}
                    />
                  </div>
                </div>

                {/* Sub-tasks List */}
                <div className="divide-y divide-[var(--line)] bg-[var(--paper-deep)] rounded-lg border border-[var(--line)] px-2 mb-3">
                  {asg.tasks.length === 0 ? (
                    <div className="py-4 text-center font-mono text-xs text-[var(--ink-soft)]">
                      No tasks yet. Break this assessment into steps below.
                    </div>
                  ) : (
                    asg.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        categories={categories}
                        hidePriority={true}
                        hideCategory={true}
                        onToggle={(tid) => handleToggleTask(asg.id, tid)}
                        onUpdateText={(tid, txt) => handleUpdateTaskText(asg.id, tid, txt)}
                        onUpdatePriority={(tid, pri) => handleUpdateTaskPriority(asg.id, tid, pri)}
                        onUpdateCategory={(tid, cat) => handleUpdateTaskCategory(asg.id, tid, cat)}
                        onUpdateDue={(tid, due) => handleUpdateTaskDue(asg.id, tid, due)}
                        onDelete={(tid) => handleDeleteTask(asg.id, tid)}
                      />
                    ))
                  )}
                </div>

                {/* Add Sub-task Row */}
                <TaskAddRow
                  categories={categories}
                  defaultCategoryId={tmpl.defaultCategoryId || 'cat_hw'}
                  defaultPriority={tmpl.defaultPriority || 'p2'}
                  hidePriority={true}
                  hideCategory={true}
                  onAddTask={(taskData) => handleAddTask(asg.id, taskData)}
                  placeholder={`Add step for "${asg.title}"...`}
                />
              </div>
            );
          })}
        </div>

        {/* Add Assignment Template Picker */}
        <div className="pt-2">
          {showTemplatePicker ? (
            <div className="border border-dashed border-[var(--line-strong)] bg-[var(--paper)] p-4 rounded-xl text-left">
              <div className="font-mono text-xs text-[var(--ink-soft)] mb-2.5 font-semibold">
                Select an Assessment Template:
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {ASSIGNMENT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => handleAddAssignmentWithTemplate(tmpl.key)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--paper-deep)] hover:border-[var(--ink)] text-xs font-mono cursor-pointer transition-colors shadow-2xs"
                  >
                    <span className="text-base">{tmpl.icon}</span>
                    <span>{tmpl.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatePicker(false)}
                className="font-mono text-xs text-[var(--ink-soft)] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowTemplatePicker(true)}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-[var(--line-strong)] text-xs font-mono text-[var(--ink)] hover:bg-[var(--paper)] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Assignment / Assessment Track</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: TIMETABLE (Displayed second, including Remark column per user request) */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6 rounded-xl shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Course Timetable & Task Schedule
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            Schedule trivial tasks or class slots by date/time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--ink-soft)] text-left">
                <th className="py-2.5 px-2 w-28">Day / Date</th>
                <th className="py-2.5 px-2 w-32">Time</th>
                <th className="py-2.5 px-2 w-48">Venue / Task</th>
                <th className="py-2.5 px-2">Remark</th>
                <th className="py-2.5 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {data.timetable.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--ink-soft)] font-mono">
                    No scheduled sessions yet. Click "Add Timetable Row" below.
                  </td>
                </tr>
              ) : (
                data.timetable.map((row, idx) => (
                  <tr key={idx} className="border-b border-[var(--line)] hover:bg-white/60 transition-colors">
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.day}
                        onChange={(e) => handleTimetableChange(idx, 'day', e.target.value)}
                        placeholder="e.g. Tuesday / Nov 12"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) => handleTimetableChange(idx, 'time', e.target.value)}
                        placeholder="e.g. 10:00–12:00"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.venue}
                        onChange={(e) => handleTimetableChange(idx, 'venue', e.target.value)}
                        placeholder="e.g. LT 2 or Read Chapter 3"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.remark || ''}
                        onChange={(e) => handleTimetableChange(idx, 'remark', e.target.value)}
                        placeholder="e.g. Bring laptop, prepare slides"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteTimetableRow(idx)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded text-[var(--ink-soft)] hover:text-[var(--brick)] hover:bg-black/5 transition-colors cursor-pointer"
                        title="Delete session"
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
          onClick={handleAddTimetableRow}
          className="mt-3.5 inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink)] hover:text-black bg-white border border-[var(--line)] px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--teal)]" />
          <span>Add Timetable Row</span>
        </button>
      </div>
    </div>
  );
};

