import React, { useState } from 'react';
import { User, Course, Submission, ParentReview, AttendanceRecord } from '../types';
import {
  BookOpen,
  CheckCircle,
  FileCheck2,
  MessageSquare,
  Users,
  Send,
  CalendarCheck,
  Check
} from 'lucide-react';

interface FacultyDashboardProps {
  currentFaculty: User;
  courses: Course[];
  submissions: Submission[];
  parentReviews: ParentReview[];
  attendance: AttendanceRecord[];
  onGradeSubmission: (submissionId: string, marks: number, feedback: string) => void;
  onReplyParentReview: (reviewId: string, reply: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  currentFaculty,
  courses,
  submissions,
  parentReviews,
  attendance,
  onGradeSubmission,
  onReplyParentReview
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const pendingSubmissions = submissions.filter((s) => s.status === 'PENDING');
  const gradedSubmissions = submissions.filter((s) => s.status === 'GRADED');

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) return;
    onGradeSubmission(selectedSubId, Number(gradeMarks), gradeFeedback);
    setSelectedSubId(null);
    setGradeFeedback('');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewId || !replyText.trim()) return;
    onReplyParentReview(replyReviewId, replyText);
    setReplyReviewId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Faculty Academic & Evaluation Portal</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
          Welcome, {currentFaculty.name}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage coursework, grade student submissions, track attendance, and respond to parent inquiries.
        </p>
      </div>

      {/* Two Column Grid: Submissions & Parent Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Submissions to Grade */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>Student Submissions</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
              {pendingSubmissions.length} Pending
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{sub.studentName}</div>
                    <div className="text-[11px] text-indigo-400">{sub.assignmentTitle}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">File: {sub.fileName}</div>
                  </div>
                  <div>
                    {sub.status === 'GRADED' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        {sub.marksObtained} Marks
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedSubId(sub.id)}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer shadow"
                      >
                        Grade Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Grading Form */}
                {selectedSubId === sub.id && (
                  <form onSubmit={handleGradeSubmit} className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-300">Marks (out of 100):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeMarks}
                        onChange={(e) => setGradeMarks(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <textarea
                      placeholder="Instructor feedback notes for student & parent..."
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSubId(null)}
                        className="px-2.5 py-1 rounded bg-slate-700 text-slate-300 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Save Grade
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Parent Reviews & Inquiries */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Parent Remarks & Academic Inquiries</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
              {parentReviews.length} Inquiries
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {parentReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-300">{rev.parentName}</span>
                    <span className="text-[10px] text-slate-400">(Parent of {rev.studentName})</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      rev.status === 'ACKNOWLEDGED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white">{rev.title}</div>
                <p className="text-slate-300 text-xs italic leading-relaxed">"{rev.message}"</p>

                {rev.facultyReply ? (
                  <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                    <span className="font-semibold block text-[10px] text-indigo-400">Your Response:</span>
                    {rev.facultyReply}
                  </div>
                ) : (
                  <div>
                    {replyReviewId === rev.id ? (
                      <form onSubmit={handleReplySubmit} className="space-y-2 pt-2 border-t border-slate-700">
                        <textarea
                          rows={2}
                          placeholder="Type response back to parent..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyReviewId(null)}
                            className="px-2.5 py-1 rounded bg-slate-700 text-slate-300 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            Send Reply
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setReplyReviewId(rev.id)}
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" /> Reply to Parent
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
