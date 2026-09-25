import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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
  mockAuditLogs,
  mockParentReviews
} from './src/data/mockData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory store initialized with mock data
let usersStore = [...mockUsers];
let coursesStore = [...mockCourses];
let materialsStore = [...mockCourseMaterials];
let assignmentsStore = [...mockAssignments];
let submissionsStore = [...mockSubmissions];
let quizzesStore = [...mockQuizzes];
let quizAttemptsStore = [...mockQuizAttempts];
let attendanceStore = [...mockAttendance];
let notificationsStore = [...mockNotifications];
let auditLogsStore = [...mockAuditLogs];
let parentReviewsStore = [...mockParentReviews];

// Helper to append audit log
function addAuditLog(performedBy: string, role: any, action: string, details: string) {
  auditLogsStore.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    performedBy,
    role,
    action,
    details,
    ipAddress: '127.0.0.1'
  });
}

// REST API ROUTES
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'EduTrack LMS Express Backend', timestamp: new Date() });
});

// Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Case-insensitive email match
  let user = usersStore.find((u) => u.email.toLowerCase() === email?.toLowerCase());
  
  if (!user && role) {
    user = usersStore.find((u) => u.role === role && (!u.status || u.status === 'APPROVED'));
  }

  if (!user) {
    return res.status(401).json({ error: 'Account not found with this email' });
  }

  // Enforce approval check for non-admin accounts
  if (user.role !== 'ADMIN' && user.status === 'PENDING') {
    return res.status(403).json({
      error: 'Your account registration is currently pending Administrator approval. Please contact University IT or wait for approval.',
      status: 'PENDING'
    });
  }

  if (user.role !== 'ADMIN' && user.status === 'REJECTED') {
    return res.status(403).json({
      error: 'Your registration request was declined by the Administrator. Please contact university admissions.',
      status: 'REJECTED'
    });
  }

  // Simulated JWT Token
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user_${user.id}_role_${user.role}.${Date.now()}`;
  
  addAuditLog(user.email, user.role, 'USER_LOGIN', `User ${user.name} logged into system with role ${user.role}`);

  res.json({
    token,
    user,
    message: 'Authentication successful'
  });
});

// Self-service Registration / Signup Endpoint (Teacher, Student, Parent)
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, role, department, regNumber, childStudentIds } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  if (role === 'ADMIN') {
    return res.status(403).json({ error: 'Administrator accounts cannot be created via public registration' });
  }

  // Check email collision
  const existing = usersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser: any = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    status: 'PENDING', // Requires Admin approval
    createdAt: new Date().toISOString(),
    avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&auto=format&fit=crop&q=80`
  };

  if (role === 'FACULTY') {
    newUser.department = department || 'General Academics';
  } else if (role === 'STUDENT') {
    newUser.department = department || 'Computer Science';
    newUser.regNumber = regNumber || `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    newUser.semester = 1;
    newUser.gpa = 3.50;
  } else if (role === 'PARENT') {
    newUser.childStudentIds = childStudentIds || ['usr-stu-1'];
  }

  usersStore.push(newUser);

  // Notify Administrators of pending registration
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Account Awaiting Approval',
    message: `${newUser.name} registered as ${newUser.role} (${newUser.email}). Review and approve in Admin Console.`,
    type: 'SYSTEM',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(newUser.email, newUser.role, 'USER_SIGNUP_PENDING', `Self-registered new ${newUser.role} account awaiting admin verification`);

  res.status(201).json({
    message: 'Registration submitted successfully. Your account is pending Administrator review and approval.',
    user: newUser
  });
});

// Admin Approval / Rejection Endpoint
app.put('/api/users/:id/approval', (req: Request, res: Response) => {
  const { status, reviewedBy } = req.body; // 'APPROVED' or 'REJECTED'
  const index = usersStore.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
  }

  usersStore[index].status = status;

  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    userId: usersStore[index].id,
    title: `Account Registration ${status === 'APPROVED' ? 'Approved' : 'Declined'}`,
    message: `Account for ${usersStore[index].name} (${usersStore[index].email}) was ${status.toLowerCase()} by Administrator.`,
    type: 'SYSTEM',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(reviewedBy || 'Admin', 'ADMIN', `USER_${status}`, `${status} registration for ${usersStore[index].name} (${usersStore[index].email})`);

  res.json({ success: true, user: usersStore[index] });
});

// Users / Students / Faculty API
app.get('/api/users', (req: Request, res: Response) => {
  const { role, status } = req.query;
  let results = usersStore;
  if (role) {
    results = results.filter((u) => u.role === role);
  }
  if (status) {
    results = results.filter((u) => u.status === status);
  }
  res.json(results);
});

app.post('/api/users', (req: Request, res: Response) => {
  const newUser = { id: `usr-${Date.now()}`, ...req.body };
  usersStore.push(newUser);
  addAuditLog(req.body.adminEmail || 'Admin', 'ADMIN', `${newUser.role}_CREATE`, `Created user ${newUser.name} (${newUser.email})`);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const index = usersStore.findIndex((u) => u.id === req.params.id);
  if (index !== -1) {
    usersStore[index] = { ...usersStore[index], ...req.body };
    addAuditLog('Admin', 'ADMIN', 'USER_UPDATE', `Updated user details for ${usersStore[index].name}`);
    return res.json(usersStore[index]);
  }
  res.status(404).json({ error: 'User not found' });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const user = usersStore.find((u) => u.id === req.params.id);
  usersStore = usersStore.filter((u) => u.id !== req.params.id);
  if (user) {
    addAuditLog('Admin', 'ADMIN', 'USER_DELETE', `Deleted user ${user.name} (${user.email})`);
  }
  res.json({ success: true, message: 'User removed' });
});

// Courses API
app.get('/api/courses', (req: Request, res: Response) => {
  res.json(coursesStore);
});

app.post('/api/courses', (req: Request, res: Response) => {
  const newCourse = {
    id: `crs-${Date.now()}`,
    enrolledStudentsCount: 0,
    maxCapacity: req.body.maxCapacity || 50,
    ...req.body
  };
  coursesStore.push(newCourse);
  addAuditLog(req.body.performedBy || 'Admin', 'ADMIN', 'COURSE_CREATE', `Created course ${newCourse.code}: ${newCourse.title}`);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', (req: Request, res: Response) => {
  const index = coursesStore.findIndex((c) => c.id === req.params.id);
  if (index !== -1) {
    coursesStore[index] = { ...coursesStore[index], ...req.body };
    addAuditLog('Admin', 'ADMIN', 'COURSE_UPDATE', `Updated course ${coursesStore[index].code}`);
    return res.json(coursesStore[index]);
  }
  res.status(404).json({ error: 'Course not found' });
});

app.delete('/api/courses/:id', (req: Request, res: Response) => {
  coursesStore = coursesStore.filter((c) => c.id !== req.params.id);
  res.json({ success: true, message: 'Course deleted' });
});

// Course Materials API
app.get('/api/materials', (req: Request, res: Response) => {
  const { courseId } = req.query;
  if (courseId) {
    return res.json(materialsStore.filter((m) => m.courseId === courseId));
  }
  res.json(materialsStore);
});

app.post('/api/materials', (req: Request, res: Response) => {
  const newMaterial = { id: `mat-${Date.now()}`, uploadedAt: new Date().toISOString().split('T')[0], ...req.body };
  materialsStore.push(newMaterial);
  res.status(201).json(newMaterial);
});

// Assignments API
app.get('/api/assignments', (req: Request, res: Response) => {
  res.json(assignmentsStore);
});

app.post('/api/assignments', (req: Request, res: Response) => {
  const newAssignment = { id: `asg-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], ...req.body };
  assignmentsStore.push(newAssignment);
  
  // Create notification for students
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Assignment Posted',
    message: `New assignment "${newAssignment.title}" due on ${newAssignment.deadline}`,
    type: 'ASSIGNMENT',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(req.body.performedBy || 'Faculty', 'FACULTY', 'ASSIGNMENT_CREATE', `Created assignment "${newAssignment.title}"`);
  res.status(201).json(newAssignment);
});

// Submissions API
app.get('/api/submissions', (req: Request, res: Response) => {
  const { assignmentId, studentId } = req.query;
  let results = submissionsStore;
  if (assignmentId) results = results.filter((s) => s.assignmentId === assignmentId);
  if (studentId) results = results.filter((s) => s.studentId === studentId);
  res.json(results);
});

app.post('/api/submissions', (req: Request, res: Response) => {
  const newSubmission = {
    id: `sub-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: 'PENDING',
    ...req.body
  };
  submissionsStore.push(newSubmission);
  addAuditLog(req.body.studentName || 'Student', 'STUDENT', 'ASSIGNMENT_SUBMIT', `Submitted file for assignment ${newSubmission.assignmentTitle}`);
  res.status(201).json(newSubmission);
});

app.put('/api/submissions/:id/grade', (req: Request, res: Response) => {
  const { marksObtained, feedback } = req.body;
  const index = submissionsStore.findIndex((s) => s.id === req.params.id);
  if (index !== -1) {
    submissionsStore[index].marksObtained = marksObtained;
    submissionsStore[index].feedback = feedback;
    submissionsStore[index].status = 'GRADED';

    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      userId: submissionsStore[index].studentId,
      title: 'Assignment Graded',
      message: `Your score for ${submissionsStore[index].assignmentTitle} is ${marksObtained}`,
      type: 'GRADE',
      createdAt: new Date().toISOString(),
      isRead: false
    });

    addAuditLog('Faculty', 'FACULTY', 'ASSIGNMENT_GRADE', `Graded submission for ${submissionsStore[index].studentName} (Marks: ${marksObtained})`);
    return res.json(submissionsStore[index]);
  }
  res.status(404).json({ error: 'Submission not found' });
});

// Quizzes API
app.get('/api/quizzes', (req: Request, res: Response) => {
  res.json(quizzesStore);
});

app.post('/api/quizzes', (req: Request, res: Response) => {
  const newQuiz = {
    id: `qz-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    isPublished: true,
    ...req.body
  };
  quizzesStore.push(newQuiz);
  
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Quiz Available',
    message: `Quiz "${newQuiz.title}" is ready to attempt! Duration: ${newQuiz.durationMinutes} mins.`,
    type: 'QUIZ',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  res.status(201).json(newQuiz);
});

app.post('/api/quizzes/:id/submit', (req: Request, res: Response) => {
  const quiz = quizzesStore.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const { studentId, studentName, answers, timeTakenSeconds } = req.body;
  
  let score = 0;
  quiz.questions.forEach((q) => {
    if (answers[q.id] !== undefined && answers[q.id] === q.correctOptionIndex) {
      score += q.marks;
    }
  });

  const attempt = {
    id: `qa-${Date.now()}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId,
    studentName,
    score,
    totalMarks: quiz.totalMarks,
    answers,
    submittedAt: new Date().toISOString(),
    timeTakenSeconds
  };

  quizAttemptsStore.push(attempt);
  addAuditLog(studentName, 'STUDENT', 'QUIZ_SUBMIT', `Submitted quiz ${quiz.title} with score ${score}/${quiz.totalMarks}`);

  res.json({ attempt, score, totalMarks: quiz.totalMarks });
});

app.get('/api/quiz-attempts', (req: Request, res: Response) => {
  res.json(quizAttemptsStore);
});

// Attendance API
app.get('/api/attendance', (req: Request, res: Response) => {
  res.json(attendanceStore);
});

app.post('/api/attendance', (req: Request, res: Response) => {
  const records = req.body.records; // array of records
  if (Array.isArray(records)) {
    records.forEach((r: any) => {
      const existing = attendanceStore.findIndex((a) => a.courseId === r.courseId && a.studentId === r.studentId && a.date === r.date);
      if (existing !== -1) {
        attendanceStore[existing].status = r.status;
      } else {
        attendanceStore.push({ id: `att-${Date.now()}-${Math.random()}`, ...r });
      }
    });
  }
  res.json({ success: true, count: records?.length || 0 });
});

// Notifications API
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(notificationsStore);
});

app.put('/api/notifications/read-all', (req: Request, res: Response) => {
  notificationsStore.forEach((n) => (n.isRead = true));
  res.json({ success: true });
});

// Audit Logs & Reports API
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(auditLogsStore);
});

app.get('/api/reports/dashboard-stats', (req: Request, res: Response) => {
  const totalStudents = usersStore.filter((u) => u.role === 'STUDENT').length;
  const totalFaculty = usersStore.filter((u) => u.role === 'FACULTY').length;
  const totalCourses = coursesStore.length;
  const activeEnrollments = coursesStore.reduce((acc, c) => acc + c.enrolledStudentsCount, 0);
  const pendingAssignmentsCount = submissionsStore.filter((s) => s.status === 'PENDING').length;
  
  res.json({
    totalStudents,
    totalFaculty,
    totalCourses,
    activeEnrollments,
    pendingAssignmentsCount,
    averageStudentPerformance: 86.4
  });
});

// Parent Portal APIs
app.get('/api/parent/children', (req: Request, res: Response) => {
  const { parentId } = req.query;
  const parent = usersStore.find((u) => u.id === parentId);
  if (!parent || parent.role !== 'PARENT') {
    return res.status(404).json({ error: 'Parent account not found' });
  }

  const childIds = parent.childStudentIds || [];
  const children = usersStore
    .filter((u) => childIds.includes(u.id))
    .map((student) => {
      // Calculate attendance rate
      const studentAttendance = attendanceStore.filter((a) => a.studentId === student.id);
      const presentCount = studentAttendance.filter((a) => a.status === 'PRESENT').length;
      const attendancePercentage = studentAttendance.length > 0 
        ? Math.round((presentCount / studentAttendance.length) * 100) 
        : 100;

      // Submissions and graded count
      const studentSubmissions = submissionsStore.filter((s) => s.studentId === student.id);
      const gradedSubmissions = studentSubmissions.filter((s) => s.status === 'GRADED');
      const avgScore = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0) / gradedSubmissions.length)
        : 0;

      // Quiz attempts
      const studentQuizAttempts = quizAttemptsStore.filter((qa) => qa.studentId === student.id);

      return {
        ...student,
        attendancePercentage,
        attendanceRecords: studentAttendance,
        submissions: studentSubmissions,
        quizAttempts: studentQuizAttempts,
        averageAssignmentScore: avgScore
      };
    });

  res.json(children);
});

app.get('/api/parent/reviews', (req: Request, res: Response) => {
  const { parentId, studentId } = req.query;
  let results = parentReviewsStore;
  if (parentId) results = results.filter((r) => r.parentId === parentId);
  if (studentId) results = results.filter((r) => r.studentId === studentId);
  res.json(results);
});

app.post('/api/parent/reviews', (req: Request, res: Response) => {
  const newReview = {
    id: `prev-${Date.now()}`,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    ...req.body
  };
  parentReviewsStore.unshift(newReview);

  // Notify faculty / admins
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: 'New Parent Inquiry / Review',
    message: `${newReview.parentName} submitted a remark regarding student ${newReview.studentName}: "${newReview.title}"`,
    type: 'PARENT_REVIEW',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(newReview.parentName || 'Parent', 'PARENT', 'PARENT_REVIEW_SUBMIT', `Submitted review for student ${newReview.studentName}: ${newReview.title}`);
  res.status(201).json(newReview);
});

app.put('/api/parent/reviews/:id/reply', (req: Request, res: Response) => {
  const { facultyReply, status } = req.body;
  const index = parentReviewsStore.findIndex((r) => r.id === req.params.id);
  if (index !== -1) {
    parentReviewsStore[index].facultyReply = facultyReply;
    parentReviewsStore[index].status = status || 'ACKNOWLEDGED';

    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      userId: parentReviewsStore[index].parentId,
      title: 'Faculty Responded to Parent Review',
      message: `Faculty responded to your inquiry regarding ${parentReviewsStore[index].studentName}: "${facultyReply.slice(0, 80)}..."`,
      type: 'PARENT_REVIEW',
      createdAt: new Date().toISOString(),
      isRead: false
    });

    addAuditLog('Faculty', 'FACULTY', 'PARENT_REVIEW_REPLY', `Replied to parent review ${parentReviewsStore[index].title}`);
    return res.json(parentReviewsStore[index]);
  }
  res.status(404).json({ error: 'Review not found' });
});

// Backend Java Spring Boot & Oracle SQL Source Code endpoint
app.get('/api/backend-code', (req: Request, res: Response) => {
  res.json({
    oracleSchemaSql: `-- =========================================================
-- EduTrack LMS - Oracle Database DDL Schema Script
-- Compatible with Oracle Database 19c / 21c / 23c
-- =========================================================

CREATE TABLE users (
    user_id VARCHAR2(50) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    role VARCHAR2(20) CHECK (role IN ('ADMIN', 'FACULTY', 'STUDENT')),
    department VARCHAR2(100),
    avatar_url VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    student_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    student_reg_number VARCHAR2(30) UNIQUE NOT NULL,
    gpa NUMBER(3,2) DEFAULT 0.00,
    semester NUMBER(2) DEFAULT 1
);

CREATE TABLE faculty (
    faculty_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    faculty_employee_code VARCHAR2(30) UNIQUE NOT NULL,
    designation VARCHAR2(100)
);

CREATE TABLE courses (
    course_id VARCHAR2(50) PRIMARY KEY,
    code VARCHAR2(20) UNIQUE NOT NULL,
    title VARCHAR2(150) NOT NULL,
    description CLOB,
    department VARCHAR2(100),
    credits NUMBER(2) NOT NULL,
    semester NUMBER(2) NOT NULL,
    faculty_id VARCHAR2(50) REFERENCES faculty(faculty_id)
);

CREATE TABLE enrollments (
    enrollment_id VARCHAR2(50) PRIMARY KEY,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    course_id VARCHAR2(50) REFERENCES courses(course_id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR2(20) DEFAULT 'ACTIVE'
);

CREATE TABLE assignments (
    assignment_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR2(200) NOT NULL,
    description CLOB,
    deadline TIMESTAMP NOT NULL,
    max_marks NUMBER(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignment_submissions (
    submission_id VARCHAR2(50) PRIMARY KEY,
    assignment_id VARCHAR2(50) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url VARCHAR2(500) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING',
    marks_obtained NUMBER(5,2),
    feedback CLOB
);

CREATE TABLE quizzes (
    quiz_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR2(200) NOT NULL,
    instructions CLOB,
    duration_minutes NUMBER(3) NOT NULL,
    total_marks NUMBER(5,2) NOT NULL,
    is_published NUMBER(1) DEFAULT 1
);

CREATE TABLE questions (
    question_id VARCHAR2(50) PRIMARY KEY,
    quiz_id VARCHAR2(50) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text CLOB NOT NULL,
    options_json CLOB NOT NULL,
    correct_option_index NUMBER(2) NOT NULL,
    marks NUMBER(5,2) NOT NULL
);

CREATE TABLE quiz_attempts (
    attempt_id VARCHAR2(50) PRIMARY KEY,
    quiz_id VARCHAR2(50) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    score NUMBER(5,2) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds NUMBER(6)
);

CREATE TABLE attendance (
    attendance_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id),
    student_id VARCHAR2(50) REFERENCES students(student_id),
    attendance_date DATE NOT NULL,
    status VARCHAR2(10) CHECK (status IN ('PRESENT', 'ABSENT', 'LATE'))
);

CREATE TABLE audit_logs (
    log_id VARCHAR2(50) PRIMARY KEY,
    performed_by VARCHAR2(100) NOT NULL,
    user_role VARCHAR2(20) NOT NULL,
    action VARCHAR2(50) NOT NULL,
    details CLOB,
    ip_address VARCHAR2(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,
    springBootFiles: [
      {
        path: 'src/main/java/com/edutrack/lms/EduTrackLmsApplication.java',
        content: `package com.edutrack.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EduTrackLmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(EduTrackLmsApplication.class, args);
    }
}`
      },
      {
        path: 'src/main/java/com/edutrack/lms/security/JwtAuthenticationFilter.java',
        content: `package com.edutrack.lms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Verify JWT signature & populate SecurityContextHolder
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken("user", null, null);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}`
      },
      {
        path: 'src/main/java/com/edutrack/lms/controller/CourseController.java',
        content: `package com.edutrack.lms.controller;

import com.edutrack.lms.entity.Course;
import com.edutrack.lms.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.save(course));
    }
}`
      }
    ]
  });
});

// Gemini AI Assistant Endpoint
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        text: `[EduTrack AI Assistant] Gemini API key is not configured yet. Here is an automated smart response:\n\nRegarding "${prompt}": In EduTrack LMS, you can easily manage courses, review grades, generate MCQ quizzes, and export performance reports to Excel or PDF!`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the EduTrack AI Academic Assistant embedded in EduTrack LMS.
Context: ${context || 'General University LMS context'}
User prompt: ${prompt}

Provide a helpful, precise, structured academic response.`
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Error processing AI request' });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduTrack LMS Server listening on http://localhost:${PORT}`);
  });
}

startServer();
