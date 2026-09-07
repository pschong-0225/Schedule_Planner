import { BASE_SUBJECTS, DAYS, DEFAULT_CATEGORIES } from './constants';
import { PlannerState } from '../types';

let idSeed = 1000;
export function generateId(prefix: string = 'id'): string {
  idSeed++;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}_${idSeed}`;
}

export function getDefaultPlannerState(): PlannerState {
  const subjects: PlannerState['subjects'] = {};

  BASE_SUBJECTS.forEach((subj, idx) => {
    if (subj.id === 'MGT3220') {
      subjects[subj.id] = {
        timetable: [
          { day: 'Tuesday', time: '10:00–12:00', venue: 'Hall A' },
          { day: 'Thursday', time: '14:00–16:00', venue: 'Room 302' },
        ],
        assignments: [
          {
            id: generateId('asg'),
            title: 'Case Study 1: Cross-cultural Negotiations',
            type: 'assignment',
            due: '2026-09-18',
            priority: 'p1',
            tasks: [
              {
                id: generateId('tsk'),
                text: 'Read Hofstede Cultural Dimensions foundational papers',
                done: true,
                priority: 'p2',
                categoryId: 'cat_reading',
                createdAt: new Date().toISOString(),
              },
              {
                id: generateId('tsk'),
                text: 'Compile multinational M&A communication case dataset',
                done: false,
                priority: 'p1',
                categoryId: 'cat_hw',
                due: '2026-09-15',
                createdAt: new Date().toISOString(),
              },
              {
                id: generateId('tsk'),
                text: 'Draft 1,500-word case brief and submit initial draft',
                done: false,
                priority: 'p1',
                categoryId: 'cat_paper',
                due: '2026-09-18',
                createdAt: new Date().toISOString(),
              }
            ]
          },
          {
            id: generateId('asg'),
            title: 'Midterm Knowledge Evaluation Quiz',
            type: 'quiz',
            due: '2026-09-25',
            priority: 'p1',
            tasks: [
              {
                id: generateId('tsk'),
                text: 'Summarize Chapters 1-4 lecture notes and build mind map',
                done: false,
                priority: 'p2',
                categoryId: 'cat_exam',
                due: '2026-09-24',
                createdAt: new Date().toISOString(),
              }
            ]
          }
        ]
      };
    } else if (subj.id === 'HRM3204') {
      subjects[subj.id] = {
        timetable: [
          { day: 'Monday', time: '09:00–11:00', venue: 'Lecture Theatre 2' }
        ],
        assignments: [
          {
            id: generateId('asg'),
            title: 'Team Presentation: Remote Workforce Motivation',
            type: 'project',
            due: '2026-09-22',
            priority: 'p2',
            tasks: [
              {
                id: generateId('tsk'),
                text: 'Virtual sync with team to finalize core thesis topic',
                done: true,
                priority: 'p2',
                categoryId: 'cat_group',
                createdAt: new Date().toISOString(),
              },
              {
                id: generateId('tsk'),
                text: 'Draft slide deck structure and split speaker sections',
                done: false,
                priority: 'p2',
                categoryId: 'cat_group',
                due: '2026-09-20',
                createdAt: new Date().toISOString(),
              },
              {
                id: generateId('tsk'),
                text: 'Prepare Q&A defense answers and backup data',
                done: false,
                priority: 'p3',
                categoryId: 'cat_exam',
                due: '2026-09-22',
                createdAt: new Date().toISOString(),
              }
            ]
          }
        ]
      };
    } else {
      subjects[subj.id] = {
        timetable: [
          { day: DAYS[(idx + 1) % 5], time: '14:00–16:00', venue: 'Room 20' + (idx + 1) }
        ],
        assignments: [
          {
            id: generateId('asg'),
            title: `Milestone 1: Unit ${idx + 1} Review`,
            type: 'assignment',
            due: '2026-09-28',
            priority: 'p2',
            tasks: [
              {
                id: generateId('tsk'),
                text: 'Complete weekly seminar questions and discussion prompts',
                done: false,
                priority: 'p3',
                categoryId: 'cat_hw',
                due: '2026-09-27',
                createdAt: new Date().toISOString(),
              }
            ]
          }
        ]
      };
    }
  });

  return {
    subjects,
    customSubjects: [],
    home: { customNodes: [] },
    school: { customNodes: [] },
    work: { customNodes: [] },
    personal: {
      color: 'sage',
      timetable: [
        { day: 'Monday', time: '07:30–08:30', venue: 'Morning walk & meditation' },
        { day: 'Wednesday', time: '18:30–19:30', venue: 'Fitness & mobility workout' },
        { day: 'Saturday', time: '10:00–11:30', venue: 'Deep reading & weekly journaling' },
        { day: 'Sunday', time: '20:00–21:00', venue: 'Weekly reflection & goal planning' },
      ],
      tasks: [
        {
          id: generateId('per_tsk'),
          text: 'Review monthly personal budget & savings target',
          done: false,
          priority: 'p2',
          categoryId: 'cat_life',
          due: '2026-09-26',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId('per_tsk'),
          text: 'Declutter workspace and organize desk stationery',
          done: true,
          priority: 'p3',
          categoryId: 'cat_life',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId('per_tsk'),
          text: 'Schedule annual health checkup appointment',
          done: false,
          priority: 'p1',
          categoryId: 'cat_life',
          due: '2026-09-19',
          createdAt: new Date().toISOString(),
        }
      ]
    },
    genericNodes: {},
    easyspace: {
      color: 'ochre',
      hours: [
        { id: generateId('hr'), day: 'Monday', date: '2026-09-15', time: '09:00–18:00', remark: 'Studio duty & member check-in' },
        { id: generateId('hr'), day: 'Tuesday', date: '2026-09-16', time: '09:00–18:00', remark: 'Inventory audit & vendor coordination' },
        { id: generateId('hr'), day: 'Wednesday', date: '2026-09-17', time: '09:00–18:00', remark: 'Facility maintenance & desk rotation' },
        { id: generateId('hr'), day: 'Thursday', date: '2026-09-18', time: '09:00–18:00', remark: 'Operations team sync' },
        { id: generateId('hr'), day: 'Friday', date: '2026-09-19', time: '09:00–17:00', remark: 'Weekly wrap-up & reporting' },
        { id: generateId('hr'), day: 'Saturday', date: '', time: 'Flexible / On-call', remark: 'Event standby if needed' },
        { id: generateId('hr'), day: 'Sunday', date: '', time: 'Off Duty', remark: 'Rest day' },
      ],
      events: [
        {
          id: generateId('ev'),
          date: '2026-09-20',
          requirement: 'Autumn Co-working Design Salon: prepare 15-min showcase slides and test display projector.',
        },
        {
          id: generateId('ev'),
          date: '2026-09-30',
          requirement: 'Quarterly operations review: reconcile monthly traffic metrics and invoice filings.',
        }
      ]
    },
    fengshui: {
      color: 'plum',
      progress: 40,
      tasks: [
        {
          id: generateId('fs'),
          text: 'Adjust desk orientation towards natural daylight and position indoor plant',
          done: true,
          priority: 'p3',
          categoryId: 'cat_life',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId('fs'),
          text: 'Clear visual clutter from office corners to encourage focused Qi flow',
          done: true,
          priority: 'p2',
          categoryId: 'cat_life',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId('fs'),
          text: 'Select gentle warm-white eye-safe reading lamp for evening study',
          done: false,
          priority: 'p4',
          categoryId: 'cat_life',
          due: '2026-09-24',
          createdAt: new Date().toISOString(),
        }
      ]
    },
    categories: [...DEFAULT_CATEGORIES],
    courses: [...BASE_SUBJECTS]
  };
}
