import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Subject,
  ClassSchedule, 
  AttendanceRecord, 
  Assignment, 
  ClassEvent,
  AttendanceStatus,
  AssignmentStatus 
} from '../types';

interface StoreState {
  // Data
  subjects: Subject[];
  classes: ClassSchedule[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  events: ClassEvent[];
  semesterStartDate: string | null;
  semesterEndDate: string | null;
  isSetupComplete: boolean;

  // Subject actions
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Class actions
  addClass: (classItem: ClassSchedule) => void;
  updateClass: (id: string, classItem: Partial<ClassSchedule>) => void;
  deleteClass: (id: string) => void;
  
  // Attendance actions
  markAttendance: (classId: string, date: string, status: AttendanceStatus, note?: string) => void;
  updateAttendance: (id: string, status: AttendanceStatus, note?: string) => void;
  
  // Assignment actions
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  updateAssignmentStatus: (id: string, status: AssignmentStatus) => void;
  
  // Event actions
  addEvent: (event: ClassEvent) => void;
  updateEvent: (id: string, event: Partial<ClassEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Setup actions
  setSemesterDates: (startDate: string, endDate: string) => void;
  completeSetup: () => void;
  resetApp: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      subjects: [],
      classes: [],
      attendance: [],
      assignments: [],
      events: [],
      semesterStartDate: null,
      semesterEndDate: null,
      isSetupComplete: false,

      // Subject actions
      addSubject: (subject) =>
        set((state) => ({
          subjects: [...state.subjects, { ...subject, id: subject.id || generateId() }]
        })),
      
      updateSubject: (id, subject) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, ...subject } : s
          ),
        })),
      
      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          // Also remove all classes for this subject
          classes: state.classes.filter((c) => c.subjectId !== id),
        })),

      // Class actions
      addClass: (classItem) => 
        set((state) => ({ 
          classes: [...state.classes, { ...classItem, id: classItem.id || generateId() }] 
        })),
      
      updateClass: (id, classItem) =>
        set((state) => ({
          classes: state.classes.map((c) => 
            c.id === id ? { ...c, ...classItem } : c
          ),
        })),
      
      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
          attendance: state.attendance.filter((a) => a.classId !== id),
          assignments: state.assignments.filter((a) => a.classId !== id),
        })),

      // Attendance actions
      markAttendance: (classId, date, status, note) => {
        const existingRecord = get().attendance.find(
          (a) => a.classId === classId && a.date === date
        );
        
        if (existingRecord) {
          set((state) => ({
            attendance: state.attendance.map((a) =>
              a.id === existingRecord.id ? { ...a, status, note } : a
            ),
          }));
        } else {
          set((state) => ({
            attendance: [
              ...state.attendance,
              { id: generateId(), classId, date, status, note },
            ],
          }));
        }
      },
      
      updateAttendance: (id, status, note) =>
        set((state) => ({
          attendance: state.attendance.map((a) =>
            a.id === id ? { ...a, status, note } : a
          ),
        })),

      // Assignment actions
      addAssignment: (assignment) =>
        set((state) => ({
          assignments: [...state.assignments, { ...assignment, id: assignment.id || generateId() }],
        })),
      
      updateAssignment: (id, assignment) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, ...assignment } : a
          ),
        })),
      
      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),
      
      updateAssignmentStatus: (id, status) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        })),

      // Event actions
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: event.id || generateId() }],
        })),
      
      updateEvent: (id, event) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...event } : e
          ),
        })),
      
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      // Setup actions
      setSemesterDates: (startDate, endDate) =>
        set({ semesterStartDate: startDate, semesterEndDate: endDate }),
      
      completeSetup: () => set({ isSetupComplete: true }),
      
      resetApp: () =>
        set({
          subjects: [],
          classes: [],
          attendance: [],
          assignments: [],
          events: [],
          semesterStartDate: null,
          semesterEndDate: null,
          isSetupComplete: false,
        }),
    }),
    {
      name: 'class-tracker-storage',
    }
  )
);
