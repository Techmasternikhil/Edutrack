import React, { useState } from 'react';
import {
  User,
  Course,
  CourseMaterial,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  AttendanceRecord
} from '../types';
import { APP_CONFIG } from '../config/constants';
import { YouTubeVideoPlayer } from './faculty/YouTubeVideoPlayer';
import {
  GraduationCap,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  TrendingUp,
  Video,
  Play,
  FileText,
  AlertTriangle,
  Clock,
  Upload
} from 'lucide-react';

interface StudentDashboardProps {
  currentStudent: User;
  courses: Course[];
  materials?: CourseMaterial[];
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  attendance: AttendanceRecord[];
  onSubmitAssignment: (assignmentId: string, assignmentTitle: string, courseCode: string, fileName: string) => void;
  onSubmitQuiz?: (quizId: string, answers: Record<string, number>, timeTaken: number) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentStudent,
  courses,
  materials = [],
  assignments,
  submissions,
  quizzes,
  quizAttempts,
  attendance,
  onSubmitAssignment,
  onSubmitQuiz
}) => {
  const [selectedAsgId, setSelectedAsgId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  // Active student tab: 'ALL' | 'VIDEOS' | 'MATERIALS' | 'ASSIGNMENTS' | 'QUIZZES' | 'ATTENDANCE'
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Video preview player state
  const [activeVideo, setActiveVideo] = useState<CourseMaterial | null>(null);

  // Quiz state
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<{ score: number; totalMarks: number } | null>(null);

  // Filter: enrolled subjects only
  const enrolledCourseIds = courses.map((c) => c.id);
  const enrolledCourseCodes = courses.map((c) => c.code);

  // Only published learning materials for enrolled courses
  const studentMaterials = materials.filter(
    (m) => enrolledCourseIds.includes(m.courseId) && (m.status === 'PUBLISHED' || !m.status)
  );

  const studentVideos = studentMaterials.filter(
    (m) => m.type === 'YOUTUBE' || m.type === 'VIDEO'
  );

  const studentDocs = studentMaterials.filter(
    (m) => m.type !== 'YOUTUBE' && m.type !== 'VIDEO'
  );

  // Only published quizzes for enrolled courses
  const studentQuizzes = quizzes.filter(
    (q) => (enrolledCourseIds.includes(q.courseId) || enrolledCourseCodes.includes(q.courseCode || '')) && q.isPublished
  );

  // Personal metrics
  const mySubmissions = submissions.filter((s) => s.studentId === currentStudent.id);
  const myAttendance = attendance.filter((a) => a.studentId === currentStudent.id);
  const myQuizAttempts = quizAttempts.filter((q) => q.studentId === currentStudent.id);
  const presentCount = myAttendance.filter((a) => a.status === 'PRESENT').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 100;

  const isAttendanceBelowThreshold = attendanceRate < APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD;

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgId || !fileName.trim()) return;
    const asg = assignments.find((a) => a.id === selectedAsgId);
    if (!asg) return;

    onSubmitAssignment(asg.id, asg.title, asg.courseCode || '', fileName);
    setSelectedAsgId(null);
    setFileName('');
  };

  const handleFinishQuiz = () => {
    if (!takingQuiz) return;
    let score = 0;
    takingQuiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctOptionIndex) {
        score += q.marks;
      }
    });

    if (onSubmitQuiz) {
      onSubmitQuiz(takingQuiz.id, quizAnswers, 320);
    }

    setQuizSubmittedResult({ score, totalMarks: takingQuiz.totalMarks });
    setTimeout(() => {
      setTakingQuiz(null);
      setQuizAnswers({});
      setQuizSubmittedResult(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Student Academic Learning Workspace</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
          Welcome back, {currentStudent.name}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registration: <span className="text-slate-300 font-mono">{currentStudent.regNumber}</span> • Department of Computer Science • Semester {currentStudent.semester}
        </p>
      </div>

      {/* Attendance Warning Alert (if statutory threshold breached) */}
      {isAttendanceBelowThreshold && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <span className="font-bold">Statutory Attendance Warning:</span> Your attendance is currently at{' '}
              <span className="font-mono font-bold">{attendanceRate}%</span>, which is below the mandatory{' '}
              {APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD}% university compliance threshold.
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
            Action Required
          </span>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Cumulative GPA</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{currentStudent.gpa?.toFixed(2)}</div>
            <div className="text-[10px] text-emerald-500/80 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Dean's List Standing
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Attendance Record</div>
            <div
              className={`text-2xl font-black mt-1 ${
                isAttendanceBelowThreshold ? 'text-rose-400' : 'text-indigo-400'
              }`}
            >
              {attendanceRate}%
            </div>
            <div className="text-[10px] text-slate-400">
              {presentCount} / {myAttendance.length} classes attended
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Teaching Videos</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{studentVideos.length}</div>
            <div className="text-[10px] text-slate-400">Available lecture streamings</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Coursework Completed</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{mySubmissions.length}</div>
            <div className="text-[10px] text-slate-400">
              {mySubmissions.filter((s) => s.status === 'GRADED').length} Graded by Faculty
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {[
          { id: 'ALL', label: 'All Learning Activity', icon: BookOpen },
          { id: 'VIDEOS', label: 'Teaching Videos', icon: Video, badge: studentVideos.length },
          { id: 'MATERIALS', label: 'Study Materials & Slides', icon: FileText, badge: studentDocs.length },
          { id: 'ASSIGNMENTS', label: 'Assignments', icon: FileCheck2 },
          { id: 'QUIZZES', label: 'Online Quizzes', icon: Award, badge: studentQuizzes.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
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

      {/* Embedded YouTube Player Modal / In-Page Section */}
      {activeVideo && (
        <div className="animate-in fade-in">
          <YouTubeVideoPlayer
            videoId={activeVideo.youtubeVideoId || ''}
            title={activeVideo.title}
            description={activeVideo.description}
            courseTitle={courses.find((c) => c.id === activeVideo.courseId)?.title}
            moduleName={activeVideo.moduleName}
            onClose={() => setActiveVideo(null)}
          />
        </div>
      )}

      {/* Teaching Videos Showcase (Rendered when in 'ALL' or 'VIDEOS' tab) */}
      {(activeTab === 'ALL' || activeTab === 'VIDEOS') && studentVideos.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-400" />
              <span>Assigned Subject Teaching Videos</span>
            </h3>
            <span className="text-xs text-slate-400">
              {studentVideos.length} Curated Lecture Video{studentVideos.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentVideos.map((vid) => {
              const course = courses.find((c) => c.id === vid.courseId);

              return (
                <div
                  key={vid.id}
                  className="rounded-xl glass-card border border-slate-700/60 overflow-hidden flex flex-col justify-between hover:border-rose-500/40 transition-colors"
                >
                  <div>
                    <div className="relative aspect-video bg-black group overflow-hidden">
                      {vid.thumbnailUrl ? (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Video className="w-10 h-10" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setActiveVideo(vid)}
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/40 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Lecture</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-semibold">
                          {course?.code}
                        </span>
                        <span className="text-[10px] text-slate-400">{vid.moduleName || 'Unit 1'}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{vid.title}</h4>
                      {vid.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">Instructor: {course?.facultyName}</span>
                    <button
                      onClick={() => setActiveVideo(vid)}
                      className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Grid: Assignments & Enrolled Courses/Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments Panel */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Coursework & Assignments</span>
          </h3>

          <div className="space-y-3">
            {assignments.map((asg) => {
              const submission = mySubmissions.find((s) => s.assignmentId === asg.id);

              return (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{asg.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                          {asg.courseCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{asg.description}</p>
                      <div className="text-[10px] text-slate-500 mt-1">Deadline: {asg.deadline}</div>
                    </div>

                    <div>
                      {submission ? (
                        submission.status === 'GRADED' ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                            {submission.marksObtained} Marks
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-medium text-xs">
                            Submitted
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => setSelectedAsgId(asg.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow"
                        >
                          <Upload className="w-3 h-3" /> Submit
                        </button>
                      )}
                    </div>
                  </div>

                  {submission?.feedback && (
                    <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                      <span className="font-semibold block text-[10px] text-indigo-400">Instructor Feedback:</span>
                      {submission.feedback}
                    </div>
                  )}

                  {selectedAsgId === asg.id && (
                    <form onSubmit={handleUploadSubmit} className="pt-2 border-t border-slate-700 flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter file name (e.g. AaravSharma_Project.zip)"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Confirm
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quizzes & Study Materials */}
        <div className="space-y-6">
          {/* Online Quizzes */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Available Quizzes & Assessments</span>
            </h3>

            <div className="space-y-3">
              {studentQuizzes.map((quiz) => {
                const attempt = myQuizAttempts.find((qa) => qa.quizId === quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{quiz.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">
                          {quiz.courseCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{quiz.description}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Duration: {quiz.durationMinutes} mins • Total: {quiz.totalMarks} Marks
                      </div>
                    </div>

                    <div>
                      {attempt ? (
                        <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-bold text-xs">
                          Score: {attempt.score} / {attempt.totalMarks}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setTakingQuiz(quiz);
                            setQuizAnswers({});
                          }}
                          className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer shadow"
                        >
                          Start Quiz
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enrolled Subjects & Reading Materials */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Study Notes & Reference Documents</span>
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {studentDocs.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No reference slides uploaded yet for enrolled courses.
                </div>
              ) : (
                studentDocs.map((doc) => {
                  const course = courses.find((c) => c.id === doc.courseId);

                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{doc.title}</span>
                          <span className="text-[10px] text-indigo-400 font-mono">[{course?.code}]</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {doc.type} • {doc.size || '2.5 MB'} • {doc.moduleName || 'Unit 1'}
                        </div>
                      </div>

                      <a
                        href={doc.url || doc.fileUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold cursor-pointer"
                      >
                        Download
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {takingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 border border-purple-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{takingQuiz.title}</h3>
                <p className="text-xs text-slate-400">{takingQuiz.description}</p>
              </div>
              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                {takingQuiz.durationMinutes} Mins
              </span>
            </div>

            {quizSubmittedResult ? (
              <div className="p-8 text-center space-y-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Quiz Attempt Completed!</h4>
                <p className="text-sm text-slate-300">
                  Your Score:{' '}
                  <span className="text-emerald-400 font-black text-xl">
                    {quizSubmittedResult.score} / {quizSubmittedResult.totalMarks}
                  </span>
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {takingQuiz.questions.map((q, qIndex) => (
                    <div key={q.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <p className="text-xs font-semibold text-slate-200">
                        {qIndex + 1}. {q.question || q.text}{' '}
                        <span className="text-purple-400 font-normal">({q.marks} pts)</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[q.id] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                              className={`p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer border ${
                                isSelected
                                  ? 'bg-purple-600/30 border-purple-500 text-white font-semibold'
                                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTakingQuiz(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishQuiz}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer"
                  >
                    Submit Answers
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
