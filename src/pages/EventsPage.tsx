import { useState, useEffect } from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Trash2, 
  Bell, 
  BellOff,
  Calendar,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  Circle,
  ClipboardList
} from 'lucide-react';
import { generateId, formatDate, isOverdue } from '../utils/helpers';
import { 
  initializeNotifications, 
  scheduleEventNotification, 
  cancelEventNotification,
  rescheduleAllNotifications 
} from '../utils/notifications';
import type { ClassEvent, EventType, Assignment, AssignmentPriority, AssignmentStatus } from '../types';
import './EventsPage.css';

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'exam', label: 'Exam', color: '#dc2626' },
  { value: 'quiz', label: 'Quiz', color: '#d97706' },
  { value: 'presentation', label: 'Presentation', color: '#2563eb' },
  { value: 'project', label: 'Project', color: '#16a34a' },
  { value: 'holiday', label: 'Holiday', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

type MainTab = 'events' | 'tasks';

export default function EventsPage() {
  const { 
    events, classes, addEvent, updateEvent, deleteEvent,
    assignments, addAssignment, updateAssignmentStatus, deleteAssignment 
  } = useStore();
  const [mainTab, setMainTab] = useState<MainTab>('events');
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [eventFilter, setEventFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Initialize notifications on mount and reschedule all event notifications
  useEffect(() => {
    const setupNotifications = async () => {
      const enabled = await initializeNotifications();
      setNotificationsEnabled(enabled);
      
      if (enabled) {
        // Reschedule all notifications when the page loads
        await rescheduleAllNotifications(events);
      }
    };

    setupNotifications();
  }, []); // Only run once on mount

  // Reschedule notifications when events change
  useEffect(() => {
    if (notificationsEnabled) {
      rescheduleAllNotifications(events);
    }
  }, [events, notificationsEnabled]);

  const filteredEvents = events
    .filter((e) => {
      const eventDate = new Date(e.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventFilter === 'upcoming') return eventDate >= today;
      if (eventFilter === 'past') return eventDate < today;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return eventFilter === 'past' ? dateB - dateA : dateA - dateB;
    });

  const filteredAssignments = assignments
    .filter((a) => {
      if (taskFilter === 'pending') return a.status !== 'completed';
      if (taskFilter === 'completed') return a.status === 'completed';
      return true;
    })
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const toggleReminder = async (eventId: string, currentState: boolean) => {
    updateEvent(eventId, { reminderEnabled: !currentState });
    
    const event = events.find(e => e.id === eventId);
    if (event) {
      if (!currentState) {
        // Enabling reminder - schedule notification
        await scheduleEventNotification({ ...event, reminderEnabled: true });
      } else {
        // Disabling reminder - cancel notification
        await cancelEventNotification(eventId);
      }
    }
  };

  const toggleComplete = (id: string, currentStatus: AssignmentStatus) => {
    updateAssignmentStatus(id, currentStatus === 'completed' ? 'pending' : 'completed');
  };

  return (
    <div className="events-page">
      <header className="page-header">
        <div className="header-row">
          <div>
            <h1>{mainTab === 'events' ? <Calendar size={24} /> : <ClipboardList size={24} />} {mainTab === 'events' ? 'Events' : 'Tasks'}</h1>
            <p>{mainTab === 'events' ? 'Track exams, quizzes & more' : 'Manage your assignments'}</p>
          </div>
          <button className="add-btn" onClick={() => mainTab === 'events' ? setShowModal(true) : setShowTaskModal(true)}>
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Main Tabs - Events / Tasks */}
      <div className="main-tabs">
        <button 
          className={`main-tab ${mainTab === 'events' ? 'active' : ''}`}
          onClick={() => setMainTab('events')}
        >
          <Calendar size={18} />
          Events
        </button>
        <button 
          className={`main-tab ${mainTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setMainTab('tasks')}
        >
          <ClipboardList size={18} />
          Tasks ({assignments.filter(a => a.status !== 'completed').length})
        </button>
      </div>

      {mainTab === 'events' ? (
        <>
          {/* Event Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`tab ${eventFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setEventFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`tab ${eventFilter === 'past' ? 'active' : ''}`}
              onClick={() => setEventFilter('past')}
            >
              Past
            </button>
            <button 
              className={`tab ${eventFilter === 'all' ? 'active' : ''}`}
              onClick={() => setEventFilter('all')}
            >
              All
            </button>
          </div>

          {/* Events List */}
          <div className="events-list">
            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <p>No {eventFilter === 'upcoming' ? 'upcoming ' : eventFilter === 'past' ? 'past ' : ''}events</p>
                <span>Tap + to add your first event</span>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const relatedClass = event.classId ? classes.find((c) => c.id === event.classId) : null;
                const eventType = EVENT_TYPES.find((t) => t.value === event.type);
                const isEventToday = isToday(new Date(event.date));
                const isEventTomorrow = isTomorrow(new Date(event.date));
                const isEventPast = isPast(new Date(event.date)) && !isEventToday;

                return (
                  <div 
                    key={event.id} 
                    className={`event-card ${isEventToday ? 'today' : ''} ${isEventPast ? 'past' : ''}`}
                  >
                    <div className="event-date-badge">
                      <span className="day">{format(new Date(event.date), 'd')}</span>
                      <span className="month">{format(new Date(event.date), 'MMM')}</span>
                      {isEventToday && <span className="today-label">Today</span>}
                      {isEventTomorrow && <span className="tomorrow-label">Tomorrow</span>}
                    </div>

                    <div className="event-content">
                      <div className="event-header">
                        <span 
                          className="event-type-badge"
                          style={{ 
                            backgroundColor: `${eventType?.color}20`, 
                            color: eventType?.color 
                          }}
                        >
                          {eventType?.label}
                        </span>
                        {isEventToday && (
                          <AlertCircle size={16} className="alert-icon" />
                        )}
                      </div>
                      
                      <h3>{event.title}</h3>
                      
                      {event.description && (
                        <p className="event-desc">{event.description}</p>
                      )}
                      
                      <div className="event-meta">
                        {relatedClass && (
                          <span 
                            className="class-tag"
                            style={{ 
                              backgroundColor: `${relatedClass.color}20`, 
                              color: relatedClass.color 
                            }}
                          >
                            {relatedClass.subjectName}
                          </span>
                        )}
                        {event.time && (
                          <span className="event-time">
                            <Clock size={14} />
                            {formatEventTime(event.time)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="event-actions">
                      <button 
                        className={`reminder-btn ${event.reminderEnabled ? 'active' : ''}`}
                        onClick={() => toggleReminder(event.id, event.reminderEnabled)}
                        title={event.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                      >
                        {event.reminderEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* Task Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`tab ${taskFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTaskFilter('all')}
            >
              All ({assignments.length})
            </button>
            <button 
              className={`tab ${taskFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setTaskFilter('pending')}
            >
              Pending ({assignments.filter(a => a.status !== 'completed').length})
            </button>
            <button 
              className={`tab ${taskFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setTaskFilter('completed')}
            >
              Done ({assignments.filter(a => a.status === 'completed').length})
            </button>
          </div>

          {/* Tasks List */}
          <div className="tasks-list">
            {filteredAssignments.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={48} />
                <p>No tasks yet</p>
                <span>Tap + to add your first task</span>
              </div>
            ) : (
              filteredAssignments.map((assignment) => {
                const relatedClass = classes.find((c) => c.id === assignment.classId);
                const overdue = isOverdue(assignment.dueDate) && assignment.status !== 'completed';
                
                return (
                  <div 
                    key={assignment.id} 
                    className={`task-card ${assignment.status === 'completed' ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
                  >
                    <button 
                      className="check-btn"
                      onClick={() => toggleComplete(assignment.id, assignment.status)}
                    >
                      {assignment.status === 'completed' ? (
                        <CheckCircle2 size={24} className="checked" />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>
                    
                    <div className="task-content">
                      <div className="task-header">
                        <h3>{assignment.title}</h3>
                        <span className={`priority-badge ${assignment.priority}`}>
                          {assignment.priority}
                        </span>
                      </div>
                      
                      {assignment.description && (
                        <p className="task-desc">{assignment.description}</p>
                      )}
                      
                      <div className="task-footer">
                        {relatedClass && (
                          <span 
                            className="class-tag"
                            style={{ backgroundColor: `${relatedClass.color}20`, color: relatedClass.color }}
                          >
                            {relatedClass.subjectName}
                          </span>
                        )}
                        <span className={`due-date ${overdue ? 'overdue' : ''}`}>
                          {overdue ? <AlertCircle size={14} /> : <Clock size={14} />}
                          {formatDate(assignment.dueDate)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="delete-btn"
                      onClick={() => deleteAssignment(assignment.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Add Event Modal */}
      {showModal && (
        <AddEventModal 
          onClose={() => setShowModal(false)}
          onAdd={(event) => {
            addEvent(event);
            setShowModal(false);
          }}
        />
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <AddTaskModal 
          onClose={() => setShowTaskModal(false)}
          onAdd={(assignment) => {
            addAssignment(assignment);
            setShowTaskModal(false);
          }}
        />
      )}
    </div>
  );
}

function formatEventTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

interface AddEventModalProps {
  onClose: () => void;
  onAdd: (event: ClassEvent) => void;
}

function AddEventModal({ onClose, onAdd }: AddEventModalProps) {
  const { classes } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    type: 'exam' as EventType,
    reminderEnabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    
    onAdd({
      id: generateId(),
      title: formData.title,
      description: formData.description,
      classId: formData.classId || undefined,
      date: formData.date,
      time: formData.time || undefined,
      type: formData.type,
      reminderEnabled: formData.reminderEnabled,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Event</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Midterm Exam"
              className="input-field"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Event Type</label>
            <div className="type-selector">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`type-btn ${formData.type === type.value ? 'active' : ''}`}
                  style={formData.type === type.value ? { 
                    backgroundColor: `${type.color}20`, 
                    borderColor: type.color,
                    color: type.color 
                  } : {}}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              className="input-field textarea"
              rows={2}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div className="form-group flex-1">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Related Class</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="input-field"
            >
              <option value="">No specific class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.subjectName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
              />
              <Bell size={18} />
              Enable reminder notification
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={!formData.title}>
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
}

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (assignment: Assignment) => void;
}

function AddTaskModal({ onClose, onAdd }: AddTaskModalProps) {
  const { classes } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: classes[0]?.id || '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium' as AssignmentPriority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    onAdd({
      id: generateId(),
      title: formData.title,
      description: formData.description,
      classId: formData.classId,
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Chapter 5 Homework"
              className="input-field"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              className="input-field textarea"
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="input-field"
              >
                <option value="">No class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.subjectName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group flex-1">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Priority</label>
            <div className="priority-selector">
              {(['low', 'medium', 'high'] as AssignmentPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn ${p} ${formData.priority === p ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, priority: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={!formData.title}>
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}
