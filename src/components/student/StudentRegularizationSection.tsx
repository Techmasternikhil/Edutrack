import React, { useState } from 'react';
import {
  AttendanceRegularizationRequest,
  Course,
  RegularizationRequestType,
  User
} from '../../types';
import { AttendanceRegularizationModal } from './AttendanceRegularizationModal';
import {
  FileText,
  Building,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Eye,
  ChevronRight,
  Filter
} from 'lucide-react';

interface StudentRegularizationSectionProps {
  student: User;
  courses: Course[];
  requests: AttendanceRegularizationRequest[];
  attendance: any[];
  onSubmitRequest: (formData: any) => void;
  onUploadApprovedOD: (requestId: string, file: File | null, fileName: string) => void;
}

export const StudentRegularizationSection: React.FC<StudentRegularizationSectionProps> = ({
  student,
  courses,
  requests,
  attendance,
  onSubmitRequest,
  onUploadApprovedOD
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'MEDICAL' | 'OD'>('ALL');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyModalType, setApplyModalType] = useState<RegularizationRequestType>('MEDICAL');

  // OD Proof Upload modal state
  const [uploadODRequestId, setUploadODRequestId] = useState<string | null>(null);
  const [odFile, setOdFile] = useState<File | null>(null);
  const [odFileName, setOdFileName] = useState('');

  // Selected detail view modal
  const [selectedRequest, setSelectedRequest] = useState<AttendanceRegularizationRequest | null>(null);

  // Filter requests strictly belonging to this student
  const myRequests = requests.filter((r) => r.studentId === student.id);
  const filteredRequests = myRequests.filter((r) => {
    if (filterType === 'ALL') return true;
    return r.requestType === filterType;
  });

  const handleOpenApply = (type: RegularizationRequestType) => {
    setApplyModalType(type);
    setIsApplyModalOpen(true);
  };

  const handleConfirmUploadOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadODRequestId) return;
    onUploadApprovedOD(uploadODRequestId, odFile, odFileName || odFile?.name || 'Approved_OD_Proof.pdf');
    setUploadODRequestId(null);
    setOdFile(null);
    setOdFileName('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ATTENDANCE_ADJUSTED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PARTIALLY_APPROVED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'REJECTED_BY_CLASS_TEACHER':
      case 'REJECTED_BY_FACULTY':
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'AWAITING_APPROVED_OD_DOCUMENT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse';
      case 'CLASS_TEACHER_APPROVED':
      case 'FORWARDED_TO_SUBJECT_FACULTY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Action Header */}
      <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-indigo-950/40 via-slate-900 to-rose-950/30 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Attendance Regularization Portal (Medical & On-Duty)</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Submit medical certificates or institutional OD requests with timetable verification and faculty routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenApply('MEDICAL')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply Medical Leave</span>
          </button>
          <button
            onClick={() => handleOpenApply('OD')}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer"
          >
            <Building className="w-3.5 h-3.5" />
            <span>Apply On-Duty (OD)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-xs">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
            filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Requests ({myRequests.length})
        </button>
        <button
          onClick={() => setFilterType('MEDICAL')}
          className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
            filterType === 'MEDICAL' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Medical Leave ({myRequests.filter((r) => r.requestType === 'MEDICAL').length})
        </button>
        <button
          onClick={() => setFilterType('OD')}
          className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
            filterType === 'OD' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          On-Duty Requests ({myRequests.filter((r) => r.requestType === 'OD').length})
        </button>
      </div>

      {/* Requests Ledger */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Attendance Requests</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have not submitted any medical or OD attendance regularization requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const isMedical = req.requestType === 'MEDICAL';
            const needsOdProof = req.status === 'AWAITING_APPROVED_OD_DOCUMENT';

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 shadow-lg flex flex-col justify-between"
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
                        <div className="text-xs font-bold text-white">
                          {req.eventName || (isMedical ? 'Medical Leave Request' : 'On-Duty Attendance')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {req.fromDate} to {req.toDate}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    <span className="text-slate-500 font-medium">Reason: </span>
                    {req.reason}
                  </p>

                  {/* Summary of affected sessions */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center text-slate-300 font-medium">
                      <span>Affected Subject Sessions:</span>
                      <span className="font-bold text-white">{req.affectedSessions?.length || 0} Sessions</span>
                    </div>

                    {req.affectedSessions && req.affectedSessions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {req.affectedSessions.map((s) => (
                          <span
                            key={s.id}
                            className={`px-2 py-0.5 rounded text-[10px] border font-mono ${
                              s.facultyDecision === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : s.facultyDecision === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {s.courseCode}: {s.facultyDecision || 'PENDING'}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                      Class Teacher: <span className="text-slate-200">{req.classTeacherName || 'Dr. R. Elankavi'}</span>
                      {req.classTeacherDecision && (
                        <span className="ml-1 text-indigo-400 font-semibold">({req.classTeacherDecision})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Status Breakdown</span>
                  </button>

                  {needsOdProof && (
                    <button
                      onClick={() => {
                        setUploadODRequestId(req.id);
                        setOdFile(null);
                        setOdFileName('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1 shadow cursor-pointer text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Approved OD</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Regularization Application Modal */}
      <AttendanceRegularizationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        type={applyModalType}
        student={student}
        courses={courses}
        attendance={attendance}
        onSubmit={onSubmitRequest}
      />

      {/* Upload Approved OD Modal */}
      {uploadODRequestId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Upload className="w-4 h-4" />
                <span>Upload Officially Approved OD Proof</span>
              </div>
              <button
                onClick={() => setUploadODRequestId(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Upload the officially signed or stamped On-Duty certificate received from the event organizers or department coordinator. Once uploaded, your request advances automatically to Class Teacher review.
            </p>

            <form onSubmit={handleConfirmUploadOD} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Approved Document File *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setOdFile(e.target.files[0]);
                        setOdFileName(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                    id="od-approved-file-upload"
                  />
                  <label
                    htmlFor="od-approved-file-upload"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer flex items-center gap-1.5 font-medium shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                  </label>
                  <input
                    type="text"
                    placeholder={odFile ? odFile.name : 'Choose document'}
                    value={odFileName}
                    onChange={(e) => setOdFileName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadODRequestId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                >
                  Upload & Advance Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Details Breakdown Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl text-xs font-bold ${
                  selectedRequest.requestType === 'MEDICAL' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {selectedRequest.requestType}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Regularization Request Lifecycle</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedRequest.fromDate} to {selectedRequest.toDate}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div>
                  <strong className="text-slate-400">Current Status:</strong>{' '}
                  <span className="text-amber-300 font-semibold">{selectedRequest.status.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <strong className="text-slate-400">Class Teacher:</strong> {selectedRequest.classTeacherName || 'Dr. R. Elankavi'}
                </div>
                {selectedRequest.classTeacherReviewReason && (
                  <div>
                    <strong className="text-slate-400">Teacher Remarks:</strong> {selectedRequest.classTeacherReviewReason}
                  </div>
                )}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <strong className="text-slate-400">Attached Documents:</strong>{' '}
                    {selectedRequest.documents.map((d) => d.originalFilename).join(', ')}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-2">Subject Faculty Review Decisions</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedRequest.affectedSessions?.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{s.courseName || s.courseCode}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Date: {s.sessionDate} • Period: {s.periodNumber || 1} • Faculty: {s.facultyName || 'Subject Faculty'}
                        </div>
                        {s.facultyReason && (
                          <div className="text-[10px] text-amber-300 italic mt-0.5">
                            Note: "{s.facultyReason}"
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          s.facultyDecision === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : s.facultyDecision === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                      >
                        {s.facultyDecision || 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
