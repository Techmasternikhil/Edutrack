import React, { useState } from 'react';
import { Course, User, AttendanceRecord, AttendanceStatus } from '../../types';
import { APP_CONFIG } from '../../config/constants';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Save,
  Users
} from 'lucide-react';

interface AttendanceSessionManagerProps {
  course: Course;
  enrolledStudents: User[];
  existingRecords: AttendanceRecord[];
  onSaveAttendance: (date: string, records: { studentId: string; studentName: string; status: AttendanceStatus }[]) => void;
}

export const AttendanceSessionManager: React.FC<AttendanceSessionManagerProps> = ({
  course,
  enrolledStudents,
  existingRecords,
  onSaveAttendance
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Map of studentId -> status for current date
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const init: Record<string, AttendanceStatus> = {};
    const dateRecords = existingRecords.filter(
      (a) => a.courseId === course.id && a.date === new Date().toISOString().split('T')[0]
    );
    enrolledStudents.forEach((s) => {
      const match = dateRecords.find((r) => r.studentId === s.id);
      init[s.id] = match ? match.status : 'PRESENT';
    });
    return init;
  });

  const [savedAlert, setSavedAlert] = useState(false);

  // Update session statuses when date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const dateRecords = existingRecords.filter((a) => a.courseId === course.id && a.date === newDate);
    const updated: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      const match = dateRecords.find((r) => r.studentId === s.id);
      updated[s.id] = match ? match.status : 'PRESENT';
    });
    setSessionStatuses(updated);
  };

  const setStatusForStudent = (studentId: string, status: AttendanceStatus) => {
    setSessionStatuses((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setSessionStatuses(updated);
  };

  const handleSave = () => {
    const records = enrolledStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      status: sessionStatuses[s.id] || 'PRESENT'
    }));

    onSaveAttendance(selectedDate, records);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3500);
  };

  // Calculate analytics for this course across all dates
  const courseRecords = existingRecords.filter((a) => a.courseId === course.id);
  const totalClassesRecorded = new Set(courseRecords.map((a) => a.date)).size;
  const presentCount = courseRecords.filter((a) => a.status === 'PRESENT').length;
  const absentCount = courseRecords.filter((a) => a.status === 'ABSENT').length;
  const lateCount = courseRecords.filter((a) => a.status === 'LATE').length;
  const totalStudentMarks = courseRecords.length;
  const overallAttendancePct = totalStudentMarks > 0
    ? Math.round((presentCount / totalStudentMarks) * 100)
    : 100;

  // Student specific statistics
  const studentMetrics = enrolledStudents.map((student) => {
    const recs = courseRecords.filter((r) => r.studentId === student.id);
    const sPresent = recs.filter((r) => r.status === 'PRESENT').length;
    const sAbsent = recs.filter((r) => r.status === 'ABSENT').length;
    const sLate = recs.filter((r) => r.status === 'LATE').length;
    const pct = recs.length > 0 ? Math.round((sPresent / recs.length) * 100) : 100;
    return {
      student,
      present: sPresent,
      absent: sAbsent,
      late: sLate,
      percentage: pct,
      isBelowThreshold: pct < APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD
    };
  });

  const belowThresholdStudents = studentMetrics.filter((m) => m.isBelowThreshold);

  return (
    <div className="space-y-6">
      {/* Subject Header & Analytics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400 font-medium">Course Attendance Rate</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{overallAttendancePct}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalClassesRecorded} recorded session{totalClassesRecorded === 1 ? '' : 's'}
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400 font-medium">Session Totals</div>
          <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
            <span className="text-emerald-400">{presentCount} Present</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400">{absentCount} Absent</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">{lateCount} Late</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all students</div>
        </div>

        <div className="p-4 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400 font-medium">Statutory Compliance</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">University minimum policy</div>
        </div>

        <div className="p-4 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400 font-medium">Students Below 75%</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {belowThresholdStudents.length}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">
            {belowThresholdStudents.length > 0 ? 'Requires Dean Attention' : 'All compliant'}
          </div>
        </div>
      </div>

      {/* Attendance Session Controls */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
              <span>Mark Session Attendance — {course.code}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select lecture date, update candidate presence statuses, and sync to institutional record.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Session</span>
            </button>
          </div>
        </div>

        {savedAlert && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Attendance saved successfully for {course.code} on {selectedDate}. Duplicate entries prevented.</span>
          </div>
        )}

        {/* Quick bulk controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">
            {enrolledStudents.length} Students Registered
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold cursor-pointer text-[11px]"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold cursor-pointer text-[11px]"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Attendance Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Reg. Number</th>
                <th className="py-2.5 px-3 text-center">Cumulative Course %</th>
                <th className="py-2.5 px-3 text-center">Status for {selectedDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {studentMetrics.map(({ student, percentage, isBelowThreshold }) => {
                const currentStatus = sessionStatuses[student.id] || 'PRESENT';

                return (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-white font-semibold">{student.name}</div>
                          <div className="text-[10px] text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {student.regNumber || 'N/A'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isBelowThreshold
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {isBelowThreshold && <AlertTriangle className="w-3 h-3" />}
                        <span>{percentage}%</span>
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStatusForStudent(student.id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusForStudent(student.id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusForStudent(student.id, 'LATE')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-600 text-white shadow'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
