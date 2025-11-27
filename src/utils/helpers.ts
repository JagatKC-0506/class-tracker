import { format, parseISO, isToday, isTomorrow, isPast, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';
import type { ClassSchedule, AttendanceRecord, DayOfWeek, AttendanceStats, WeeklyAttendance } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const CLASS_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export const getDayOfWeekFromDate = (date: Date): DayOfWeek => {
  const dayIndex = getDay(date);
  // getDay returns 0 for Sunday, we need to adjust
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex];
};

export const getClassesForDay = (classes: ClassSchedule[], day: DayOfWeek): ClassSchedule[] => {
  return classes
    .filter((c) => c.day === day)
    .sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
};

export const getTodaysClasses = (classes: ClassSchedule[]): ClassSchedule[] => {
  const today = getDayOfWeekFromDate(new Date());
  return getClassesForDay(classes, today);
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d, yyyy');
};

export const formatDateShort = (dateString: string): string => {
  return format(parseISO(dateString), 'MMM d');
};

export const isOverdue = (dateString: string): boolean => {
  return isPast(parseISO(dateString)) && !isToday(parseISO(dateString));
};

export const calculateAttendanceStats = (
  attendance: AttendanceRecord[],
  classId?: string
): AttendanceStats => {
  const records = classId 
    ? attendance.filter((a) => a.classId === classId)
    : attendance;
  
  const total = records.length;
  const present = records.filter((a) => a.status === 'present').length;
  const absent = records.filter((a) => a.status === 'absent').length;
  const late = records.filter((a) => a.status === 'late').length;
  const cancelled = records.filter((a) => a.status === 'cancelled').length;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return { total, present, absent, late, cancelled, percentage };
};

export const getWeeklyAttendanceData = (
  attendance: AttendanceRecord[],
  weeks: number = 8
): WeeklyAttendance[] => {
  const data: WeeklyAttendance[] = [];
  const today = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const weekRecords = attendance.filter((a) => {
      const date = parseISO(a.date);
      return date >= weekStart && date <= weekEnd;
    });

    data.push({
      week: format(weekStart, 'MMM d'),
      present: weekRecords.filter((a) => a.status === 'present').length,
      absent: weekRecords.filter((a) => a.status === 'absent').length,
      late: weekRecords.filter((a) => a.status === 'late').length,
    });
  }

  return data;
};

export const getUpcomingDatesForClass = (
  classSchedule: ClassSchedule,
  startDate: Date,
  endDate: Date
): Date[] => {
  const dates: Date[] = [];
  const dayIndex = DAYS_OF_WEEK.indexOf(classSchedule.day);
  // Adjust for JavaScript's getDay (0 = Sunday)
  const jsDayIndex = dayIndex === 6 ? 0 : dayIndex + 1;
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  allDays.forEach((date) => {
    if (getDay(date) === jsDayIndex) {
      dates.push(date);
    }
  });

  return dates;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const sendNotification = (title: string, body: string, icon?: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/vite.svg',
      badge: '/vite.svg',
    });
  }
};
