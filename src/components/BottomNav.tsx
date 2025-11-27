import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  CalendarDays, 
  BookOpen 
} from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={22} />
        <span>Schedule</span>
      </NavLink>
      <NavLink to="/subjects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BookOpen size={22} />
        <span>Subjects</span>
      </NavLink>
      <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <CheckSquare size={22} />
        <span>Attendance</span>
      </NavLink>
      <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <CalendarDays size={22} />
        <span>Events</span>
      </NavLink>
    </nav>
  );
}
