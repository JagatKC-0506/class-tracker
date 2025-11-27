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
  AlertCircle
} from 'lucide-react';
import { generateId, requestNotificationPermission, sendNotification } from '../utils/helpers';
import type { ClassEvent, EventType } from '../types';
import './EventsPage.css';

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'exam', label: 'Exam', color: '#dc2626' },
  { value: 'quiz', label: 'Quiz', color: '#d97706' },
  { value: 'presentation', label: 'Presentation', color: '#2563eb' },
  { value: 'project', label: 'Project', color: '#16a34a' },
  { value: 'holiday', label: 'Holiday', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

export default function EventsPage() {
  const { events, classes, addEvent, updateEvent, deleteEvent } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Check for events today and send notifications
  useEffect(() => {
    const checkNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) return;

      events.forEach((event) => {
        if (event.reminderEnabled && isToday(new Date(event.date))) {
          // Check if we haven't already notified (using localStorage)
          const notifiedKey = `notified_${event.id}_${event.date}`;
          if (!localStorage.getItem(notifiedKey)) {
            sendNotification(
              `📅 ${event.title}`,
              `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} is today!`,
            );
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    };

    checkNotifications();
  }, [events]);

  const filteredEvents = events
    .filter((e) => {
      const eventDate = new Date(e.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filter === 'upcoming') return eventDate >= today;
      if (filter === 'past') return eventDate < today;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filter === 'past' ? dateB - dateA : dateA - dateB;
    });

  const toggleReminder = (eventId: string, currentState: boolean) => {
    updateEvent(eventId, { reminderEnabled: !currentState });
  };

  return (
    <div className="events-page">
      <header className="page-header">
        <div className="header-row">
          <div>
            <h1><Calendar size={24} /> Events</h1>
            <p>Track exams, quizzes & more</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {/* Events List */}
      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No {filter === 'upcoming' ? 'upcoming ' : filter === 'past' ? 'past ' : ''}events</p>
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
                        {formatTime(event.time)}
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
    </div>
  );
}

function formatTime(time: string): string {
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
