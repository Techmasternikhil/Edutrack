import React, { useState } from 'react';
import { AcademicClass, User, UserRole } from '../types';
import {
  GraduationCap,
  Shield,
  BookOpen,
  HeartHandshake,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Clock,
  Building,
  Hash,
  School,
  UserCheck2
} from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  classes?: AcademicClass[];
  onLogin: (user: User) => void;
  onRegister: (data: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    regNumber?: string;
    childStudentIds?: string[];
    phone?: string;
    classId?: string;
    className?: string;
    studentRegNumber?: string;
    childName?: string;
    relationship?: string;
  }) => { success: boolean; message: string };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, classes = [], onLogin, onRegister }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PARENT');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [regNumber, setRegNumber] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'cls-cse-4a');
  const [selectedChildId, setSelectedChildId] = useState('usr-stu-1');
  const [relationship, setRelationship] = useState('Father');

  // UI feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [twoStageNotice, setTwoStageNotice] = useState<{
    role: UserRole;
    applicantName: string;
    className?: string;
    teacherName?: string;
  } | null>(null);

  const roleConfigs = [
    {
      role: 'PARENT' as UserRole,
      title: 'Parent & Guardian Portal',
      description: 'Monitor child grades, attendance, and communicate with instructors.',
      icon: HeartHandshake,
      color: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      activeBorder: 'border-purple-500 shadow-purple-500/20',
      canRegister: true
    },
    {
      role: 'STUDENT' as UserRole,
      title: 'Student Learning Hub',
      description: 'Course materials, assignments, quizzes, and personal grades.',
      icon: GraduationCap,
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeBorder: 'border-emerald-500 shadow-emerald-500/20',
      canRegister: true
    },
    {
      role: 'FACULTY' as UserRole,
      title: 'Faculty Academic Portal',
      description: 'Manage assignments, grade submissions, and answer parent remarks.',
      icon: BookOpen,
      color: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeBorder: 'border-amber-500 shadow-amber-500/20',
      canRegister: true
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Institutional Admin Console',
      description: 'User access control, course rosters, and university compliance audit.',
      icon: Shield,
      color: 'from-rose-600 to-red-600',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      activeBorder: 'border-rose-500 shadow-rose-500/20',
      canRegister: false // Admin registration prohibited
    }
  ];

  const currentRoleUsers = users.filter((u) => u.role === selectedRole);
  const activeStudents = users.filter((u) => u.role === 'STUDENT' && (!u.status || u.status === 'APPROVED'));

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundUser) {
      setError('No account found with this email. Please check your credentials or register a new account.');
      return;
    }

    if (foundUser.role !== selectedRole) {
      setError(`Account belongs to ${foundUser.role} role. Please select the correct portal tab above.`);
      return;
    }

    // Check approval status for non-admin accounts
    if (foundUser.role !== 'ADMIN' && foundUser.status === 'PENDING') {
      setError('Your registration is pending Administrator approval. Please check back once verified by the university.');
      return;
    }

    if (foundUser.role !== 'ADMIN' && foundUser.status === 'REJECTED') {
      setError('Your registration was declined by the Administrator. Please contact university admissions.');
      return;
    }

    onLogin(foundUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (selectedRole === 'ADMIN') {
      setError('Administrator accounts cannot be self-registered. Only existing authenticated administrators can create new admin accounts.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError('Please provide your full name and valid email.');
      return;
    }

    const targetClass = classes.find((c) => c.id === selectedClassId);

    const payload: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: selectedRole,
      phone: phone.trim() || undefined
    };

    if (selectedRole === 'FACULTY') {
      payload.department = department;
    } else if (selectedRole === 'STUDENT') {
      payload.department = department;
      payload.classId = selectedClassId;
      payload.className = targetClass ? `${targetClass.className || targetClass.name} (${targetClass.section})` : 'B.Tech CSE - Semester 4 (Sec A)';
      payload.regNumber = regNumber.trim() || `CS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    } else if (selectedRole === 'PARENT') {
      const selectedChild = activeStudents.find((s) => s.id === selectedChildId);
      payload.childStudentIds = [selectedChildId];
      payload.childName = selectedChild?.name || 'Selected Student';
      payload.studentRegNumber = selectedChild?.regNumber || 'STU-ID';
      payload.relationship = relationship;
      payload.classId = selectedChild?.classId || selectedClassId;
      payload.className = selectedChild?.className || (targetClass ? `${targetClass.className || targetClass.name} (${targetClass.section})` : undefined);
    }

    const result = onRegister(payload);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Set two stage notice modal
    setTwoStageNotice({
      role: selectedRole,
      applicantName: name.trim(),
      className: targetClass ? `${targetClass.className || targetClass.name} (${targetClass.section})` : undefined,
      teacherName: targetClass?.classTeacherName || 'Assigned Class Teacher'
    });

    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRegNumber('');
  };

  const handleQuickLogin = (user: User) => {
    if (user.role !== 'ADMIN' && (user.accountStatus === 'PENDING' || user.status === 'PENDING')) {
      setError(`Cannot login: Account for ${user.name} is awaiting Class Teacher / Administrator approval.`);
      return;
    }
    setEmail(user.email);
    setPassword('••••••••••••');
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Two-Stage Registration Confirmation Notice Modal */}
      {twoStageNotice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <UserCheck2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Two-Stage Verification Pipeline Initialized
              </span>
              <h3 className="text-xl font-bold text-white">Registration Submitted Successfully!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thank you, <strong className="text-white">{twoStageNotice.applicantName}</strong>. Your registration for{' '}
                <strong className="text-indigo-300">{twoStageNotice.role}</strong> has entered the official university authorization workflow.
              </p>
            </div>

            {/* Visual Pipeline Progression */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">Stage 1: Class Teacher Verification</div>
                  <div className="text-[11px] text-slate-400">
                    Assigned Class Teacher ({twoStageNotice.teacherName || 'Faculty'}) must review and confirm your academic eligibility.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300">Stage 2: Institutional Admin Review</div>
                  <div className="text-[11px] text-slate-400">
                    Administrator performs final authorization and account activation.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Account status remains <strong className="text-amber-200">INACTIVE</strong> until both stages complete. You cannot log in yet.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setTwoStageNotice(null);
                setMode('LOGIN');
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Return to Login Portal
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-7 z-10">
        {/* App Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-1">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
            EduTrack Enterprise LMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            University Academic Intelligence & Role-Based Access Platform
          </p>
        </div>

        {/* Portal Role Selector */}
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
                  setSuccessMsg(null);
                  setEmail('');
                  setPassword('');
                  if (cfg.role === 'ADMIN' && mode === 'REGISTER') {
                    setMode('LOGIN');
                  }
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

        {/* Main Card (Login or Self-Service Registration) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
          {/* Header & Toggle Between Login & Register */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {mode === 'LOGIN' ? 'Portal Authentication' : 'Two-Stage Onboarding'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    roleConfigs.find((r) => r.role === selectedRole)?.badgeBg
                  }`}
                >
                  {selectedRole} {mode}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {mode === 'LOGIN'
                  ? roleConfigs.find((r) => r.role === selectedRole)?.title
                  : `Register New ${selectedRole} Account`}
              </h2>
            </div>

            {/* Mode Switcher Buttons */}
            {selectedRole !== 'ADMIN' ? (
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'LOGIN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'REGISTER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            ) : (
              <span className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 font-medium">
                Protected Authority
              </span>
            )}
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Mode 1: LOGIN FORM */}
            {mode === 'LOGIN' ? (
              <>
                <form onSubmit={handleLoginSubmit} className="lg:col-span-7 space-y-4">
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
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Enterprise SSO / 2FA Enabled</span>
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

                {/* Right: Quick Profiles for Testing */}
                <div className="lg:col-span-5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Pre-Configured {selectedRole} Accounts
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">1-Click Test</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Click any authorized account to log in directly:
                  </p>

                  <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1">
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
                          {u.status === 'PENDING' ? 'Pending' : 'Login'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Mode 2: REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="lg:col-span-12 space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-300">
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Two-Stage Verification Enforced</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Registration requests are routed first to your <strong>Assigned Class Teacher</strong> for academic confirmation, followed by <strong>Institutional Admin Review</strong>. Accounts remain inactive until both approvals complete.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun Kumar or Raj Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. applicant@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {selectedRole === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Academic Class / Batch / Section *
                      </label>
                      <div className="relative">
                        <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                        <select
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.className || cls.name} ({cls.section}) • Teacher: {cls.classTeacherName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'FACULTY' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Academic Department *
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Computer Science & Engineering"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === 'PARENT' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Relationship to Student *
                      </label>
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Legal Guardian</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Additional Specific Fields */}
                {selectedRole === 'STUDENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Department
                      </label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Student Registration / Roll Number
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="e.g. CS-2026-088"
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'PARENT' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Select Enrolled Child / Student Account *
                    </label>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {activeStudents.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.name} ({stu.regNumber || stu.email}) • {stu.className || 'B.Tech CSE'}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Parent verification will be routed to this child's assigned Class Teacher for confirmation.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Submit Registration for Teacher Verification</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security & Access Restriction Footer */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Institutional security protocol: Public registration for ADMIN accounts is prohibited. Administrator approvals are enforced via audit logging.
          </span>
        </div>
      </div>
    </div>
  );
};
