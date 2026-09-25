import React from 'react';
import { User } from '../types';
import { X, Mail, Shield, BookOpen, UserCheck, HeartHandshake, LogOut } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-lg mb-3"
          />
          <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
          <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {currentUser.role} ACCOUNT
          </span>
        </div>

        <div className="mt-5 space-y-3.5 text-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Email Address</div>
              <div className="text-slate-200">{currentUser.email}</div>
            </div>
          </div>

          {currentUser.department && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Department</div>
                <div className="text-slate-200">{currentUser.department}</div>
              </div>
            </div>
          )}

          {currentUser.role === 'STUDENT' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Registration</div>
                <div className="text-slate-200 font-semibold">{currentUser.regNumber}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Current GPA</div>
                <div className="text-emerald-400 font-bold">{currentUser.gpa?.toFixed(2)}</div>
              </div>
            </div>
          )}

          {currentUser.role === 'PARENT' && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
                <HeartHandshake className="w-4 h-4" />
                <span>Parental Monitoring Link</span>
              </div>
              <p className="text-[11px] text-purple-200/80 leading-relaxed">
                Authorized guardian for student ID(s):{' '}
                <span className="font-mono text-purple-300">{currentUser.childStudentIds?.join(', ')}</span>
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Security Access</div>
              <div className="text-slate-200">Role-Based Access Control (RBAC) Active</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          {onLogout ? (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
