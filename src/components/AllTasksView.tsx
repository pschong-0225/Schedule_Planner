import React, { useState, useMemo } from 'react';
import { GlobalTaskItem, PriorityLevel, TaskCategory } from '../types';
import { PRIORITIES } from '../data/constants';
import { TaskItem } from './TaskItem';
import { Search, Filter, ArrowUpDown, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface AllTasksViewProps {
  tasks: GlobalTaskItem[];
  categories: TaskCategory[];
  onToggleTask: (taskId: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onUpdateTaskPriority: (taskId: string, priority: PriorityLevel) => void;
  onUpdateTaskCategory: (taskId: string, categoryId: string) => void;
  onUpdateTaskDue?: (taskId: string, due: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToSource?: (task: GlobalTaskItem) => void;
}

type SortOption = 'priority' | 'due' | 'created' | 'source';

export const AllTasksView: React.FC<AllTasksViewProps> = ({
  tasks,
  categories,
  onToggleTask,
  onUpdateTaskText,
  onUpdateTaskPriority,
  onUpdateTaskCategory,
  onUpdateTaskDue,
  onDeleteTask,
  onNavigateToSource,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'category'>('priority');

  // Metrics calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.done).length;
  const pendingCount = totalCount - completedCount;
  const p1Count = tasks.filter((t) => !t.done && t.priority === 'p1').length;
  const p2Count = tasks.filter((t) => !t.done && t.priority === 'p2').length;
  const p3Count = tasks.filter((t) => !t.done && t.priority === 'p3').length;
  const p4Count = tasks.filter((t) => !t.done && t.priority === 'p4').length;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (statusFilter === 'pending' && t.done) return false;
      if (statusFilter === 'completed' && !t.done) return false;

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = t.text.toLowerCase().includes(q);
        const matchSource =
          t.sourceTitle.toLowerCase().includes(q) ||
          (t.sourceCode && t.sourceCode.toLowerCase().includes(q));
        if (!matchText && !matchSource) return false;
      }

      return true;
    });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    const priorityWeight: Record<PriorityLevel, number> = {
      p1: 1,
      p2: 2,
      p3: 3,
      p4: 4,
    };

    return list.sort((a, b) => {
      // Pending first, then completed
      if (a.done !== b.done) return a.done ? 1 : -1;

      if (sortBy === 'priority') {
        const wa = priorityWeight[a.priority || 'p3'] || 3;
        const wb = priorityWeight[b.priority || 'p3'] || 3;
        if (wa !== wb) return wa - wb;
      } else if (sortBy === 'due') {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return a.due.localeCompare(b.due);
      } else if (sortBy === 'source') {
        return a.sourceTitle.localeCompare(b.sourceTitle);
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [filteredTasks, sortBy]);

  return (
    <div className="space-y-5 text-left">
      {/* Overview Statistics Banner */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-4 rounded">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[var(--line)] pb-3 mb-3">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)]">
              任务总览与分类管理 (All Tasks Hub)
            </h2>
            <p className="font-mono text-xs text-[var(--ink-soft)] mt-0.5">
              全站跨模块汇聚：支持多维检索、优先级筛选与分类管理
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 bg-[var(--paper)] border border-[var(--line)] rounded">
              总计: <strong>{totalCount}</strong>
            </span>
            <span className="px-2 py-1 bg-[var(--paper)] border border-[var(--line)] rounded text-[var(--brick)]">
              待办: <strong>{pendingCount}</strong>
            </span>
            <span className="px-2 py-1 bg-[var(--paper)] border border-[var(--line)] rounded text-[var(--teal)]">
              已完成: <strong>{completedCount}</strong>
            </span>
          </div>
        </div>

        {/* Priority Quick Metric Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          {(['p1', 'p2', 'p3', 'p4'] as PriorityLevel[]).map((lvl) => {
            const meta = PRIORITIES[lvl];
            const count =
              lvl === 'p1' ? p1Count : lvl === 'p2' ? p2Count : lvl === 'p3' ? p3Count : p4Count;
            const isSelected = priorityFilter === lvl;

            return (
              <button
                key={lvl}
                type="button"
                id={`stat-filter-${lvl}`}
                onClick={() => setPriorityFilter(isSelected ? 'all' : lvl)}
                style={{
                  backgroundColor: isSelected ? meta.badgeBg : 'var(--paper)',
                  borderColor: isSelected ? meta.borderVar : 'var(--line)',
                }}
                className={`p-2 rounded border text-left flex items-center justify-between cursor-pointer transition-all hover:border-[var(--ink-soft)] ${
                  isSelected ? 'shadow-xs font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.colorVar }}
                  />
                  <span className="truncate" style={{ color: meta.colorVar }}>
                    {lvl.toUpperCase()} · {meta.label}
                  </span>
                </div>
                <span
                  className="px-1.5 py-0.5 rounded text-[11px] font-bold"
                  style={{
                    backgroundColor: meta.badgeBg,
                    color: meta.badgeText,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="border border-[var(--line)] bg-[var(--paper)] p-3 rounded space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-2.5 top-2.5" />
            <input
              type="text"
              id="all-tasks-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索所有任务、课程或备注…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--paper-deep)] border border-[var(--line)] rounded text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none"
            />
          </div>

          {/* Controls: Status & Sort */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            {/* Status switcher */}
            <div className="inline-flex rounded border border-[var(--line)] bg-[var(--paper-deep)] p-0.5">
              <button
                type="button"
                id="status-filter-all"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-[var(--ink)] text-white font-medium' : 'text-[var(--ink-soft)]'
                }`}
              >
                全部
              </button>
              <button
                type="button"
                id="status-filter-pending"
                onClick={() => setStatusFilter('pending')}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-[var(--ink)] text-white font-medium'
                    : 'text-[var(--ink-soft)]'
                }`}
              >
                待办 ({pendingCount})
              </button>
              <button
                type="button"
                id="status-filter-completed"
                onClick={() => setStatusFilter('completed')}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-[var(--ink)] text-white font-medium'
                    : 'text-[var(--ink-soft)]'
                }`}
              >
                已完成 ({completedCount})
              </button>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1 bg-[var(--paper-deep)] border border-[var(--line)] rounded px-2 py-1">
              <ArrowUpDown className="w-3 h-3 text-[var(--ink-soft)]" />
              <select
                id="tasks-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border-none text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
              >
                <option value="priority">按优先级排序 (P1 → P4)</option>
                <option value="due">按截止时间排序</option>
                <option value="created">按创建时间倒序</option>
                <option value="source">按所属课程/项目</option>
              </select>
            </div>

            {/* Group selector */}
            <div className="flex items-center gap-1 bg-[var(--paper-deep)] border border-[var(--line)] rounded px-2 py-1">
              <Layers className="w-3 h-3 text-[var(--ink-soft)]" />
              <select
                id="tasks-group-by"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="bg-transparent border-none text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
              >
                <option value="priority">按优先级分组</option>
                <option value="category">按分类分组</option>
                <option value="none">不分组纯列表</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--line)]">
          <span className="font-mono text-xs text-[var(--ink-soft)] mr-1">分类筛选:</span>
          <button
            type="button"
            id="cat-chip-all"
            onClick={() => setCategoryFilter('all')}
            className={`font-mono text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors ${
              categoryFilter === 'all'
                ? 'bg-[var(--ink)] text-white border-[var(--ink)] font-medium'
                : 'bg-[var(--paper-deep)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink-soft)]'
            }`}
          >
            全部分类
          </button>
          {categories.map((cat) => {
            const count = tasks.filter((t) => t.categoryId === cat.id).length;
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                id={`cat-chip-${cat.id}`}
                onClick={() => setCategoryFilter(isSelected ? 'all' : cat.id)}
                className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--ink)] text-white border-[var(--ink)] font-medium'
                    : 'bg-[var(--paper-deep)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink-soft)]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List (Grouped or Flat) */}
      <div className="border border-[var(--line)] bg-[var(--paper-deep)] rounded p-4">
        {sortedTasks.length === 0 ? (
          <div className="py-14 text-center font-mono text-xs text-[var(--ink-soft)]">
            没有符合当前筛选条件或搜索的任务
          </div>
        ) : groupBy === 'priority' ? (
          // Grouped by Priority
          <div className="space-y-5">
            {(['p1', 'p2', 'p3', 'p4'] as PriorityLevel[]).map((lvl) => {
              const groupTasks = sortedTasks.filter((t) => (t.priority || 'p3') === lvl);
              if (groupTasks.length === 0) return null;
              const meta = PRIORITIES[lvl];

              return (
                <div
                  key={lvl}
                  className="bg-[var(--paper)] rounded border border-[var(--line)] p-3"
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: meta.badgeBg,
                          color: meta.badgeText,
                          borderColor: meta.badgeBorder,
                        }}
                      >
                        {lvl.toUpperCase()} · {meta.label}
                      </span>
                      <span className="text-xs text-[var(--ink-soft)] font-mono hidden sm:inline">
                        {meta.description}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[var(--ink-soft)]">
                      {groupTasks.length} 项
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--line)]">
                    {groupTasks.map((task) => (
                      <TaskItem
                        key={task.id}
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
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : groupBy === 'category' ? (
          // Grouped by Category
          <div className="space-y-5">
            {categories.map((cat) => {
              const groupTasks = sortedTasks.filter((t) => t.categoryId === cat.id);
              if (groupTasks.length === 0) return null;

              return (
                <div
                  key={cat.id}
                  className="bg-[var(--paper)] rounded border border-[var(--line)] p-3"
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-serif font-bold text-sm text-[var(--ink)]">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[var(--ink-soft)]">
                      {groupTasks.length} 项
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--line)]">
                    {groupTasks.map((task) => (
                      <TaskItem
                        key={task.id}
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
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Flat list
          <div className="bg-[var(--paper)] rounded border border-[var(--line)] divide-y divide-[var(--line)] px-2">
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
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
                onSourceClick={onNavigateToSource ? () => onNavigateToSource(task) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
