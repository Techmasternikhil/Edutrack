import React, { useState, useEffect } from 'react';
import { User, UserRole, Course, CourseMaterial, Assignment, Submission, Quiz, QuizAttempt, AttendanceRecord, Notification, ParentReview } from './types';
import {
  mockUsers,
  mockCourses,
  mockCourseMaterials,
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
import { AIAssistantModal } from './components/AIAssistantModal';
import { LoginScreen } from './components/LoginScreen';
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
  ExternalLink,
  Shield
} from 'lucide-react';

export function App() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  // Persist session or require login
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('edutrack_session_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return null; // Prompt login screen
  });
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [materials, setMaterials] = useState<CourseMaterial[]>(mockCourseMaterials);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(mockQuizAttempts);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [parentReviews, setParentReviews] = useState<ParentReview[]>(mockParentReviews);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('edutrack_session_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('edutrack_session_user');
    } catch (e) {}
  };

  // Self-registration for Teacher, Student, Parent
  const handleRegisterUser = (data: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    regNumber?: string;
    childStudentIds?: string[];
  }): { success: boolean; message: string } => {
    // Collision check
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'PENDING', // Requires Admin approval
      department: data.department,
      regNumber: data.regNumber,
      childStudentIds: data.childStudentIds,
      semester: data.role === 'STUDENT' ? 1 : undefined,
      gpa: data.role === 'STUDENT' ? 3.50 : undefined,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&auto=format&fit=crop&q=80`
    };

    setUsers((prev) => [...prev, newUser]);

    // Add alert notification for Admin
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'New Account Pending Approval',
      message: `${newUser.name} registered as ${newUser.role} (${newUser.email}).`,
      type: 'SYSTEM',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [notif, ...prev]);

    // Sync with backend API
    fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch((err) => console.log('Backend signup sync skipped:', err));

    return {
      success: true,
      message: `Registration submitted! Your ${data.role} account is now pending Administrator approval.`
    };
  };

  // Admin approves or declines account
  const handleApproveUser = (userId: string, status: 'APPROVED' | 'REJECTED') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );

    // Sync with backend API
    fetch(`/api/users/${userId}/approval`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewedBy: currentUser?.name || 'Administrator' })
    }).catch((err) => console.log('Backend approval sync skipped:', err));

    // Notify user
    const target = users.find((u) => u.id === userId);
    if (target) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        title: `Account Registration ${status === 'APPROVED' ? 'Approved' : 'Declined'}`,
        message: `Account for ${target.name} (${target.email}) was ${status.toLowerCase()} by Administrator.`,
        type: 'SYSTEM',
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Sync initial state from backend on mount if server is running
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => {
        // Fetch users, courses, assignments, etc.
        Promise.all([
          fetch('/api/users').then((r) => r.json()).catch(() => null),
          fetch('/api/courses').then((r) => r.json()).catch(() => null),
          fetch('/api/materials').then((r) => r.json()).catch(() => null),
          fetch('/api/assignments').then((r) => r.json()).catch(() => null),
          fetch('/api/submissions').then((r) => r.json()).catch(() => null),
          fetch('/api/quizzes').then((r) => r.json()).catch(() => null),
          fetch('/api/quiz-attempts').then((r) => r.json()).catch(() => null),
          fetch('/api/attendance').then((r) => r.json()).catch(() => null),
          fetch('/api/notifications').then((r) => r.json()).catch(() => null),
          fetch('/api/parent/reviews').then((r) => r.json()).catch(() => null)
        ]).then(([u, c, mats, asg, subs, qz, qa, att, notifs, revs]) => {
          if (u && Array.isArray(u) && u.length > 0) setUsers(u);
          if (c && Array.isArray(c) && c.length > 0) setCourses(c);
          if (mats && Array.isArray(mats) && mats.length > 0) setMaterials(mats);
          if (asg && Array.isArray(asg) && asg.length > 0) setAssignments(asg);
          if (subs && Array.isArray(subs) && subs.length > 0) setSubmissions(subs);
          if (qz && Array.isArray(qz) && qz.length > 0) setQuizzes(qz);
          if (qa && Array.isArray(qa) && qa.length > 0) setQuizAttempts(qa);
          if (att && Array.isArray(att) && att.length > 0) setAttendance(att);
          if (notifs && Array.isArray(notifs) && notifs.length > 0) setNotifications(notifs);
          if (revs && Array.isArray(revs) && revs.length > 0) setParentReviews(revs);
        });
      })
      .catch((err) => console.log('Running in local mock store:', err));
  }, []);

  // Switch role helper
  const handleSwitchRole = (newRole: UserRole) => {
    const targetUser = users.find((u) => u.role === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch('/api/notifications/read-all', { method: 'PUT' }).catch(() => null);
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

    // Add notification locally
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'New Parent Inquiry',
      message: `${newRev.parentName} submitted an inquiry regarding ${newRev.studentName}`,
      type: 'PARENT_REVIEW',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications([notif, ...notifications]);

    // Sync with backend API
    fetch('/api/parent/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRev)
    }).catch((err) => console.log('Backend sync skipped:', err));
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

    // Sync with backend API
    fetch(`/api/submissions/${submissionId}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marksObtained: marks, feedback })
    }).catch((err) => console.log('Backend sync skipped:', err));
  };

  // Faculty replies to parent review
  const handleReplyParentReview = (reviewId: string, reply: string) => {
    setParentReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, facultyReply: reply, status: 'ACKNOWLEDGED' } : r
      )
    );

    // Sync with backend API
    fetch(`/api/parent/reviews/${reviewId}/reply`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facultyReply: reply, status: 'ACKNOWLEDGED' })
    }).catch((err) => console.log('Backend sync skipped:', err));
  };

  // Faculty saves learning material (video/pdf/slides)
  const handleSaveMaterial = (data: Partial<CourseMaterial>) => {
    if (data.id) {
      // Edit existing
      setMaterials((prev) =>
        prev.map((m) => (m.id === data.id ? ({ ...m, ...data } as CourseMaterial) : m))
      );
      fetch(`/api/materials/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, performedBy: currentUser?.name, userRole: currentUser?.role, facultyId: currentUser?.id })
      }).catch((err) => console.log('Backend material update error:', err));
    } else {
      // Create new
      const newMat: CourseMaterial = {
        id: `mat-${Date.now()}`,
        courseId: data.courseId || '',
        facultyId: currentUser?.id,
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'PDF',
        fileType: data.fileType || data.type || 'PDF',
        url: data.url || data.fileUrl || '',
        fileUrl: data.url || data.fileUrl || '',
        moduleName: data.moduleName || 'Unit 1',
        status: data.status || 'PUBLISHED',
        youtubeVideoId: data.youtubeVideoId,
        thumbnailUrl: data.thumbnailUrl,
        size: data.size || '3.0 MB',
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setMaterials((prev) => [newMat, ...prev]);

      fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMat, performedBy: currentUser?.name, userRole: currentUser?.role, facultyId: currentUser?.id })
      }).catch((err) => console.log('Backend material create error:', err));
    }
  };

  // Faculty deletes material
  const handleDeleteMaterial = (materialId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    fetch(`/api/materials/${materialId}`, {
      method: 'DELETE'
    }).catch((err) => console.log('Backend material delete error:', err));
  };

  // Faculty creates or edits quiz
  const handleSaveQuiz = (data: Partial<Quiz>) => {
    if (data.id) {
      setQuizzes((prev) =>
        prev.map((q) => (q.id === data.id ? ({ ...q, ...data } as Quiz) : q))
      );
      fetch(`/api/quizzes/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, performedBy: currentUser?.name, userRole: currentUser?.role, facultyId: currentUser?.id })
      }).catch((err) => console.log('Backend quiz update error:', err));
    } else {
      const newQz: Quiz = {
        id: `qz-${Date.now()}`,
        courseId: data.courseId || '',
        courseCode: data.courseCode || '',
        courseTitle: data.courseTitle || '',
        title: data.title || '',
        description: data.description || '',
        instructions: data.instructions || '',
        durationMinutes: data.durationMinutes || 20,
        totalMarks: data.totalMarks || 10,
        isPublished: data.isPublished ?? true,
        questions: data.questions || [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setQuizzes((prev) => [newQz, ...prev]);

      fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newQz, performedBy: currentUser?.name, userRole: currentUser?.role, facultyId: currentUser?.id })
      }).catch((err) => console.log('Backend quiz create error:', err));
    }
  };

  // Faculty deletes quiz
  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    fetch(`/api/quizzes/${quizId}`, {
      method: 'DELETE'
    }).catch((err) => console.log('Backend quiz delete error:', err));
  };

  // Faculty creates or edits assignment
  const handleSaveAssignment = (data: Partial<Assignment>) => {
    if (data.id) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === data.id ? ({ ...a, ...data } as Assignment) : a))
      );
      fetch(`/api/assignments/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, performedBy: currentUser?.name, userRole: currentUser?.role, facultyId: currentUser?.id })
      }).catch((err) => console.log('Backend assignment update error:', err));
    } else {
      const newAsg: Assignment = {
        id: `asg-${Date.now()}`,
        courseId: data.courseId || '',
        courseCode: data.courseCode || '',
        title: data.title || '',
        description: data.description || '',
        deadline: data.deadline || '',
        totalMarks: data.totalMarks || 100,
        maxMarks: data.maxMarks || 100,
        status: data.status || 'PUBLISHED',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAssignments((prev) => [newAsg, ...prev]);

      fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAsg, performedBy: currentUser?.name, userRole: currentUser?.role, facultyId: currentUser?.id })
      }).catch((err) => console.log('Backend assignment create error:', err));
    }
  };

  // Faculty deletes assignment
  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    fetch(`/api/assignments/${assignmentId}`, {
      method: 'DELETE'
    }).catch((err) => console.log('Backend assignment delete error:', err));
  };

  // Faculty records bulk session attendance
  const handleSaveAttendance = (
    courseId: string,
    date: string,
    records: { studentId: string; studentName: string; status: any }[]
  ) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    setAttendance((prev) => {
      const updated = [...prev];
      records.forEach((rec) => {
        const existingIdx = updated.findIndex(
          (a) => a.courseId === courseId && a.studentId === rec.studentId && a.date === date
        );
        if (existingIdx !== -1) {
          updated[existingIdx] = { ...updated[existingIdx], status: rec.status };
        } else {
          updated.push({
            id: `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            courseId,
            courseCode: targetCourse?.code,
            courseName: targetCourse?.title,
            studentId: rec.studentId,
            studentName: rec.studentName,
            date,
            status: rec.status
          });
        }
      });
      return updated;
    });

    fetch(`/api/courses/${courseId}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        records,
        facultyId: currentUser?.id,
        userRole: currentUser?.role,
        performedBy: currentUser?.name
      })
    }).catch((err) => console.log('Backend bulk attendance sync error:', err));
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

    // Sync with backend API
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub)
    }).catch((err) => console.log('Backend sync skipped:', err));
  };

  // Student attempts quiz
  const handleStudentSubmitQuiz = (quizId: string, answers: Record<string, number>, timeTaken: number) => {
    const targetQuiz = quizzes.find((q) => q.id === quizId);
    let calculatedScore = 0;
    targetQuiz?.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        calculatedScore += q.marks;
      }
    });

    const newAttempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      quizId,
      quizTitle: targetQuiz?.title || 'Quiz',
      studentId: currentUser.id,
      studentName: currentUser.name,
      score: calculatedScore,
      totalMarks: targetQuiz?.totalMarks || 12,
      answers,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: timeTaken
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);

    // Sync with backend API
    fetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentUser.id,
        studentName: currentUser.name,
        answers,
        timeTakenSeconds: timeTaken
      })
    }).catch((err) => console.log('Backend sync skipped:', err));
  };

  // If not logged in, present secure multi-role login barrier
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenAI={() => setIsAIOpen(true)}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Body with Enforced Role-Based Access Isolation */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Portal Access Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              {currentUser.role === 'PARENT' && <HeartHandshake className="w-4 h-4 text-purple-400" />}
              {currentUser.role === 'STUDENT' && <GraduationCap className="w-4 h-4 text-emerald-400" />}
              {currentUser.role === 'FACULTY' && <BookOpen className="w-4 h-4 text-amber-400" />}
              {currentUser.role === 'ADMIN' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  {currentUser.role === 'PARENT' && 'Parental Oversight & Child Monitoring System'}
                  {currentUser.role === 'STUDENT' && 'Student Learning & Coursework Portal'}
                  {currentUser.role === 'FACULTY' && 'Faculty Instruction & Grading Portal'}
                  {currentUser.role === 'ADMIN' && 'Institutional Administration Console'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Restricted Access
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">EduTrack RBAC Active</span>
          </div>
        </div>

        {/* Dynamic Authorized Portal View Only */}
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
            materials={materials}
            assignments={assignments}
            submissions={submissions}
            quizzes={quizzes}
            quizAttempts={quizAttempts}
            attendance={attendance}
            onSubmitAssignment={handleStudentSubmitAssignment}
            onSubmitQuiz={handleStudentSubmitQuiz}
          />
        )}

        {currentUser.role === 'FACULTY' && (
          <FacultyDashboard
            currentFaculty={currentUser}
            courses={courses}
            materials={materials}
            assignments={assignments}
            submissions={submissions}
            quizzes={quizzes}
            quizAttempts={quizAttempts}
            attendance={attendance}
            parentReviews={parentReviews}
            students={users}
            onGradeSubmission={handleGradeSubmission}
            onReplyParentReview={handleReplyParentReview}
            onSaveMaterial={handleSaveMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onSaveQuiz={handleSaveQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onSaveAssignment={handleSaveAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {currentUser.role === 'ADMIN' && (
          <AdminDashboard
            users={users}
            courses={courses}
            submissions={submissions}
            parentReviews={parentReviews}
            onApproveUser={handleApproveUser}
          />
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Gemini AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userRole={currentUser.role}
      />
    </div>
  );
}

export default App;
