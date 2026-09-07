import { AssignmentTemplate, PriorityLevel, PriorityMeta, Quote, SubjectMeta, TaskCategory } from '../types';
import { PALETTE_COLORS } from './colors';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PRIORITIES: Record<PriorityLevel, PriorityMeta> = {
  p1: {
    level: 'p1',
    label: 'Urgent & Important',
    quadrantName: 'Quadrant I · Do First',
    quadrantAction: 'Do First',
    tagText: 'P1 · Urgent',
    colorVar: '#9B3C30',
    bgVar: '#F5E3E0',
    borderVar: '#CE8B82',
    badgeBg: '#F5E3E0',
    badgeText: '#772B21',
    badgeBorder: '#CE8B82',
    description: 'Strict deadlines, exams, or high-impact tasks'
  },
  p2: {
    level: 'p2',
    label: 'Important, Not Urgent',
    quadrantName: 'Quadrant II · Schedule',
    quadrantAction: 'Schedule',
    tagText: 'P2 · Important',
    colorVar: '#A37227',
    bgVar: '#F4ECE0',
    borderVar: '#CEB07D',
    badgeBg: '#F4ECE0',
    badgeText: '#775116',
    badgeBorder: '#CEB07D',
    description: 'Long-term goals, study review, research, and self-growth'
  },
  p3: {
    level: 'p3',
    label: 'Urgent, Not Important',
    quadrantName: 'Quadrant III · Delegate',
    quadrantAction: 'Delegate',
    tagText: 'P3 · Quick Task',
    colorVar: '#3E576F',
    bgVar: '#E0E7EE',
    borderVar: '#92A6BA',
    badgeBg: '#E0E7EE',
    badgeText: '#2A3C4E',
    badgeBorder: '#92A6BA',
    description: 'Short errands, administrative follow-ups, minor chores'
  },
  p4: {
    level: 'p4',
    label: 'Low Priority / Memo',
    quadrantName: 'Quadrant IV · Backlog',
    quadrantAction: 'Backlog',
    tagText: 'P4 · Backlog',
    colorVar: '#424546',
    bgVar: '#E8E8E7',
    borderVar: '#9CA0A1',
    badgeBg: '#E8E8E7',
    badgeText: '#2B2D2E',
    badgeBorder: '#9CA0A1',
    description: 'Ideas, reference notes, or low-demand reminders'
  }
};

export const DEFAULT_CATEGORIES: TaskCategory[] = [
  { id: 'cat_hw', name: 'Coursework', icon: '📝', color: 'teal', isDefault: true },
  { id: 'cat_exam', name: 'Exam Prep', icon: '📚', color: 'brick', isDefault: true },
  { id: 'cat_group', name: 'Team Project', icon: '👥', color: 'slate', isDefault: true },
  { id: 'cat_paper', name: 'Paper & Essay', icon: '📄', color: 'terracotta', isDefault: true },
  { id: 'cat_reading', name: 'Reading', icon: '📖', color: 'moss', isDefault: true },
  { id: 'cat_work', name: 'Work Duty', icon: '💼', color: 'ochre', isDefault: true },
  { id: 'cat_admin', name: 'Admin & Routine', icon: '📎', color: 'lavender', isDefault: true },
  { id: 'cat_life', name: 'Life & Habits', icon: '🌿', color: 'sage', isDefault: true }
];

export const BASE_SUBJECTS: SubjectMeta[] = [
  { id: 'MGT3220', code: 'MGT3220', title: 'Cross Cultural Management', accent: 'teal', accentSoft: 'teal' },
  { id: 'HRM3204', code: 'HRM3204', title: 'Managing People', accent: 'slate', accentSoft: 'slate' },
  { id: 'ENL2221', code: 'ENL2221', title: 'English For Business Studies 2', accent: 'moss', accentSoft: 'moss' },
  { id: 'MGT3225', code: 'MGT3225', title: 'Business Ethics', accent: 'terracotta', accentSoft: 'terracotta' },
  { id: 'MPU3193', code: 'MPU3193', title: 'Philosophy', accent: 'plum', accentSoft: 'plum' },
];

export function getNextAccent(index: number) {
  const p = PALETTE_COLORS[index % PALETTE_COLORS.length];
  return { accent: p.id, accentSoft: p.id, hex: p.hex };
}

export const ACCENT_CYCLE = [
  { accent: 'teal', label: 'Teal' },
  { accent: 'slate', label: 'Slate' },
  { accent: 'brick', label: 'Brick' },
  { accent: 'terracotta', label: 'Terracotta' },
  { accent: 'moss', label: 'Moss' },
  { accent: 'plum', label: 'Plum' },
  { accent: 'ochre', label: 'Ochre' },
  { accent: 'sage', label: 'Sage' },
  { accent: 'rose', label: 'Rose' },
  { accent: 'lavender', label: 'Lavender' },
];

export const ASSIGNMENT_TEMPLATES: AssignmentTemplate[] = [
  { key: 'assignment', label: 'Assignment', icon: '📝', defaultPriority: 'p2', defaultCategoryId: 'cat_hw' },
  { key: 'exam', label: 'Exam', icon: '📚', defaultPriority: 'p1', defaultCategoryId: 'cat_exam' },
  { key: 'quiz', label: 'Quiz', icon: '🧪', defaultPriority: 'p1', defaultCategoryId: 'cat_exam' },
  { key: 'project', label: 'Team Project', icon: '👥', defaultPriority: 'p2', defaultCategoryId: 'cat_group' },
  { key: 'reading', label: 'Reading Review', icon: '📖', defaultPriority: 'p3', defaultCategoryId: 'cat_reading' },
  { key: 'custom', label: 'Custom Milestone', icon: '✏️', defaultPriority: 'p3', defaultCategoryId: 'cat_hw' },
];

export const QUOTES: Quote[] = [
  { main: "Take it slow — you're doing much better than you think.", sub: "Every steady step forward shapes meaningful progress." },
  { main: "A little progress each day adds up to big results.", sub: "Focus on what is right in front of you today." },
  { main: "Rest is not wasted time; it is fuel for the journey ahead.", sub: "Give your mind the quiet space it deserves." },
  { main: "You don't need to be flawless to begin — you just need to start.", sub: "Clarity comes from deliberate action, not waiting." },
  { main: "Breathe deeply. One thing at a time, and it will all get done.", sub: "Prioritize what matters most and let the rest unfold." },
  { main: "Honor your own pace. There is no need to compare with anyone else.", sub: "Your consistent cadence is your greatest strength." },
  { main: "Celebrate the quiet discipline that nobody else sees.", sub: "Small daily habits build enduring accomplishments." },
  { main: "Focus on continuous progress, not unattainable perfection.", sub: "Done with care is always better than perfect in imagination." },
  { main: "When you feel weary, remember how many hurdles you have already overcome.", sub: "You have the resilience to see this through." },
  { main: "Today's thoughtful planning is tomorrow's peace of mind.", sub: "Organizing your hours creates freedom for what you love." },
  { main: "Energy flows where mindful intention goes.", sub: "Choose where your focus belongs and protect that focus." },
  { main: "Be patient with your learning curve. Mastery takes time.", sub: "Every challenge faced today is tomorrow's wisdom." },
  { main: "Clear your desk, take a calm breath, and begin with step one.", sub: "Simplicity brings clarity and natural momentum." },
  { main: "Small wins quietly compound into extraordinary chapters.", sub: "Keep moving steadily, one gentle step at a time." }
];

