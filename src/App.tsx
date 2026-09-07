import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Assignment,
  CustomNodeInfo,
  GlobalTaskItem,
  PageType,
  PlannerState,
  PriorityLevel,
  SubjectData,
  SubjectMeta,
  Task,
  TaskCategory,
  TimetableRow,
  ViewState,
} from './types';
import { BASE_SUBJECTS, getNextAccent } from './data/constants';
import { generateId, getDefaultPlannerState } from './data/initialState';
import { getPaletteColor } from './data/colors';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { MonthlyTimetable } from './components/MonthlyTimetable';
import { PriorityMatrixView } from './components/PriorityMatrixView';
import { AllTasksView } from './components/AllTasksView';
import { SchoolView } from './components/SchoolView';
import { SubjectDetailView } from './components/SubjectDetailView';
import { WorkView } from './components/WorkView';
import { PersonalView } from './components/PersonalView';
import { EasySpaceDetail } from './components/EasySpaceDetail';
import { FengshuiDetail } from './components/FengshuiDetail';
import { GenericProjectDetail } from './components/GenericProjectDetail';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { Plus, Trash2, Calendar, LayoutGrid, ListTodo, BookOpen, Briefcase, Heart, ArrowRight, Tag } from 'lucide-react';
import { loadPlannerFromCloud, savePlannerToCloud } from './services/firebase';

const STORAGE_KEY = 'planner-data-v2';
const OLD_STORAGE_KEY = 'planner-data';

export default function App() {
  const [state, setState] = useState<PlannerState>(() => {
    // Attempt load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const fresh = getDefaultPlannerState();
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && parsed.categories) {
          return {
            ...fresh,
            ...parsed,
            courses: parsed.courses || [...BASE_SUBJECTS, ...(parsed.customSubjects || [])],
            personal: parsed.personal || fresh.personal,
            easyspace: { ...fresh.easyspace, ...(parsed.easyspace || {}) },
            fengshui: { ...fresh.fengshui, ...(parsed.fengshui || {}) },
          };
        }
      }
      // Check legacy key
      const legacy = localStorage.getItem(OLD_STORAGE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        return {
          ...fresh,
          subjects: { ...fresh.subjects, ...(parsedLegacy.subjects || {}) },
          customSubjects: parsedLegacy.customSubjects || [],
          courses: [...BASE_SUBJECTS, ...(parsedLegacy.customSubjects || [])],
          home: parsedLegacy.home || { customNodes: [] },
          school: parsedLegacy.school || { customNodes: [] },
          work: parsedLegacy.work || { customNodes: [] },
          personal: parsedLegacy.personal || fresh.personal,
          genericNodes: parsedLegacy.genericNodes || {},
          easyspace: parsedLegacy.easyspace || fresh.easyspace,
          fengshui: parsedLegacy.fengshui || fresh.fengshui,
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return getDefaultPlannerState();
  });

  const [view, setView] = useState<ViewState>({ page: 'home' });
  const [saveStatus, setSaveStatus] = useState<string>('Saved to Database');
  const [cloudStatus, setCloudStatus] = useState<'synced' | 'saving' | 'offline' | 'loading'>('loading');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [homeAdding, setHomeAdding] = useState(false);
  const [newHomeTitle, setNewHomeTitle] = useState('');

  // Initial load from Firebase Firestore Database
  useEffect(() => {
    let isMounted = true;
    loadPlannerFromCloud()
      .then((cloudData) => {
        if (!isMounted) return;
        if (cloudData && cloudData.subjects && cloudData.categories) {
          setState((prev) => ({
            ...prev,
            ...cloudData,
            courses: cloudData.courses || prev.courses || [...BASE_SUBJECTS, ...(cloudData.customSubjects || [])],
          }));
          setCloudStatus('synced');
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          // Push local state to Firestore if cloud is empty
          savePlannerToCloud(state).then((ok) => {
            if (isMounted) {
              setCloudStatus(ok ? 'synced' : 'offline');
              if (ok) setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
          });
        }
      })
      .catch((err) => {
        console.warn('Initial cloud database fetch warning:', err);
        if (isMounted) setCloudStatus('offline');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save to localStorage & Firebase Firestore with debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    setSaveStatus('Saving to Database...');
    setCloudStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Error saving state locally:', err);
      }

      const ok = await savePlannerToCloud(state);
      if (ok) {
        setSaveStatus('Saved to Database');
        setCloudStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaveStatus('Saved locally');
        setCloudStatus('offline');
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state]);

  const handleManualSync = async () => {
    setCloudStatus('saving');
    setSaveStatus('Syncing to Database...');
    const ok = await savePlannerToCloud(state);
    if (ok) {
      setCloudStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSaveStatus('Saved to Database');
    } else {
      setCloudStatus('offline');
      setSaveStatus('Saved locally (Offline)');
    }
  };

  const allSubjects: SubjectMeta[] = useMemo(() => {
    if (state.courses && state.courses.length > 0) {
      const courseIds = new Set(state.courses.map((c) => c.id));
      const extraCustom = (state.customSubjects || []).filter((s) => !courseIds.has(s.id));
      if (extraCustom.length > 0) {
        return [...state.courses, ...extraCustom];
      }
      return state.courses;
    }
    return [...BASE_SUBJECTS, ...(state.customSubjects || [])];
  }, [state.courses, state.customSubjects]);

  // Aggregate all tasks across subjects, fengshui, and generic custom nodes
  const globalTasks: GlobalTaskItem[] = useMemo(() => {
    const list: GlobalTaskItem[] = [];

    // Subjects assignments tasks
    allSubjects.forEach((s) => {
      const data = state.subjects[s.id];
      if (!data) return;

      (data.assignments || []).forEach((asg) => {
        (asg.tasks || []).forEach((t) => {
          list.push({
            ...t,
            sourceType: 'subject',
            sourceTitle: asg.title,
            sourceCode: s.code,
            sourceAccent: s.accent,
            subjectId: s.id,
            assignmentId: asg.id,
          });
        });
      });
    });

    // Fengshui tasks
    (state.fengshui.tasks || []).forEach((t) => {
      list.push({
        ...t,
        sourceType: 'fengshui',
        sourceTitle: 'Feng Shui',
        sourceAccent: state.fengshui?.color || 'sage',
      });
    });

    // Generic nodes tasks (school, work, home)
    const checkNodes = [
      ...(state.school.customNodes || []).map((n) => ({ ...n, loc: 'school' as const })),
      ...(state.work.customNodes || []).map((n) => ({ ...n, loc: 'work' as const })),
      ...(state.home.customNodes || []).map((n) => ({ ...n, loc: 'home' as const })),
    ];

    checkNodes.forEach((node) => {
      const data = state.genericNodes[node.id];
      if (!data) return;
      (data.tasks || []).forEach((t) => {
        list.push({
          ...t,
          sourceType: 'generic',
          sourceTitle: node.title,
          sourceAccent: node.accent,
          genericLoc: node.loc,
          genericId: node.id,
        });
      });
    });

    return list;
  }, [state, allSubjects]);

  // Task usage count per category
  const categoryUsageCount = useMemo(() => {
    const counts: Record<string, number> = {};
    globalTasks.forEach((t) => {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + 1;
    });
    return counts;
  }, [globalTasks]);

  const totalPendingP1Count = useMemo(() => {
    return globalTasks.filter((t) => !t.done && t.priority === 'p1').length;
  }, [globalTasks]);

  // Navigation helper
  const handleNavigate = (
    page: PageType,
    extra?: { id?: string; loc?: 'home' | 'school' | 'work' | 'personal' }
  ) => {
    setView({ page, ...extra });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ----------------------------------------------------
  // Task Mutation Handlers for Global Tasks / Matrix View
  // ----------------------------------------------------
  const handleToggleGlobalTask = (taskId: string) => {
    setState((prev) => {
      const copy = { ...prev };

      // Check subjects
      for (const sId of Object.keys(copy.subjects)) {
        const sData = copy.subjects[sId];
        let found = false;
        const newAssignments = sData.assignments.map((asg) => {
          const tIdx = asg.tasks.findIndex((t) => t.id === taskId);
          if (tIdx !== -1) {
            found = true;
            const updatedTasks = [...asg.tasks];
            const current = updatedTasks[tIdx];
            updatedTasks[tIdx] = {
              ...current,
              done: !current.done,
              completedAt: !current.done ? new Date().toISOString() : undefined,
            };
            return { ...asg, tasks: updatedTasks };
          }
          return asg;
        });
        if (found) {
          copy.subjects[sId] = { ...sData, assignments: newAssignments };
          return copy;
        }
      }

      // Check Fengshui
      const fsIdx = copy.fengshui.tasks.findIndex((t) => t.id === taskId);
      if (fsIdx !== -1) {
        const updated = [...copy.fengshui.tasks];
        const cur = updated[fsIdx];
        updated[fsIdx] = {
          ...cur,
          done: !cur.done,
          completedAt: !cur.done ? new Date().toISOString() : undefined,
        };
        copy.fengshui = { ...copy.fengshui, tasks: updated };
        return copy;
      }

      // Check generic nodes
      for (const gId of Object.keys(copy.genericNodes)) {
        const gData = copy.genericNodes[gId];
        const tIdx = (gData.tasks || []).findIndex((t) => t.id === taskId);
        if (tIdx !== -1) {
          const updated = [...gData.tasks];
          const cur = updated[tIdx];
          updated[tIdx] = {
            ...cur,
            done: !cur.done,
            completedAt: !cur.done ? new Date().toISOString() : undefined,
          };
          copy.genericNodes[gId] = { ...gData, tasks: updated };
          return copy;
        }
      }

      return copy;
    });
  };

  const handleUpdateGlobalTaskText = (taskId: string, newText: string) => {
    setState((prev) => {
      const copy = { ...prev };
      // Subjects
      for (const sId of Object.keys(copy.subjects)) {
        const sData = copy.subjects[sId];
        let found = false;
        const newAssignments = sData.assignments.map((asg) => {
          const tIdx = asg.tasks.findIndex((t) => t.id === taskId);
          if (tIdx !== -1) {
            found = true;
            const updatedTasks = [...asg.tasks];
            updatedTasks[tIdx] = { ...updatedTasks[tIdx], text: newText };
            return { ...asg, tasks: updatedTasks };
          }
          return asg;
        });
        if (found) {
          copy.subjects[sId] = { ...sData, assignments: newAssignments };
          return copy;
        }
      }

      // Fengshui
      const fsIdx = copy.fengshui.tasks.findIndex((t) => t.id === taskId);
      if (fsIdx !== -1) {
        const updated = [...copy.fengshui.tasks];
        updated[fsIdx] = { ...updated[fsIdx], text: newText };
        copy.fengshui = { ...copy.fengshui, tasks: updated };
        return copy;
      }

      // Generic
      for (const gId of Object.keys(copy.genericNodes)) {
        const gData = copy.genericNodes[gId];
        const tIdx = (gData.tasks || []).findIndex((t) => t.id === taskId);
        if (tIdx !== -1) {
          const updated = [...gData.tasks];
          updated[tIdx] = { ...updated[tIdx], text: newText };
          copy.genericNodes[gId] = { ...gData, tasks: updated };
          return copy;
        }
      }

      return copy;
    });
  };

  const handleUpdateGlobalTaskPriority = (taskId: string, priority: PriorityLevel) => {
    setState((prev) => {
      const copy = { ...prev };
      // Subjects
      for (const sId of Object.keys(copy.subjects)) {
        const sData = copy.subjects[sId];
        let found = false;
        const newAssignments = sData.assignments.map((asg) => {
          const tIdx = asg.tasks.findIndex((t) => t.id === taskId);
          if (tIdx !== -1) {
            found = true;
            const updatedTasks = [...asg.tasks];
            updatedTasks[tIdx] = { ...updatedTasks[tIdx], priority };
            return { ...asg, tasks: updatedTasks };
          }
          return asg;
        });
        if (found) {
          copy.subjects[sId] = { ...sData, assignments: newAssignments };
          return copy;
        }
      }

      // Fengshui
      const fsIdx = copy.fengshui.tasks.findIndex((t) => t.id === taskId);
      if (fsIdx !== -1) {
        const updated = [...copy.fengshui.tasks];
        updated[fsIdx] = { ...updated[fsIdx], priority };
        copy.fengshui = { ...copy.fengshui, tasks: updated };
        return copy;
      }

      // Generic
      for (const gId of Object.keys(copy.genericNodes)) {
        const gData = copy.genericNodes[gId];
        const tIdx = (gData.tasks || []).findIndex((t) => t.id === taskId);
        if (tIdx !== -1) {
          const updated = [...gData.tasks];
          updated[tIdx] = { ...updated[tIdx], priority };
          copy.genericNodes[gId] = { ...gData, tasks: updated };
          return copy;
        }
      }

      return copy;
    });
  };

  const handleUpdateGlobalTaskCategory = (taskId: string, categoryId: string) => {
    setState((prev) => {
      const copy = { ...prev };
      // Subjects
      for (const sId of Object.keys(copy.subjects)) {
        const sData = copy.subjects[sId];
        let found = false;
        const newAssignments = sData.assignments.map((asg) => {
          const tIdx = asg.tasks.findIndex((t) => t.id === taskId);
          if (tIdx !== -1) {
            found = true;
            const updatedTasks = [...asg.tasks];
            updatedTasks[tIdx] = { ...updatedTasks[tIdx], categoryId };
            return { ...asg, tasks: updatedTasks };
          }
          return asg;
        });
        if (found) {
          copy.subjects[sId] = { ...sData, assignments: newAssignments };
          return copy;
        }
      }

      // Fengshui
      const fsIdx = copy.fengshui.tasks.findIndex((t) => t.id === taskId);
      if (fsIdx !== -1) {
        const updated = [...copy.fengshui.tasks];
        updated[fsIdx] = { ...updated[fsIdx], categoryId };
        copy.fengshui = { ...copy.fengshui, tasks: updated };
        return copy;
      }

      // Generic
      for (const gId of Object.keys(copy.genericNodes)) {
        const gData = copy.genericNodes[gId];
        const tIdx = (gData.tasks || []).findIndex((t) => t.id === taskId);
        if (tIdx !== -1) {
          const updated = [...gData.tasks];
          updated[tIdx] = { ...updated[tIdx], categoryId };
          copy.genericNodes[gId] = { ...gData, tasks: updated };
          return copy;
        }
      }

      return copy;
    });
  };

  const handleUpdateGlobalTaskDue = (taskId: string, due: string) => {
    setState((prev) => {
      const copy = { ...prev };
      // Subjects
      for (const sId of Object.keys(copy.subjects)) {
        const sData = copy.subjects[sId];
        let found = false;
        const newAssignments = sData.assignments.map((asg) => {
          const tIdx = asg.tasks.findIndex((t) => t.id === taskId);
          if (tIdx !== -1) {
            found = true;
            const updatedTasks = [...asg.tasks];
            updatedTasks[tIdx] = { ...updatedTasks[tIdx], due: due || undefined };
            return { ...asg, tasks: updatedTasks };
          }
          return asg;
        });
        if (found) {
          copy.subjects[sId] = { ...sData, assignments: newAssignments };
          return copy;
        }
      }

      // Fengshui
      const fsIdx = copy.fengshui.tasks.findIndex((t) => t.id === taskId);
      if (fsIdx !== -1) {
        const updated = [...copy.fengshui.tasks];
        updated[fsIdx] = { ...updated[fsIdx], due: due || undefined };
        copy.fengshui = { ...copy.fengshui, tasks: updated };
        return copy;
      }

      // Generic
      for (const gId of Object.keys(copy.genericNodes)) {
        const gData = copy.genericNodes[gId];
        const tIdx = (gData.tasks || []).findIndex((t) => t.id === taskId);
        if (tIdx !== -1) {
          const updated = [...gData.tasks];
          updated[tIdx] = { ...updated[tIdx], due: due || undefined };
          copy.genericNodes[gId] = { ...gData, tasks: updated };
          return copy;
        }
      }

      return copy;
    });
  };

  const handleDeleteGlobalTask = (taskId: string) => {
    setState((prev) => {
      const copy = { ...prev };
      // Subjects
      for (const sId of Object.keys(copy.subjects)) {
        const sData = copy.subjects[sId];
        let found = false;
        const newAssignments = sData.assignments.map((asg) => {
          if (asg.tasks.some((t) => t.id === taskId)) {
            found = true;
            return { ...asg, tasks: asg.tasks.filter((t) => t.id !== taskId) };
          }
          return asg;
        });
        if (found) {
          copy.subjects[sId] = { ...sData, assignments: newAssignments };
          return copy;
        }
      }

      // Fengshui
      if (copy.fengshui.tasks.some((t) => t.id === taskId)) {
        copy.fengshui = {
          ...copy.fengshui,
          tasks: copy.fengshui.tasks.filter((t) => t.id !== taskId),
        };
        return copy;
      }

      // Generic
      for (const gId of Object.keys(copy.genericNodes)) {
        const gData = copy.genericNodes[gId];
        if ((gData.tasks || []).some((t) => t.id === taskId)) {
          copy.genericNodes[gId] = {
            ...gData,
            tasks: gData.tasks.filter((t) => t.id !== taskId),
          };
          return copy;
        }
      }

      return copy;
    });
  };

  // Quick add task from Priority Matrix to first available subject assignment or general
  const handleMatrixQuickAdd = (
    quadrant: PriorityLevel,
    text: string,
    categoryId: string
  ) => {
    const newTask: Task = {
      id: generateId('matrix_tsk'),
      text,
      done: false,
      priority: quadrant,
      categoryId,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => {
      const copy = { ...prev };
      const firstSubjId = allSubjects[0]?.id;
      if (firstSubjId && copy.subjects[firstSubjId]) {
        const sData = copy.subjects[firstSubjId];
        if (sData.assignments.length > 0) {
          const newAssignments = [...sData.assignments];
          newAssignments[0] = {
            ...newAssignments[0],
            tasks: [newTask, ...newAssignments[0].tasks],
          };
          copy.subjects[firstSubjId] = { ...sData, assignments: newAssignments };
          return copy;
        }
      }

      // Fallback to Fengshui
      copy.fengshui = {
        ...copy.fengshui,
        tasks: [newTask, ...copy.fengshui.tasks],
      };
      return copy;
    });
  };

  const handleNavigateToSource = (task: GlobalTaskItem) => {
    if (task.sourceType === 'subject' && task.subjectId) {
      handleNavigate('subject', { id: task.subjectId });
    } else if (task.sourceType === 'fengshui') {
      handleNavigate('fengshui');
    } else if (task.sourceType === 'personal') {
      handleNavigate('personal');
    } else if (task.sourceType === 'generic' && task.genericId && task.genericLoc) {
      handleNavigate('generic', { id: task.genericId, loc: task.genericLoc });
    }
  };

  // ----------------------------------------------------
  // Category Management Handlers
  // ----------------------------------------------------
  const handleAddCategory = (newCat: TaskCategory) => {
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const handleDeleteCategory = (catId: string) => {
    setState((prev) => {
      const newCats = prev.categories.filter((c) => c.id !== catId);
      const fallbackCat = newCats[0]?.id || 'cat_hw';

      // Reassign affected tasks in all nodes to fallback category
      const copy = { ...prev, categories: newCats };
      // Subjects
      for (const sId of Object.keys(copy.subjects)) {
        const sData = copy.subjects[sId];
        const newAssignments = sData.assignments.map((asg) => ({
          ...asg,
          tasks: asg.tasks.map((t) => (t.categoryId === catId ? { ...t, categoryId: fallbackCat } : t)),
        }));
        copy.subjects[sId] = { ...sData, assignments: newAssignments };
      }
      // Fengshui
      copy.fengshui = {
        ...copy.fengshui,
        tasks: copy.fengshui.tasks.map((t) => (t.categoryId === catId ? { ...t, categoryId: fallbackCat } : t)),
      };
      // Generic
      for (const gId of Object.keys(copy.genericNodes)) {
        const gData = copy.genericNodes[gId];
        copy.genericNodes[gId] = {
          ...gData,
          tasks: (gData.tasks || []).map((t) => (t.categoryId === catId ? { ...t, categoryId: fallbackCat } : t)),
        };
      }
      return copy;
    });
  };

  // ----------------------------------------------------
  // Backup / Export / Reset Handlers
  // ----------------------------------------------------
  const handleExportData = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schedule_Planner_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && parsed.subjects) {
          setState(parsed);
          setSaveStatus('Data imported');
        } else {
          setSaveStatus('Invalid file format');
        }
      } catch (err) {
        setSaveStatus('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    const fresh = getDefaultPlannerState();
    setState(fresh);
    setSaveStatus('Reset to default');
  };

  // Custom node management for Home
  const handleAddHomeCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeTitle.trim()) return;
    const accentInfo = getNextAccent((state.home.customNodes?.length || 0) + 3);
    const id = generateId('home_node');
    const newNode: CustomNodeInfo = {
      id,
      title: newHomeTitle.trim(),
      accent: accentInfo.accent,
    };
    setState((prev) => ({
      ...prev,
      home: { customNodes: [...(prev.home.customNodes || []), newNode] },
      genericNodes: {
        ...prev.genericNodes,
        [id]: { due: '', timetable: [{ day: '', time: '', venue: '' }], tasks: [] },
      },
    }));
    setNewHomeTitle('');
    setHomeAdding(false);
  };

  const handleDeleteHomeCustomNode = (nodeId: string) => {
    setState((prev) => {
      const newNodes = (prev.home.customNodes || []).filter((n) => n.id !== nodeId);
      const newGeneric = { ...prev.genericNodes };
      delete newGeneric[nodeId];
      return {
        ...prev,
        home: { customNodes: newNodes },
        genericNodes: newGeneric,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans antialiased px-4 sm:px-6 py-6 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header & Global Quote */}
        <Header
          currentPage={view.page}
          onNavigate={(page) => handleNavigate(page)}
          onNavigateHome={() => handleNavigate('home')}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onResetData={handleResetData}
          totalPendingP1Count={totalPendingP1Count}
          cloudStatus={cloudStatus}
          lastSyncedTime={lastSyncedTime}
          onManualSync={handleManualSync}
        />

        {/* Breadcrumb Navigation Trail */}
        <Breadcrumbs
          view={view}
          subjects={allSubjects}
          customSchoolNodes={state.school.customNodes || []}
          customWorkNodes={state.work.customNodes || []}
          customHomeNodes={state.home.customNodes || []}
          onNavigate={(page, extra) => handleNavigate(page, extra)}
        />

        {/* MAIN PAGE ROUTER */}
        <main>
          {/* 1. HOME VIEW */}
          {view.page === 'home' && (
            <div className="space-y-6 text-left">
              {/* Monthly Overview Timetable */}
              <MonthlyTimetable
                state={state}
                scope="all"
                title="Monthly Overview"
                id="homeMonthlyPanel"
              />

              {/* Top Level Category Navigation Tiles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <div>
                    <h2 className="font-serif font-bold text-xl text-[var(--ink)]">
                      Notebook Sections
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* School Tile */}
                  <div
                    onClick={() => handleNavigate('school')}
                    style={{ borderTopColor: getPaletteColor('c_teal').hex }}
                    className="group border border-[var(--line)] border-t-4 bg-[var(--paper-deep)] p-5 rounded-xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-black/25 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center border"
                          style={{
                            backgroundColor: getPaletteColor('c_teal').bg,
                            borderColor: getPaletteColor('c_teal').border,
                            color: getPaletteColor('c_teal').badgeText,
                          }}
                        >
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs text-[var(--ink-soft)] flex items-center gap-1 group-hover:text-[var(--ink)]">
                          <span>Enter</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                      <h2 className="font-serif font-bold text-2xl text-[var(--ink)]">School</h2>
                    </div>
                  </div>

                  {/* Work Tile */}
                  <div
                    onClick={() => handleNavigate('work')}
                    style={{ borderTopColor: getPaletteColor('c_ochre').hex }}
                    className="group border border-[var(--line)] border-t-4 bg-[var(--paper-deep)] p-5 rounded-xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-black/25 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center border"
                          style={{
                            backgroundColor: getPaletteColor('c_ochre').bg,
                            borderColor: getPaletteColor('c_ochre').border,
                            color: getPaletteColor('c_ochre').badgeText,
                          }}
                        >
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs text-[var(--ink-soft)] flex items-center gap-1 group-hover:text-[var(--ink)]">
                          <span>Enter</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                      <h2 className="font-serif font-bold text-2xl text-[var(--ink)]">Work</h2>
                    </div>
                  </div>

                  {/* Custom Home Nodes */}
                  {(state.home.customNodes || []).map((node) => {
                    const nodeCol = getPaletteColor(node.accent);
                    return (
                      <div
                        key={node.id}
                        onClick={() => handleNavigate('generic', { id: node.id, loc: 'home' })}
                        style={{ borderTopColor: nodeCol.hex }}
                        className="group border border-[var(--line)] border-t-4 bg-[var(--paper-deep)] p-5 rounded-xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-black/25 transition-all cursor-pointer relative flex flex-col justify-between"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHomeCustomNode(node.id);
                          }}
                          className="absolute top-3 right-3 text-[var(--ink-soft)] hover:text-[var(--brick)] p-1 transition-colors cursor-pointer"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center border"
                              style={{
                                backgroundColor: nodeCol.bg,
                                borderColor: nodeCol.border,
                                color: nodeCol.badgeText,
                              }}
                            >
                              <Tag className="w-4 h-4" />
                            </div>
                            <span className="font-mono text-xs text-[var(--ink-soft)] flex items-center gap-1 group-hover:text-[var(--ink)]">
                              <span>Enter</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                          <h2 className="font-serif font-bold text-2xl text-[var(--ink)]">
                            {node.title}
                          </h2>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Custom Home Category Form or Button */}
                  {homeAdding ? (
                    <form
                      onSubmit={handleAddHomeCustomNode}
                      className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 rounded-xl flex flex-col justify-between gap-3 text-left shadow-xs"
                    >
                      <div className="space-y-2">
                        <span className="font-mono text-xs text-[var(--ink)] font-bold block uppercase tracking-wider">
                          New Home Category
                        </span>
                        <input
                          type="text"
                          value={newHomeTitle}
                          onChange={(e) => setNewHomeTitle(e.target.value)}
                          placeholder="e.g. Finances, Hobbies, Reading..."
                          autoFocus
                          className="w-full text-xs p-2 bg-white border border-[var(--line)] rounded-lg text-[var(--ink)] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setHomeAdding(false)}
                          className="flex-1 text-xs font-mono py-1.5 border border-[var(--line)] rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] bg-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newHomeTitle.trim()}
                          className="flex-1 text-xs font-mono py-1.5 bg-[var(--ink)] text-white rounded-lg hover:opacity-90 disabled:opacity-40 cursor-pointer"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHomeAdding(true)}
                      className="min-h-[170px] border border-dashed border-[var(--line)] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] hover:bg-white/50 transition-all cursor-pointer"
                    >
                      <Plus className="w-6 h-6 text-[var(--teal)]" />
                      <span className="font-mono text-xs font-semibold">+ Add Home Category</span>
                      <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                        Add a new custom notebook section
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. PRIORITY MATRIX VIEW */}
          {view.page === 'matrix' && (
            <PriorityMatrixView
              tasks={globalTasks}
              categories={state.categories}
              onToggleTask={handleToggleGlobalTask}
              onUpdateTaskText={handleUpdateGlobalTaskText}
              onUpdateTaskPriority={handleUpdateGlobalTaskPriority}
              onUpdateTaskCategory={handleUpdateGlobalTaskCategory}
              onUpdateTaskDue={handleUpdateGlobalTaskDue}
              onDeleteTask={handleDeleteGlobalTask}
              onNavigateToSource={handleNavigateToSource}
              onQuickAddTask={handleMatrixQuickAdd}
            />
          )}

          {/* 3. ALL TASKS VIEW */}
          {view.page === 'all-tasks' && (
            <AllTasksView
              tasks={globalTasks}
              categories={state.categories}
              onToggleTask={handleToggleGlobalTask}
              onUpdateTaskText={handleUpdateGlobalTaskText}
              onUpdateTaskPriority={handleUpdateGlobalTaskPriority}
              onUpdateTaskCategory={handleUpdateGlobalTaskCategory}
              onUpdateTaskDue={handleUpdateGlobalTaskDue}
              onDeleteTask={handleDeleteGlobalTask}
              onNavigateToSource={handleNavigateToSource}
            />
          )}

          {/* 4. SCHOOL / ASSIGNMENT VIEW */}
          {(view.page === 'school' || view.page === 'assignment') && (
            <SchoolView
              state={state}
              onSelectSubject={(sId) => handleNavigate('subject', { id: sId })}
              onAddCustomSubject={(newSubj) => {
                setState((prev) => {
                  const currentCourses = prev.courses || [...BASE_SUBJECTS, ...(prev.customSubjects || [])];
                  return {
                    ...prev,
                    courses: [...currentCourses, newSubj],
                    customSubjects: [...(prev.customSubjects || []), newSubj],
                    subjects: {
                      ...prev.subjects,
                      [newSubj.id]: {
                        timetable: [{ day: '', time: '', venue: '', remark: '' }],
                        assignments: [
                          {
                            id: generateId('asg'),
                            title: 'Assignment 1',
                            type: 'assignment',
                            due: '',
                            priority: 'p2',
                            tasks: [],
                          },
                        ],
                      },
                    },
                  };
                });
              }}
              onDeleteSubject={(sId) => {
                setState((prev) => {
                  const currentCourses = prev.courses && prev.courses.length > 0
                    ? prev.courses
                    : [...BASE_SUBJECTS, ...(prev.customSubjects || [])];
                  const courseIds = new Set(currentCourses.map((c) => c.id));
                  const extraCustom = (prev.customSubjects || []).filter((s) => !courseIds.has(s.id));
                  const fullList = [...currentCourses, ...extraCustom];

                  const newCourses = fullList.filter((s) => s.id !== sId && s.title !== sId && s.code !== sId);
                  const newCustom = (prev.customSubjects || []).filter((s) => s.id !== sId && s.title !== sId && s.code !== sId);
                  const newSubs = { ...prev.subjects };
                  delete newSubs[sId];
                  // In case subjects was keyed by code or title
                  Object.keys(newSubs).forEach((key) => {
                    if (key === sId) delete newSubs[key];
                  });

                  return {
                    ...prev,
                    courses: newCourses,
                    customSubjects: newCustom,
                    subjects: newSubs,
                  };
                });
                if (view.page === 'subject' && view.id === sId) {
                  handleNavigate('school');
                }
              }}
              onUpdateSubjectColor={(sId, colorId) => {
                setState((prev) => {
                  const currentCourses = prev.courses || [...BASE_SUBJECTS, ...(prev.customSubjects || [])];
                  const updatedCourses = currentCourses.map((s) =>
                    s.id === sId ? { ...s, accent: colorId } : s
                  );
                  const customList = (prev.customSubjects || []).map((s) =>
                    s.id === sId ? { ...s, accent: colorId } : s
                  );
                  return {
                    ...prev,
                    courses: updatedCourses,
                    customSubjects: customList,
                  };
                });
              }}
            />
          )}

          {/* 5. SUBJECT DETAIL VIEW */}
          {view.page === 'subject' && view.id && (
            (() => {
              const subjMeta = allSubjects.find((s) => s.id === view.id);
              const subjData = state.subjects[view.id] || { timetable: [], assignments: [] };
              if (!subjMeta) {
                return (
                  <div className="p-8 text-center font-mono text-xs text-[var(--ink-soft)]">
                    Course not found.
                    <button
                      onClick={() => handleNavigate('school')}
                      className="underline text-[var(--ink)] ml-1"
                    >
                      Return to Courses
                    </button>
                  </div>
                );
              }

              return (
                <SubjectDetailView
                  subject={subjMeta}
                  data={subjData}
                  categories={state.categories}
                  fullPlannerState={state}
                  onUpdateTimetable={(newTt) => {
                    setState((prev) => ({
                      ...prev,
                      subjects: {
                        ...prev.subjects,
                        [subjMeta.id]: {
                          ...(prev.subjects[subjMeta.id] || { assignments: [] }),
                          timetable: newTt,
                        },
                      },
                    }));
                  }}
                  onUpdateAssignments={(newAsg) => {
                    setState((prev) => ({
                      ...prev,
                      subjects: {
                        ...prev.subjects,
                        [subjMeta.id]: {
                          ...(prev.subjects[subjMeta.id] || { timetable: [] }),
                          assignments: newAsg,
                        },
                      },
                    }));
                  }}
                  onDeleteSubject={() => {
                    setState((prev) => {
                      const currentCourses = prev.courses && prev.courses.length > 0
                        ? prev.courses
                        : [...BASE_SUBJECTS, ...(prev.customSubjects || [])];
                      const courseIds = new Set(currentCourses.map((c) => c.id));
                      const extraCustom = (prev.customSubjects || []).filter((s) => !courseIds.has(s.id));
                      const fullList = [...currentCourses, ...extraCustom];

                      const newCourses = fullList.filter(
                        (s) => s.id !== subjMeta.id && s.title !== subjMeta.title && s.code !== subjMeta.code
                      );
                      const newCustom = (prev.customSubjects || []).filter(
                        (s) => s.id !== subjMeta.id && s.title !== subjMeta.title && s.code !== subjMeta.code
                      );
                      const newSubs = { ...prev.subjects };
                      delete newSubs[subjMeta.id];
                      return {
                        ...prev,
                        courses: newCourses,
                        customSubjects: newCustom,
                        subjects: newSubs,
                      };
                    });
                    handleNavigate('school');
                  }}
                />
              );
            })()
          )}

          {/* 6. WORK VIEW */}
          {view.page === 'work' && (
            <WorkView
              state={state}
              onNavigate={(pg, extra) => handleNavigate(pg as PageType, extra as any)}
              onAddCustomNode={(newNode) => {
                setState((prev) => ({
                  ...prev,
                  work: { customNodes: [...(prev.work.customNodes || []), newNode] },
                  genericNodes: {
                    ...prev.genericNodes,
                    [newNode.id]: {
                      due: '',
                      timetable: [{ day: '', time: '', venue: '' }],
                      tasks: [],
                    },
                  },
                }));
              }}
              onDeleteCustomNode={(nodeId) => {
                setState((prev) => {
                  const newNodes = (prev.work.customNodes || []).filter((n) => n.id !== nodeId);
                  const newGeneric = { ...prev.genericNodes };
                  delete newGeneric[nodeId];
                  return {
                    ...prev,
                    work: { customNodes: newNodes },
                    genericNodes: newGeneric,
                  };
                });
              }}
              onUpdateWorkColor={(key, colorId) => {
                setState((prev) => ({
                  ...prev,
                  [key]: {
                    ...prev[key],
                    color: colorId,
                  },
                }));
              }}
            />
          )}

          {/* PERSONAL VIEW */}
          {view.page === 'personal' && state.personal && (
            <PersonalView
              personal={state.personal}
              categories={state.categories}
              fullPlannerState={state}
              onUpdatePersonal={(updated) => {
                setState((prev) => ({ ...prev, personal: updated }));
              }}
              onUpdatePersonalColor={(colId) => {
                setState((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, color: colId },
                }));
              }}
            />
          )}

          {/* 7. EASYSPACE DETAIL */}
          {view.page === 'easyspace' && (
            <EasySpaceDetail
              hours={state.easyspace.hours}
              events={state.easyspace.events}
              colorHex={getPaletteColor(state.easyspace.color || 'c_ochre').hex}
              onUpdateHours={(newHours) => {
                setState((prev) => ({
                  ...prev,
                  easyspace: { ...prev.easyspace, hours: newHours },
                }));
              }}
              onUpdateEvents={(newEvents) => {
                setState((prev) => ({
                  ...prev,
                  easyspace: { ...prev.easyspace, events: newEvents },
                }));
              }}
              onBackToWork={() => handleNavigate('work')}
            />
          )}

          {/* 8. FENGSHUI DETAIL */}
          {view.page === 'fengshui' && (
            <FengshuiDetail
              progress={state.fengshui.progress}
              tasks={state.fengshui.tasks}
              categories={state.categories}
              onUpdateProgress={(progress) => {
                setState((prev) => ({
                  ...prev,
                  fengshui: { ...prev.fengshui, progress },
                }));
              }}
              onUpdateTasks={(newTasks) => {
                setState((prev) => ({
                  ...prev,
                  fengshui: { ...prev.fengshui, tasks: newTasks },
                }));
              }}
            />
          )}

          {/* 9. GENERIC CUSTOM PROJECT DETAIL */}
          {view.page === 'generic' && view.id && (
            (() => {
              const loc = view.loc || 'work';
              const node = state[loc].customNodes.find((n) => n.id === view.id);
              const data = state.genericNodes[view.id] || {
                due: '',
                timetable: [],
                tasks: [],
              };

              if (!node) {
                return (
                  <div className="p-8 text-center font-mono text-xs text-[var(--ink-soft)]">
                    Page not found or has been removed.
                    <button
                      onClick={() => handleNavigate(loc)}
                      className="underline text-[var(--ink)] ml-1"
                    >
                      Return to previous section
                    </button>
                  </div>
                );
              }

              return (
                <GenericProjectDetail
                  node={node}
                  data={data}
                  categories={state.categories}
                  onUpdateDue={(due) => {
                    setState((prev) => ({
                      ...prev,
                      genericNodes: {
                        ...prev.genericNodes,
                        [node.id]: {
                          ...(prev.genericNodes[node.id] || { timetable: [], tasks: [] }),
                          due,
                        },
                      },
                    }));
                  }}
                  onUpdateTimetable={(timetable) => {
                    setState((prev) => ({
                      ...prev,
                      genericNodes: {
                        ...prev.genericNodes,
                        [node.id]: {
                          ...(prev.genericNodes[node.id] || { due: '', tasks: [] }),
                          timetable,
                        },
                      },
                    }));
                  }}
                  onUpdateTasks={(tasks) => {
                    setState((prev) => ({
                      ...prev,
                      genericNodes: {
                        ...prev.genericNodes,
                        [node.id]: {
                          ...(prev.genericNodes[node.id] || { due: '', timetable: [] }),
                          tasks,
                        },
                      },
                    }));
                  }}
                  onDeleteNode={() => {
                    setState((prev) => {
                      const newNodes = prev[loc].customNodes.filter((n) => n.id !== node.id);
                      const newGeneric = { ...prev.genericNodes };
                      delete newGeneric[node.id];
                      return {
                        ...prev,
                        [loc]: { customNodes: newNodes },
                        genericNodes: newGeneric,
                      };
                    });
                    handleNavigate(loc);
                  }}
                />
              );
            })()
          )}
        </main>

        {/* Footer Note */}
        <footer className="mt-14 pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[var(--ink-soft)] gap-2">
          <span>Schedule Planner</span>
          <span className="opacity-80">{saveStatus}</span>
        </footer>

        {/* Manage Categories Modal */}
        <ManageCategoriesModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={state.categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          categoryUsageCount={categoryUsageCount}
        />
      </div>
    </div>
  );
}
