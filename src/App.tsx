import React, { useState } from 'react';
import { User, UserRole, Course, Assignment, Submission, Quiz, QuizAttempt, AttendanceRecord, Notification, ParentReview } from './types';
import {
  mockUsers,
  mockCourses,
  mockAssignments,
  mockSubmissions,
  mockQuizzes,
  mockQuizAttempts,
  mockAttendance,
  mockNotifications,
  mockParentReviews
} from './data/mockData';
import { Header } from './components/Header';
import { UserProfileModal } from './components/UserProfileModal';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { FacultyDashboard } from './components/FacultyDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export function App() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  // Default to the Parent user to immediately showcase parental oversight features
  const [currentUser, setCurrentUser] = useState<User>(
    mockUsers.find((u) => u.role === 'PARENT') || mockUsers[0]
  );
  const [courses] = useState<Course[]>(mockCourses);
  const [assignments] = useState<Assignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [quizzes] = useState<Quiz[]>(mockQuizzes);
  const [quizAttempts] = useState<QuizAttempt[]>(mockQuizAttempts);
  const [attendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [parentReviews, setParentReviews] = useState<ParentReview[]>(mockParentReviews);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Switch role helper
  const handleSwitchRole = (newRole: UserRole) => {
    const targetUser = users.find((u) => u.role === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // Parent submits review
  const handleParentSubmitReview = (
    newRev: Omit<ParentReview, 'id' | 'createdAt' | 'status'>
  ) => {
    const reviewItem: ParentReview = {
      id: `prev-${Date.now()}`,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      ...newRev
    };

    setParentReviews([reviewItem, ...parentReviews]);

    // Add notification
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'New Parent Inquiry',
      message: `${newRev.parentName} submitted an inquiry regarding ${newRev.studentName}`,
      type: 'PARENT_REVIEW',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications([notif, ...notifications]);
  };

  // Faculty grades submission
  const handleGradeSubmission = (submissionId: string, marks: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, status: 'GRADED', marksObtained: marks, feedback }
          : s
      )
    );
  };

  // Faculty replies to parent review
  const handleReplyParentReview = (reviewId: string, reply: string) => {
    setParentReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, facultyReply: reply, status: 'ACKNOWLEDGED' } : r
      )
    );
  };

  // Student submits assignment
  const handleStudentSubmitAssignment = (
    assignmentId: string,
    assignmentTitle: string,
    courseCode: string,
    fileName: string
  ) => {
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      assignmentTitle,
      courseCode,
      studentId: currentUser.id,
      studentName: currentUser.name,
      fileName,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };
    setSubmissions([newSub, ...submissions]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Portal Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => handleSwitchRole('PARENT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentUser.role === 'PARENT'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Parent Portal</span>
            </button>

            <button
              onClick={() => handleSwitchRole('STUDENT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentUser.role === 'STUDENT'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Workspace</span>
            </button>

            <button
              onClick={() => handleSwitchRole('FACULTY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentUser.role === 'FACULTY'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 ring-1 ring-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Faculty Dashboard</span>
            </button>

            <button
              onClick={() => handleSwitchRole('ADMIN')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentUser.role === 'ADMIN'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 ring-1 ring-rose-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>EduTrack System Online</span>
          </div>
        </div>

        {/* Dynamic Role Dashboard */}
        {currentUser.role === 'PARENT' && (
          <ParentDashboard
            currentParent={currentUser}
            allUsers={users}
            courses={courses}
            submissions={submissions}
            quizAttempts={quizAttempts}
            attendance={attendance}
            reviews={parentReviews}
            onSubmitReview={handleParentSubmitReview}
          />
        )}

        {currentUser.role === 'STUDENT' && (
          <StudentDashboard
            currentStudent={currentUser}
            courses={courses}
            assignments={assignments}
            submissions={submissions}
            quizzes={quizzes}
            quizAttempts={quizAttempts}
            attendance={attendance}
            onSubmitAssignment={handleStudentSubmitAssignment}
          />
        )}

        {currentUser.role === 'FACULTY' && (
          <FacultyDashboard
            currentFaculty={currentUser}
            courses={courses}
            submissions={submissions}
            parentReviews={parentReviews}
            attendance={attendance}
            onGradeSubmission={handleGradeSubmission}
            onReplyParentReview={handleReplyParentReview}
          />
        )}

        {currentUser.role === 'ADMIN' && (
          <AdminDashboard
            users={users}
            courses={courses}
            submissions={submissions}
            parentReviews={parentReviews}
          />
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
