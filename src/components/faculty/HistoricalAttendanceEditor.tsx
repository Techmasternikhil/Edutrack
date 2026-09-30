import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus, Course, User } from '../../types';
import { getAttendanceStatusBadgeClass } from '../../utils/academic';
import {
  Calendar,
  History,
  Filter,
  Search,
  Edit2,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck
} from 'lucide-react';

interface HistoricalAttendanceEditorProps {
  currentFaculty: User;
  courses: Course[];
  students: User[];
  attendance: AttendanceRecord[];
  onUpdateHistoricalAttendance: (
    attendanceId: string,
    newStatus: AttendanceStatus,
    reason: string
  ) => void;
}

export const HistoricalAttendanceEditor: React.FC<HistoricalAttendanceEditorProps> = ({
  currentFaculty,
  courses,
  students,
  attendance,
  onUpdateHistoricalAttendance
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Editing modal state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('PRESENT');
  const [reason, setReason] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filter attendance for assigned courses
  const myCourseIds = courses.map((c) => c.id);
  const courseRecords = attendance.filter((a) => {
    if (selectedCourseId) {
      return a.courseId === selectedCourseId;
    }
    return myCourseIds.includes(a.courseId);
  });

  const filteredRecords = courseRecords.filter((rec) => {
    if (selectedDate && rec.date !== selectedDate) return false;
    if (selectedStudentFilter !== 'ALL' && rec.studentId !== selectedStudentFilter) return false;
    if (selectedStatusFilter !== 'ALL' && rec.status !== selectedStatusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = rec.studentName.toLowerCase().includes(q);
      const matchDate = rec.date.includes(q);
      if (!matchName && !matchDate) return false;
    }
    return true;
  });

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setNewStatus(rec.status);
    setReason('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !reason.trim()) return;

    onUpdateHistoricalAttendance(editingRecord.id, newStatus, reason.trim());
    setSuccessBanner(
      `Attendance for ${editingRecord.studentName} on ${editingRecord.date} updated from ${editingRecord.status} to ${newStatus}. Audit entry logged.`
    );
    setTimeout(() => setSuccessBanner(null), 4000);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/30 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Authorized Attendance History & Correction Desk</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Historical Attendance Ledger (Assigned Subjects)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Faculty members can correct historical attendance sessions for authorized subjects. Every correction is audited and recorded with mandatory justification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable Audit Logging Active</span>
          </span>
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Subject */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Session Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Status</label>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
          </select>
        </div>

        {/* Student */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Student</label>
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
          >
            <option value="ALL">All Students</option>
            {students.filter((s) => s.role === 'STUDENT').map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.regNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px]">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Historical Register Table */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Historical Attendance Sessions</span>
          <span className="text-slate-400 font-mono">Showing {filteredRecords.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3 text-center">Original Status</th>
                <th className="py-2.5 px-3 text-center">Effective Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No historical attendance records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-300">{rec.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{rec.studentName}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-400">{rec.courseCode || rec.courseId}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAttendanceStatusBadgeClass(rec.status)}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAttendanceStatusBadgeClass(rec.effectiveStatus || rec.status)}`}>
                        {rec.effectiveStatus || rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(rec)}
                        className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold cursor-pointer text-xs flex items-center gap-1 ml-auto"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Status</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Edit Historical Attendance</h3>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1 text-slate-300">
              <div>
                <strong className="text-slate-400">Student:</strong> {editingRecord.studentName}
              </div>
              <div>
                <strong className="text-slate-400">Session Date:</strong> {editingRecord.date}
              </div>
              <div>
                <strong className="text-slate-400">Course:</strong> {editingRecord.courseCode || editingRecord.courseName}
              </div>
              <div>
                <strong className="text-slate-400">Current Status:</strong>{' '}
                <span className="font-bold text-amber-400">{editingRecord.status}</span>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Attendance Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PRESENT', 'ABSENT', 'LATE'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        newStatus === st
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Attendance Modification (Mandatory for Audit Trail) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Student was attending approved departmental seminar; marked absent in error"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reason.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer"
                >
                  Update & Commit Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
