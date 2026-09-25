import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  GraduationCap,
  Shield,
  BookOpen,
  UserCheck,
  HeartHandshake,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('PARENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const roleConfigs = [
    {
      role: 'PARENT' as UserRole,
      title: 'Parent & Guardian Portal',
      description: 'Monitor child grades, attendance, and communicate with instructors.',
      icon: HeartHandshake,
      color: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      activeBorder: 'border-purple-500 shadow-purple-500/20'
    },
    {
      role: 'STUDENT' as UserRole,
      title: 'Student Learning Hub',
      description: 'Course materials, assignments, quizzes, and personal grades.',
      icon: GraduationCap,
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeBorder: 'border-emerald-500 shadow-emerald-500/20'
    },
    {
      role: 'FACULTY' as UserRole,
      title: 'Faculty Academic Portal',
      description: 'Manage assignments, grade submissions, and answer parent remarks.',
      icon: BookOpen,
      color: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeBorder: 'border-amber-500 shadow-amber-500/20'
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Institutional Admin Console',
      description: 'User access control, course rosters, and university compliance audit.',
      icon: Shield,
      color: 'from-rose-600 to-red-600',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      activeBorder: 'border-rose-500 shadow-rose-500/20'
    }
  ];

  const currentRoleUsers = users.filter((u) => u.role === selectedRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Case-insensitive email matching
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundUser) {
      setError('No registered account found with this email. Please check your credentials or select a quick-login profile.');
      return;
    }

    if (foundUser.role !== selectedRole) {
      setError(`Account belongs to ${foundUser.role} role. Please select the correct portal tab above.`);
      return;
    }

    onLogin(foundUser);
  };

  const handleQuickLogin = (user: User) => {
    setEmail(user.email);
    setPassword('••••••••••••');
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 z-10">
        {/* App Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-2">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
            EduTrack Enterprise LMS
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            University Academic Intelligence & Role-Based Access Control Platform
          </p>
        </div>

        {/* Portal Role Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {roleConfigs.map((cfg) => {
            const Icon = cfg.icon;
            const isSelected = selectedRole === cfg.role;
            return (
              <button
                key={cfg.role}
                type="button"
                onClick={() => {
                  setSelectedRole(cfg.role);
                  setError(null);
                  setEmail('');
                  setPassword('');
                }}
                className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer relative border ${
                  isSelected
                    ? `bg-slate-900/90 ${cfg.activeBorder} shadow-lg ring-1 ring-white/10`
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700/80 text-slate-400'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 bg-gradient-to-tr ${cfg.color} text-white shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white tracking-wide">{cfg.role}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cfg.title.split(' ')[0]}</div>
                {isSelected && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Login Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Secure Portal Login
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    roleConfigs.find((r) => r.role === selectedRole)?.badgeBg
                  }`}
                >
                  {selectedRole} AUTH
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {roleConfigs.find((r) => r.role === selectedRole)?.title}
              </h2>
            </div>
            <div className="text-xs text-slate-400 max-w-xs">
              {roleConfigs.find((r) => r.role === selectedRole)?.description}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Left: Email/Password Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder={`e.g. ${currentRoleUsers[0]?.email || 'user@edutrack.edu'}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password / Credentials
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Enter account password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Enterprise SSO / OAuth Enabled</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> 256-Bit SSL Encrypted
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <span>Authorize & Enter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Right: One-Click Quick Profiles for Demonstration */}
            <div className="lg:col-span-5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Pre-Configured {selectedRole} Accounts
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">1-Click Test Login</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Click any persona below to authenticate instantly with appropriate role permissions:
              </p>

              <div className="space-y-2 pt-1">
                {currentRoleUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{u.email}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shrink-0 ml-2">
                      Login
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Restriction Notice */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Role-Based Access Control (RBAC) enforced. Parents can only access their linked child's records. Staff and admin systems are restricted.
          </span>
        </div>
      </div>
    </div>
  );
};
