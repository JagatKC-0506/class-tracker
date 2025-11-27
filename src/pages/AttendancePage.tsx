import { useState } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { useStore } from '../store/useStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ban,
  Calendar
} from 'lucide-react';
import { 
  getClassesForDay, 
  getDayOfWeekFromDate, 
  DAY_LABELS, 
  formatTime 
} from '../utils/helpers';
import type { AttendanceStatus } from '../types';
import './AttendancePage.css';

export default function AttendancePage() {
  const { classes, attendance, markAttendance } = useStore();
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedWeek, i));
  const selectedDayOfWeek = getDayOfWeekFromDate(selectedDay);
  const dayClasses = getClassesForDay(classes, selectedDayOfWeek);
  const selectedDateStr = format(selectedDay, 'yyyy-MM-dd');

  const handleMarkAttendance = (classId: string, status: AttendanceStatus) => {
    markAttendance(classId, selectedDateStr, status);
  };

  const getAttendanceForClass = (classId: string) => {
    return attendance.find(
      (a) => a.classId === classId && a.date === selectedDateStr
    );
  };

  return (
    <div className="attendance-page">
      <header className="page-header">
        <h1><Calendar size={24} /> Attendance</h1>
        <p>Track your class attendance</p>
      </header>

      {/* Week Navigation */}
      <div className="week-nav">
        <button className="nav-btn" onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}>
          <ChevronLeft size={24} />
        </button>
        <span className="week-label">
          {format(selectedWeek, 'MMM d')} - {format(addDays(selectedWeek, 6), 'MMM d, yyyy')}
        </span>
        <button className="nav-btn" onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Day Selector */}
      <div className="day-selector">
        {weekDays.map((day) => {
          const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const dayOfWeek = getDayOfWeekFromDate(day);
          const hasClasses = getClassesForDay(classes, dayOfWeek).length > 0;
          
          return (
            <button
              key={day.toISOString()}
              className={`day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="day-name">{format(day, 'EEE')}</span>
              <span className="day-num">{format(day, 'd')}</span>
              {hasClasses && <span className="has-classes" />}
            </button>
          );
        })}
      </div>

      {/* Classes for Selected Day */}
      <div className="attendance-content">
        <h2>{DAY_LABELS[selectedDayOfWeek]}, {format(selectedDay, 'MMMM d')}</h2>
        
        {dayClasses.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No classes on this day</p>
          </div>
        ) : (
          <div className="class-attendance-list">
            {dayClasses.map((cls) => {
              const record = getAttendanceForClass(cls.id);
              
              return (
                <div key={cls.id} className="attendance-card" style={{ borderLeftColor: cls.color }}>
                  <div className="class-details">
                    <h3>{cls.subjectName}</h3>
                    <div className="class-time-room">
                      <span>{formatTime(cls.timeSlot.startTime)} - {formatTime(cls.timeSlot.endTime)}</span>
                      {cls.room && <span>• {cls.room}</span>}
                    </div>
                  </div>
                  
                  <div className="attendance-buttons">
                    <button
                      className={`att-btn present ${record?.status === 'present' ? 'active' : ''}`}
                      onClick={() => handleMarkAttendance(cls.id, 'present')}
                      title="Present"
                    >
                      <CheckCircle2 size={24} />
                    </button>
                    <button
                      className={`att-btn late ${record?.status === 'late' ? 'active' : ''}`}
                      onClick={() => handleMarkAttendance(cls.id, 'late')}
                      title="Late"
                    >
                      <Clock size={24} />
                    </button>
                    <button
                      className={`att-btn absent ${record?.status === 'absent' ? 'active' : ''}`}
                      onClick={() => handleMarkAttendance(cls.id, 'absent')}
                      title="Absent"
                    >
                      <XCircle size={24} />
                    </button>
                    <button
                      className={`att-btn cancelled ${record?.status === 'cancelled' ? 'active' : ''}`}
                      onClick={() => handleMarkAttendance(cls.id, 'cancelled')}
                      title="Cancelled"
                    >
                      <Ban size={24} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
