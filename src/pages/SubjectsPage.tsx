import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  X,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { CLASS_COLORS, generateId } from '../utils/helpers';
import type { Subject } from '../types';
import './SubjectsPage.css';

export default function SubjectsPage() {
  const { subjects, classes, addSubject, updateSubjectAndClasses, deleteSubject } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubject(null);
  };

  const handleSave = (subjectData: Partial<Subject>) => {
    if (editingSubject) {
      // Update subject and all related classes
      updateSubjectAndClasses(editingSubject.id, subjectData);
    } else {
      // Add new subject
      addSubject({
        ...subjectData,
        id: generateId(),
      } as Subject);
    }
    handleCloseModal();
  };

  // Get class count for each subject
  const getClassCount = (subjectId: string) => {
    return classes.filter(c => c.subjectId === subjectId).length;
  };

  // Get scheduled days for a subject
  const getScheduledDays = (subjectId: string) => {
    const subjectClasses = classes.filter(c => c.subjectId === subjectId);
    const days = [...new Set(subjectClasses.map(c => c.day))];
    return days.map(d => d.charAt(0).toUpperCase() + d.slice(0, 2)).join(', ');
  };

  return (
    <div className="subjects-page">
      <header className="page-header">
        <div className="header-row">
          <div>
            <h1><BookOpen size={24} /> Subjects</h1>
            <p>Manage your subjects</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="subjects-list">
        {subjects.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>No subjects yet</p>
            <span>Tap + to add your first subject</span>
          </div>
        ) : (
          subjects.map((subject) => {
            const classCount = getClassCount(subject.id);
            const scheduledDays = getScheduledDays(subject.id);
            
            return (
              <div 
                key={subject.id} 
                className="subject-card"
                style={{ borderLeftColor: subject.color }}
              >
                <div className="subject-color-dot" style={{ backgroundColor: subject.color }} />
                
                <div className="subject-content">
                  <div className="subject-header">
                    <h3>{subject.name}</h3>
                    {subject.code && (
                      <span className="subject-code">{subject.code}</span>
                    )}
                  </div>
                  
                  <div className="subject-details">
                    {subject.instructor && (
                      <div className="detail-item">
                        <User size={14} />
                        <span>{subject.instructor}</span>
                      </div>
                    )}
                    {subject.room && (
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{subject.room}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="subject-meta">
                    {classCount > 0 && (
                      <span className="class-count-badge">
                        <Calendar size={12} />
                        {classCount} class{classCount > 1 ? 'es' : ''}/week
                      </span>
                    )}
                    {scheduledDays && (
                      <span className="days-badge">{scheduledDays}</span>
                    )}
                  </div>
                </div>

                <div className="subject-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(subject)}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => {
                      if (confirm(`Delete "${subject.name}"? This will also remove all scheduled classes for this subject.`)) {
                        deleteSubject(subject.id);
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Subject Modal */}
      {showModal && (
        <SubjectModal
          subject={editingSubject}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface SubjectModalProps {
  subject: Subject | null;
  onClose: () => void;
  onSave: (subjectData: Partial<Subject>) => void;
}

function SubjectModal({ subject, onClose, onSave }: SubjectModalProps) {
  const { subjects } = useStore();
  const [formData, setFormData] = useState({
    name: subject?.name || '',
    code: subject?.code || '',
    instructor: subject?.instructor || '',
    room: subject?.room || '',
    color: subject?.color || CLASS_COLORS[subjects.length % CLASS_COLORS.length],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{subject ? 'Edit Subject' : 'Add Subject'}</h2>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Data Structures"
                className="input-field"
                autoFocus
              />
            </div>
            <div className="form-group flex-1">
              <label>Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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

          {subject && (
            <p className="edit-note">
              Note: Editing will update all scheduled classes for this subject.
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={!formData.name}>
            {subject ? 'Save Changes' : 'Add Subject'}
          </button>
        </form>
      </div>
    </div>
  );
}
