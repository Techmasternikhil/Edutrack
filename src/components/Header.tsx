import React from 'react';
import { User, UserRole, Notification } from '../types';
import {
  GraduationCap,
  Bell,
  Search,
  LogOut,
  Shield
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onOpenProfile: () => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsRead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenProfile,
  onLogout,
  notifications,
  onMarkNotificationsRead
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleBadgeColors: Record<UserRole, string> = {
    ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    FACULTY: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    STUDENT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    PARENT: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              EduTrack LMS
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-400">University Academic Intelligence System</p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search courses, assignments, student records..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Right Controls: Role Badge, Notifications, Profile */}
      <div className="flex items-center gap-3">

        {/* Authenticated Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 font-medium hidden sm:inline">Role:</span>
          <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${roleBadgeColors[currentUser.role]}`}>
            {currentUser.role}
          </span>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => {
              const nextState = !showNotifications;
              setShowNotifications(nextState);
              if (nextState && unreadCount > 0 && onMarkNotificationsRead) {
                onMarkNotificationsRead();
              }
            }}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white relative cursor-pointer transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">System Notifications</span>
                <span className="text-[10px] text-indigo-400">{unreadCount} new</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-700/40">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-700/40 transition-colors text-xs">
                      <div className="font-semibold text-slate-200">{n.title}</div>
                      <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer text-left"
          title="View Profile"
        >
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
          />
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{currentUser.email}</div>
          </div>
        </button>

        {/* Secure Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer"
          title="Sign Out of Portal"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
