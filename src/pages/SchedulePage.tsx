import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { 
  DAYS_OF_WEEK, 
  DAY_LABELS, 
  CLASS_COLORS, 
  getClassesForDay,
  formatTime,
  generateId
} from '../utils/helpers';
import type { ClassSchedule, DayOfWeek } from '../types';
import './SchedulePage.css';

export default function SchedulePage() {
  const { classes, addClass, updateClass, deleteClass } = useStore();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);

  const dayClasses = getClassesForDay(classes, selectedDay);

  const handleEdit = (cls: ClassSchedule) => {
    setEditingClass(cls);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClass(null);
  };

  return (
    <div className="schedule-page">
      <header className="page-header">
        <div className="header-row">
          <div>
            <h1><Calendar size={24} /> Schedule</h1>
            <p>Your weekly class timetable</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Day Selector */}
      <div className="day-tabs">
        {DAYS_OF_WEEK.map((day) => {
          const classCount = getClassesForDay(classes, day).length;
          return (
            <button
              key={day}
              className={`day-tab ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="day-label">{DAY_LABELS[day].slice(0, 3)}</span>
              {classCount > 0 && <span className="class-count">{classCount}</span>}
            </button>
          );
        })}
      </div>

      {/* Classes for Selected Day */}
      <div className="schedule-content">
        <h2>{DAY_LABELS[selectedDay]}</h2>
        
        {dayClasses.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No classes on {DAY_LABELS[selectedDay]}</p>
            <button className="btn btn-outline" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Add Class
            </button>
          </div>
        ) : (
          <div className="class-list">
            {dayClasses.map((cls) => (
              <div 
                key={cls.id} 
                className="schedule-class-card"
                style={{ borderLeftColor: cls.color }}
              >
                <div className="time-column">
                  <span className="start-time">{formatTime(cls.timeSlot.startTime)}</span>
                  <div className="time-line" style={{ backgroundColor: cls.color }} />
                  <span className="end-time">{formatTime(cls.timeSlot.endTime)}</span>
                </div>
                
                <div className="class-info">
                  <div className="class-header">
                    <h3>{cls.subjectName}</h3>
                    {cls.subjectCode && (
                      <span className="subject-code">{cls.subjectCode}</span>
                    )}
                  </div>
                  
                  <div className="class-details">
                    {cls.instructor && (
                      <div className="detail-item">
                        <User size={14} />
                        <span>{cls.instructor}</span>
                      </div>
                    )}
                    {cls.room && (
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{cls.room}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="class-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(cls)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => deleteClass(cls.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Overview */}
      <div className="weekly-overview">
        <h3>Weekly Overview</h3>
        <div className="overview-grid">
          {DAYS_OF_WEEK.map((day) => {
            const dayClassList = getClassesForDay(classes, day);
            return (
              <div 
                key={day} 
                className={`overview-day ${selectedDay === day ? 'selected' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <span className="overview-day-label">{DAY_LABELS[day].slice(0, 1)}</span>
                <div className="overview-classes">
                  {dayClassList.map((cls) => (
                    <div 
                      key={cls.id}
                      className="overview-class-dot"
                      style={{ backgroundColor: cls.color }}
                      title={cls.subjectName}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      {showModal && (
        <ClassModal
          classItem={editingClass}
          selectedDay={selectedDay}
          onClose={handleCloseModal}
          onSave={(classData, selectedDays) => {
            if (editingClass) {
              updateClass(editingClass.id, classData);
            } else if (selectedDays && selectedDays.length > 0) {
              // Add class for each selected day
              selectedDays.forEach((day) => {
                addClass({ ...classData, day, id: generateId() } as ClassSchedule);
              });
            } else {
              addClass({ ...classData, id: generateId() } as ClassSchedule);
            }
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

interface ClassModalProps {
  classItem: ClassSchedule | null;
  selectedDay: DayOfWeek;
  onClose: () => void;
  onSave: (classData: Partial<ClassSchedule>, selectedDays?: DayOfWeek[]) => void;
}

function ClassModal({ classItem, selectedDay, onClose, onSave }: ClassModalProps) {
  const [formData, setFormData] = useState({
    subjectName: classItem?.subjectName || '',
    subjectCode: classItem?.subjectCode || '',
    instructor: classItem?.instructor || '',
    room: classItem?.room || '',
    day: classItem?.day || selectedDay,
    timeSlot: classItem?.timeSlot || { startTime: '09:00', endTime: '10:00' },
    color: classItem?.color || CLASS_COLORS[0],
  });
  
  // For new classes, allow multiple day selection
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([classItem?.day || selectedDay]);
  const isEditing = !!classItem;

  const toggleDay = (day: DayOfWeek) => {
    if (isEditing) {
      // When editing, only allow single day
      setFormData({ ...formData, day });
      setSelectedDays([day]);
    } else {
      // When adding new, allow multiple days
      setSelectedDays((prev) => {
        if (prev.includes(day)) {
          if (prev.length === 1) return prev;
          return prev.filter((d) => d !== day);
        } else {
          return [...prev, day];
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectName) return;
    
    if (isEditing) {
      onSave(formData);
    } else {
      onSave(formData, selectedDays);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{classItem ? 'Edit Class' : 'Add Class'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Subject Name *</label>
              <input
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder="e.g., Data Structures"
                className="input-field"
                autoFocus
              />
            </div>
            <div className="form-group flex-1">
              <label>Code</label>
              <input
                type="text"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="CS201"
                className="input-field"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><User size={14} /> Instructor</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="Dr. Smith"
                className="input-field"
              />
            </div>
            <div className="form-group flex-1">
              <label><MapPin size={14} /> Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Room 101"
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Day{isEditing ? '' : 's'} of Week {!isEditing && <span className="days-hint">(select multiple)</span>}</label>
            <div className="day-selector">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${selectedDays.includes(day) ? 'active' : ''}`}
                  onClick={() => toggleDay(day)}
                  style={selectedDays.includes(day) ? { backgroundColor: formData.color } : {}}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><Clock size={14} /> Start Time</label>
              <input
                type="time"
                value={formData.timeSlot.startTime}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  timeSlot: { ...formData.timeSlot, startTime: e.target.value } 
                })}
                className="input-field"
              />
            </div>
            <div className="form-group flex-1">
              <label><Clock size={14} /> End Time</label>
              <input
                type="time"
                value={formData.timeSlot.endTime}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  timeSlot: { ...formData.timeSlot, endTime: e.target.value } 
                })}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-selector">
              {CLASS_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-btn ${formData.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={!formData.subjectName}>
            {classItem ? 'Update Class' : `Add Class${selectedDays.length > 1 ? ` (${selectedDays.length} days)` : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}
