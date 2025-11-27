// Types for the Class Tracker App

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

// Subject is the base class info (saved once)
export interface Subject {
  id: string;
  name: string;
  code: string;
  instructor: string;
  room: string;
  color: string;
}

// ClassSchedule is a subject assigned to a specific day/time
export interface ClassSchedule {
  id: string;
  subjectId: string; // Reference to Subject
  subjectName: string;
  subjectCode: string;
  instructor: string;
  room: string;
  day: DayOfWeek;
  timeSlot: TimeSlot;
  color: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // ISO date string
  status: AttendanceStatus;
  note?: string;
}

export type AssignmentStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type AssignmentPriority = 'low' | 'medium' | 'high';

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  status: AssignmentStatus;
  priority: AssignmentPriority;
  createdAt: string;
}

export type EventType = 'exam' | 'quiz' | 'presentation' | 'project' | 'holiday' | 'other';

export interface ClassEvent {
  id: string;
  classId?: string; // Optional - can be general event
  title: string;
  description: string;
  date: string; // ISO date string
  time?: string; // HH:mm format
  type: EventType;
  reminderEnabled: boolean;
  reminderTime?: number; // Minutes before event
}

export interface AppState {
  subjects: Subject[];
  classes: ClassSchedule[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  events: ClassEvent[];
  semesterStartDate: string | null;
  semesterEndDate: string | null;
  isSetupComplete: boolean;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface WeeklyAttendance {
  week: string;
  present: number;
  absent: number;
  late: number;
}
