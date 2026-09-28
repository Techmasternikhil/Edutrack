import React, { useState, useMemo } from 'react';
import { Course, AttendanceRecord, AttendanceStatus } from '../../types';
import { APP_CONFIG } from '../../config/constants';
import {
  calculateAttendanceMetrics,
  calculateSubjectAttendanceMetrics,
  buildStudentAttendanceProfile,
  getAttendanceStatusBadgeClass,
  SubjectAttendanceMetric
} from '../../utils/academic';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  XCircle,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface StudentAttendanceSectionProps {
  studentId: string;
  studentName: string;
  regNumber?: string;
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
  isParentView?: boolean;
}

export const StudentAttendanceSection: React.FC<StudentAttendanceSectionProps> = ({
  studentId,
  studentName,
  regNumber,
  courses,
  attendanceRecords,
  isParentView = false
}) => {
  // Filters state for historical records table
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Filter attendance belonging strictly to this student
  const myRecords = useMemo(
    () => attendanceRecords.filter((a) => a.studentId === studentId),
    [attendanceRecords, studentId]
  );

  // Authoritative calculations from Academic Engine
  const profile = useMemo(
    () => buildStudentAttendanceProfile(courses, myRecords),
    [courses, myRecords]
  );

  const { overall, subjects, recentActivity, history } = profile;

  // Filter history records based on user interactive filters
  const filteredHistory = useMemo(() => {
    return history.filter((rec) => {
      // Subject filter
      if (selectedSubjectFilter !== 'ALL' && rec.courseId !== selectedSubjectFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'ALL' && rec.status !== selectedStatusFilter) {
        return false;
      }

      // Date range filter
      if (selectedTimeRange !== 'ALL') {
        const recDate = new Date(rec.date);
        const now = new Date();
        if (selectedTimeRange === 'TODAY') {
          const todayStr = now.toISOString().split('T')[0];
          if (rec.date !== todayStr) return false;
        } else if (selectedTimeRange === 'THIS_WEEK') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (recDate < sevenDaysAgo) return false;
        } else if (selectedTimeRange === 'THIS_MONTH') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (recDate < thirtyDaysAgo) return false;
        }
      }

      // Search query (matches course name, code, or date)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = rec.courseCode?.toLowerCase().includes(q);
        const matchName = rec.courseName?.toLowerCase().includes(q);
        const matchDate = rec.date.includes(q);
        if (!matchCode && !matchName && !matchDate) return false;
      }

      return true;
    });
  }, [history, selectedSubjectFilter, selectedStatusFilter, selectedTimeRange, searchTerm]);

  // Recharts Attendance Distribution Pie Data
  const distributionData = [
    { name: 'Present', value: overall.presentCount, color: '#10b981' },
    { name: 'Late', value: overall.lateCount, color: '#f59e0b' },
    { name: 'Absent', value: overall.absentCount, color: '#ef4444' }
  ];

  // Subject Comparison Chart Data
  const subjectChartData = subjects.map((s) => ({
    name: s.courseCode,
    fullName: s.courseName,
    rate: s.attendanceRate,
    isCompliant: s.isCompliant
  }));

  return (
    <div className="space-y-6">
      {/* Statutory Attendance Warning Banner */}
      {!overall.isCompliant && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-lg animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {isParentView ? 'Ward Attendance Shortage Warning' : 'Statutory Attendance Deficit Alert'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                {studentName}'s overall attendance is{' '}
                <span className="font-bold text-rose-400 font-mono text-sm">{overall.attendanceRate}%</span>, which is below the mandatory university threshold of{' '}
                <span className="font-semibold text-white">{APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}%</span>.
                {overall.shortageCount > 0 && (
                  <span className="ml-1 text-rose-200">
                    Must attend at least <strong className="text-white underline">{overall.shortageCount}</strong> consecutive upcoming sessions to regain compliance.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-slate-400 font-mono">Present / Total Classes</div>
            <div className="text-lg font-black text-rose-400">{overall.presentCount} / {overall.totalRecords}</div>
          </div>
        </div>
      )}

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Percentage */}
        <div className={`p-4 rounded-2xl glass-card border transition-all ${
          overall.isCompliant ? 'bg-slate-900/60 border-slate-800' : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              overall.isCompliant
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {overall.statusLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl sm:text-3xl font-black ${
              overall.isCompliant ? 'text-indigo-400' : 'text-rose-400'
            }`}>
              {overall.attendanceRate}%
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Minimum policy requirement: {APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}%
          </div>
        </div>

        {/* Sessions Attended (Present) */}
        <div className="p-4 rounded-2xl glass-card bg-emerald-950/20 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Present Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
            {overall.presentCount}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-1">
            Full class participation logged
          </div>
        </div>

        {/* Late Attendance */}
        <div className="p-4 rounded-2xl glass-card bg-amber-950/20 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Late Arrivals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
            {overall.lateCount}
          </div>
          <div className="text-[10px] text-amber-500/80 mt-1">
            Delayed session admissions
          </div>
        </div>

        {/* Absences */}
        <div className="p-4 rounded-2xl glass-card bg-rose-950/20 border border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Absent Sessions</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">
            {overall.absentCount}
          </div>
          <div className="text-[10px] text-rose-500/80 mt-1">
            {overall.totalRecords} total sessions scheduled
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Subject Comparison & Presence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Performance Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Subject Attendance Breakdown</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Statutory threshold target: {APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}%
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            {subjectChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No enrolled subjects found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`${val}%`, 'Attendance']}
                    labelFormatter={(label: any) => {
                      const found = subjectChartData.find((d) => d.name === label);
                      return found ? `${found.fullName} (${label})` : label;
                    }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {subjectChartData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.isCompliant ? '#6366f1' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Presence Distribution Pie Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Session Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Overall status distribution</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {overall.totalRecords === 0 ? (
              <div className="text-xs text-slate-500">No attendance sessions recorded yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, idx) => (
                      <Cell key={`slice-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-[10px] text-slate-400">Present</div>
              <div className="text-xs font-bold text-emerald-400">{overall.presentCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Late</div>
              <div className="text-xs font-bold text-amber-400">{overall.lateCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Absent</div>
              <div className="text-xs font-bold text-rose-400">{overall.absentCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Detailed Attendance Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Subject Attendance Overview</span>
            </h3>
            <p className="text-xs text-slate-400">
              Session metrics and statutory compliance per enrolled curriculum module
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
            {subjects.length} Enrolled Courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const isExpanded = expandedCourseId === sub.courseId;
            return (
              <div
                key={sub.courseId}
                className={`p-4 rounded-2xl glass-panel border transition-all flex flex-col justify-between ${
                  sub.isCompliant ? 'border-slate-800 bg-slate-900/60' : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {sub.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{sub.courseName}</h4>
                      <p className="text-[11px] text-slate-400">{sub.facultyName || 'Course Instructor'}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        sub.isCompliant
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {sub.statusLabel}
                    </span>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-400">Attendance Rate</span>
                      <span className={`text-base font-black font-mono ${
                        sub.isCompliant ? 'text-white' : 'text-rose-400'
                      }`}>
                        {sub.attendanceRate}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sub.isCompliant ? 'bg-indigo-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.attendanceRate)}%` }}
                      />
                    </div>
                  </div>

                  {/* Breakdown Numbers */}
                  <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400">Present</div>
                      <div className="text-xs font-bold text-emerald-400">{sub.presentCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Late</div>
                      <div className="text-xs font-bold text-amber-400">{sub.lateCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Absent</div>
                      <div className="text-xs font-bold text-rose-400">{sub.absentCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">Total</div>
                      <div className="text-xs font-bold text-white">{sub.totalRecords}</div>
                    </div>
                  </div>

                  {/* Shortage notice if warning */}
                  {!sub.isCompliant && sub.shortageCount > 0 && (
                    <div className="text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>Need {sub.shortageCount} consecutive classes for 75%</span>
                    </div>
                  )}
                </div>

                {/* Toggle Subject Recent Records */}
                <div className="pt-3 mt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setExpandedCourseId(isExpanded ? null : sub.courseId)}
                    className="w-full flex items-center justify-between text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Subject Log' : 'View Subject Session History'}</span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {sub.records.length === 0 ? (
                        <div className="text-[10px] text-slate-500 py-1">No recorded sessions for this course.</div>
                      ) : (
                        sub.records.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/40 text-[10px]"
                          >
                            <span className="font-mono text-slate-300">{r.date}</span>
                            <span className={`px-2 py-0.5 rounded font-bold border ${getAttendanceStatusBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live & Recent Attendance Activity Feed */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Recent Attendance Activity (Live Faculty Submissions)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live updates recorded directly from instructional sessions
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            Live Synced
          </span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No recent attendance records logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recentActivity.slice(0, 4).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white line-clamp-1">{rec.courseName || rec.courseCode}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{rec.date}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${getAttendanceStatusBadgeClass(rec.status)}`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Historical Attendance Register & Interactive Filters */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Complete Attendance History</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Filterable session-by-session ledger of academic presence
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredHistory.length} of {history.length} records
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Subject Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Subject</label>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Attendance Status</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Date Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Recorded Dates</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">Past 7 Days</option>
              <option value="THIS_MONTH">Past 30 Days</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Search Ledger</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search subject or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* History Table (Desktop & Tablet) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Session Date</th>
                <th className="py-2.5 px-3">Subject / Course</th>
                <th className="py-2.5 px-3">Course Code</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                    No attendance records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {rec.date}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {rec.courseName || 'Curriculum Subject Session'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-indigo-400">
                      {rec.courseCode || rec.courseId}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getAttendanceStatusBadgeClass(rec.status)}`}>
                        {rec.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3" />}
                        {rec.status === 'LATE' && <Clock className="w-3 h-3" />}
                        {rec.status === 'ABSENT' && <XCircle className="w-3 h-3" />}
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="sm:hidden space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No attendance records match filter criteria.
            </div>
          ) : (
            filteredHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{rec.courseName || rec.courseCode}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rec.date} • {rec.courseCode}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getAttendanceStatusBadgeClass(rec.status)}`}>
                  {rec.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
