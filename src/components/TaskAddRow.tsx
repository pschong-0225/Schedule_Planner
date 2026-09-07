import React, { useState } from 'react';
import { PriorityLevel, TaskCategory } from '../types';
import { PRIORITIES } from '../data/constants';
import { Plus, Calendar } from 'lucide-react';

interface TaskAddRowProps {
  categories: TaskCategory[];
  defaultCategoryId?: string;
  defaultPriority?: PriorityLevel;
  hidePriority?: boolean;
  hideCategory?: boolean;
  onAddTask: (data: {
    text: string;
    priority: PriorityLevel;
    categoryId: string;
    due?: string;
  }) => void;
  placeholder?: string;
}

export const TaskAddRow: React.FC<TaskAddRowProps> = ({
  categories,
  defaultCategoryId,
  defaultPriority = 'p2',
  hidePriority = false,
  hideCategory = false,
  onAddTask,
  placeholder = 'Add a task... (Press Enter to add)',
}) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(defaultPriority);
  const [categoryId, setCategoryId] = useState<string>(
    defaultCategoryId || (categories[0]?.id ?? 'cat_hw')
  );
  const [due, setDue] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTask({
      text: trimmed,
      priority,
      categoryId,
      due: due || undefined,
    });
    setText('');
    setDue('');
  };

  const showToolbar = (showOptions || text.length > 0) && (!hidePriority || !hideCategory || true);

  return (
    <div className="mt-3 border border-[var(--line)] bg-[var(--paper)] rounded p-2 text-left">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            id="new-task-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowOptions(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none px-1 py-1"
          />
          <button
            type="submit"
            id="new-task-submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-1 bg-[var(--ink)] text-white text-xs font-mono px-3 py-1.5 rounded hover:opacity-85 disabled:opacity-40 cursor-pointer transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Optional toolbar (Priority, Category, Due Date) */}
        {(showOptions || text.length > 0) && (
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[var(--line)] text-xs font-mono">
            {/* Priority quick buttons */}
            {!hidePriority ? (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] text-[var(--ink-soft)] mr-1">Priority:</span>
                {(['p1', 'p2', 'p3', 'p4'] as PriorityLevel[]).map((lvl) => {
                  const meta = PRIORITIES[lvl];
                  const active = priority === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      id={`add-pri-${lvl}`}
                      onClick={() => setPriority(lvl)}
                      style={{
                        backgroundColor: active ? meta.badgeBg : 'transparent',
                        color: active ? meta.badgeText : 'var(--ink-soft)',
                        borderColor: active ? meta.badgeBorder : 'var(--line)',
                      }}
                      className={`px-1.5 py-0.5 rounded border text-[11px] cursor-pointer transition-all ${
                        active ? 'font-semibold shadow-xs' : 'hover:border-[var(--ink-soft)]'
                      }`}
                      title={meta.label}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div />
            )}

            {/* Category and optional due date */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category dropdown */}
              {!hideCategory && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[var(--ink-soft)]">Category:</span>
                  <select
                    id="add-cat-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="bg-[var(--paper-deep)] border border-[var(--line)] rounded text-[11px] px-1.5 py-0.5 text-[var(--ink)] focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Due date input */}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[var(--ink-soft)]" />
                <span className="text-[11px] text-[var(--ink-soft)]">Due:</span>
                <input
                  type="date"
                  id="add-due-date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="bg-[var(--paper-deep)] border border-[var(--line)] rounded text-[11px] px-1 py-0.5 text-[var(--ink)] focus:outline-none font-mono"
                  title="Target date (optional)"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
