import React, { useState } from 'react';
import { User, Course, Assignment, Submission, Quiz, QuizAttempt, AttendanceRecord } from '../types';
import {
  GraduationCap,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Upload
} from 'lucide-react';

interface StudentDashboardProps {
  currentStudent: User;
  courses: Course[];
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

  // Quiz state
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<{ score: number; totalMarks: number } | null>(null);

  const mySubmissions = submissions.filter((s) => s.studentId === currentStudent.id);
  const myAttendance = attendance.filter((a) => a.studentId === currentStudent.id);
  const myQuizAttempts = quizAttempts.filter((q) => q.studentId === currentStudent.id);
  const presentCount = myAttendance.filter((a) => a.status === 'PRESENT').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 100;

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgId || !fileName.trim()) return;
    const asg = assignments.find((a) => a.id === selectedAsgId);
    if (!asg) return;

    onSubmitAssignment(asg.id, asg.title, asg.courseCode, fileName);
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

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Cumulative GPA</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{currentStudent.gpa?.toFixed(2)}</div>
            <div className="text-[10px] text-emerald-500/80 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Dean's List
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Attendance Record</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{attendanceRate}%</div>
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
            <div className="text-xs text-slate-400 font-medium">Completed Submissions</div>
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

      {/* Two Column Grid: Assignments & Enrolled Courses */}
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

                  {selectedAsgId === asg.id && (
                    <form onSubmit={handleUploadSubmit} className="pt-2 border-t border-slate-700 flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter file name (e.g. AlexRivera_Project.zip)"
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

        {/* Enrolled Courses & Quizzes */}
        <div className="space-y-6">
          {/* Online Quizzes */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Available Quizzes & Assessments</span>
            </h3>

            <div className="space-y-3">
              {quizzes.map((quiz) => {
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

          {/* Enrolled Courses */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Enrolled Subjects</span>
            </h3>

            <div className="space-y-3">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{c.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                        {c.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Instructor: {c.facultyName}</div>
                    <div className="text-[10px] text-slate-500">{c.schedule} • {c.room}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-300">{c.credits} Credits</span>
                  </div>
                </div>
              ))}
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
