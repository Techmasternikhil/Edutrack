import React from 'react';
import { User, Course, ParentReview, Submission } from '../types';
import {
  Users,
  BookOpen,
  ShieldAlert,
  Activity,
  HeartHandshake,
  MessageSquareQuote,
  TrendingUp,
  Server
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  courses: Course[];
  submissions: Submission[];
  parentReviews: ParentReview[];
  onOpenOracleSchemaModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  courses,
  submissions,
  parentReviews
}) => {
  const studentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const facultyCount = users.filter((u) => u.role === 'FACULTY').length;
  const parentCount = users.filter((u) => u.role === 'PARENT').length;
  const totalCourses = courses.length;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-rose-950/30 via-slate-900 to-indigo-950/30 border border-rose-500/20">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>System Administration & Institutional Metrics</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
          University Administration Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Overseeing faculty rosters, student enrollments, parental monitoring links, and institutional compliance.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Enrolled Students</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{studentsCount}</div>
            <span className="text-[10px] text-slate-400">Undergraduate & Graduate</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Faculty Members</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{facultyCount}</div>
            <span className="text-[10px] text-slate-400">Department of Computer Science</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Parent Portals Active</span>
            <div className="text-2xl font-black text-purple-400 mt-1">{parentCount}</div>
            <span className="text-[10px] text-purple-400/80 font-medium">Linked Guardians</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Courses</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{totalCourses}</div>
            <span className="text-[10px] text-slate-400">Semester 4 Curricula</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: User Roster & Parent Oversight Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Directory */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Registered Accounts & Roles</h3>
            <span className="text-xs text-slate-400">Total: {users.length}</span>
          </div>

          <div className="divide-y divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {u.role === 'PARENT' && (
                    <span className="text-[10px] text-purple-400 font-medium hidden sm:inline">
                      Monitoring {u.childStudentIds?.length} Student(s)
                    </span>
                  )}
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

        {/* Parent-Faculty Review Stream */}
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

          <div className="space-y-3">
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
    </div>
  );
};
