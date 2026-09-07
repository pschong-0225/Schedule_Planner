export type PriorityLevel = 'p1' | 'p2' | 'p3' | 'p4';

export interface PriorityMeta {
  level: PriorityLevel;
  label: string;
  quadrantName: string;
  quadrantAction: string;
  tagText: string;
  colorVar: string;
  bgVar: string;
  borderVar: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  icon: string;
  color: string; // e.g. 'teal' | 'slate' | 'moss' | 'clay' | 'ochre' | 'plum' | 'brick'
  isDefault?: boolean;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: PriorityLevel;
  categoryId: string; // references TaskCategory.id
  due?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AssignmentTemplate {
  key: 'assignment' | 'exam' | 'quiz' | 'project' | 'reading' | 'custom';
  label: string;
  icon: string;
  defaultPriority?: PriorityLevel;
  defaultCategoryId?: string;
}

export interface Assignment {
  id: string;
  title: string;
  type: string;
  due: string;
  priority?: PriorityLevel;
  tasks: Task[];
}

export interface TimetableRow {
  day: string;
  time: string;
  venue: string;
  remark?: string;
}

export interface SubjectMeta {
  id: string;
  code: string;
  title: string;
  accent: string;
  accentSoft: string;
  isCustom?: boolean;
}

export interface SubjectData {
  timetable: TimetableRow[];
  assignments: Assignment[];
}

export interface WorkHour {
  id: string;
  day: string;
  date?: string;
  time: string;
  remark?: string;
}

export interface WorkEvent {
  id: string;
  date: string;
  requirement: string;
}

export interface CustomNodeInfo {
  id: string;
  title: string;
  accent: string;
}

export interface GenericNodeData {
  due: string;
  timetable: TimetableRow[];
  tasks: Task[];
}

export interface Quote {
  main: string;
  sub: string;
}

export interface PersonalSection {
  color: string;
  timetable: TimetableRow[];
  tasks: Task[];
  customNodes?: CustomNodeInfo[];
}

export interface PlannerState {
  subjects: Record<string, SubjectData>;
  customSubjects: SubjectMeta[];
  courses?: SubjectMeta[];
  home: { customNodes: CustomNodeInfo[] };
  school: { customNodes: CustomNodeInfo[] };
  work: { customNodes: CustomNodeInfo[] };
  personal: PersonalSection;
  genericNodes: Record<string, GenericNodeData>;
  easyspace: {
    color?: string;
    hours: WorkHour[];
    events: WorkEvent[];
  };
  fengshui: {
    color?: string;
    progress: number;
    tasks: Task[];
  };
  categories: TaskCategory[];
}

export type PageType = 
  | 'home' 
  | 'school' 
  | 'assignment' 
  | 'subject' 
  | 'work' 
  | 'easyspace' 
  | 'fengshui' 
  | 'personal'
  | 'generic'
  | 'matrix'
  | 'all-tasks';

export interface ViewState {
  page: PageType;
  id?: string;
  loc?: 'home' | 'school' | 'work' | 'personal';
}

export interface GlobalTaskItem extends Task {
  sourceType: 'subject' | 'fengshui' | 'personal' | 'generic';
  sourceTitle: string;
  sourceCode?: string;
  sourceAccent: string;
  assignmentId?: string;
  subjectId?: string;
  genericLoc?: 'home' | 'school' | 'work' | 'personal';
  genericId?: string;
}
