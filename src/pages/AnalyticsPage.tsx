import { useStore } from '../store/useStore';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Target
} from 'lucide-react';
import { calculateAttendanceStats, getWeeklyAttendanceData } from '../utils/helpers';
import './AnalyticsPage.css';

const COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  late: '#f59e0b',
  cancelled: '#9333ea',
};

export default function AnalyticsPage() {
  const { subjects, classes, attendance } = useStore();
  
  const overallStats = calculateAttendanceStats(attendance);
  const weeklyData = getWeeklyAttendanceData(attendance, 8);
  
  // Per-SUBJECT statistics (not per-class)
  // Group classes by subjectId and aggregate attendance
  const subjectStats = subjects.map((subject) => {
    // Get all class IDs for this subject
    const subjectClassIds = classes
      .filter(c => c.subjectId === subject.id)
      .map(c => c.id);
    
    // Filter attendance records for these classes
    const subjectAttendance = attendance.filter(a => subjectClassIds.includes(a.classId));
    
    // Calculate stats
    const total = subjectAttendance.length;
    const present = subjectAttendance.filter(a => a.status === 'present').length;
    const absent = subjectAttendance.filter(a => a.status === 'absent').length;
    const late = subjectAttendance.filter(a => a.status === 'late').length;
    const cancelled = subjectAttendance.filter(a => a.status === 'cancelled').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    return {
      id: subject.id,
      name: subject.name.length > 12 ? subject.name.slice(0, 12) + '...' : subject.name,
      fullName: subject.name,
      percentage,
      present,
      absent,
      late,
      cancelled,
      total,
      color: subject.color,
      classCount: subjectClassIds.length,
    };
  }).filter(s => s.total > 0 || s.classCount > 0); // Only show subjects with classes or attendance

  // Pie chart data
  const pieData = [
    { name: 'Present', value: overallStats.present, color: COLORS.present },
    { name: 'Absent', value: overallStats.absent, color: COLORS.absent },
    { name: 'Late', value: overallStats.late, color: COLORS.late },
    { name: 'Cancelled', value: overallStats.cancelled, color: COLORS.cancelled },
  ].filter((d) => d.value > 0);

  return (
    <div className="analytics-page">
      <header className="page-header">
        <h1><BarChart3 size={24} /> Analytics</h1>
        <p>Track your attendance performance</p>
      </header>

      {/* Overall Stats */}
      <section className="stats-overview">
        <div className="main-stat">
          <div 
            className="percentage-ring"
            style={{
              background: `conic-gradient(
                ${COLORS.present} 0deg ${overallStats.percentage * 3.6}deg,
                #e5e7eb ${overallStats.percentage * 3.6}deg 360deg
              )`
            }}
          >
            <div className="ring-inner">
              <span className="percentage-value">{overallStats.percentage}%</span>
              <span className="percentage-label">Attendance</span>
            </div>
          </div>
        </div>
        
        <div className="stat-cards">
          <div className="stat-mini present">
            <CheckCircle2 size={20} />
            <div>
              <span className="stat-num">{overallStats.present}</span>
              <span className="stat-text">Present</span>
            </div>
          </div>
          <div className="stat-mini absent">
            <XCircle size={20} />
            <div>
              <span className="stat-num">{overallStats.absent}</span>
              <span className="stat-text">Absent</span>
            </div>
          </div>
          <div className="stat-mini late">
            <Clock size={20} />
            <div>
              <span className="stat-num">{overallStats.late}</span>
              <span className="stat-text">Late</span>
            </div>
          </div>
          <div className="stat-mini cancelled">
            <Ban size={20} />
            <div>
              <span className="stat-num">{overallStats.cancelled}</span>
              <span className="stat-text">Cancelled</span>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Trend Chart */}
      {weeklyData.some((d) => d.present > 0 || d.absent > 0 || d.late > 0) && (
        <section className="chart-section">
          <div className="section-header">
            <h2><TrendingUp size={20} /> Weekly Trend</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke={COLORS.present}
                  strokeWidth={3}
                  dot={{ fill: COLORS.present, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke={COLORS.absent}
                  strokeWidth={3}
                  dot={{ fill: COLORS.absent, strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke={COLORS.late}
                  strokeWidth={3}
                  dot={{ fill: COLORS.late, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Attendance Distribution */}
      {pieData.length > 0 && (
        <section className="chart-section">
          <div className="section-header">
            <h2><Target size={20} /> Distribution</h2>
          </div>
          <div className="chart-container pie-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} classes`, '']}
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {pieData.map((entry) => (
                <div key={entry.name} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: entry.color }} />
                  <span className="legend-label">{entry.name}</span>
                  <span className="legend-value">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Per-Subject Statistics */}
      {subjectStats.length > 0 && (
        <section className="chart-section">
          <div className="section-header">
            <h2><BarChart3 size={20} /> By Subject</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={Math.max(200, subjectStats.length * 50)}>
              <BarChart data={subjectStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: { payload?: { fullName?: string; total?: number; classCount?: number } }) => {
                    if (props.payload) {
                      return [`${value}% (${props.payload.total} classes across ${props.payload.classCount} day${props.payload.classCount !== 1 ? 's' : ''}/week)`, props.payload.fullName];
                    }
                    return [`${value}%`, name];
                  }}
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="percentage" 
                  radius={[0, 8, 8, 0]}
                >
                  {subjectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Subject Detail Cards */}
      {subjectStats.length > 0 && (
        <section className="class-details-section">
          <div className="section-header">
            <h2>Subject Breakdown</h2>
          </div>
          <div className="class-detail-cards">
            {subjectStats.map((subject) => (
              <div key={subject.id} className="class-detail-card">
                <div className="class-detail-header" style={{ borderLeftColor: subject.color }}>
                  <h3>{subject.fullName}</h3>
                  <span 
                    className="class-percentage"
                    style={{ 
                      color: subject.percentage >= 75 ? COLORS.present : 
                             subject.percentage >= 50 ? COLORS.late : COLORS.absent 
                    }}
                  >
                    {subject.percentage}%
                  </span>
                </div>
                <div className="subject-schedule-info">
                  <span>{subject.classCount} class{subject.classCount !== 1 ? 'es' : ''}/week</span>
                </div>
                <div className="class-detail-stats">
                  <div className="detail-stat present">
                    <span>{subject.present}</span>
                    <span>Present</span>
                  </div>
                  <div className="detail-stat absent">
                    <span>{subject.absent}</span>
                    <span>Absent</span>
                  </div>
                  <div className="detail-stat late">
                    <span>{subject.late}</span>
                    <span>Late</span>
                  </div>
                  <div className="detail-stat total">
                    <span>{subject.total}</span>
                    <span>Total</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${subject.percentage}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {attendance.length === 0 && (
        <div className="empty-state">
          <BarChart3 size={48} />
          <p>No attendance data yet</p>
          <span>Start marking attendance to see your statistics</span>
        </div>
      )}
    </div>
  );
}
