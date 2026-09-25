import React, { useState } from 'react';
import { User, Course, ParentReview, Submission, RegistrationRequest, AcademicClass } from '../types';
import {
  Users,
  BookOpen,
  ShieldAlert,
  Activity,
  HeartHandshake,
  MessageSquareQuote,
  TrendingUp,
  Server,
  UserCheck,
  Check,
  X,
  Clock,
  AlertCircle,
  UserPlus,
  Shield,
  Eye,
  Building,
  School,
  FileText,
  Award,
  Video,
  Database,
  CalendarCheck,
  Plus
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  courses: Course[];
  submissions: Submission[];
  parentReviews: ParentReview[];
  academicClasses?: AcademicClass[];
  registrationRequests?: RegistrationRequest[];
  onApproveRegistration?: (requestId: string) => void;
  onRejectRegistration?: (requestId: string, reason: string) => void;
  onCreateAdmin?: (adminData: { name: string; email: string; department?: string }) => void;
  onCreateClass?: (classData: {
    className: string;
    section: string;
    department: string;
    semester: number;
    academicYear: string;
    classTeacherId: string;
  }) => void;
  onApproveUser?: (userId: string, status: 'APPROVED' | 'REJECTED') => void;
  onOpenOracleSchemaModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  courses,
  submissions,
  parentReviews,
  academicClasses = [],
  registrationRequests = [],
  onApproveRegistration,
  onRejectRegistration,
  onCreateAdmin,
  onCreateClass,
  onApproveUser,
  onOpenOracleSchemaModal
}) => {
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Modals state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDept, setNewAdminDept] = useState('Academic Affairs');
  const [adminCreateMsg, setAdminCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Class Modal state
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('B.Tech Artificial Intelligence & Data Science');
  const [newClassSection, setNewClassSection] = useState('Section A');
  const [newClassDept, setNewClassDept] = useState('Computer Science & Engineering');
  const [newClassSem, setNewClassSem] = useState(1);
  const [newClassYear, setNewClassYear] = useState('2026-2027');
  const facultyList = users.filter((u) => u.role === 'FACULTY');
  const [selectedClassTeacherId, setSelectedClassTeacherId] = useState(facultyList[0]?.id || 'usr-fac-1');
  const [classCreateSuccess, setClassCreateSuccess] = useState<string | null>(null);

  const [viewingRequest, setViewingRequest] = useState<RegistrationRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<RegistrationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Pending teacher review and pending admin review counts
  const pendingAdminRequests = registrationRequests.filter(
    (r) => r.status === 'PENDING_ADMIN_REVIEW' || r.status === 'TEACHER_CONFIRMED'
  );
  const pendingTeacherRequests = registrationRequests.filter(
    (r) => r.status === 'PENDING_TEACHER_REVIEW'
  );

  const approvedUsers = users.filter((u) => !u.status || u.status === 'APPROVED');
  const studentsCount = approvedUsers.filter((u) => u.role === 'STUDENT').length;
  const facultyCount = approvedUsers.filter((u) => u.role === 'FACULTY').length;
  const parentCount = approvedUsers.filter((u) => u.role === 'PARENT').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const totalCourses = courses.length;

  const filteredUsers = filterRole === 'ALL'
    ? users
    : users.filter((u) => u.role === filterRole);

  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCreateMsg(null);

    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      setAdminCreateMsg({ type: 'error', text: 'Admin name and email are required.' });
      return;
    }

    if (onCreateAdmin) {
      onCreateAdmin({
        name: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        department: newAdminDept.trim()
      });
      setAdminCreateMsg({ type: 'success', text: `Admin account for ${newAdminName} created successfully!` });
      setTimeout(() => {
        setIsAddAdminOpen(false);
        setAdminCreateMsg(null);
        setNewAdminName('');
        setNewAdminEmail('');
      }, 1500);
    }
  };

  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassSection.trim()) return;

    if (onCreateClass) {
      onCreateClass({
        className: newClassName.trim(),
        section: newClassSection.trim(),
        department: newClassDept.trim(),
        semester: Number(newClassSem) || 1,
        academicYear: newClassYear.trim(),
        classTeacherId: selectedClassTeacherId
      });
      setClassCreateSuccess(`Class "${newClassName} (${newClassSection})" created and assigned to Class Teacher!`);
      setTimeout(() => {
        setIsAddClassOpen(false);
        setClassCreateSuccess(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Institutional Governance & System Administration</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
            University Administration Console
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Overseeing RBAC permissions, academic classes, course rosters, and institutional security.
          </p>
        </div>

        {/* Admin Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsAddClassOpen(true);
              setClassCreateSuccess(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <School className="w-4 h-4" />
            <span>+ Add Academic Class</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddAdminOpen(true);
              setAdminCreateMsg(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Administrator</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (8 Total institucional cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Users</span>
            <div className="text-2xl font-black text-white mt-1">{users.length}</div>
            <span className="text-[10px] text-slate-500">Accounts in DB</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Students</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{studentsCount}</div>
            <span className="text-[10px] text-emerald-500/80">Active Learners</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Faculty</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{facultyCount}</div>
            <span className="text-[10px] text-indigo-400/80">Instructors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Administrators</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{adminCount}</div>
            <span className="text-[10px] text-rose-400/80">System Admins</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Two-Stage Pipeline Registration Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-medium">Stage 1: Teacher Review</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingTeacherRequests.length}</div>
            <span className="text-[10px] text-amber-400/70">Awaiting Class Teacher</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <School className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-medium">Stage 2: Admin Approval</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{pendingAdminRequests.length}</div>
            <span className="text-[10px] text-emerald-400/70">Teacher-Confirmed Ready</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-300 font-medium">Active Courses</span>
            <div className="text-2xl font-black text-purple-400 mt-1">{totalCourses}</div>
            <span className="text-[10px] text-purple-400/70">University Curricula</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Two-Stage Registration Approval Queue for Admin */}
      <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">
              Two-Stage Registration Approval Queue ({pendingAdminRequests.length})
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
            Teacher-Confirmed Only
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Only applications verified and confirmed by assigned Class Teachers appear here. Final Administrator approval activates the user account for LMS login.
        </p>

        {pendingAdminRequests.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <Check className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-200">No Pending Admin Approvals</div>
            <div className="text-[11px] text-slate-400">
              All teacher-confirmed registrations have been approved or declined.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingAdminRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                          req.requestedRole === 'STUDENT' ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}
                      >
                        {req.requestedRole === 'STUDENT' ? <Users className="w-4 h-4" /> : <HeartHandshake className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{req.userName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                            {req.requestedRole}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{req.userEmail}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                      Confirmed by Teacher
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1 text-slate-300">
                    <div>
                      <strong className="text-slate-200">Class:</strong> {req.className || 'B.Tech CSE'}
                    </div>
                    <div>
                      <strong className="text-slate-200">Class Teacher:</strong> {req.classTeacherName || 'Assigned Faculty'}
                    </div>
                    {req.requestedRole === 'PARENT' && (
                      <div>
                        <strong className="text-slate-200">Child:</strong> {req.childName} ({req.relationship || 'Father'})
                      </div>
                    )}
                    <div>
                      <strong className="text-slate-200">Teacher Decision:</strong>{' '}
                      <span className="text-emerald-400 font-semibold">Confirmed</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingRequest(req)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Details</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingRequest(req);
                        setRejectReason('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveRegistration && onApproveRegistration(req.id)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Activate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Roster & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Registered Accounts Directory</h3>
              <p className="text-[11px] text-slate-400">Total institutional accounts: {users.length}</p>
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              {(['ALL', 'STUDENT', 'FACULTY', 'PARENT', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    filterRole === r ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span>{u.name}</span>
                      {u.isClassTeacher && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                          Class Teacher
                        </span>
                      )}
                      {(u.accountStatus === 'PENDING' || u.status === 'PENDING') && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : u.role === 'FACULTY'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : u.role === 'STUDENT'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parent-Faculty Inquiries Stream */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-purple-400" />
              <span>Parent Inquiries</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
              {parentReviews.length} Logged
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {parentReviews.map((pr) => (
              <div
                key={pr.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{pr.parentName}</span>
                  <span className="text-[10px] text-slate-400">{new Date(pr.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-[11px] text-indigo-400 font-medium">Re: {pr.studentName}</div>
                <p className="text-[11px] text-slate-300 italic">"{pr.message}"</p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-semibold">
                    {pr.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{pr.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Administrator Modal */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <Shield className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Create New Institutional Administrator</h3>
              </div>
              <button
                onClick={() => setIsAddAdminOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Public self-registration for ADMIN is prohibited. Only an existing authenticated Administrator can provision a new Administrator account.
            </p>

            {adminCreateMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  adminCreateMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminCreateMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sandra Bullock"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Official Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin.sandra@edutrack.edu"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrative Division / Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office of Registrar / Academic Affairs"
                  value={newAdminDept}
                  onChange={(e) => setNewAdminDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Provision Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin View Details Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Registration Application Audit View</h3>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Applicant Name</span>
                  <strong className="text-white text-xs">{viewingRequest.userName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Applied Role</span>
                  <span className="text-indigo-400 font-bold">{viewingRequest.requestedRole}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Email</span>
                  <span className="font-mono text-slate-300">{viewingRequest.userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Class</span>
                  <span>{viewingRequest.className || 'B.Tech CSE'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div>
                  <span className="text-slate-500 text-[10px]">Assigned Class Teacher:</span>{' '}
                  <strong className="text-white">{viewingRequest.classTeacherName || 'Dr. Teacher'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Teacher Confirmation Decision:</span>{' '}
                  <span className="text-emerald-400 font-semibold">Confirmed</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Teacher Reviewed At:</span>{' '}
                  <span className="text-slate-300">
                    {viewingRequest.teacherReviewedAt
                      ? new Date(viewingRequest.teacherReviewedAt).toLocaleString()
                      : 'Verified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const req = viewingRequest;
                  setViewingRequest(null);
                  setRejectingRequest(req);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold cursor-pointer"
              >
                Reject Application
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = viewingRequest.id;
                  setViewingRequest(null);
                  onApproveRegistration && onApproveRegistration(id);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                Approve & Activate Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Rejection Reason Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Decline Registration Application</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Please enter the official institutional reason for rejecting{' '}
              <strong className="text-white">{rejectingRequest.userName}</strong>. Reason is required for compliance audit.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rejection Justification *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Failure to submit required institutional documentation..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  if (!rejectReason.trim()) return;
                  onRejectRegistration && onRejectRegistration(rejectingRequest.id, rejectReason.trim());
                  setRejectingRequest(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Academic Class Modal */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <School className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Create New Academic Class / Batch</h3>
              </div>
              <button
                onClick={() => setIsAddClassOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Define the academic program, section, and assign a dedicated <strong>Class Teacher</strong> responsible for first-stage student and parent registration verification.
            </p>

            {classCreateSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{classCreateSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Class / Program Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Section *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newClassSem}
                    onChange={(e) => setNewClassSem(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newClassDept}
                    onChange={(e) => setNewClassDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign Class Teacher (Faculty) *
                </label>
                <select
                  value={selectedClassTeacherId}
                  onChange={(e) => setSelectedClassTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.department || 'Faculty'}) • {f.email}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  This faculty member will receive and verify all student and parent registrations for this class.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Class & Assign Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

