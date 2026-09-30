import React, { useState } from 'react';
import {
  AttendanceRecord,
  AttendanceRegularizationRequest,
  Course,
  User
} from '../../types';
import { APP_CONFIG } from '../../config/constants';
import { calculateAttendanceMetrics } from '../../utils/academic';
import {
  School,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Check,
  X,
  Calendar,
  FileText,
  Building,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ClassTeacherRegularizationReviewProps {
  currentTeacher: User;
  requests: AttendanceRegularizationRequest[];
  courses: Course[];
  students: User[];
  attendance: AttendanceRecord[];
  onReviewRequest: (
    requestId: string,
    decision: 'APPROVE' | 'REJECT',
    reason?: string,
    approvedSessionIds?: string[]
  ) => void;
}

export const ClassTeacherRegularizationReview: React.FC<ClassTeacherRegularizationReviewProps> = ({
  currentTeacher,
  requests,
  courses,
  students,
  attendance,
  onReviewRequest
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'MEDICAL' | 'OD'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('PENDING_CLASS_TEACHER_REVIEW');

  // Reviewing modal state
  const [reviewingReq, setReviewingReq] = useState<AttendanceRegularizationRequest | null>(null);
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reason, setReason] = useState<string>('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);

  // Filter requests belonging to this class teacher's queue
  const myQueue = requests.filter((r) => {
    // If teacher matches, or fallback
    return (
      r.classTeacherId === currentTeacher.id ||
      currentTeacher.isClassTeacher ||
      currentTeacher.assignedClassId === r.classId ||
      r.status !== 'DRAFT'
    );
  });

  const filteredQueue = myQueue.filter((r) => {
    if (filterType !== 'ALL' && r.requestType !== filterType) return false;
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'PENDING_CLASS_TEACHER_REVIEW') {
        return (
          r.status === 'PENDING_CLASS_TEACHER_REVIEW' ||
          r.status === 'SUBMITTED' ||
          r.status === 'DOCUMENT_UPLOADED'
        );
      }
      return r.status === filterStatus;
    }
    return true;
  });

  const openReviewModal = (req: AttendanceRegularizationRequest) => {
    setReviewingReq(req);
    setDecision('APPROVE');
    setReason('');
    // By default select all affected session IDs for approval
    setSelectedSessionIds(req.affectedSessions?.map((s) => s.id) || []);
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingReq) return;
    if (decision === 'REJECT' && !reason.trim()) return;

    onReviewRequest(reviewingReq.id, decision, reason, selectedSessionIds);
    setReviewingReq(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/30 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <School className="w-4 h-4" />
            <span>Class Teacher Academic Review Desk</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Attendance Regularization Queue (Medical & On-Duty Requests)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Verify student certificates, inspect affected low-attendance subjects, and route approved sessions to course faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {myQueue.filter((r) => r.status === 'PENDING_CLASS_TEACHER_REVIEW' || r.status === 'SUBMITTED' || r.status === 'DOCUMENT_UPLOADED').length} Pending Review
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilterType('MEDICAL')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              filterType === 'MEDICAL' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Medical Leave
          </button>
          <button
            onClick={() => setFilterType('OD')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              filterType === 'OD' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            On-Duty (OD)
          </button>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
        >
          <option value="PENDING_CLASS_TEACHER_REVIEW">Pending Review</option>
          <option value="FORWARDED_TO_SUBJECT_FACULTY">Forwarded to Faculty</option>
          <option value="ATTENDANCE_ADJUSTED">Completed / Adjusted</option>
          <option value="REJECTED_BY_CLASS_TEACHER">Rejected by Teacher</option>
          <option value="ALL">All Statuses</option>
        </select>
      </div>

      {/* List of Requests */}
      {filteredQueue.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-2xl space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Requests Matching Criteria</h3>
          <p className="text-xs text-slate-400">All attendance regularization applications have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQueue.map((req) => {
            const isMedical = req.requestType === 'MEDICAL';
            const isPending =
              req.status === 'PENDING_CLASS_TEACHER_REVIEW' ||
              req.status === 'SUBMITTED' ||
              req.status === 'DOCUMENT_UPLOADED';

            // Student metrics
            const studentAttendance = attendance.filter((a) => a.studentId === req.studentId);
            const m = calculateAttendanceMetrics(studentAttendance);

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 space-y-3.5 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl text-xs font-bold ${
                        isMedical ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isMedical ? 'MEDICAL' : 'ON-DUTY'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{req.studentName}</span>
                          <span className="font-mono text-slate-400 text-[11px]">({req.studentRegNumber})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Period: {req.fromDate} to {req.toDate}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Student Overall Attendance & Shortage Warning */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Overall Attendance:</span>
                    <span className={`font-mono font-bold ${
                      m.effectiveAttendanceRate < APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {m.effectiveAttendanceRate}% ({m.presentCount} / {studentAttendance.length} classes)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    <strong className="text-slate-400">Reason: </strong>{req.reason}
                  </p>

                  {/* Detected Affected Subject Sessions */}
                  <div className="text-[11px] space-y-1">
                    <div className="text-slate-400 font-semibold flex items-center justify-between">
                      <span>Detected Affected Sessions:</span>
                      <span className="text-amber-400 font-bold">{req.affectedSessions?.length || 0}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {req.affectedSessions?.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]"
                        >
                          {s.courseCode} ({s.sessionDate})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Doc: {req.documents && req.documents[0] ? req.documents[0].originalFilename : 'Attached'}
                  </span>

                  {isPending ? (
                    <button
                      onClick={() => openReviewModal(req)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review & Forward</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openReviewModal(req)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      Inspect Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Decision Modal */}
      {reviewingReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                  {reviewingReq.requestType}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Class Teacher Review — {reviewingReq.studentName}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {reviewingReq.fromDate} to {reviewingReq.toDate} • Roll: {reviewingReq.studentRegNumber}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReviewingReq(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Low-Attendance Subject Analysis Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Low-Attendance Subject Analysis (Automated Detection)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="p-2">Subject</th>
                      <th className="p-2 text-center">Present</th>
                      <th className="p-2 text-center">Absent</th>
                      <th className="p-2 text-center">Current %</th>
                      <th className="p-2 text-center">Affected Classes</th>
                      <th className="p-2 text-center">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {courses.map((c) => {
                      const recs = attendance.filter(
                        (a) => a.studentId === reviewingReq.studentId && (a.courseId === c.id || a.courseCode === c.code)
                      );
                      const m = calculateAttendanceMetrics(recs);
                      const affectedCount = reviewingReq.affectedSessions?.filter(
                        (s) => s.courseId === c.id || s.courseCode === c.code
                      ).length || 0;

                      return (
                        <tr key={c.id}>
                          <td className="p-2 font-semibold text-white">{c.code} — {c.title}</td>
                          <td className="p-2 text-center text-emerald-400">{m.presentCount}</td>
                          <td className="p-2 text-center text-rose-400">{m.absentCount}</td>
                          <td className="p-2 text-center font-bold">{m.effectiveAttendanceRate}%</td>
                          <td className="p-2 text-center text-amber-400 font-bold">{affectedCount}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.isCompliant ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {m.isCompliant ? 'Compliant' : 'Shortage'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selectable Sessions for Approval */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">
                  Select Affected Sessions Eligible for Faculty Routing:
                </span>
                <span className="text-slate-400 text-[11px]">
                  {selectedSessionIds.length} of {reviewingReq.affectedSessions?.length || 0} selected
                </span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {reviewingReq.affectedSessions?.map((session) => {
                  const isChecked = selectedSessionIds.includes(session.id);
                  return (
                    <label
                      key={session.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSessionIds([...selectedSessionIds, session.id]);
                            } else {
                              setSelectedSessionIds(selectedSessionIds.filter((id) => id !== session.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <strong className="text-white">{session.courseName || session.courseCode}</strong>
                          <span className="text-[11px] text-slate-400 ml-2">
                            {session.sessionDate} • Period {session.periodNumber || 1}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-indigo-400 font-mono">
                        Faculty: {session.facultyName || 'Course Mentor'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Decision Controls */}
            <form onSubmit={handleConfirmDecision} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-400">
                  <input
                    type="radio"
                    name="teacherDecision"
                    checked={decision === 'APPROVE'}
                    onChange={() => setDecision('APPROVE')}
                    className="text-emerald-600 focus:ring-0"
                  />
                  <span>Approve & Forward to Subject Faculty</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-rose-400">
                  <input
                    type="radio"
                    name="teacherDecision"
                    checked={decision === 'REJECT'}
                    onChange={() => setDecision('REJECT')}
                    className="text-rose-600 focus:ring-0"
                  />
                  <span>Reject Request</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {decision === 'REJECT' ? 'Rejection Reason (Mandatory) *' : 'Teacher Verification Remarks (Optional)'}
                </label>
                <textarea
                  required={decision === 'REJECT'}
                  rows={2}
                  placeholder={decision === 'REJECT' ? 'e.g. Unauthenticated certificate submitted / Date mismatch' : 'e.g. Verified physician recommendation, eligible for subject adjustment'}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg cursor-pointer ${
                    decision === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  {decision === 'APPROVE' ? 'Approve & Route to Faculty' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
