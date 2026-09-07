import React, { useState } from 'react';
import { PriorityLevel, Task, TaskCategory } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { Calendar, Trash2, Edit3, Check } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  categories: TaskCategory[];
  onToggle: (taskId: string) => void;
  onUpdateText: (taskId: string, newText: string) => void;
  onUpdatePriority: (taskId: string, priority: PriorityLevel) => void;
  onUpdateCategory: (taskId: string, categoryId: string) => void;
  onUpdateDue?: (taskId: string, due: string) => void;
  onDelete: (taskId: string) => void;
  sourceLabel?: string;
  sourceAccent?: string;
  onSourceClick?: () => void;
  hidePriority?: boolean;
  hideCategory?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  categories,
  onToggle,
  onUpdateText,
  onUpdatePriority,
  onUpdateCategory,
  onUpdateDue,
  onDelete,
  sourceLabel,
  sourceAccent,
  onSourceClick,
  hidePriority = false,
  hideCategory = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSaveText = () => {
    if (editText.trim() && editText !== task.text) {
      onUpdateText(task.id, editText.trim());
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveText();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      id={`task-item-${task.id}`}
      className={`group flex items-start gap-2.5 py-2.5 px-2 border-b border-[var(--line)] transition-colors hover:bg-[rgba(239,237,227,0.5)] ${
        task.done ? 'opacity-70' : ''
      }`}
    >
      {/* Checkbox */}
      <div className="pt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          id={`task-cb-${task.id}`}
          checked={task.done}
          onChange={() => onToggle(task.id)}
          className="w-4 h-4 accent-[var(--teal)] cursor-pointer rounded-sm"
          title={task.done ? 'Mark incomplete' : 'Mark completed'}
        />
      </div>

      {/* Main Task Content & Controls */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source badge if provided (Global / Matrix views) */}
          {sourceLabel && (
            <button
              type="button"
              id={`task-source-${task.id}`}
              onClick={onSourceClick}
              className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded border border-[var(--line)] hover:underline cursor-pointer flex-shrink-0 ${
                sourceAccent ? `text-[var(--${sourceAccent})]` : 'text-[var(--ink-soft)]'
              } bg-[var(--paper)]`}
              title="Go to section"
            >
              {sourceLabel}
            </button>
          )}

          {/* Priority selector */}
          {!hidePriority && (
            <PriorityBadge
              level={task.priority || 'p3'}
              onChange={(newLevel) => onUpdatePriority(task.id, newLevel)}
            />
          )}

          {/* Category selector */}
          {!hideCategory && (
            <CategoryBadge
              categoryId={task.categoryId}
              categories={categories}
              onChange={(newCatId) => onUpdateCategory(task.id, newCatId)}
            />
          )}

          {/* Due date tag/picker */}
          {task.due ? (
            <div className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--ink-soft)] bg-[var(--paper)] px-1.5 py-0.5 rounded border border-[var(--line)]">
              <Calendar className="w-3 h-3 text-[var(--brick)]" />
              <span>{task.due}</span>
              {onUpdateDue && (
                <button
                  type="button"
                  onClick={() => onUpdateDue(task.id, '')}
                  className="text-[10px] hover:text-[var(--brick)] ml-0.5 cursor-pointer"
                  title="Clear due date"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            onUpdateDue && (
              <div className="relative inline-block">
                {showDatePicker ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="date"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          onUpdateDue(task.id, e.target.value);
                        }
                        setShowDatePicker(false);
                      }}
                      onBlur={() => setShowDatePicker(false)}
                      autoFocus
                      className="font-mono text-[11px] p-0.5 border border-[var(--line)] bg-[var(--paper)] rounded"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5 text-[10.5px] font-mono text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline cursor-pointer"
                    title="Set target date"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>+Due</span>
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* Task Text or Edit Input */}
        <div className="flex items-center gap-1.5 w-full">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                id={`task-edit-input-${task.id}`}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveText}
                autoFocus
                className="flex-1 text-sm bg-[var(--paper)] border border-[var(--line-strong)] rounded px-2 py-1 text-[var(--ink)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveText}
                className="p-1 text-[var(--teal)] hover:opacity-80 cursor-pointer"
                title="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              className={`flex-1 text-sm text-[var(--ink)] break-words cursor-text select-text ${
                task.done ? 'line-through text-[var(--ink-soft)]' : ''
              }`}
              onClick={() => {
                setEditText(task.text);
                setIsEditing(true);
              }}
              title="Click to edit task"
            >
              {task.text}
            </div>
          )}

          {/* Action buttons (Edit & Delete) */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setEditText(task.text);
                  setIsEditing(true);
                }}
                className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded cursor-pointer"
                title="Edit text"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              id={`task-del-${task.id}`}
              onClick={() => onDelete(task.id)}
              className="p-1 text-[var(--ink-soft)] hover:text-[var(--brick)] rounded cursor-pointer transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
