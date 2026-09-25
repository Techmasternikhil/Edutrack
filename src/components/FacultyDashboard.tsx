import React, { useState } from 'react';
import {
  User,
  Course,
  CourseMaterial,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  AttendanceRecord,
  ParentReview
} from '../types';
import { APP_CONFIG } from '../config/constants';
import { YouTubeVideoPlayer } from './faculty/YouTubeVideoPlayer';
import { VideoFormModal } from './faculty/VideoFormModal';
import { MaterialFormModal } from './faculty/MaterialFormModal';
import { QuizFormModal } from './faculty/QuizFormModal';
import { QuizAnalyticsModal } from './faculty/QuizAnalyticsModal';
import { AssignmentFormModal } from './faculty/AssignmentFormModal';
import { AttendanceSessionManager } from './faculty/AttendanceSessionManager';
import {
  BookOpen,
  Users,
  Video,
  FileText,
  Award,
  FileCheck2,
  CalendarCheck,
  MessageSquare,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Trash2,
  Send,
  Eye,
  Check
} from 'lucide-react';

interface FacultyDashboardProps {
  currentFaculty: User;
  courses: Course[];
  materials: CourseMaterial[];
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  attendance: AttendanceRecord[];
  parentReviews: ParentReview[];
  students: User[];
  onGradeSubmission: (submissionId: string, marks: number, feedback: string) => void;
  onReplyParentReview: (reviewId: string, reply: string) => void;
  onSaveMaterial: (material: Partial<CourseMaterial>) => void;
  onDeleteMaterial: (materialId: string) => void;
  onSaveQuiz: (quiz: Partial<Quiz>) => void;
  onDeleteQuiz: (quizId: string) => void;
  onSaveAssignment: (asg: Partial<Assignment>) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onSaveAttendance: (courseId: string, date: string, records: { studentId: string; studentName: string; status: any }[]) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  currentFaculty,
  courses,
  materials,
  assignments,
  submissions,
  quizzes,
  quizAttempts,
  attendance,
  parentReviews,
  students,
  onGradeSubmission,
  onReplyParentReview,
  onSaveMaterial,
  onDeleteMaterial,
  onSaveQuiz,
  onDeleteQuiz,
  onSaveAssignment,
  onDeleteAssignment,
  onSaveAttendance
}) => {
  // Assigned courses for current faculty member only
  const myCourses = courses.filter(
    (c) => c.facultyId === currentFaculty.id || c.facultyName === currentFaculty.name
  );

  // Selected subject workspace: null means "All Subjects Overview"
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Main active tab within workspace:
  // 'OVERVIEW' | 'SUBJECTS' | 'VIDEOS' | 'MATERIALS' | 'QUIZZES' | 'ASSIGNMENTS' | 'ATTENDANCE' | 'PARENTS'
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');

  // Modals state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [analyticsQuiz, setAnalyticsQuiz] = useState<Quiz | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [previewVideo, setPreviewVideo] = useState<CourseMaterial | null>(null);

  // Inline grading state
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  // Parent review reply state
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Filtered dataset strictly for this faculty's assigned courses
  const myCourseIds = myCourses.map((c) => c.id);
  const myCourseCodes = myCourses.map((c) => c.code);

  const activeCourse = myCourses.find((c) => c.id === selectedCourseId) || null;

  // Filter materials, assignments, etc.
  const relevantMaterials = materials.filter(
    (m) => (selectedCourseId ? m.courseId === selectedCourseId : myCourseIds.includes(m.courseId))
  );

  const relevantVideos = relevantMaterials.filter(
    (m) => m.type === 'YOUTUBE' || m.type === 'VIDEO'
  );

  const relevantDocuments = relevantMaterials.filter(
    (m) => m.type !== 'YOUTUBE' && m.type !== 'VIDEO'
  );

  const relevantAssignments = assignments.filter(
    (a) => (selectedCourseId ? a.courseId === selectedCourseId : myCourseIds.includes(a.courseId))
  );

  const relevantQuizzes = quizzes.filter(
    (q) => (selectedCourseId ? q.courseId === selectedCourseId : myCourseIds.includes(q.courseId))
  );

  const relevantSubmissions = submissions.filter((s) =>
    selectedCourseId
      ? s.courseCode === activeCourse?.code
      : !s.courseCode || myCourseCodes.includes(s.courseCode)
  );

  const pendingSubmissions = relevantSubmissions.filter((s) => s.status === 'PENDING');

  // Enrolled students for faculty courses
  const enrolledStudents = students.filter((u) => u.role === 'STUDENT');

  // Handle grade submission
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) return;
    onGradeSubmission(selectedSubId, Number(gradeMarks), gradeFeedback);
    setSelectedSubId(null);
    setGradeFeedback('');
  };

  // Handle parent reply
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewId || !replyText.trim()) return;
    onReplyParentReview(replyReviewId, replyText);
    setReplyReviewId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Faculty Academic Command Center</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
            Welcome, {currentFaculty.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Department of {currentFaculty.department || 'Computer Science & Engineering'} • {myCourses.length} Assigned Course{myCourses.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Global Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingMaterial(null);
              setIsVideoModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>+ Add Video</span>
          </button>

          <button
            onClick={() => {
              setEditingMaterial(null);
              setIsMaterialModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Add Material</span>
          </button>

          <button
            onClick={() => {
              setEditingQuiz(null);
              setIsQuizModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>+ Create Quiz</span>
          </button>

          <button
            onClick={() => {
              setEditingAssignment(null);
              setIsAssignmentModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>+ Post Assignment</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {[
          { id: 'OVERVIEW', label: 'Dashboard Overview', icon: BookOpen },
          { id: 'SUBJECTS', label: 'My Subjects', icon: Users },
          { id: 'VIDEOS', label: 'Teaching Videos', icon: Video, badge: relevantVideos.length },
          { id: 'MATERIALS', label: 'Study Materials', icon: FileText, badge: relevantDocuments.length },
          { id: 'QUIZZES', label: 'Quizzes & MCQ', icon: Award, badge: relevantQuizzes.length },
          { id: 'ASSIGNMENTS', label: 'Assignments & Submissions', icon: FileCheck2, badge: pendingSubmissions.length },
          { id: 'ATTENDANCE', label: 'Attendance Sessions', icon: CalendarCheck },
          { id: 'PARENTS', label: 'Parent Inquiries', icon: MessageSquare, badge: parentReviews.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Course Filter Pill Bar (If faculty teaches multiple courses) */}
      {myCourses.length > 1 && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <span className="text-slate-400 pl-2">Subject Filter:</span>
          <button
            onClick={() => setSelectedCourseId(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              selectedCourseId === null ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Assigned Subjects ({myCourses.length})
          </button>
          {myCourses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                selectedCourseId === c.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      )}

      {/* Embedded Video Preview Player (when instructor clicks "Watch / Preview") */}
      {previewVideo && (
        <div className="animate-in fade-in">
          <YouTubeVideoPlayer
            videoId={previewVideo.youtubeVideoId || ''}
            title={previewVideo.title}
            description={previewVideo.description}
            courseTitle={myCourses.find((c) => c.id === previewVideo.courseId)?.title}
            moduleName={previewVideo.moduleName}
            instructorName={currentFaculty.name}
            onClose={() => setPreviewVideo(null)}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. OVERVIEW TAB                                               */}
      {/* ============================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-card">
              <div className="text-xs text-slate-400 font-medium">Assigned Subjects</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{myCourses.length}</div>
              <div className="text-[10px] text-slate-400">Total university course modules</div>
            </div>

            <div className="p-4 rounded-xl glass-card">
              <div className="text-xs text-slate-400 font-medium">Enrolled Students</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {myCourses.reduce((sum, c) => sum + c.enrolledStudentsCount, 0)}
              </div>
              <div className="text-[10px] text-slate-400">Active roster candidates</div>
            </div>

            <div className="p-4 rounded-xl glass-card">
              <div className="text-xs text-slate-400 font-medium">Teaching Videos & Materials</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{relevantMaterials.length}</div>
              <div className="text-[10px] text-slate-400">
                {relevantVideos.length} Videos • {relevantDocuments.length} Documents
              </div>
            </div>

            <div className="p-4 rounded-xl glass-card">
              <div className="text-xs text-slate-400 font-medium">Pending Submissions</div>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {pendingSubmissions.length}
              </div>
              <div className="text-[10px] text-amber-400">Requires grading</div>
            </div>
          </div>

          {/* Two Column Grid: Assigned Subjects & Pending Evaluation Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: My Subjects Cards */}
            <div className="p-5 rounded-2xl glass-panel space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>My Assigned Subjects</span>
                </h3>
                <button
                  onClick={() => setActiveTab('SUBJECTS')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {myCourses.map((c) => {
                  const courseMats = materials.filter((m) => m.courseId === c.id);
                  const courseQz = quizzes.filter((q) => q.courseId === c.id);
                  const courseAsg = assignments.filter((a) => a.courseId === c.id);

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{c.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                              {c.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-300">{c.credits} Credits</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <span>{c.enrolledStudentsCount} Students</span>
                        <span>•</span>
                        <span>{courseMats.length} Materials</span>
                        <span>•</span>
                        <span>{courseQz.length} Quizzes</span>
                        <span>•</span>
                        <span>{courseAsg.length} Assignments</span>
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedCourseId(c.id);
                            setActiveTab('VIDEOS');
                          }}
                          className="text-xs px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold cursor-pointer"
                        >
                          Manage Subject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Urgent Submissions Queue */}
            <div className="p-5 rounded-2xl glass-panel space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Submissions Requiring Evaluation</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                  {pendingSubmissions.length} Pending
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {pendingSubmissions.length === 0 ? (
                  <div className="text-xs text-slate-500 py-8 text-center flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                    <span>All student submissions have been evaluated and graded!</span>
                  </div>
                ) : (
                  pendingSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{sub.studentName}</div>
                          <div className="text-[11px] text-indigo-400">{sub.assignmentTitle}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            File: <span className="font-mono text-slate-300">{sub.fileName}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedSubId(sub.id)}
                          className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer shadow"
                        >
                          Grade Now
                        </button>
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
                            placeholder="Constructive feedback notes for student & parent..."
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUBJECTS TAB                                               */}
      {/* ============================================================== */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Subject Curriculum & Allocated Classes</h2>
            <span className="text-xs text-slate-400">
              Only subjects assigned by University Administration are visible.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCourses.map((c) => {
              const courseMats = materials.filter((m) => m.courseId === c.id);
              const courseVids = courseMats.filter((m) => m.type === 'YOUTUBE' || m.type === 'VIDEO');
              const courseQz = quizzes.filter((q) => q.courseId === c.id);
              const courseAsg = assignments.filter((a) => a.courseId === c.id);

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-700/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/20">
                        {c.code}
                      </span>
                      <span className="text-xs text-slate-400">{c.credits} Credits • Sem {c.semester}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      {c.schedule} • Room: {c.room || 'Main Hall'}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <div className="text-xs font-bold text-white">{c.enrolledStudentsCount}</div>
                        <div className="text-[10px] text-slate-400">Students</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <div className="text-xs font-bold text-rose-400">{courseVids.length}</div>
                        <div className="text-[10px] text-slate-400">Videos</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <div className="text-xs font-bold text-purple-400">{courseQz.length}</div>
                        <div className="text-[10px] text-slate-400">Quizzes</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <div className="text-xs font-bold text-amber-400">{courseAsg.length}</div>
                        <div className="text-[10px] text-slate-400">Assignments</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setActiveTab('VIDEOS');
                      }}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      Open Subject Workspace
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TEACHING VIDEOS TAB                                        */}
      {/* ============================================================== */}
      {activeTab === 'VIDEOS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-400" />
                <span>Teaching Video Library ({relevantVideos.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Curate YouTube lectures, lab demonstrations, and recorded syllabus sessions.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMaterial(null);
                setIsVideoModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Video</span>
            </button>
          </div>

          {relevantVideos.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl space-y-3">
              <Video className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Teaching Videos Added Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Upload YouTube links for your assigned courses. Students will be able to watch them directly in their LMS portal.
              </p>
              <button
                onClick={() => {
                  setEditingMaterial(null);
                  setIsVideoModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Add First Lecture Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantVideos.map((vid) => {
                const targetCourse = myCourses.find((c) => c.id === vid.courseId);

                return (
                  <div
                    key={vid.id}
                    className="rounded-2xl glass-panel border border-slate-700/60 overflow-hidden flex flex-col justify-between hover:border-rose-500/40 transition-colors"
                  >
                    <div>
                      {/* Thumbnail with Watch Button */}
                      <div className="relative aspect-video bg-black group overflow-hidden">
                        {vid.thumbnailUrl ? (
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Video className="w-12 h-12" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setPreviewVideo(vid)}
                            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/40 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Preview Video</span>
                          </button>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              vid.status === 'PUBLISHED'
                                ? 'bg-emerald-500/80 text-white'
                                : 'bg-slate-800/80 text-slate-300'
                            }`}
                          >
                            {vid.status || 'PUBLISHED'}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-semibold">
                            {targetCourse?.code || 'Course'}
                          </span>
                          <span className="text-[10px] text-slate-400">{vid.moduleName || 'General Unit'}</span>
                        </div>

                        <h3 className="text-xs font-bold text-white line-clamp-1">{vid.title}</h3>
                        {vid.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {vid.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setPreviewVideo(vid)}
                        className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingMaterial(vid);
                            setIsVideoModalOpen(true);
                          }}
                          className="px-2 py-1 rounded text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteMaterial(vid.id)}
                          className="px-2 py-1 rounded text-rose-400 hover:text-rose-300 bg-rose-500/10 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. STUDY MATERIALS TAB                                         */}
      {/* ============================================================== */}
      {activeTab === 'MATERIALS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Subject Study Materials & Slides ({relevantDocuments.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                PDF textbooks, syllabus guides, laboratory manuals, and lecture presentations.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMaterial(null);
                setIsMaterialModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Learning Material</span>
            </button>
          </div>

          {relevantDocuments.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Study Materials Added Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Share slides, notes, or reading links for your assigned courses.
              </p>
              <button
                onClick={() => {
                  setEditingMaterial(null);
                  setIsMaterialModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Upload First Material
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantDocuments.map((mat) => {
                const targetCourse = myCourses.find((c) => c.id === mat.courseId);

                return (
                  <div
                    key={mat.id}
                    className="p-4 rounded-xl glass-panel border border-slate-700/60 hover:border-slate-600 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{mat.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                          {targetCourse?.code || 'Course'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{mat.description}</p>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Format: {mat.type || 'PDF'}</span>
                        <span>•</span>
                        <span>Size: {mat.size || mat.fileSize || '3.2 MB'}</span>
                        <span>•</span>
                        <span>Uploaded: {mat.uploadedAt}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <a
                        href={mat.url || mat.fileUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center cursor-pointer"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => onDeleteMaterial(mat.id)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. QUIZZES TAB                                                */}
      {/* ============================================================== */}
      {activeTab === 'QUIZZES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Quizzes & Assessment Tests ({relevantQuizzes.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Author automated MCQ exams, adjust marks, and review real-time score statistics.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingQuiz(null);
                setIsQuizModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantQuizzes.map((quiz) => {
              const attempts = quizAttempts.filter((qa) => qa.quizId === quiz.id);
              const targetCourse = myCourses.find((c) => c.id === quiz.courseId);

              return (
                <div
                  key={quiz.id}
                  className="p-5 rounded-2xl glass-panel border border-slate-700/60 hover:border-purple-500/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{quiz.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-semibold">
                          {quiz.courseCode || targetCourse?.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{quiz.description}</p>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Duration: {quiz.durationMinutes} mins • Total: {quiz.totalMarks} Marks • Questions: {quiz.questions?.length || 0}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        quiz.isPublished ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium">
                      {attempts.length} Student Attempt{attempts.length === 1 ? '' : 's'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAnalyticsQuiz(quiz)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5" /> Analytics
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setIsQuizModalOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteQuiz(quiz.id)}
                        className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. ASSIGNMENTS TAB                                            */}
      {/* ============================================================== */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>Assignments & Coursework Manager</span>
              </h2>
              <p className="text-xs text-slate-400">
                Post laboratory problem sets, project prompts, and grade student submissions.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingAssignment(null);
                setIsAssignmentModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Assignment</span>
            </button>
          </div>

          {/* Submissions Evaluation Queue Table */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Submissions Review Queue</span>
            </h3>

            <div className="space-y-3">
              {relevantSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{sub.studentName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                          {sub.courseCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{sub.assignmentTitle}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>File: {sub.fileName}</span>
                      </div>
                    </div>

                    <div>
                      {sub.status === 'GRADED' ? (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                            {sub.marksObtained} Marks
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSubId(sub.id)}
                          className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer shadow"
                        >
                          Grade Submission
                        </button>
                      )}
                    </div>
                  </div>

                  {sub.feedback && (
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                      <span className="text-indigo-400 font-semibold text-[10px] block">Your Feedback:</span>
                      <p className="text-slate-300 text-[11px] italic leading-relaxed">"{sub.feedback}"</p>
                    </div>
                  )}

                  {/* Inline Grading Form */}
                  {selectedSubId === sub.id && (
                    <form onSubmit={handleGradeSubmit} className="mt-3 pt-3 border-t border-slate-700 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <label className="text-slate-300 font-medium">Marks (out of 100):</label>
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
                        placeholder="Provide feedback on algorithm design, code style, or edge cases..."
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
                          Save & Notify Student
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. ATTENDANCE TAB                                             */}
      {/* ============================================================== */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          {myCourses.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl text-slate-400">
              No courses assigned to record attendance.
            </div>
          ) : (
            <AttendanceSessionManager
              course={activeCourse || myCourses[0]}
              enrolledStudents={enrolledStudents}
              existingRecords={attendance}
              onSaveAttendance={(date, records) => {
                onSaveAttendance(activeCourse?.id || myCourses[0].id, date, records);
              }}
            />
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. PARENTS TAB                                                */}
      {/* ============================================================== */}
      {activeTab === 'PARENTS' && (
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Parent Remarks & Academic Inquiries ({parentReviews.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
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
                  <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                    <span className="font-semibold block text-[10px] text-indigo-400">Your Response:</span>
                    {rev.facultyReply}
                  </div>
                ) : (
                  <div>
                    {replyReviewId === rev.id ? (
                      <form onSubmit={handleReplySubmit} className="space-y-2 pt-2 border-t border-slate-700">
                        <textarea
                          rows={2}
                          placeholder="Type official instructor response to parent..."
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
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer pt-1"
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
      )}

      {/* Form Modals */}
      <VideoFormModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        courses={myCourses}
        initialData={editingMaterial}
        onSave={onSaveMaterial}
      />

      <MaterialFormModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        courses={myCourses}
        initialData={editingMaterial}
        onSave={onSaveMaterial}
      />

      <QuizFormModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        courses={myCourses}
        initialData={editingQuiz}
        onSave={onSaveQuiz}
      />

      <QuizAnalyticsModal
        isOpen={analyticsQuiz !== null}
        onClose={() => setAnalyticsQuiz(null)}
        quiz={analyticsQuiz}
        attempts={quizAttempts.filter((qa) => qa.quizId === analyticsQuiz?.id)}
        totalStudents={
          myCourses.find((c) => c.id === analyticsQuiz?.courseId)?.enrolledStudentsCount || 40
        }
      />

      <AssignmentFormModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        courses={myCourses}
        initialData={editingAssignment}
        onSave={onSaveAssignment}
      />
    </div>
  );
};
