import React, { useState } from 'react';
import { User, Course, Submission, QuizAttempt, AttendanceRecord, ParentReview, FeeRecord, PaymentMethod } from '../types';
import { StudentBillingSection } from './student/StudentBillingSection';
import { StudentAttendanceSection } from './student/StudentAttendanceSection';
import {
  Users,
  Award,
  CalendarCheck,
  FileCheck2,
  HelpCircle,
  MessageSquarePlus,
  Send,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  HeartHandshake,
  Receipt,
  CreditCard,
  MessageSquareQuote
} from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { calculateAttendanceMetrics } from '../utils/academic';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ParentDashboardProps {
  currentParent: User;
  allUsers: User[];
  courses: Course[];
  submissions: Submission[];
  quizAttempts: QuizAttempt[];
  attendance: AttendanceRecord[];
  reviews: ParentReview[];
  fees?: FeeRecord[];
  onSubmitReview: (review: Omit<ParentReview, 'id' | 'createdAt' | 'status'>) => void;
  onPayFee?: (feeId: string, paymentMethod: PaymentMethod, transactionRef: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  currentParent,
  allUsers,
  courses,
  submissions,
  quizAttempts,
  attendance,
  reviews,
  fees = [],
  onSubmitReview,
  onPayFee
}) => {
  // Linked children strictly limited to this parent's authorized IDs
  const linkedChildren = allUsers.filter(
    (u) => u.role === 'STUDENT' && currentParent.childStudentIds?.includes(u.id)
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    linkedChildren[0]?.id || ''
  );

  // Keep selectedStudentId in sync if parent changes
  React.useEffect(() => {
    if (linkedChildren.length > 0 && !linkedChildren.some((c) => c.id === selectedStudentId)) {
      setSelectedStudentId(linkedChildren[0].id);
    }
  }, [currentParent, linkedChildren, selectedStudentId]);

  const selectedStudent = linkedChildren.find((c) => c.id === selectedStudentId) || linkedChildren[0];

  // Forms state for Parent Review / Inquiry
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'BILLING' | 'REMARKS'>('OVERVIEW');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewCategory, setReviewCategory] = useState<ParentReview['category']>('GENERAL');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  // Student specific data
  const studentAttendance = attendance.filter((a) => a.studentId === selectedStudent?.id);
  const attendanceMetrics = calculateAttendanceMetrics(studentAttendance);
  const { presentCount, lateCount, absentCount, attendanceRate } = attendanceMetrics;

  const studentSubmissions = submissions.filter((s) => s.studentId === selectedStudent?.id);
  const studentQuizAttempts = quizAttempts.filter((q) => q.studentId === selectedStudent?.id);
  const studentReviews = reviews.filter((r) => r.studentId === selectedStudent?.id);
  const studentFees = fees.filter((f) => f.studentId === selectedStudent?.id);
  const studentUnpaidFees = studentFees.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE');

  // Recharts data: Attendance Pie
  const attendanceData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Late', value: lateCount, color: '#f59e0b' },
    { name: 'Absent', value: absentCount, color: '#ef4444' }
  ];

  // Academic marks breakdown
  const marksData = studentSubmissions
    .filter((s) => s.status === 'GRADED')
    .map((s) => ({
      name: s.assignmentTitle.length > 18 ? s.assignmentTitle.slice(0, 15) + '...' : s.assignmentTitle,
      score: s.marksObtained || 0
    }));

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewMessage.trim() || !selectedStudent) return;

    const matchedCourse = courses.find((c) => c.id === selectedCourseId);

    onSubmitReview({
      parentId: currentParent.id,
      parentName: currentParent.name,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      courseId: selectedCourseId || undefined,
      courseCode: matchedCourse?.code || undefined,
      category: reviewCategory,
      title: reviewTitle,
      message: reviewMessage
    });

    setReviewTitle('');
    setReviewMessage('');
    setShowSubmitSuccess(true);
    setTimeout(() => setShowSubmitSuccess(false), 4000);
  };

  if (!selectedStudent) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl">
        <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No Student Linked</h3>
        <p className="text-xs text-slate-400 mt-1">
          This parent account is not currently linked to any active students.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner: Child Switcher & Welcome */}
      <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold tracking-wide uppercase">
            <HeartHandshake className="w-4 h-4" />
            <span>Parent Academic Oversight Portal</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
            Welcome back, {currentParent.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitoring continuous academic performance, attendance compliance, and instructor feedback.
          </p>
        </div>

        {/* Child Selector */}
        {linkedChildren.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 pl-2">Select Student:</span>
            {linkedChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedStudentId(child.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedStudentId === child.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Child Quick Profile Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Child Identity Card */}
        <div className="p-4 rounded-xl glass-card flex items-center gap-3">
          <img
            src={selectedStudent.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
            alt={selectedStudent.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/30"
          />
          <div>
            <div className="text-sm font-bold text-white">{selectedStudent.name}</div>
            <div className="text-[11px] text-slate-400">Reg: {selectedStudent.regNumber || 'N/A'}</div>
            <div className="text-[10px] text-purple-400 font-medium">Semester {selectedStudent.semester || 1}</div>
          </div>
        </div>

        {/* GPA Metric */}
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Cumulative GPA</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {selectedStudent.gpa?.toFixed(2) || '3.80'}
            </div>
            <div className="text-[10px] text-emerald-500/80 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Dean's Honor Roll Standing
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div
          onClick={() => setActiveTab('ATTENDANCE')}
          className="p-4 rounded-xl glass-card flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition-all group"
        >
          <div>
            <div className="text-xs text-slate-400 font-medium group-hover:text-indigo-300 transition-colors">
              Attendance Rate (Click to View Log)
            </div>
            <div className="text-2xl font-black text-indigo-400 mt-0.5">{attendanceRate}%</div>
            <div className="text-[10px] text-slate-400 font-medium">
              {attendanceRate < APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Below {APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}% Requirement
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Compliant ({APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}%+ Threshold)
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Submissions & Quizzes */}
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Submissions & Quizzes</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {studentSubmissions.length + studentQuizAttempts.length}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {studentSubmissions.filter((s) => s.status === 'PENDING').length} awaiting grading
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Parent Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-1 ring-purple-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Academic Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ATTENDANCE'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Child Attendance (Live & Historical)</span>
          {attendanceRate < APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-white shadow-sm animate-pulse">
              Warning
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BILLING')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'BILLING'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-1 ring-emerald-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Ward Fee Clearance & Online Payments</span>
          {studentUnpaidFees.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-white shadow-sm animate-pulse">
              {studentUnpaidFees.length} Due
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REMARKS')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'REMARKS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-1 ring-purple-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Inquiries & Instructor Reviews</span>
          {studentReviews.length > 0 && (
            <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-slate-800 text-slate-300">
              {studentReviews.length}
            </span>
          )}
        </button>
      </div>

      {/* Child Subject-Wise Live & Historical Attendance Tab View */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <CalendarCheck className="w-4 h-4" />
                <span>Parental Ward Attendance & Compliance Monitoring</span>
              </div>
              <h2 className="text-base font-bold text-white">
                Live & Historical Subject-Wise Attendance for {selectedStudent.name}
              </h2>
              <p className="text-xs text-slate-300">
                Official instructional records submitted directly by faculty members. Real-time evaluation against the mandatory {APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}% statutory policy threshold.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                attendanceRate >= APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {attendanceRate >= APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Compliance Verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Statutory Shortage</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <StudentAttendanceSection
            studentId={selectedStudent.id}
            studentName={selectedStudent.name}
            regNumber={selectedStudent.regNumber}
            courses={courses}
            attendanceRecords={attendance}
            isParentView={true}
          />
        </div>
      )}

      {/* Ward Fee Clearance Tab View */}
      {activeTab === 'BILLING' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Parental Fee Clearance & Payment Hub</span>
              </div>
              <h2 className="text-base font-bold text-white">
                Official Tuition & University Fees for {selectedStudent.name}
              </h2>
              <p className="text-xs text-slate-300">
                Parents and legal guardians can directly settle semester dues online with instant 256-bit encrypted UPI/Card checkout and automated e-receipt issuance.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant University Clearance</span>
              </span>
            </div>
          </div>

          <StudentBillingSection
            studentId={selectedStudent.id}
            studentName={selectedStudent.name}
            fees={fees}
            onPayFee={(feeId, method, ref) => {
              if (onPayFee) {
                onPayFee(feeId, method, ref);
              }
            }}
            isParentView={true}
          />
        </div>
      )}

      {/* Visual Analytics Grid (Overview Tab) */}
      {activeTab === 'OVERVIEW' && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown Chart */}
        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Attendance Distribution</h3>
              <p className="text-xs text-slate-400">Class presence vs absence logs</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Total: {studentAttendance.length} Sessions
            </span>
          </div>

          <div className="h-52 flex items-center justify-center">
            {studentAttendance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No attendance data recorded yet</div>
            )}
          </div>

          <div className="flex justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Present: {presentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">Late: {lateCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">Absent: {absentCount}</span>
            </div>
          </div>
        </div>

        {/* Assignment Performance Chart */}
        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Assignment Scores</h3>
              <p className="text-xs text-slate-400">Scores obtained across graded submissions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Avg: 94%
            </span>
          </div>

          <div className="h-52">
            {marksData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marksData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No graded assignments yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Student Activity Review & Parent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Details (Submissions & Quiz Attempts) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submissions Review */}
          <div className="p-5 rounded-2xl glass-panel">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-purple-400" />
              <span>Assignment Submissions & Faculty Grading</span>
            </h3>

            <div className="space-y-3">
              {studentSubmissions.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No assignments submitted yet</div>
              ) : (
                studentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{sub.assignmentTitle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                            {sub.courseCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>File: {sub.fileName}</span>
                        </div>
                      </div>

                      {/* Status / Score */}
                      <div>
                        {sub.status === 'GRADED' ? (
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                              {sub.marksObtained} Marks
                            </span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30">
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    {sub.feedback && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                        <span className="text-indigo-400 font-semibold text-[11px] block mb-0.5">
                          Faculty Feedback:
                        </span>
                        <p className="text-slate-300 text-[11px] italic leading-relaxed">"{sub.feedback}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quiz Attempts */}
          <div className="p-5 rounded-2xl glass-panel">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Assessment & Quiz Results</span>
            </h3>

            <div className="space-y-3">
              {studentQuizAttempts.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No quizzes attempted yet</div>
              ) : (
                studentQuizAttempts.map((qa) => (
                  <div
                    key={qa.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{qa.quizTitle}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Completed in {Math.round(qa.timeTakenSeconds / 60)} mins •{' '}
                        {new Date(qa.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                        {qa.score} / {qa.totalMarks} (100%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Parent Review / Inquiry Form & Past Remarks */}
        <div className="space-y-6">
          {/* Submit Review Form */}
          <div className="p-5 rounded-2xl glass-panel">
            <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-purple-400" />
              <span>Submit Academic Review / Inquiry</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Send remarks, attendance inquiries, or feedback directly to instructors.
            </p>

            {showSubmitSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Remark submitted and dispatched to course faculty!</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="GENERAL">General Inquiries</option>
                  <option value="ACADEMIC_CONCERN">Academic Concern / Grades</option>
                  <option value="ATTENDANCE">Attendance Discrepancy / Leave Note</option>
                  <option value="APPRECIATION">Faculty Appreciation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject / Course (Optional)</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- All / General Institution --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Inquiry regarding Midterm Project"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  placeholder="Provide context or questions for the instructor..."
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Parent Review</span>
              </button>
            </form>
          </div>

          {/* Past Remarks & Responses */}
          <div className="p-5 rounded-2xl glass-panel">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Inquiry History & Responses</span>
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {studentReviews.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No parent reviews submitted yet</div>
              ) : (
                studentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{rev.title}</span>
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

                    <p className="text-slate-400 text-[11px] leading-relaxed">{rev.message}</p>

                    {rev.facultyReply && (
                      <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300 mt-2">
                        <span className="font-semibold block text-[10px] text-indigo-400">Faculty Response:</span>
                        {rev.facultyReply}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 pt-1">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* When activeTab is REMARKS, show Inquiry & Remarks view */}
      {activeTab === 'REMARKS' && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl glass-panel">
            <h3 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-purple-400" />
              <span>Submit Academic Review / Inquiry for {selectedStudent.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Send remarks, attendance inquiries, or feedback directly to instructors.
            </p>

            {showSubmitSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Remark submitted and dispatched to course faculty!</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="GENERAL">General Inquiries</option>
                  <option value="ACADEMIC_CONCERN">Academic Concern / Grades</option>
                  <option value="ATTENDANCE">Attendance Discrepancy / Leave Note</option>
                  <option value="APPRECIATION">Faculty Appreciation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject / Course (Optional)</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- All / General Institution --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Inquiry regarding Midterm Project"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  placeholder="Enter message for academic staff..."
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Faculty</span>
                </button>
              </div>
            </form>
          </div>

          <div className="p-5 rounded-2xl glass-panel">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-purple-400" />
              <span>Inquiry Communication History</span>
            </h3>

            <div className="space-y-3">
              {studentReviews.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No parent reviews submitted yet</div>
              ) : (
                studentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{rev.title}</span>
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

                    <p className="text-slate-400 text-[11px] leading-relaxed">{rev.message}</p>

                    {rev.facultyReply && (
                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300 mt-2">
                        <span className="font-semibold block text-[10px] text-indigo-400">Faculty Response:</span>
                        {rev.facultyReply}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 pt-1">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
