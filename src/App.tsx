import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Course,
  CourseMaterial,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  AttendanceRecord,
  Notification,
  ParentReview,
  AcademicClass,
  RegistrationRequest,
  FeeRecord,
  AttendanceRegularizationRequest,
  SMSNotificationRecord,
  ExamAssessment,
  ExamResult,
  ExamType,
  AttendanceStatus,
  ProfileChangeRequest
} from './types';
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
  mockParentReviews,
  mockAcademicClasses,
  mockRegistrationRequests,
  mockFeeRecords,
  mockAttendanceRequests,
  mockSmsNotifications,
  mockExamAssessments,
  mockExamResults,
  mockProfileChangeRequests
} from './data/mockData';
import { Header } from './components/Header';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginScreen } from './components/LoginScreen';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { FacultyDashboard } from './components/FacultyDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import {
  GraduationCap,
  BookOpen,
  HeartHandshake,
  ShieldAlert
} from 'lucide-react';

export function App() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>(mockAcademicClasses);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(mockRegistrationRequests);
  // Persist session or require login
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('edutrack_session_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.name === 'Arun' && u.email === 'admin@edutrack.edu') {
          u.name = 'Dr. Rajesh Verma';
        }
        return u;
      }
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
  const [fees, setFees] = useState<FeeRecord[]>(mockFeeRecords);
  const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRegularizationRequest[]>(mockAttendanceRequests);
  const [smsNotifications, setSmsNotifications] = useState<SMSNotificationRecord[]>(mockSmsNotifications);
  const [examAssessments, setExamAssessments] = useState<ExamAssessment[]>(mockExamAssessments);
  const [examResults, setExamResults] = useState<ExamResult[]>(mockExamResults);
  const [profileChangeRequests, setProfileChangeRequests] = useState<ProfileChangeRequest[]>(mockProfileChangeRequests);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  // Two-Stage Self-registration for Student, Parent, and Faculty
  const handleRegisterUser = (data: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    regNumber?: string;
    childStudentIds?: string[];
    phone?: string;
    classId?: string;
    className?: string;
    studentRegNumber?: string;
    childName?: string;
    relationship?: string;
  }): { success: boolean; message: string } => {
    // Collision check
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    if (data.role === 'ADMIN') {
      return { success: false, message: 'Administrator accounts cannot be self-registered.' };
    }

    // Determine assigned class teacher
    let resolvedClass = academicClasses.find((c) => c.id === data.classId) || academicClasses[0];
    if (data.role === 'PARENT' && data.childStudentIds && data.childStudentIds.length > 0) {
      const child = users.find((u) => u.id === data.childStudentIds![0]);
      if (child && child.classId) {
        resolvedClass = academicClasses.find((c) => c.id === child.classId) || resolvedClass;
      }
    }

    const newUserId = `usr-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'PENDING',
      accountStatus: 'PENDING',
      department: data.department,
      regNumber: data.regNumber || data.studentRegNumber,
      childStudentIds: data.childStudentIds,
      classId: resolvedClass?.id,
      className: resolvedClass ? `${resolvedClass.className || resolvedClass.name} (${resolvedClass.section})` : undefined,
      phone: data.phone,
      semester: data.role === 'STUDENT' ? 1 : undefined,
      gpa: data.role === 'STUDENT' ? 3.50 : undefined,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&auto=format&fit=crop&q=80`
    };

    setUsers((prev) => [...prev, newUser]);

    // Create Two-Stage Registration Request
    const reqStatus = (data.role === 'STUDENT' || data.role === 'PARENT')
      ? 'PENDING_TEACHER_REVIEW'
      : 'PENDING_ADMIN_REVIEW';

    const newReq: RegistrationRequest = {
      id: `reg-${Date.now()}`,
      userId: newUserId,
      userName: data.name,
      userEmail: data.email,
      requestedRole: data.role,
      status: reqStatus,
      classId: resolvedClass?.id,
      className: resolvedClass ? `${resolvedClass.className || resolvedClass.name} (${resolvedClass.section})` : undefined,
      classSection: resolvedClass?.section,
      classTeacherId: resolvedClass?.classTeacherId,
      classTeacherName: resolvedClass?.classTeacherName,
      studentId: data.childStudentIds ? data.childStudentIds[0] : undefined,
      childName: data.childName,
      studentRegNumber: data.regNumber || data.studentRegNumber,
      relationship: data.relationship,
      phone: data.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRegistrationRequests((prev) => [newReq, ...prev]);

    // Add alert notification for Class Teacher or Admin
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'New Two-Stage Registration Application',
      message: `${newUser.name} applied for ${newUser.role}. Assigned to ${resolvedClass?.classTeacherName || 'Class Teacher'} for verification.`,
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
      message: `Registration submitted! Awaiting verification by assigned Class Teacher (${resolvedClass?.classTeacherName || 'Faculty'}).`
    };
  };

  // Class Teacher Confirms Registration
  const handleTeacherConfirmRegistration = (requestId: string) => {
    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'PENDING_ADMIN_REVIEW',
              teacherReviewedBy: currentUser?.name || 'Class Teacher',
              teacherReviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    fetch(`/api/faculty/registration-requests/${requestId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: currentUser?.id,
        teacherName: currentUser?.name,
        userRole: currentUser?.role
      })
    }).catch((err) => console.log('Backend teacher confirm error:', err));

    const targetReq = registrationRequests.find((r) => r.id === requestId);
    if (targetReq) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Registration Teacher-Confirmed',
          message: `Application for ${targetReq.userName} (${targetReq.requestedRole}) confirmed by Class Teacher. Pending final Admin authorization.`,
          type: 'SYSTEM',
          createdAt: new Date().toISOString(),
          isRead: false
        },
        ...prev
      ]);
    }
  };

  // Class Teacher Rejects Registration
  const handleTeacherRejectRegistration = (requestId: string, reason: string) => {
    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED_BY_TEACHER',
              teacherReviewedBy: currentUser?.name || 'Class Teacher',
              teacherReviewedAt: new Date().toISOString(),
              teacherReviewReason: reason,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    // Update user status to REJECTED
    const targetReq = registrationRequests.find((r) => r.id === requestId);
    if (targetReq) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetReq.userId
            ? { ...u, status: 'REJECTED', accountStatus: 'REJECTED' }
            : u
        )
      );
    }

    fetch(`/api/faculty/registration-requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: currentUser?.id,
        teacherName: currentUser?.name,
        userRole: currentUser?.role,
        reason
      })
    }).catch((err) => console.log('Backend teacher reject error:', err));
  };

  // Admin Approves Registration (Activates Account)
  const handleAdminApproveRegistration = (requestId: string) => {
    const targetReq = registrationRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              adminReviewedBy: currentUser?.name || 'Administrator',
              adminReviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    // Transactionally activate user account
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetReq.userId
          ? { ...u, status: 'APPROVED', accountStatus: 'ACTIVE' }
          : u
      )
    );

    fetch(`/api/admin/registration-requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: currentUser?.id,
        adminName: currentUser?.name,
        userRole: currentUser?.role
      })
    }).catch((err) => console.log('Backend admin approve error:', err));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Account Activated by Administrator',
        message: `${targetReq.userName}'s account is now ACTIVE and authorized for EduTrack login.`,
        type: 'SYSTEM',
        createdAt: new Date().toISOString(),
        isRead: false
      },
      ...prev
    ]);
  };

  // Admin Rejects Registration
  const handleAdminRejectRegistration = (requestId: string, reason: string) => {
    const targetReq = registrationRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setRegistrationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED_BY_ADMIN',
              adminReviewedBy: currentUser?.name || 'Administrator',
              adminReviewedAt: new Date().toISOString(),
              adminReviewReason: reason,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetReq.userId
          ? { ...u, status: 'REJECTED', accountStatus: 'REJECTED' }
          : u
      )
    );

    fetch(`/api/admin/registration-requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: currentUser?.id,
        adminName: currentUser?.name,
        userRole: currentUser?.role,
        reason
      })
    }).catch((err) => console.log('Backend admin reject error:', err));
  };

  // Admin Creates Another Admin
  const handleAdminCreateAdmin = (adminData: { name: string; email: string; department?: string }) => {
    const newAdminUser: User = {
      id: `usr-adm-${Date.now()}`,
      name: adminData.name,
      email: adminData.email,
      role: 'ADMIN',
      status: 'APPROVED',
      accountStatus: 'ACTIVE',
      department: adminData.department || 'Administration',
      avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 100000000)}?w=150&auto=format&fit=crop&q=80`
    };

    setUsers((prev) => [...prev, newAdminUser]);

    fetch('/api/admin/users/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...adminData,
        creatorId: currentUser?.id,
        creatorName: currentUser?.name,
        creatorRole: currentUser?.role
      })
    }).catch((err) => console.log('Backend create admin error:', err));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Administrator Provisioned',
        message: `${adminData.name} (${adminData.email}) was provisioned as Administrator by ${currentUser?.name}.`,
        type: 'SYSTEM',
        createdAt: new Date().toISOString(),
        isRead: false
      },
      ...prev
    ]);
  };

  // Admin Creates New Academic Class
  const handleAdminCreateClass = (classData: {
    className: string;
    section: string;
    department: string;
    semester: number;
    academicYear: string;
    classTeacherId: string;
  }) => {
    const assignedTeacher = users.find((u) => u.id === classData.classTeacherId);

    const newClass: AcademicClass = {
      id: `cls-${Date.now()}`,
      className: classData.className,
      section: classData.section,
      academicYear: classData.academicYear,
      department: classData.department,
      semester: classData.semester,
      classTeacherId: classData.classTeacherId,
      classTeacherName: assignedTeacher?.name || 'Assigned Faculty',
      classTeacherEmail: assignedTeacher?.email || 'faculty@edutrack.edu'
    };

    setAcademicClasses((prev) => [...prev, newClass]);

    // Update teacher's assignment state
    if (assignedTeacher) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === assignedTeacher.id
            ? {
                ...u,
                isClassTeacher: true,
                assignedClassId: newClass.id,
                assignedClassName: `${newClass.className} (${newClass.section})`
              }
            : u
        )
      );
    }

    fetch('/api/academic-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...classData,
        performedBy: currentUser?.name,
        userRole: currentUser?.role
      })
    }).catch((err) => console.log('Backend create class error:', err));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Academic Class Configured',
        message: `Class "${classData.className} (${classData.section})" was created with Class Teacher ${assignedTeacher?.name || 'Faculty'}.`,
        type: 'SYSTEM',
        createdAt: new Date().toISOString(),
        isRead: false
      },
      ...prev
    ]);
  };

  // Admin approves or declines account legacy fallback
  const handleApproveUser = (userId: string, status: 'APPROVED' | 'REJECTED') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status, accountStatus: status === 'APPROVED' ? 'ACTIVE' : 'REJECTED' } : u))
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

  // Admin edits details of staff, students, or parents
  const handleAdminUpdateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );

    // If current logged-in user is updated, update currentUser state as well
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('edutrack_user', JSON.stringify(updatedUser));
    }

    // Sync with backend API
    fetch(`/api/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch((err) => console.log('Backend user update sync error:', err));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'User Profile Updated',
        message: `Records for ${updatedUser.name} (${updatedUser.role}) were modified by Administrator.`,
        type: 'SYSTEM',
        createdAt: new Date().toISOString(),
        isRead: false
      },
      ...prev
    ]);
  };

  // Sync initial state from backend on mount if server is running
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => {
        // Fetch users, courses, assignments, academic classes, registration requests, etc.
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
          fetch('/api/parent/reviews').then((r) => r.json()).catch(() => null),
          fetch('/api/academic-classes').then((r) => r.json()).catch(() => null),
          fetch('/api/admin/registration-requests').then((r) => r.json()).catch(() => null),
          fetch('/api/fees').then((r) => r.json()).catch(() => null),
          fetch('/api/attendance-requests').then((r) => r.json()).catch(() => null),
          fetch('/api/notifications/sms').then((r) => r.json()).catch(() => null),
          fetch('/api/exam-assessments').then((r) => r.json()).catch(() => null),
          fetch('/api/exam-results').then((r) => r.json()).catch(() => null),
          fetch('/api/admin/profile-change-requests').then((r) => r.json()).catch(() => null)
        ]).then(([u, c, mats, asg, subs, qz, qa, att, notifs, revs, aClasses, regReqs, feeRecords, attReqs, smsNotifs, examAsmts, examRes, pcrList]) => {
          if (u && Array.isArray(u) && u.length > 0) {
            // Normalize any legacy/demo names to authentic Indian names
            const indianNameMap: Record<string, { name: string; email: string }> = {
              'usr-admin-1': { name: 'Dr. Rajesh Verma', email: 'admin@edutrack.edu' },
              'usr-fac-1': { name: 'Prof. Ananya Sharma', email: 'ananya.sharma@edutrack.edu' },
              'usr-stu-1': { name: 'Aarav Sharma', email: 'aarav.sharma@student.edutrack.edu' },
              'usr-stu-2': { name: 'Diya Patel', email: 'diya.patel@student.edutrack.edu' },
              'usr-parent-1': { name: 'Raveendra Sharma', email: 'raveendra.sharma@edutrack.edu' },
              'usr-parent-2': { name: 'Suresh Patel', email: 'suresh.patel@gmail.com' }
            };

            const normalizedUsers = u.map((user: User) => {
              if (indianNameMap[user.id]) {
                return { ...user, ...indianNameMap[user.id] };
              }
              // Replace any generic non-Indian sample names dynamically
              let cleanName = user.name
                .replace(/Evelyn Reed/g, 'Ananya Sharma')
                .replace(/Alex Rivera/g, 'Aarav Sharma')
                .replace(/Sophia Chen/g, 'Diya Patel')
                .replace(/David Chen/g, 'Suresh Patel')
                .replace(/Dean Arthur Pendelton/g, 'Dr. Rajesh Verma')
                .replace(/Robert Vance/g, 'Dr. Rajesh Verma')
                .replace(/Diana Prince/g, 'Priya Nair')
                .replace(/Arun$/g, 'Dr. Rajesh Verma');

              let cleanEmail = user.email
                .replace(/evelyn\.reed/g, 'ananya.sharma')
                .replace(/alex\.rivera/g, 'aarav.sharma')
                .replace(/sophia\.chen/g, 'diya.patel')
                .replace(/david\.chen/g, 'suresh.patel')
                .replace(/arthur\.dean\.live/g, 'rajesh.verma')
                .replace(/diana\.prince/g, 'priya.nair');

              if (user.id === 'usr-parent-1' && cleanName === 'Raveendra') {
                cleanName = 'Raveendra Sharma';
                cleanEmail = 'raveendra.sharma@edutrack.edu';
              }

              return { ...user, name: cleanName, email: cleanEmail };
            });

            setUsers(normalizedUsers);
          }
          if (c && Array.isArray(c) && c.length > 0) setCourses(c);
          if (mats && Array.isArray(mats) && mats.length > 0) setMaterials(mats);
          if (asg && Array.isArray(asg) && asg.length > 0) setAssignments(asg);
          if (subs && Array.isArray(subs) && subs.length > 0) setSubmissions(subs);
          if (qz && Array.isArray(qz) && qz.length > 0) setQuizzes(qz);
          if (qa && Array.isArray(qa) && qa.length > 0) setQuizAttempts(qa);
          if (att && Array.isArray(att) && att.length > 0) setAttendance(att);
          if (notifs && Array.isArray(notifs) && notifs.length > 0) setNotifications(notifs);
          if (revs && Array.isArray(revs) && revs.length > 0) setParentReviews(revs);
          if (aClasses && Array.isArray(aClasses) && aClasses.length > 0) setAcademicClasses(aClasses);
          if (regReqs && Array.isArray(regReqs) && regReqs.length > 0) setRegistrationRequests(regReqs);
          if (feeRecords && Array.isArray(feeRecords) && feeRecords.length > 0) setFees(feeRecords);
          if (attReqs && Array.isArray(attReqs) && attReqs.length > 0) setAttendanceRequests(attReqs);
          if (smsNotifs && Array.isArray(smsNotifs) && smsNotifs.length > 0) setSmsNotifications(smsNotifs);
          if (examAsmts && Array.isArray(examAsmts) && examAsmts.length > 0) setExamAssessments(examAsmts);
          if (examRes && Array.isArray(examRes) && examRes.length > 0) setExamResults(examRes);
          if (pcrList && Array.isArray(pcrList) && pcrList.length > 0) setProfileChangeRequests(pcrList);
        });
      })
      .catch((err) => console.log('Running in local mock store:', err));
  }, []);

  // Mark all notifications as read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch('/api/notifications/read-all', { method: 'PUT' }).catch(() => null);
  };

  // Fee Payment Handler (Student or Parent)
  const handlePayFee = async (feeId: string, paymentMethod: string, transactionRef?: string) => {
    const targetFee = fees.find((f) => f.id === feeId);
    if (!targetFee) return;

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const paidAt = new Date().toISOString();

    // Optimistically update local fee state
    setFees((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? {
              ...f,
              status: 'PAID',
              paidAt,
              paidAmount: f.amount,
              paymentMethod: paymentMethod as any,
              transactionRef: transactionRef || `TXN${Date.now()}`,
              receiptNumber: receiptNo
            }
          : f
      )
    );

    // Call backend API
    fetch(`/api/fees/${feeId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethod,
        transactionRef,
        payerId: currentUser?.id,
        payerName: currentUser?.name,
        payerRole: currentUser?.role
      })
    }).catch((err) => console.log('Fee payment API error:', err));

    // Create immediate user notification
    const receiptNotif: Notification = {
      id: `notif-fee-${Date.now()}`,
      title: 'Fee Payment Received',
      message: `Payment of ₹${targetFee.amount.toLocaleString('en-IN')} for "${targetFee.title}" has been verified. Receipt: ${receiptNo}.`,
      type: 'BILLING',
      createdAt: paidAt,
      isRead: false
    };
    setNotifications((prev) => [receiptNotif, ...prev]);
  };

  // Fee Reminder Dispatcher (Faculty or Admin)
  const handleSendFeeReminder = async (feeId: string, customMessage?: string) => {
    const targetFee = fees.find((f) => f.id === feeId);
    if (!targetFee) return;

    fetch(`/api/fees/${feeId}/remind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser?.id,
        senderName: currentUser?.name,
        senderRole: currentUser?.role,
        customMessage
      })
    }).catch((err) => console.log('Fee reminder API error:', err));

    // Push local in-app alert
    const reminderNotif: Notification = {
      id: `notif-remind-${Date.now()}`,
      title: 'Fee Due Alert Dispatched',
      message: `Reminder sent to ${targetFee.studentName} for ₹${targetFee.amount.toLocaleString('en-IN')} (${targetFee.title}) by ${currentUser?.name}.`,
      type: 'BILLING',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [reminderNotif, ...prev]);
  };

  // Fee Invoice Creator (Admin)
  const handleCreateFeeInvoice = async (invoiceData: Omit<FeeRecord, 'id' | 'createdAt' | 'status'> & { status?: FeeRecord['status'] }) => {
    const newInvoice: FeeRecord = {
      id: `fee-${Date.now()}`,
      status: invoiceData.status || 'PENDING',
      createdAt: new Date().toISOString(),
      ...invoiceData
    };

    setFees((prev) => [newInvoice, ...prev]);

    fetch('/api/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...invoiceData,
        creatorId: currentUser?.id,
        creatorName: currentUser?.name
      })
    }).catch((err) => console.log('Fee invoice create API error:', err));

    const invoiceNotif: Notification = {
      id: `notif-inv-${Date.now()}`,
      title: 'New Institutional Fee Invoice Raised',
      message: `Invoice #${newInvoice.invoiceNumber} of ₹${newInvoice.amount.toLocaleString('en-IN')} issued for ${newInvoice.studentName}.`,
      type: 'BILLING',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [invoiceNotif, ...prev]);
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
    })
      .then((res) => res.json())
      .then((data) => {
        // If the server dispatched SMS notifications, append them to local state
        if (data && data.smsDispatches && Array.isArray(data.smsDispatches)) {
          setSmsNotifications((prev) => [...data.smsDispatches, ...prev]);
        }
      })
      .catch((err) => console.log('Backend bulk attendance sync error:', err));
  };

  // Student submits attendance regularization request (Medical Certificate or OD)
  const handleSubmitRegularizationRequest = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        studentId: currentUser?.id,
        studentName: currentUser?.name,
        rollNumber: currentUser?.regNumber,
        department: currentUser?.department,
        classId: currentUser?.classId,
        className: currentUser?.className
      };

      const res = await fetch('/api/attendance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.request) {
        setAttendanceRequests((prev) => [data.request, ...prev]);
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: 'Attendance Regularization Submitted',
            message: `Your ${formData.type} regularization request has been routed to your Class Teacher.`,
            type: 'SYSTEM',
            createdAt: new Date().toISOString(),
            isRead: false
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error submitting regularization request:', err);
    }
  };

  // Student uploads approved OD certificate after attending event
  const handleUploadApprovedOD = async (requestId: string, file: File | null, fileName: string) => {
    try {
      const res = await fetch(`/api/attendance-requests/${requestId}/upload-approved-od`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser?.id,
          certificateUrl: fileName || 'https://images.unsplash.com/photo-od-cert.jpg'
        })
      });
      const data = await res.json();
      if (data.request) {
        setAttendanceRequests((prev) =>
          prev.map((r) => (r.id === requestId ? data.request : r))
        );
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: 'Approved OD Uploaded',
            message: 'Your signed OD certificate has been forwarded for Class Teacher and Subject Faculty clearance.',
            type: 'SYSTEM',
            createdAt: new Date().toISOString(),
            isRead: false
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error uploading approved OD:', err);
    }
  };

  // Class Teacher reviews and endorses regularization request
  const handleReviewRegularizationRequest = async (
    requestId: string,
    decision: 'APPROVE' | 'REJECT',
    reason?: string,
    sessionIds?: string[]
  ) => {
    try {
      const res = await fetch(`/api/class-teacher/attendance-requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentUser?.id,
          teacherName: currentUser?.name,
          decision,
          rejectionReason: reason,
          approvedSessionIds: sessionIds
        })
      });
      const data = await res.json();
      if (data.request) {
        setAttendanceRequests((prev) =>
          prev.map((r) => (r.id === requestId ? data.request : r))
        );
      }
    } catch (err) {
      console.error('Error reviewing regularization request:', err);
    }
  };

  // Subject Faculty reviews an affected session adjustment
  const handleFacultyDecisionAdjustment = async (
    requestId: string,
    sessionId: string,
    decision: 'APPROVED' | 'REJECTED',
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/faculty/attendance-adjustments/${sessionId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: currentUser?.id,
          facultyName: currentUser?.name,
          decision,
          reason
        })
      });
      const data = await res.json();
      if (data.adjustment) {
        // Update local requests
        setAttendanceRequests((prev) =>
          prev.map((req) => {
            const hasSession = req.affectedSessions.some((s) => s.id === sessionId);
            if (!hasSession) return req;
            return {
              ...req,
              affectedSessions: req.affectedSessions.map((s) =>
                s.id === sessionId
                  ? { ...s, facultyDecision: decision, rejectionReason: reason, reviewedAt: new Date().toISOString() }
                  : s
              )
            };
          })
        );
        // Refresh attendance from server to update effectiveStatus & adjustments
        fetch('/api/attendance')
          .then((r) => r.json())
          .then((att) => {
            if (Array.isArray(att)) setAttendance(att);
          })
          .catch(() => null);
      }
    } catch (err) {
      console.error('Error resolving faculty adjustment:', err);
    }
  };

  // Faculty modifies historical attendance with mandatory reason & audit
  const handleUpdateHistoricalAttendance = async (
    attendanceId: string,
    newStatus: AttendanceStatus,
    reason: string
  ) => {
    try {
      const res = await fetch(`/api/faculty/attendance/${attendanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          reason,
          facultyId: currentUser?.id,
          facultyName: currentUser?.name
        })
      });
      const data = await res.json();
      if (data.record) {
        setAttendance((prev) =>
          prev.map((a) => (a.id === attendanceId ? data.record : a))
        );
        // If an SMS was dispatched due to absent mark
        if (data.smsDispatches && Array.isArray(data.smsDispatches)) {
          setSmsNotifications((prev) => [...data.smsDispatches, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error updating historical attendance:', err);
    }
  };

  // Faculty creates Exam Assessment (IAT-1, IAT-2, Model)
  const handleCreateExamAssessment = async (data: {
    courseId: string;
    courseCode: string;
    examType: ExamType;
    title: string;
    maxMarks: number;
    examDate: string;
  }) => {
    try {
      const res = await fetch('/api/exam-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          facultyId: currentUser?.id
        })
      });
      const newAssessment = await res.json();
      if (newAssessment && newAssessment.id) {
        setExamAssessments((prev) => [newAssessment, ...prev]);
      }
    } catch (err) {
      console.error('Error creating exam assessment:', err);
    }
  };

  // Faculty saves marks for an exam assessment
  const handleSaveExamResults = async (
    assessmentId: string,
    results: { studentId: string; marksObtained: number; remarks?: string }[]
  ) => {
    try {
      const res = await fetch(`/api/exam-assessments/${assessmentId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: currentUser?.id,
          results
        })
      });
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setExamResults((prev) => {
          const filtered = prev.filter((r) => r.assessmentId !== assessmentId);
          return [...filtered, ...data.results];
        });
      }
    } catch (err) {
      console.error('Error saving exam results:', err);
    }
  };

  // Faculty publishes exam assessment
  const handlePublishExamAssessment = async (assessmentId: string) => {
    try {
      const res = await fetch(`/api/exam-assessments/${assessmentId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId: currentUser?.id })
      });
      const data = await res.json();
      if (data.assessment) {
        setExamAssessments((prev) =>
          prev.map((a) => (a.id === assessmentId ? data.assessment : a))
        );
        // Refresh exam results
        fetch('/api/exam-results')
          .then((r) => r.json())
          .then((rList) => {
            if (Array.isArray(rList)) setExamResults(rList);
          })
          .catch(() => null);
      }
    } catch (err) {
      console.error('Error publishing exam assessment:', err);
    }
  };

  // Profile Change Request: Applicant submits updates
  const handleSubmitProfileRequest = async (payload: {
    changes: Record<string, any>;
    pendingAvatarUrl?: string;
    requestType?: string;
  }) => {
    try {
      const res = await fetch('/api/profile/me/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userRole: currentUser?.role,
          ...payload
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit profile request.');
      }

      if (data.request) {
        setProfileChangeRequests((prev) => [data.request, ...prev]);
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: 'Profile Change Submitted',
            message: `Your profile change request has been submitted for ${data.request.approvalLevel === 'CLASS_TEACHER' ? 'Class Teacher' : 'Administrative'} approval.`,
            type: 'SYSTEM',
            createdAt: new Date().toISOString(),
            isRead: false
          },
          ...prev
        ]);
      } else if (data.user) {
        // Admin direct edit
        setCurrentUser(data.user);
        setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      }
    } catch (err: any) {
      console.error('Error submitting profile request:', err);
      throw err;
    }
  };

  // Profile Change Request: Applicant cancels pending request
  const handleCancelProfileRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/profile/change-requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel request.');
      }

      setProfileChangeRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' } : r))
      );
    } catch (err: any) {
      console.error('Error cancelling profile request:', err);
      throw err;
    }
  };

  // Approver: Class Teacher or Admin approves request (Atomic Update)
  const handleApproveProfileRequest = async (requestId: string) => {
    try {
      const targetReq = profileChangeRequests.find((r) => r.id === requestId);
      if (!targetReq) return;

      const endpoint =
        targetReq.approvalLevel === 'CLASS_TEACHER'
          ? `/api/class-teacher/profile-change-requests/${requestId}/approve`
          : `/api/admin/profile-change-requests/${requestId}/approve`;

      const payload =
        targetReq.approvalLevel === 'CLASS_TEACHER'
          ? { teacherId: currentUser?.id, teacherName: currentUser?.name }
          : { adminId: currentUser?.id, adminName: currentUser?.name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve request.');
      }

      if (data.request) {
        setProfileChangeRequests((prev) =>
          prev.map((r) => (r.id === requestId ? data.request : r))
        );
      }

      if (data.updatedUser) {
        // Update user in directory and session if it's the current user
        setUsers((prev) =>
          prev.map((u) => (u.id === data.updatedUser.id ? { ...u, ...data.updatedUser } : u))
        );
        if (currentUser && currentUser.id === data.updatedUser.id) {
          setCurrentUser(data.updatedUser);
        }
      }
    } catch (err: any) {
      console.error('Error approving profile request:', err);
      throw err;
    }
  };

  // Approver: Class Teacher or Admin rejects request
  const handleRejectProfileRequest = async (requestId: string, reason: string) => {
    try {
      const targetReq = profileChangeRequests.find((r) => r.id === requestId);
      if (!targetReq) return;

      const endpoint =
        targetReq.approvalLevel === 'CLASS_TEACHER'
          ? `/api/class-teacher/profile-change-requests/${requestId}/reject`
          : `/api/admin/profile-change-requests/${requestId}/reject`;

      const payload =
        targetReq.approvalLevel === 'CLASS_TEACHER'
          ? { teacherId: currentUser?.id, teacherName: currentUser?.name, reason }
          : { adminId: currentUser?.id, adminName: currentUser?.name, reason };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject request.');
      }

      if (data.request) {
        setProfileChangeRequests((prev) =>
          prev.map((r) => (r.id === requestId ? data.request : r))
        );
      }
    } catch (err: any) {
      console.error('Error rejecting profile request:', err);
      throw err;
    }
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
        classes={academicClasses}
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
            fees={fees}
            examAssessments={examAssessments}
            examResults={examResults}
            smsNotifications={smsNotifications}
            profileChangeRequests={profileChangeRequests}
            onPayFee={handlePayFee}
            onSubmitReview={handleParentSubmitReview}
            onSubmitProfileRequest={handleSubmitProfileRequest}
            onCancelProfileRequest={handleCancelProfileRequest}
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
            fees={fees}
            attendanceRequests={attendanceRequests}
            examAssessments={examAssessments}
            examResults={examResults}
            profileChangeRequests={profileChangeRequests}
            onPayFee={handlePayFee}
            onSubmitAssignment={handleStudentSubmitAssignment}
            onSubmitQuiz={handleStudentSubmitQuiz}
            onSubmitRegularizationRequest={handleSubmitRegularizationRequest}
            onUploadApprovedOD={handleUploadApprovedOD}
            onSubmitProfileRequest={handleSubmitProfileRequest}
            onCancelProfileRequest={handleCancelProfileRequest}
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
            registrationRequests={registrationRequests}
            fees={fees}
            attendanceRequests={attendanceRequests}
            examAssessments={examAssessments}
            examResults={examResults}
            profileChangeRequests={profileChangeRequests}
            onSendFeeReminder={handleSendFeeReminder}
            onConfirmRegistration={handleTeacherConfirmRegistration}
            onRejectRegistration={handleTeacherRejectRegistration}
            onGradeSubmission={handleGradeSubmission}
            onReplyParentReview={handleReplyParentReview}
            onSaveMaterial={handleSaveMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onSaveQuiz={handleSaveQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onSaveAssignment={handleSaveAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onSaveAttendance={handleSaveAttendance}
            onReviewRegularizationRequest={handleReviewRegularizationRequest}
            onFacultyDecisionAdjustment={handleFacultyDecisionAdjustment}
            onUpdateHistoricalAttendance={handleUpdateHistoricalAttendance}
            onCreateExamAssessment={handleCreateExamAssessment}
            onSaveExamResults={handleSaveExamResults}
            onPublishExamAssessment={handlePublishExamAssessment}
            onApproveProfileRequest={handleApproveProfileRequest}
            onRejectProfileRequest={handleRejectProfileRequest}
            onSubmitProfileRequest={handleSubmitProfileRequest}
            onCancelProfileRequest={handleCancelProfileRequest}
          />
        )}

        {currentUser.role === 'ADMIN' && (
          <AdminDashboard
            users={users}
            courses={courses}
            submissions={submissions}
            parentReviews={parentReviews}
            academicClasses={academicClasses}
            registrationRequests={registrationRequests}
            fees={fees}
            profileChangeRequests={profileChangeRequests}
            onSendFeeReminder={handleSendFeeReminder}
            onCreateInvoice={handleCreateFeeInvoice}
            onApproveRegistration={handleAdminApproveRegistration}
            onRejectRegistration={handleAdminRejectRegistration}
            onCreateAdmin={handleAdminCreateAdmin}
            onCreateClass={handleAdminCreateClass}
            onApproveUser={handleApproveUser}
            onUpdateUser={handleAdminUpdateUser}
            onApproveProfileRequest={handleApproveProfileRequest}
            onRejectProfileRequest={handleRejectProfileRequest}
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
    </div>
  );
}

export default App;
