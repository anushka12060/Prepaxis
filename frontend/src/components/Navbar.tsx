import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Interviews', path: '/interviews', icon: MessageSquare },
  { label: 'Resume', path: '/resume', icon: FileText },
  { label: 'Question bank', path: '/questions', icon: BookOpen },
];

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div
      className={`shrink-0 h-screen border-r border-line bg-paper flex flex-col p-4 sticky top-0 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && <span className="font-display font-bold text-lg text-ink">PrepAxis</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#eeeae1] text-[#6b675d] transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-ink text-paper font-medium'
                  : 'text-[#6b675d] hover:bg-[#eeeae1]'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>

      <button
        onClick={logout}
        title={collapsed ? 'Log out' : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-[#6b675d] hover:bg-[#eeeae1] transition-colors ${
          collapsed ? 'justify-center px-0' : ''
        }`}
      >
        <span className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-[10px] font-mono shrink-0">
          {initials}
        </span>
        {!collapsed && (
          <span className="flex items-center gap-1.5">
            <LogOut size={14} />
            Log out
          </span>
        )}
      </button>
    </div>
  );
}