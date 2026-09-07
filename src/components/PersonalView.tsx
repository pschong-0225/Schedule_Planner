import React, { useState } from 'react';
import { PersonalSection, PriorityLevel, Task, TaskCategory } from '../types';
import { generateId } from '../data/initialState';
import { getPaletteColor } from '../data/colors';
import { MonthlyTimetable } from './MonthlyTimetable';
import { TaskItem } from './TaskItem';
import { TaskAddRow } from './TaskAddRow';
import { Plus, Trash2, Calendar, Clock, Heart, CheckCircle2 } from 'lucide-react';

interface PersonalViewProps {
  personal: PersonalSection;
  categories: TaskCategory[];
  fullPlannerState: any;
  onUpdatePersonal: (updated: PersonalSection) => void;
  onUpdatePersonalColor?: (colorId: string) => void;
}

export const PersonalView: React.FC<PersonalViewProps> = ({
  personal,
  categories,
  fullPlannerState,
  onUpdatePersonal,
  onUpdatePersonalColor,
}) => {
  const personalCol = getPaletteColor(personal.color || 'c_rose');

  // Stats
  const totalTasks = personal.tasks.length;
  const completedTasks = personal.tasks.filter((t) => t.done).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Schedule helpers
  const handleScheduleChange = (idx: number, field: 'day' | 'time' | 'activity' | 'remark', val: string) => {
    const updatedSchedule = [...personal.schedule];
    updatedSchedule[idx] = { ...updatedSchedule[idx], [field]: val };
    onUpdatePersonal({ ...personal, schedule: updatedSchedule });
  };

  const handleAddScheduleRow = () => {
    onUpdatePersonal({
      ...personal,
      schedule: [
        ...personal.schedule,
        { id: generateId('psch'), day: '', time: '', activity: '', remark: '' },
      ],
    });
  };

  const handleDeleteScheduleRow = (idx: number) => {
    onUpdatePersonal({
      ...personal,
      schedule: personal.schedule.filter((_, i) => i !== idx),
    });
  };

  // Task helpers
  const handleToggleTask = (taskId: string) => {
    onUpdatePersonal({
      ...personal,
      tasks: personal.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              done: !t.done,
              completedAt: !t.done ? new Date().toISOString() : undefined,
            }
          : t
      ),
    });
  };

  const handleUpdateTaskText = (taskId: string, text: string) => {
    onUpdatePersonal({
      ...personal,
      tasks: personal.tasks.map((t) => (t.id === taskId ? { ...t, text } : t)),
    });
  };

  const handleUpdateTaskPriority = (taskId: string, priority: PriorityLevel) => {
    onUpdatePersonal({
      ...personal,
      tasks: personal.tasks.map((t) => (t.id === taskId ? { ...t, priority } : t)),
    });
  };

  const handleUpdateTaskCategory = (taskId: string, categoryId: string) => {
    onUpdatePersonal({
      ...personal,
      tasks: personal.tasks.map((t) => (t.id === taskId ? { ...t, categoryId } : t)),
    });
  };

  const handleUpdateTaskDue = (taskId: string, due: string) => {
    onUpdatePersonal({
      ...personal,
      tasks: personal.tasks.map((t) => (t.id === taskId ? { ...t, due: due || undefined } : t)),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdatePersonal({
      ...personal,
      tasks: personal.tasks.filter((t) => t.id !== taskId),
    });
  };

  const handleAddTask = (taskData: {
    text: string;
    priority: PriorityLevel;
    categoryId: string;
    due?: string;
  }) => {
    const newTask: Task = {
      id: generateId('ptsk'),
      text: taskData.text,
      done: false,
      priority: taskData.priority,
      categoryId: taskData.categoryId,
      due: taskData.due,
      createdAt: new Date().toISOString(),
    };

    onUpdatePersonal({
      ...personal,
      tasks: [...personal.tasks, newTask],
    });
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="font-mono text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: personalCol.bg,
                  borderColor: personalCol.border,
                  color: personalCol.badgeText,
                }}
              >
                Life & Wellness
              </span>
              <span className="font-mono text-xs text-[var(--ink-soft)]">
                Personal routines, self-care & goals
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              Personal
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="bg-[var(--paper-deep)] border border-[var(--line)] p-3.5 rounded-xl min-w-[260px] shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-[var(--ink)] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--teal)]" />
                <span>Personal Goals Done</span>
              </span>
              <span className="font-bold text-sm text-[var(--ink)]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[var(--line)]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: personalCol.hex,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[var(--ink-soft)] mt-1.5">
              <span>{completedTasks} completed</span>
              <span>{totalTasks} total tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Personal Timetable */}
      <div>
        <MonthlyTimetable
          state={fullPlannerState}
          scope="personal"
          title="Personal Timetable & Monthly Schedule"
          closable={false}
          id="personalMonthlyTimetable"
        />
      </div>

      {/* 2. Personal Routine & Time Schedule */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Personal Schedule & Routines
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            Habits, workout, meal prep & personal slots
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--ink-soft)] text-left">
                <th className="py-2.5 px-2 w-32">Day / Frequency</th>
                <th className="py-2.5 px-2 w-36">Time</th>
                <th className="py-2.5 px-2 w-56">Activity / Habit</th>
                <th className="py-2.5 px-2">Remark</th>
                <th className="py-2.5 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {personal.schedule.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[var(--ink-soft)] font-mono">
                    No personal routines set. Click "Add Routine Row" below.
                  </td>
                </tr>
              ) : (
                personal.schedule.map((row, idx) => (
                  <tr key={row.id || idx} className="border-b border-[var(--line)] hover:bg-white/60 transition-colors">
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.day}
                        onChange={(e) => handleScheduleChange(idx, 'day', e.target.value)}
                        placeholder="e.g. Daily / Weekends"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) => handleScheduleChange(idx, 'time', e.target.value)}
                        placeholder="e.g. 07:00–08:00"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.activity}
                        onChange={(e) => handleScheduleChange(idx, 'activity', e.target.value)}
                        placeholder="e.g. Morning Pilates & Journaling"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.remark || ''}
                        onChange={(e) => handleScheduleChange(idx, 'remark', e.target.value)}
                        placeholder="e.g. Hydrate, outdoor walk"
                        className="w-full bg-white border border-[var(--line)] px-2 py-1.5 rounded text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduleRow(idx)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded text-[var(--ink-soft)] hover:text-[var(--brick)] hover:bg-black/5 transition-colors cursor-pointer"
                        title="Delete routine session"
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
          onClick={handleAddScheduleRow}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink)] hover:text-black bg-white border border-[var(--line)] px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--teal)]" />
          <span>Add Routine Row</span>
        </button>
      </div>

      {/* 3. Personal Tasks & Action Items */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--rose)]" />
            <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
              Personal Tasks & To-Dos
            </h2>
          </div>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            {completedTasks} of {totalTasks} tasks completed
          </span>
        </div>

        <div className="divide-y divide-[var(--line)] bg-[var(--paper)] rounded-xl border border-[var(--line)] px-2">
          {personal.tasks.length === 0 ? (
            <div className="py-6 text-center font-mono text-xs text-[var(--ink-soft)]">
              No personal tasks yet. Add one below to organize your day.
            </div>
          ) : (
            personal.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                categories={categories}
                onToggle={handleToggleTask}
                onUpdateText={handleUpdateTaskText}
                onUpdatePriority={handleUpdateTaskPriority}
                onUpdateCategory={handleUpdateTaskCategory}
                onUpdateDue={handleUpdateTaskDue}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>

        <TaskAddRow
          categories={categories}
          defaultCategoryId="cat_life"
          defaultPriority="p3"
          onAddTask={handleAddTask}
          placeholder="Add a new personal task or habit..."
        />
      </div>
    </div>
  );
};
