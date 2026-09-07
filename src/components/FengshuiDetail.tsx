import React from 'react';
import { PriorityLevel, Task, TaskCategory } from '../types';
import { generateId } from '../data/initialState';
import { TaskItem } from './TaskItem';
import { TaskAddRow } from './TaskAddRow';
import { Compass, CheckSquare } from 'lucide-react';

interface FengshuiDetailProps {
  progress: number;
  tasks: Task[];
  categories: TaskCategory[];
  onUpdateProgress: (val: number) => void;
  onUpdateTasks: (tasks: Task[]) => void;
}

export const FengshuiDetail: React.FC<FengshuiDetailProps> = ({
  progress,
  tasks,
  categories,
  onUpdateProgress,
  onUpdateTasks,
}) => {
  const handleToggleTask = (taskId: string) => {
    onUpdateTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }
          : t
      )
    );
  };

  const handleUpdateTaskText = (taskId: string, text: string) => {
    onUpdateTasks(tasks.map((t) => (t.id === taskId ? { ...t, text } : t)));
  };

  const handleUpdateTaskPriority = (taskId: string, priority: PriorityLevel) => {
    onUpdateTasks(tasks.map((t) => (t.id === taskId ? { ...t, priority } : t)));
  };

  const handleUpdateTaskCategory = (taskId: string, categoryId: string) => {
    onUpdateTasks(tasks.map((t) => (t.id === taskId ? { ...t, categoryId } : t)));
  };

  const handleUpdateTaskDue = (taskId: string, due: string) => {
    onUpdateTasks(tasks.map((t) => (t.id === taskId ? { ...t, due: due || undefined } : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleAddTask = (data: {
    text: string;
    priority: PriorityLevel;
    categoryId: string;
    due?: string;
  }) => {
    const newTask: Task = {
      id: generateId('fs_tsk'),
      text: data.text,
      done: false,
      priority: data.priority,
      categoryId: data.categoryId,
      due: data.due,
      createdAt: new Date().toISOString(),
    };
    onUpdateTasks([...tasks, newTask]);
  };

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b-4 border-b-[var(--plum)] pb-3">
        <div className="flex items-center gap-2 text-[var(--plum)] mb-1">
          <Compass className="w-5 h-5" />
          <span className="font-mono text-xs font-bold uppercase">环境与规划</span>
        </div>
        <h2 className="font-serif font-bold text-3xl text-[var(--ink)]">风水</h2>
      </div>

      {/* Progress Section */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 rounded space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-base text-[var(--ink)]">
            整体完成进度 (Progress)
          </h4>
          <span className="font-mono text-lg font-bold text-[var(--plum)]">{progress}%</span>
        </div>

        {/* Clickable Progress Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            onUpdateProgress(Math.max(0, Math.min(100, pct)));
          }}
          className="w-full bg-[var(--paper)] h-3.5 rounded border border-[var(--line)] cursor-pointer relative overflow-hidden"
        >
          <div
            className="bg-[var(--plum)] h-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onUpdateProgress(Number(e.target.value))}
          className="w-full accent-[var(--plum)] cursor-pointer"
        />
      </div>

      {/* Checklist Section */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 rounded space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
          <h4 className="font-serif font-bold text-base text-[var(--ink)] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[var(--plum)]" />
            <span>执行检查单 (Action Checklist)</span>
          </h4>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            已完成 {completedCount} / {tasks.length}
          </span>
        </div>

        {/* Task List */}
        <div className="divide-y divide-[var(--line)] bg-[var(--paper)] rounded border border-[var(--line)] px-2">
          {tasks.length === 0 ? (
            <div className="py-6 text-center font-mono text-xs text-[var(--ink-soft)]">
              暂无任务项，请在下方添加
            </div>
          ) : (
            tasks.map((task) => (
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

        {/* Add Task Row */}
        <TaskAddRow
          categories={categories}
          defaultCategoryId="cat_life"
          defaultPriority="p2"
          onAddTask={handleAddTask}
          placeholder="新增风水与环境待办任务…"
        />
      </div>
    </div>
  );
};
