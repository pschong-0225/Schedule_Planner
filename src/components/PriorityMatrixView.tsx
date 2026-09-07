import React, { useState } from 'react';
import { GlobalTaskItem, PriorityLevel, TaskCategory } from '../types';
import { PRIORITIES } from '../data/constants';
import { TaskItem } from './TaskItem';
import { Plus, CheckCircle2, Filter, Search, ArrowRight, ArrowLeft } from 'lucide-react';

interface PriorityMatrixViewProps {
  tasks: GlobalTaskItem[];
  categories: TaskCategory[];
  onToggleTask: (taskId: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onUpdateTaskPriority: (taskId: string, priority: PriorityLevel) => void;
  onUpdateTaskCategory: (taskId: string, categoryId: string) => void;
  onUpdateTaskDue?: (taskId: string, due: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToSource?: (task: GlobalTaskItem) => void;
  onQuickAddTask: (quadrant: PriorityLevel, text: string, categoryId: string) => void;
}

export const PriorityMatrixView: React.FC<PriorityMatrixViewProps> = ({
  tasks,
  categories,
  onToggleTask,
  onUpdateTaskText,
  onUpdateTaskPriority,
  onUpdateTaskCategory,
  onUpdateTaskDue,
  onDeleteTask,
  onNavigateToSource,
  onQuickAddTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickInputQuadrant, setQuickInputQuadrant] = useState<PriorityLevel | null>(null);
  const [quickText, setQuickText] = useState<string>('');
  const [quickCategory, setQuickCategory] = useState<string>(categories[0]?.id || 'cat_hw');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (!showCompleted && t.done) return false;
    if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = t.text.toLowerCase().includes(q);
      const matchSource = t.sourceTitle.toLowerCase().includes(q) || (t.sourceCode && t.sourceCode.toLowerCase().includes(q));
      if (!matchText && !matchSource) return false;
    }
    return true;
  });

  const getQuadrantTasks = (level: PriorityLevel) => {
    return filteredTasks.filter((t) => (t.priority || 'p3') === level);
  };

  const handleQuickAdd = (level: PriorityLevel) => {
    if (!quickText.trim()) return;
    onQuickAddTask(level, quickText.trim(), quickCategory);
    setQuickText('');
    setQuickInputQuadrant(null);
  };

  const quadrants: { level: PriorityLevel; tag: string; action: string; desc: string }[] = [
    { level: 'p1', tag: '第一象限', action: '立即执行 · Do First', desc: '紧急且重要 · 需最先完成的紧急学业/核心截止日' },
    { level: 'p2', tag: '第二象限', action: '规划深耕 · Schedule', desc: '重要不紧急 · 长期复习、大论文研究与高价值储备' },
    { level: 'p3', tag: '第三象限', action: '快速解决 · Delegate/Batch', desc: '紧急不重要 · 琐碎沟通、流程填表或常规跑腿' },
    { level: 'p4', tag: '第四象限', action: '常规备忘 · Eliminate/Backlog', desc: '不紧急不重要 · 随手备忘、非必须杂项、归档灵感' },
  ];

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-4 rounded text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3 mb-3">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)]">
              四象限优先级看板 (Eisenhower Matrix)
            </h2>
            <p className="font-mono text-xs text-[var(--ink-soft)] mt-0.5">
              按「重要性」与「紧迫度」对所有任务进行系统性分流，聚焦高价值投入
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="matrix-toggle-completed"
              onClick={() => setShowCompleted(!showCompleted)}
              className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5 rounded border cursor-pointer transition-colors ${
                showCompleted
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                  : 'bg-[var(--paper)] text-[var(--ink-soft)] border-[var(--line)] hover:border-[var(--ink)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{showCompleted ? '隐藏已完成' : '显示已完成'}</span>
            </button>
          </div>
        </div>

        {/* Filter controls: Category chips and Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1">
          {/* Category filter bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs text-[var(--ink-soft)] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>分类:</span>
            </span>
            <button
              type="button"
              id="matrix-cat-all"
              onClick={() => setSelectedCategory('all')}
              className={`font-mono text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                  : 'bg-[var(--paper)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink-soft)]'
              }`}
            >
              全部 ({tasks.length})
            </button>
            {categories.map((cat) => {
              const count = tasks.filter((t) => t.categoryId === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`matrix-cat-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--ink)] text-white border-[var(--ink)] font-medium'
                      : 'bg-[var(--paper)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink-soft)]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-2.5 top-2.5" />
            <input
              type="text"
              id="matrix-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索任务或课程…"
              className="w-full pl-8 pr-3 py-1 text-xs bg-[var(--paper)] border border-[var(--line)] rounded text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {quadrants.map(({ level, tag, action, desc }) => {
          const meta = PRIORITIES[level];
          const qTasks = getQuadrantTasks(level);
          const pendingCount = qTasks.filter((t) => !t.done).length;
          const isQuickAdding = quickInputQuadrant === level;

          return (
            <div
              key={level}
              id={`quadrant-${level}`}
              style={{
                borderColor: meta.borderVar,
                backgroundColor: 'var(--paper-deep)',
              }}
              className="border-2 rounded p-4 flex flex-col min-h-[320px] shadow-xs relative"
            >
              {/* Quadrant Header */}
              <div
                className="flex items-start justify-between border-b pb-2 mb-3 gap-2"
                style={{ borderColor: 'var(--line)' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: meta.badgeBg,
                        color: meta.badgeText,
                        borderColor: meta.badgeBorder,
                      }}
                    >
                      {tag} · {level.toUpperCase()}
                    </span>
                    <span className="font-serif font-bold text-base text-[var(--ink)]">
                      {action}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-soft)] mt-1 font-mono leading-tight">
                    {desc}
                  </p>
                </div>

                {/* Badge count */}
                <div
                  className="font-mono text-xs font-bold px-2 py-1 rounded border flex-shrink-0"
                  style={{
                    backgroundColor: meta.badgeBg,
                    color: meta.badgeText,
                    borderColor: meta.badgeBorder,
                  }}
                >
                  {pendingCount} 待办
                </div>
              </div>

              {/* Task list inside this quadrant */}
              <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-[var(--line)] bg-[var(--paper)] rounded border border-[var(--line)] px-2">
                {qTasks.length === 0 ? (
                  <div className="py-12 text-center text-[var(--ink-soft)] text-xs font-mono">
                    本象限当前没有任务
                  </div>
                ) : (
                  qTasks.map((task) => (
                    <div key={task.id} className="relative group/quad">
                      <TaskItem
                        task={task}
                        categories={categories}
                        onToggle={onToggleTask}
                        onUpdateText={onUpdateTaskText}
                        onUpdatePriority={onUpdateTaskPriority}
                        onUpdateCategory={onUpdateTaskCategory}
                        onUpdateDue={onUpdateTaskDue}
                        onDelete={onDeleteTask}
                        sourceLabel={task.sourceCode || task.sourceTitle}
                        sourceAccent={task.sourceAccent}
                        onSourceClick={
                          onNavigateToSource ? () => onNavigateToSource(task) : undefined
                        }
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Quick Add row for this quadrant */}
              <div className="mt-3 pt-2 border-t border-[var(--line)]">
                {isQuickAdding ? (
                  <div className="flex flex-col gap-2 bg-[var(--paper)] p-2 rounded border border-[var(--line)]">
                    <input
                      type="text"
                      id={`quick-input-${level}`}
                      value={quickText}
                      onChange={(e) => setQuickText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAdd(level);
                        if (e.key === 'Escape') setQuickInputQuadrant(null);
                      }}
                      placeholder={`在${tag}新增任务… (按回车添加)`}
                      autoFocus
                      className="text-xs p-1.5 bg-transparent border-b border-[var(--line)] text-[var(--ink)] focus:outline-none"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-mono text-[var(--ink-soft)]">分类:</span>
                        <select
                          value={quickCategory}
                          onChange={(e) => setQuickCategory(e.target.value)}
                          className="text-[11px] font-mono bg-[var(--paper-deep)] border border-[var(--line)] rounded px-1 py-0.5"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.icon} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQuickInputQuadrant(null)}
                          className="text-xs font-mono text-[var(--ink-soft)] px-2 py-0.5 hover:text-[var(--ink)]"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(level)}
                          className="text-xs font-mono bg-[var(--ink)] text-white px-2.5 py-1 rounded hover:opacity-85"
                        >
                          确认添加
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    id={`quick-add-btn-${level}`}
                    onClick={() => {
                      setQuickInputQuadrant(level);
                      setQuickText('');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-dashed border-[var(--line)] text-xs font-mono text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加任务到{tag}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
