import React, { useState } from 'react';
import {
  AffectedSession,
  AttendanceRecord,
  AttendanceRegularizationRequest,
  Course,
  User
} from '../../types';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Building,
  FileText,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface FacultyAdjustmentQueueProps {
  currentFaculty: User;
  requests: AttendanceRegularizationRequest[];
  courses: Course[];
  onDecision: (
    requestId: string,
    sessionId: string,
    decision: 'APPROVED' | 'REJECTED',
    reason?: string
  ) => void;
}

export const FacultyAdjustmentQueue: React.FC<FacultyAdjustmentQueueProps> = ({
  currentFaculty,
  requests,
  courses,
  onDecision
}) => {
  const [rejectingSession, setRejectingSession] = useState<{
    requestId: string;
    session: AffectedSession;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Extract all forwarded sessions assigned to this faculty's courses
  const myCourseIds = courses.map((c) => c.id);
  const myCourseCodes = courses.map((c) => c.code);

  const pendingAdjustments: {
    request: AttendanceRegularizationRequest;
    session: AffectedSession;
  }[] = [];

  requests.forEach((req) => {
    // Only requests approved by class teacher or forwarded
    if (
      req.status === 'CLASS_TEACHER_APPROVED' ||
      req.status === 'FORWARDED_TO_SUBJECT_FACULTY' ||
      req.status === 'PARTIALLY_APPROVED'
    ) {
      req.affectedSessions?.forEach((session) => {
        const matchesCourse =
          myCourseIds.includes(session.courseId) ||
          myCourseCodes.includes(session.courseCode);
        const matchesFaculty =
          !session.facultyId ||
          session.facultyId === currentFaculty.id ||
          session.facultyName === currentFaculty.name;

        if (matchesCourse && matchesFaculty && (!session.facultyDecision || session.facultyDecision === 'PENDING')) {
          pendingAdjustments.push({ request: req, session });
        }
      });
    }
  });

  const handleApprove = (reqId: string, session: AffectedSession) => {
    onDecision(reqId, session.id, 'APPROVED', 'Approved by Subject Faculty');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSession || !rejectReason.trim()) return;
    onDecision(
      rejectingSession.requestId,
      rejectingSession.session.id,
      'REJECTED',
      rejectReason.trim()
    );
    setRejectingSession(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Subject Faculty Attendance Adjustment Desk</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Regularization Approvals Forwarded by Class Teacher
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Class Teachers have verified supporting medical/OD proofs. Apply attendance adjustments for your assigned sessions.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {pendingAdjustments.length} Action Required
        </span>
      </div>

      {pendingAdjustments.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-2xl space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">All Adjustment Requests Processed</h3>
          <p className="text-xs text-slate-400">
            There are currently no pending attendance adjustments waiting for your review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingAdjustments.map(({ request, session }) => {
            const isMedical = request.requestType === 'MEDICAL';

            return (
              <div
                key={session.id}
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
                          <span>{request.studentName}</span>
                          <span className="text-[11px] font-mono text-slate-400">({request.studentRegNumber})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Session: <strong className="text-indigo-300">{session.courseCode}</strong> • {session.sessionDate} • Period {session.periodNumber || 1}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Teacher Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="text-slate-300">
                      <strong className="text-slate-400">Verified By: </strong>
                      {request.classTeacherName || 'Class Teacher'}
                    </div>
                    {request.classTeacherReason && (
                      <div className="text-amber-300 text-[11px] italic">
                        "{request.classTeacherReason}"
                      </div>
                    )}
                    <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                      <strong>Student Reason: </strong>{request.reason}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setRejectingSession({ requestId: request.id, session });
                      setRejectReason('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(request.id, session)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Attendance Adjustment</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Decline Attendance Adjustment</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Provide justification for declining regularization for session{' '}
              <strong className="text-white">{rejectingSession.session.courseCode}</strong> on{' '}
              <span className="font-mono text-white">{rejectingSession.session.sessionDate}</span>.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Critical laboratory assessment conducted during this period; requires physical lab make-up"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSession(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
