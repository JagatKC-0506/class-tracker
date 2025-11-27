import { useEffect } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  BookOpen,
  Bell,
  TrendingUp,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { 
  getTodaysClasses, 
  formatTime, 
  formatDate, 
  calculateAttendanceStats,
  getDayOfWeekFromDate,
  requestNotificationPermission
} from '../utils/helpers';
import type { ClassSchedule, ClassEvent, Assignment } from '../types';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { classes, attendance, assignments, events } = useStore();
  
  const todaysClasses = getTodaysClasses(classes);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const stats = calculateAttendanceStats(attendance);
  
  // Get upcoming events (next 7 days)
  const upcomingEvents = events
    .filter((e) => {
      const eventDate = new Date(e.date);
      const today = new Date();
      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= weekLater;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  // Get pending assignments
  const pendingAssignments = assignments
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="greeting">
            <h1>Good {getGreeting()}! 👋</h1>
            <p>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="header-actions">
            <button className="stats-btn" onClick={() => navigate('/analytics')} title="View Stats">
              <BarChart3 size={22} />
            </button>
            <div className="stat-circle" style={{ 
              background: `conic-gradient(#22c55e ${stats.percentage * 3.6}deg, #e5e7eb 0deg)` 
            }}>
              <span>{stats.percentage}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="quick-stats">
        <div className="stat-card" onClick={() => navigate('/attendance')}>
          <div className="stat-icon present">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.present}</span>
            <span className="stat-label">Present</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/attendance')}>
          <div className="stat-icon absent">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.absent}</span>
            <span className="stat-label">Absent</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/assignments')}>
          <div className="stat-icon pending">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{pendingAssignments.length}</span>
            <span className="stat-label">Tasks</span>
          </div>
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="section">
        <div className="section-header">
          <h2><Calendar size={20} /> Today's Classes</h2>
          <button className="link-btn" onClick={() => navigate('/schedule')}>
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        {todaysClasses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>No classes today!</p>
            <span>Enjoy your day off 🎉</span>
          </div>
        ) : (
          <div className="class-timeline">
            {todaysClasses.map((cls) => (
              <TodayClassCard 
                key={cls.id} 
                classItem={cls} 
                attendanceStatus={getAttendanceStatus(cls.id, todayStr)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2><Bell size={20} /> Upcoming Events</h2>
            <button className="link-btn" onClick={() => navigate('/events')}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="event-list">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} classes={classes} />
            ))}
          </div>
        </section>
      )}

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2><TrendingUp size={20} /> Pending Tasks</h2>
            <button className="link-btn" onClick={() => navigate('/assignments')}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="assignment-list">
            {pendingAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} classes={classes} />
            ))}
          </div>
        </section>
      )}
    </div>
  );

  function getAttendanceStatus(classId: string, date: string) {
    const record = attendance.find((a) => a.classId === classId && a.date === date);
    return record?.status;
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

interface TodayClassCardProps {
  classItem: ClassSchedule;
  attendanceStatus?: string;
}

function TodayClassCard({ classItem, attendanceStatus }: TodayClassCardProps) {
  const navigate = useNavigate();
  const isCurrentClass = isClassNow(classItem);
  
  return (
    <div 
      className={`today-class-card ${isCurrentClass ? 'current' : ''}`}
      style={{ borderLeftColor: classItem.color }}
      onClick={() => navigate('/attendance')}
    >
      <div className="class-time">
        <Clock size={14} />
        <span>{formatTime(classItem.timeSlot.startTime)}</span>
        <span className="time-separator">-</span>
        <span>{formatTime(classItem.timeSlot.endTime)}</span>
      </div>
      <div className="class-info">
        <h3>{classItem.subjectName}</h3>
        <div className="class-meta">
          {classItem.instructor && <span>{classItem.instructor}</span>}
          {classItem.room && (
            <>
              <MapPin size={12} />
              <span>{classItem.room}</span>
            </>
          )}
        </div>
      </div>
      {attendanceStatus && (
        <div className={`attendance-badge ${attendanceStatus}`}>
          {attendanceStatus === 'present' && <CheckCircle2 size={16} />}
          {attendanceStatus === 'absent' && <XCircle size={16} />}
          {attendanceStatus === 'late' && <AlertCircle size={16} />}
        </div>
      )}
      {isCurrentClass && <div className="current-badge">Now</div>}
    </div>
  );
}

function isClassNow(classItem: ClassSchedule): boolean {
  const now = new Date();
  const today = getDayOfWeekFromDate(now);
  
  if (classItem.day !== today) return false;
  
  const currentTime = format(now, 'HH:mm');
  return currentTime >= classItem.timeSlot.startTime && currentTime <= classItem.timeSlot.endTime;
}

interface EventCardProps {
  event: ClassEvent;
  classes: ClassSchedule[];
}

function EventCard({ event, classes }: EventCardProps) {
  const relatedClass = event.classId ? classes.find((c) => c.id === event.classId) : null;
  
  return (
    <div className="event-card">
      <div className="event-date">
        <span className="event-day">{format(new Date(event.date), 'd')}</span>
        <span className="event-month">{format(new Date(event.date), 'MMM')}</span>
      </div>
      <div className="event-info">
        <span className={`event-type ${event.type}`}>{event.type}</span>
        <h4>{event.title}</h4>
        {relatedClass && (
          <span className="event-class" style={{ color: relatedClass.color }}>
            {relatedClass.subjectName}
          </span>
        )}
      </div>
      {event.reminderEnabled && (
        <Bell size={16} className="reminder-icon" />
      )}
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
  classes: ClassSchedule[];
}

function AssignmentCard({ assignment, classes }: AssignmentCardProps) {
  const relatedClass = classes.find((c) => c.id === assignment.classId);
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed';
  
  return (
    <div className={`assignment-card ${isOverdue ? 'overdue' : ''}`}>
      <div 
        className="assignment-indicator" 
        style={{ backgroundColor: relatedClass?.color || '#6b7280' }}
      />
      <div className="assignment-info">
        <h4>{assignment.title}</h4>
        <div className="assignment-meta">
          <span className={`priority ${assignment.priority}`}>{assignment.priority}</span>
          <span className="due-date">
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {formatDate(assignment.dueDate)}
          </span>
        </div>
      </div>
      <ChevronRight size={20} className="assignment-arrow" />
    </div>
  );
}
