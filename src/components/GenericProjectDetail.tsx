import React from 'react';
import { CustomNodeInfo, GenericNodeData, PriorityLevel, Task, TaskCategory, TimetableRow } from '../types';
import { generateId } from '../data/initialState';
import { TaskItem } from './TaskItem';
import { TaskAddRow } from './TaskAddRow';
import { Calendar, Clock, CheckSquare, Trash2, Plus } from 'lucide-react';

interface GenericProjectDetailProps {
  node: CustomNodeInfo;
  data: GenericNodeData;
  categories: TaskCategory[];
  onUpdateDue: (due: string) => void;
  onUpdateTimetable: (tt: TimetableRow[]) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  onDeleteNode: () => void;
}

export const GenericProjectDetail: React.FC<GenericProjectDetailProps> = ({
  node,
  data,
  categories,
  onUpdateDue,
  onUpdateTimetable,
  onUpdateTasks,
  onDeleteNode,
}) => {
  const handleTimetableChange = (idx: number, field: keyof TimetableRow, value: string) => {
    const updated = [...(data.timetable || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    onUpdateTimetable(updated);
  };

  const handleAddTimetableRow = () => {
    onUpdateTimetable([...(data.timetable || []), { day: '', time: '', venue: '' }]);
  };

  const handleDeleteTimetableRow = (idx: number) => {
    onUpdateTimetable((data.timetable || []).filter((_, i) => i !== idx));
  };

  const handleToggleTask = (taskId: string) => {
    onUpdateTasks(
      data.tasks.map((t) =>
        t.id === taskId
          ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }
          : t
      )
    );
  };

  const handleUpdateTaskText = (taskId: string, text: string) => {
    onUpdateTasks(data.tasks.map((t) => (t.id === taskId ? { ...t, text } : t)));
  };

  const handleUpdateTaskPriority = (taskId: string, priority: PriorityLevel) => {
    onUpdateTasks(data.tasks.map((t) => (t.id === taskId ? { ...t, priority } : t)));
  };

  const handleUpdateTaskCategory = (taskId: string, categoryId: string) => {
    onUpdateTasks(data.tasks.map((t) => (t.id === taskId ? { ...t, categoryId } : t)));
  };

  const handleUpdateTaskDue = (taskId: string, due: string) => {
    onUpdateTasks(data.tasks.map((t) => (t.id === taskId ? { ...t, due: due || undefined } : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(data.tasks.filter((t) => t.id !== taskId));
  };

  const handleAddTask = (taskData: {
    text: string;
    priority: PriorityLevel;
    categoryId: string;
    due?: string;
  }) => {
    const newTask: Task = {
      id: generateId('gen_tsk'),
      text: taskData.text,
      done: false,
      priority: taskData.priority,
      categoryId: taskData.categoryId,
      due: taskData.due,
      createdAt: new Date().toISOString(),
    };
    onUpdateTasks([...(data.tasks || []), newTask]);
  };

  const completedCount = (data.tasks || []).filter((t) => t.done).length;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div
        className="flex items-baseline justify-between border-b-4 pb-3"
        style={{ borderColor: `var(--${node.accent})` }}
      >
        <h2 className="font-serif font-bold text-3xl text-[var(--ink)]">{node.title}</h2>
        <button
          type="button"
          onClick={() => onDeleteNode()}
          className="text-xs font-mono text-[var(--ink-soft)] hover:text-[var(--brick)] border border-[var(--line)] px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          删除此页面
        </button>
      </div>

      {/* Due Date Section */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-4 rounded flex items-center gap-3">
        <label className="font-serif font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[var(--ink-soft)]" />
          <span>项目总截止日期 (Due Date):</span>
        </label>
        <input
          type="date"
          value={data.due || ''}
          onChange={(e) => onUpdateDue(e.target.value)}
          className="bg-[var(--paper)] border border-[var(--line)] rounded text-xs font-mono px-2 py-1 text-[var(--ink)] focus:outline-none"
        />
      </div>

      {/* Timetable Section */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 rounded">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-3">
          <h4 className="font-serif font-bold text-base text-[var(--ink)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--teal)]" />
            <span>时间表安排 (Timetable)</span>
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--ink-soft)] text-left">
                <th className="py-2 px-2 w-1/4">星期</th>
                <th className="py-2 px-2 w-1/3">时间</th>
                <th className="py-2 px-2 w-1/3">地点 / 备注</th>
                <th className="py-2 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(data.timetable || []).map((row, idx) => (
                <tr key={idx} className="border-b border-[var(--line)]">
                  <td className="p-1">
                    <input
                      type="text"
                      value={row.day}
                      onChange={(e) => handleTimetableChange(idx, 'day', e.target.value)}
                      placeholder="例：周三"
                      className="w-full bg-transparent px-2 py-1.5 rounded focus:bg-[var(--paper)] focus:outline-none"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={row.time}
                      onChange={(e) => handleTimetableChange(idx, 'time', e.target.value)}
                      placeholder="例：19:00–21:00"
                      className="w-full bg-transparent px-2 py-1.5 rounded focus:bg-[var(--paper)] focus:outline-none"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={row.venue}
                      onChange={(e) => handleTimetableChange(idx, 'venue', e.target.value)}
                      placeholder="例：图书馆二楼 / 线上"
                      className="w-full bg-transparent px-2 py-1.5 rounded focus:bg-[var(--paper)] focus:outline-none"
                    />
                  </td>
                  <td className="p-1 text-center">
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
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleAddTimetableRow}
          className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] border border-dashed border-[var(--line)] px-3 py-1.5 rounded transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>添加时段</span>
        </button>
      </div>

      {/* Tasks Section */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 rounded space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
          <h4 className="font-serif font-bold text-base text-[var(--ink)] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[var(--teal)]" />
            <span>分类任务清单 (Tasks Checklist)</span>
          </h4>
          <span className="font-mono text-xs text-[var(--ink-soft)]">
            已完成 {completedCount} / {(data.tasks || []).length}
          </span>
        </div>

        <div className="divide-y divide-[var(--line)] bg-[var(--paper)] rounded border border-[var(--line)] px-2">
          {(data.tasks || []).length === 0 ? (
            <div className="py-6 text-center font-mono text-xs text-[var(--ink-soft)]">
              暂无任务项，请在下方添加
            </div>
          ) : (
            (data.tasks || []).map((task) => (
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
          defaultCategoryId={categories[0]?.id || 'cat_hw'}
          defaultPriority="p2"
          onAddTask={handleAddTask}
          placeholder="新增项目具体任务…"
        />
      </div>
    </div>
  );
};
