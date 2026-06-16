import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Ticket, 
  BookOpen, 
  Settings, 
  Bell, 
  Activity, 
  Users, 
  AlertOctagon,
  LogOut,
  FolderOpen
} from 'lucide-react';

export default function Sidebar({ currentSubpage, onSubpageChange }) {
  const { user, logout, unreadNotificationsCount } = useAuth();

  if (!user) return null;

  const role = user.role;

  const menuItems = {
    Employee: [
      { id: 'dashboard_home', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'raise_ticket', label: 'Raise Ticket', icon: PlusCircle },
      { id: 'my_tickets', label: 'My Tickets', icon: Ticket },
      { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    ],
    'IT Staff': [
      { id: 'staff_home', label: 'Assigned Tickets', icon: Ticket },
      { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    ],
    Admin: [
      { id: 'admin_home', label: 'Analytics Panel', icon: LayoutDashboard },
      { id: 'admin_tickets', label: 'All Tickets', icon: FolderOpen },
      { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    ]
  };

  const activeRoleItems = menuItems[role] || [];

  return (
    <aside className="w-64 bg-white text-slate-700 min-h-screen flex flex-col justify-between border-r border-corporate-grayBorder">
      <div>
        {/* User Card */}
        <div className="p-6 border-b border-corporate-grayBorder bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-corporate-orange/15 text-corporate-orange flex items-center justify-center font-bold text-lg shadow-sm border border-corporate-orange/20">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <h4 className="font-bold text-slate-800 text-sm truncate">{user.name}</h4>
              <p className="text-[10px] text-corporate-orange font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <div className="mt-3 bg-slate-100 rounded-lg p-2 text-center text-[10px] font-semibold text-slate-600 border border-slate-200">
            {user.department} Department
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Navigation</p>
          {activeRoleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSubpage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSubpageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-corporate-orangeLight text-corporate-orange shadow-sm border border-corporate-orange/25' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-corporate-orange' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action footer */}
      <div className="p-4 border-t border-corporate-grayBorder">
        <button
          onClick={() => {
            logout();
            window.location.reload();
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Dashboard</span>
        </button>
      </div>
    </aside>
  );
}
