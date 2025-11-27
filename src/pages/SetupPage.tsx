import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Calendar, Clock, MapPin, User, BookOpen, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import type { Subject, ClassSchedule, DayOfWeek } from '../types';
import { DAYS_OF_WEEK, DAY_LABELS, CLASS_COLORS, generateId } from '../utils/helpers';
import './SetupPage.css';

export default function SetupPage() {
  const navigate = useNavigate();
  const store = useStore();
  const { subjects, addSubject, addClass, setSemesterDates, completeSetup, classes } = store;
  
  const [step, setStep] = useState(1);
  const [semesterStart, setSemesterStart] = useState('');
  const [semesterEnd, setSemesterEnd] = useState('');
  
  // Step 2: Subject form
  const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({
    name: '',
    code: '',
    instructor: '',
    room: '',
    color: CLASS_COLORS[0],
  });

  // Step 3: Schedule building - single day at a time for different times
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [timeSlot, setTimeSlot] = useState({ startTime: '09:00', endTime: '10:00' });

  const handleAddSubject = () => {
    if (currentSubject.name) {
      addSubject({
        ...currentSubject,
        id: generateId(),
      } as Subject);
      
      // Reset form with next color
      const nextColorIndex = (subjects.length + 1) % CLASS_COLORS.length;
      setCurrentSubject({
        name: '',
        code: '',
        instructor: '',
        room: '',
        color: CLASS_COLORS[nextColorIndex],
      });
    }
  };

  const handleAddToSchedule = () => {
    if (selectedSubject && selectedDay) {
      addClass({
        id: generateId(),
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        instructor: selectedSubject.instructor,
        room: selectedSubject.room,
        day: selectedDay,
        timeSlot,
        color: selectedSubject.color,
      } as ClassSchedule);
      
      // Keep subject selected so user can add another day/time for same subject
      // Just reset day and time
      setSelectedDay(null);
      setTimeSlot({ startTime: '09:00', endTime: '10:00' });
    }
  };

  const handleComplete = () => {
    if (semesterStart && semesterEnd) {
      setSemesterDates(semesterStart, semesterEnd);
    }
    completeSetup();
    navigate('/');
  };

  // Step 1: Semester Dates
  const renderStep1 = () => (
    <div className="setup-step">
      <div className="step-header">
        <Calendar className="step-icon" />
        <h2>Set Semester Dates</h2>
        <p>When does your semester start and end?</p>
      </div>
      
      <div className="form-group">
        <label>Semester Start Date</label>
        <input
          type="date"
          value={semesterStart}
          onChange={(e) => setSemesterStart(e.target.value)}
          className="input-field"
        />
      </div>
      
      <div className="form-group">
        <label>Semester End Date</label>
        <input
          type="date"
          value={semesterEnd}
          onChange={(e) => setSemesterEnd(e.target.value)}
          className="input-field"
        />
      </div>
      
      <button 
        className="btn btn-primary btn-full"
        onClick={() => setStep(2)}
        disabled={!semesterStart || !semesterEnd}
      >
        Continue
        <ChevronRight size={20} />
      </button>
    </div>
  );

  // Step 2: Save Subjects (just the info, no schedule yet)
  const renderStep2 = () => (
    <div className="setup-step">
      <div className="step-header">
        <BookOpen className="step-icon" />
        <h2>Save Your Subjects</h2>
        <p>First, add all your subjects. You'll schedule them next.</p>
      </div>

      {subjects.length > 0 && (
        <div className="added-classes">
          <h3>Saved Subjects ({subjects.length})</h3>
          <div className="class-list">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </div>
      )}

      <div className="class-form">
        <div className="form-row">
          <div className="form-group flex-2">
            <label>Subject Name *</label>
            <input
              type="text"
              value={currentSubject.name}
              onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
              placeholder="e.g., Data Structures"
              className="input-field"
            />
          </div>
          <div className="form-group flex-1">
            <label>Code</label>
            <input
              type="text"
              value={currentSubject.code}
              onChange={(e) => setCurrentSubject({ ...currentSubject, code: e.target.value })}
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
              value={currentSubject.instructor}
              onChange={(e) => setCurrentSubject({ ...currentSubject, instructor: e.target.value })}
              placeholder="Dr. Smith"
              className="input-field"
            />
          </div>
          <div className="form-group flex-1">
            <label><MapPin size={14} /> Room</label>
            <input
              type="text"
              value={currentSubject.room}
              onChange={(e) => setCurrentSubject({ ...currentSubject, room: e.target.value })}
              placeholder="Room 101"
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
                className={`color-btn ${currentSubject.color === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentSubject({ ...currentSubject, color })}
              />
            ))}
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-full"
          onClick={handleAddSubject}
          disabled={!currentSubject.name}
        >
          <Plus size={20} />
          Save Subject
        </button>
      </div>

      <div className="setup-actions">
        <button className="btn btn-outline" onClick={() => setStep(1)}>
          <ChevronLeft size={20} />
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setStep(3)}
          disabled={subjects.length === 0}
        >
          Build Schedule
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  // Step 3: Build Weekly Schedule
  const renderStep3 = () => (
    <div className="setup-step">
      <div className="step-header">
        <Calendar className="step-icon" />
        <h2>Build Your Schedule</h2>
        <p>Select a subject, pick days and times</p>
      </div>

      {/* Weekly Schedule Preview */}
      {classes.length > 0 && (
        <div className="schedule-preview">
          <h3>Your Schedule ({classes.length} classes)</h3>
          <div className="week-grid">
            {DAYS_OF_WEEK.map((day) => {
              const dayClasses = classes.filter(c => c.day === day);
              return (
                <div key={day} className="week-day">
                  <span className="week-day-label">{DAY_LABELS[day].slice(0, 3)}</span>
                  <div className="week-day-classes">
                    {dayClasses.map((cls) => (
                      <div 
                        key={cls.id} 
                        className="mini-class"
                        style={{ backgroundColor: cls.color }}
                        title={`${cls.subjectName} ${cls.timeSlot.startTime}-${cls.timeSlot.endTime}`}
                      >
                        <span className="mini-class-name">{cls.subjectCode || cls.subjectName.slice(0, 3)}</span>
                        <span className="mini-class-time">{cls.timeSlot.startTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Picker */}
      <div className="subject-picker">
        <label>Select Subject to Schedule</label>
        <div className="subject-chips">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              className={`subject-chip ${selectedSubject?.id === subject.id ? 'active' : ''}`}
              style={selectedSubject?.id === subject.id ? { backgroundColor: subject.color, borderColor: subject.color } : { borderColor: subject.color }}
              onClick={() => setSelectedSubject(selectedSubject?.id === subject.id ? null : subject)}
            >
              <span 
                className="chip-dot" 
                style={{ backgroundColor: subject.color }}
              />
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {/* Day & Time Selection (only shows when subject selected) */}
      {selectedSubject && (
        <div className="schedule-form">
          <div className="selected-subject-header">
            <span className="selected-dot" style={{ backgroundColor: selectedSubject.color }} />
            <span>Adding: <strong>{selectedSubject.name}</strong></span>
            <button className="btn-clear" onClick={() => setSelectedSubject(null)}>✕</button>
          </div>

          <div className="form-group">
            <label>Select Day</label>
            <div className="day-selector">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${selectedDay === day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  style={selectedDay === day ? { backgroundColor: selectedSubject.color } : {}}
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
                value={timeSlot.startTime}
                onChange={(e) => setTimeSlot({ ...timeSlot, startTime: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="form-group flex-1">
              <label><Clock size={14} /> End Time</label>
              <input
                type="time"
                value={timeSlot.endTime}
                onChange={(e) => setTimeSlot({ ...timeSlot, endTime: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-full"
            onClick={handleAddToSchedule}
            disabled={!selectedDay}
          >
            <Plus size={20} />
            Add {selectedDay ? DAY_LABELS[selectedDay] : ''} Class
          </button>
          
          <p className="schedule-hint">You can add this subject again with different day/time</p>
        </div>
      )}

      <div className="setup-actions">
        <button className="btn btn-outline" onClick={() => setStep(2)}>
          <ChevronLeft size={20} />
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleComplete}
        >
          <CheckCircle2 size={20} />
          {classes.length === 0 ? 'Skip for Now' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Dates</p>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Subjects</p>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Schedule</p>
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const { deleteSubject } = useStore();
  
  return (
    <div className="class-card" style={{ borderLeftColor: subject.color }}>
      <div className="class-card-content">
        <div className="class-card-header">
          <h4>{subject.name}</h4>
          {subject.code && <span className="subject-code">{subject.code}</span>}
        </div>
        <div className="class-card-details">
          {subject.instructor && <span>{subject.instructor}</span>}
          {subject.instructor && subject.room && <span>•</span>}
          {subject.room && <span>{subject.room}</span>}
        </div>
      </div>
      <button className="btn-icon delete" onClick={() => deleteSubject(subject.id)}>
        <Trash2 size={18} />
      </button>
    </div>
  );
}
