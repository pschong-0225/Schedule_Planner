import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PageType, SubjectMeta, ViewState } from '../types';

interface BreadcrumbsProps {
  view: ViewState;
  subjects: SubjectMeta[];
  customWorkNodes: Array<{ id: string; title: string }>;
  customSchoolNodes: Array<{ id: string; title: string }>;
  customHomeNodes: Array<{ id: string; title: string }>;
  onNavigate: (page: PageType, extra?: { id?: string; loc?: 'home' | 'school' | 'work' | 'personal' }) => void;
  onBack?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  view,
  subjects,
  customWorkNodes,
  customSchoolNodes,
  customHomeNodes,
  onNavigate,
  onBack,
}) => {
  if (view.page === 'home') {
    return null;
  }

  const parts: { label: string; page: PageType; id?: string; loc?: 'home' | 'school' | 'work' | 'personal' }[] = [
    { label: 'Home', page: 'home' },
  ];

  if (view.page === 'school' || view.page === 'assignment' || view.page === 'subject') {
    parts.push({ label: 'School', page: 'school' });
    if (view.page === 'subject' && view.id) {
      const s = subjects.find((x) => x.id === view.id);
      parts.push({
        label: s ? (s.code ? `${s.code} · ${s.title}` : s.title) : 'Course Details',
        page: 'subject',
        id: view.id,
      });
    }
  } else if (view.page === 'work' || view.page === 'easyspace' || view.page === 'fengshui') {
    parts.push({ label: 'Work', page: 'work' });
    if (view.page === 'easyspace') {
      parts.push({ label: 'EasySpace', page: 'easyspace' });
    }
    if (view.page === 'fengshui') {
      parts.push({ label: 'Fengshui', page: 'fengshui' });
    }
  } else if (view.page === 'personal') {
    parts.push({ label: 'Personal', page: 'personal' });
  } else if (view.page === 'matrix') {
    parts.push({ label: 'Priority Matrix', page: 'matrix' });
  } else if (view.page === 'all-tasks') {
    parts.push({ label: 'All Tasks', page: 'all-tasks' });
  } else if (view.page === 'generic' && view.id) {
    if (view.loc === 'school') {
      parts.push({ label: 'School', page: 'school' });
      const node = customSchoolNodes.find((n) => n.id === view.id);
      if (node) parts.push({ label: node.title, page: 'generic', id: view.id, loc: 'school' });
    } else if (view.loc === 'work') {
      parts.push({ label: 'Work', page: 'work' });
      const node = customWorkNodes.find((n) => n.id === view.id);
      if (node) parts.push({ label: node.title, page: 'generic', id: view.id, loc: 'work' });
    } else {
      const node = customHomeNodes.find((n) => n.id === view.id);
      if (node) parts.push({ label: node.title, page: 'generic', id: view.id, loc: 'home' });
    }
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (view.page === 'subject') {
      onNavigate('school');
    } else if (view.page === 'easyspace' || view.page === 'fengshui') {
      onNavigate('work');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 pb-3 mb-5 border-b border-[var(--line)]">
      <button
        type="button"
        onClick={handleBackClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-[var(--ink)] bg-[var(--paper-deep)] border border-[var(--line)] hover:bg-[#F2F1EA] hover:border-black/25 transition-all shadow-2xs cursor-pointer"
        title="Go back to previous view"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-[var(--ink-soft)] flex-wrap text-right">
        {parts.map((p, idx) => {
          const isLast = idx === parts.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[var(--line-strong)] select-none">/</span>}
              {isLast ? (
                <span className="text-[var(--ink)] font-semibold">{p.label}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(p.page, { id: p.id, loc: p.loc })}
                  className="hover:text-[var(--ink)] hover:underline cursor-pointer"
                >
                  {p.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

