import React, { useState } from 'react';
import { AttendanceRecord, AttendanceRegularizationRequest, Course, RegularizationRequestType, User } from '../../types';
import { APP_CONFIG } from '../../config/constants';
import { calculateAttendanceMetrics, getAttendanceStatusBadgeClass } from '../../utils/academic';
import {
  FileText,
  Upload,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  FileCheck2,
  Search,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building
} from 'lucide-react';

interface AttendanceRegularizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: RegularizationRequestType;
  student: User;
  courses: Course[];
  attendance: AttendanceRecord[];
  onSubmit: (formData: {
    requestType: RegularizationRequestType;
    fromDate: string;
    toDate: string;
    reason: string;
    studentNote?: string;
    file?: File | null;
    fileName?: string;
    eventName?: string;
    eventType?: string;
    organization?: string;
  }) => void;
}

export const AttendanceRegularizationModal: React.FC<AttendanceRegularizationModalProps> = ({
  isOpen,
  onClose,
  type,
  student,
  courses,
  attendance,
  onSubmit
}) => {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileNameInput, setFileNameInput] = useState('');

  // OD Specific Fields
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Technical Event');
  const [organization, setOrganization] = useState('');

  if (!isOpen) return null;

  // Identify affected sessions in this date range
  const affectedRecords = attendance.filter((a) => {
    if (a.studentId !== student.id) return false;
    return a.date >= fromDate && a.date <= toDate;
  });

  const absentSessions = affectedRecords.filter((a) => a.status === 'ABSENT');

  // Compute subject attendance metrics to show low attendance warnings
  const subjectSummaries = courses.map((course) => {
    const recs = attendance.filter(
      (a) => a.studentId === student.id && (a.courseId === course.id || a.courseCode === course.code)
    );
    const m = calculateAttendanceMetrics(recs);
    const affectedCount = absentSessions.filter(
      (a) => a.courseId === course.id || a.courseCode === course.code
    ).length;
    return {
      course,
      attendanceRate: m.effectiveAttendanceRate,
      isCompliant: m.isCompliant,
      affectedCount
    };
  });

  const lowAttendanceSubjects = subjectSummaries.filter((s) => !s.isCompliant);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) return;
    if (type === 'OD' && !eventName.trim()) return;

    onSubmit({
      requestType: type,
      fromDate,
      toDate,
      reason,
      studentNote,
      file: selectedFile,
      fileName: selectedFile?.name || fileNameInput || (type === 'MEDICAL' ? 'Medical_Certificate.pdf' : 'OD_Supporting_Doc.pdf'),
      eventName: type === 'OD' ? eventName : undefined,
      eventType: type === 'OD' ? eventType : undefined,
      organization: type === 'OD' ? organization : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${type === 'MEDICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {type === 'MEDICAL' ? <FileText className="w-5 h-5" /> : <Building className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {type === 'MEDICAL' ? 'Apply for Medical Attendance Regularization' : 'Apply for On-Duty (OD) Leave'}
              </h3>
              <p className="text-xs text-slate-400">
                Routed automatically to Class Teacher <strong className="text-slate-200">Dr. R. Elankavi</strong> for verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Low Attendance Subject Warning Alert */}
        {lowAttendanceSubjects.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Current Subjects Below {APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}% Statutory Minimum:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {lowAttendanceSubjects.map((sub) => (
                <div key={sub.course.id} className="p-2 rounded-lg bg-slate-900/60 border border-amber-500/30 flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-white truncate mr-2">{sub.course.title}</span>
                  <span className="text-rose-400 font-mono font-bold">{sub.attendanceRate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* OD Specific Event Info */}
          {type === 'OD' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Event / Activity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Hackathon / Inter-College Symposium"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Event Type *</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Technical Event">Technical Event</option>
                  <option value="Academic Conference">Academic Conference</option>
                  <option value="Sports">Sports Competition</option>
                  <option value="Cultural">Cultural Fest</option>
                  <option value="Workshop">Hands-on Workshop</option>
                  <option value="Institutional Duty">Institutional Duty</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">Organization / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Madras / Anna University Campus"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">From Date *</label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">To Date *</label>
              <input
                type="date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Affected Subjects Live Detection Preview */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                System Detected Affected Sessions ({fromDate} to {toDate}):
              </span>
              <span className="text-amber-400 font-semibold">
                {absentSessions.length} Absent Session{absentSessions.length === 1 ? '' : 's'}
              </span>
            </div>

            {absentSessions.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                No recorded absent sessions in this date range. You may still apply in advance.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {absentSessions.map((rec) => (
                  <span
                    key={rec.id}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono flex items-center gap-1"
                  >
                    <span>{rec.courseCode || 'Course'}</span>
                    <span className="text-slate-400">({rec.date})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {type === 'MEDICAL' ? 'Medical Diagnosis & Reason *' : 'Reason for OD Application *'}
            </label>
            <textarea
              required
              rows={2}
              placeholder={type === 'MEDICAL' ? 'e.g. Acute viral fever with physician-recommended bed rest...' : 'e.g. Representing department in 36-hour inter-collegiate hackathon...'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {type === 'MEDICAL'
                ? 'Official Medical Certificate (PDF / JPG / PNG) *'
                : 'Initial Supporting Letter / Brochure (Optional: approved proof can be uploaded later)'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setFileNameInput(e.target.files[0].name);
                  }
                }}
                className="hidden"
                id="regularization-doc-upload"
              />
              <label
                htmlFor="regularization-doc-upload"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer flex items-center gap-1.5 font-medium shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Document</span>
              </label>
              <input
                type="text"
                placeholder={selectedFile ? selectedFile.name : 'Enter document title or select file'}
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Maximum file size 10MB. Files are verified for authenticated academic review only.
            </p>
          </div>

          {/* Student Note */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Optional Note for Faculty</label>
            <input
              type="text"
              placeholder="e.g. All lab records caught up with peer notes"
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-bold shadow-lg cursor-pointer ${
                type === 'MEDICAL'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
              }`}
            >
              Submit {type === 'MEDICAL' ? 'Medical Request' : 'OD Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
