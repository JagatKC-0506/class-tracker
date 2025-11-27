import { useState } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  ClipboardList,
  X
} from 'lucide-react';
import { generateId, formatDate, isOverdue } from '../utils/helpers';
import type { Assignment, AssignmentPriority, AssignmentStatus } from '../types';
import './AssignmentsPage.css';

export default function AssignmentsPage() {
  const { assignments, classes, addAssignment, updateAssignmentStatus, deleteAssignment } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredAssignments = assignments
    .filter((a) => {
      if (filter === 'pending') return a.status !== 'completed';
      if (filter === 'completed') return a.status === 'completed';
      return true;
    })
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const toggleComplete = (id: string, currentStatus: AssignmentStatus) => {
    updateAssignmentStatus(id, currentStatus === 'completed' ? 'pending' : 'completed');
  };

  return (
    <div className="assignments-page">
      <header className="page-header">
        <div className="header-row">
          <div>
            <h1><ClipboardList size={24} /> Assignments</h1>
            <p>Manage your tasks and deadlines</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({assignments.length})
        </button>
        <button 
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({assignments.filter(a => a.status !== 'completed').length})
        </button>
        <button 
          className={`tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Done ({assignments.filter(a => a.status === 'completed').length})
        </button>
      </div>

      {/* Assignment List */}
      <div className="assignments-list">
        {filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <p>No assignments yet</p>
            <span>Tap + to add your first assignment</span>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const relatedClass = classes.find((c) => c.id === assignment.classId);
            const overdue = isOverdue(assignment.dueDate) && assignment.status !== 'completed';
            
            return (
              <div 
                key={assignment.id} 
                className={`assignment-card ${assignment.status === 'completed' ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
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
                
                <div className="assignment-content">
                  <div className="assignment-header">
                    <h3>{assignment.title}</h3>
                    <span className={`priority-badge ${assignment.priority}`}>
                      {assignment.priority}
                    </span>
                  </div>
                  
                  {assignment.description && (
                    <p className="assignment-desc">{assignment.description}</p>
                  )}
                  
                  <div className="assignment-footer">
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

      {/* Add Assignment Modal */}
      {showModal && (
        <AddAssignmentModal 
          onClose={() => setShowModal(false)}
          onAdd={(assignment) => {
            addAssignment(assignment);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

interface AddAssignmentModalProps {
  onClose: () => void;
  onAdd: (assignment: Assignment) => void;
}

function AddAssignmentModal({ onClose, onAdd }: AddAssignmentModalProps) {
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
          <h2>New Assignment</h2>
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
            Add Assignment
          </button>
        </form>
      </div>
    </div>
  );
}
