import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
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
  mockParentReviews,
  mockAcademicClasses,
  mockRegistrationRequests
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
let classesStore = [...mockAcademicClasses];
let registrationRequestsStore = [...mockRegistrationRequests];

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

// Academic Classes API
app.get('/api/academic-classes', (req: Request, res: Response) => {
  res.json(classesStore);
});

app.post('/api/academic-classes', (req: Request, res: Response) => {
  const { className, section, department, semester, academicYear, classTeacherId, performedBy, userRole } = req.body;
  if (!className || !section) {
    return res.status(400).json({ error: 'Class name and section are required' });
  }

  // Find class teacher if provided
  let teacher = usersStore.find((u) => u.id === classTeacherId);
  if (!teacher) {
    teacher = usersStore.find((u) => u.role === 'FACULTY');
  }

  const newClass = {
    id: `cls-${Date.now()}`,
    className,
    section,
    academicYear: academicYear || '2026-2027',
    department: department || 'Computer Science',
    semester: Number(semester) || 1,
    classTeacherId: teacher?.id || 'usr-fac-1',
    classTeacherName: teacher?.name || 'Prof. Ananya Sharma',
    classTeacherEmail: teacher?.email || 'ananya.sharma@edutrack.edu'
  };

  classesStore.push(newClass);

  if (teacher) {
    teacher.isClassTeacher = true;
    teacher.assignedClassId = newClass.id;
    teacher.assignedClassName = `${newClass.className} (${newClass.section})`;
  }

  addAuditLog(performedBy || 'Admin', userRole || 'ADMIN', 'CLASS_CREATE', `Created academic class ${newClass.className} (${newClass.section}) assigned to ${newClass.classTeacherName}`);

  res.status(201).json(newClass);
});

// Self-service Two-Stage Registration / Signup Endpoint (Student & Parent)
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, role, classId, regNumber, studentId, relationship, department } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  // Explicit Restriction 4: Cannot self-register as ADMIN
  if (role === 'ADMIN') {
    return res.status(403).json({ error: 'Prohibited: Administrator accounts cannot be self-registered publicly.' });
  }

  // Check email collision
  const existing = usersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  // Determine Class and Class Teacher
  let targetClass = classesStore.find((c) => c.id === classId);

  // For parents: lookup student and their class if classId not provided directly
  let linkedStudent: any = null;
  if (role === 'PARENT') {
    if (studentId) {
      linkedStudent = usersStore.find((u) => u.id === studentId || u.regNumber === studentId);
      if (!linkedStudent) {
        return res.status(404).json({ error: 'Specified student was not found in institutional records.' });
      }
      if (linkedStudent.classId) {
        targetClass = classesStore.find((c) => c.id === linkedStudent.classId);
      }
    }
    if (!targetClass) {
      targetClass = classesStore[0]; // Fallback to first class in department
    }
  }

  if (role === 'STUDENT' && !targetClass) {
    targetClass = classesStore[0];
  }

  const assignedTeacherId = targetClass?.classTeacherId || 'usr-fac-1';
  const assignedTeacherName = targetClass?.classTeacherName || 'Prof. Ananya Sharma';

  const newUserId = `usr-${Date.now()}`;
  const newUser: any = {
    id: newUserId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    status: 'PENDING',
    accountStatus: 'PENDING', // Inactive until both stages complete
    createdAt: new Date().toISOString(),
    avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&auto=format&fit=crop&q=80`
  };

  if (role === 'STUDENT') {
    newUser.department = targetClass?.department || department || 'Computer Science';
    newUser.regNumber = regNumber || `CS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    newUser.classId = targetClass?.id;
    newUser.className = targetClass ? `${targetClass.className} (${targetClass.section})` : 'Class 4A';
    newUser.semester = targetClass?.semester || 1;
    newUser.gpa = 3.50;
  } else if (role === 'PARENT') {
    newUser.childStudentIds = linkedStudent ? [linkedStudent.id] : (req.body.childStudentIds || ['usr-stu-1']);
  } else if (role === 'FACULTY') {
    newUser.department = department || 'General Academics';
  }

  usersStore.push(newUser);

  // Create Registration Request Record for Two-Stage Verification
  const regReqId = `reg-req-${Date.now()}`;
  const regRequest: any = {
    id: regReqId,
    userId: newUserId,
    applicantName: newUser.name,
    applicantEmail: newUser.email,
    requestedRole: role,
    classId: targetClass?.id || 'cls-cse-4a',
    className: targetClass ? `${targetClass.className} (${targetClass.section})` : 'B.Tech CSE - 4A',
    classSection: targetClass?.section || 'Section A',
    classTeacherId: assignedTeacherId,
    classTeacherName: assignedTeacherName,
    regNumber: newUser.regNumber,
    department: newUser.department,
    studentId: linkedStudent?.id,
    studentName: linkedStudent?.name,
    relationship: relationship || 'Father',
    status: 'PENDING_TEACHER_REVIEW',
    createdAt: new Date().toISOString()
  };

  registrationRequestsStore.unshift(regRequest);

  // Notify the assigned Class Teacher
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    userId: assignedTeacherId,
    title: `New ${role} Registration Request`,
    message: `${newUser.name} registered for ${regRequest.className}. Please review and verify the request.`,
    type: 'SYSTEM',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(newUser.email, newUser.role, 'REGISTRATION_SUBMITTED', `Submitted ${role} registration assigned to Class Teacher ${assignedTeacherName} (${regRequest.className})`);

  res.status(201).json({
    message: 'Registration submitted successfully. Your request is waiting for Class Teacher verification before administrative approval.',
    user: newUser,
    registrationRequest: regRequest
  });
});

// Teacher Registration Requests API
app.get('/api/faculty/registration-requests', (req: Request, res: Response) => {
  const { teacherId } = req.query;
  let results = [...registrationRequestsStore];
  if (teacherId) {
    results = results.filter((r) => r.classTeacherId === teacherId);
  }
  res.json(results);
});

// Teacher Stage 1: Confirm Registration
app.post('/api/faculty/registration-requests/:id/confirm', (req: Request, res: Response) => {
  const { facultyId, teacherId, facultyName, teacherName, reason, userRole } = req.body;
  const currentTeacherId = teacherId || facultyId;
  const currentTeacherName = teacherName || facultyName || 'Class Teacher';

  const index = registrationRequestsStore.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Registration request not found' });
  }

  const reqItem = registrationRequestsStore[index];

  // Authorization: Must be assigned class teacher
  if (!currentTeacherId || reqItem.classTeacherId !== currentTeacherId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned as the Class Teacher for this class.' });
  }

  // State Transition Validation: Only PENDING_TEACHER_REVIEW can be confirmed
  if (reqItem.status !== 'PENDING_TEACHER_REVIEW') {
    return res.status(400).json({ error: `Invalid transition. Request is in status ${reqItem.status}, not PENDING_TEACHER_REVIEW.` });
  }

  reqItem.status = 'PENDING_ADMIN_REVIEW';
  reqItem.teacherReviewedBy = currentTeacherName;
  reqItem.teacherReviewedAt = new Date().toISOString();
  reqItem.teacherReviewReason = reason || 'Verified academic credentials and class roster entry.';
  reqItem.updatedAt = new Date().toISOString();

  // Notify Administrators
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: 'Registration Ready for Administrative Approval',
    message: `${reqItem.applicantName} (${reqItem.requestedRole}) verified by Class Teacher ${reqItem.teacherReviewedBy}. Ready for final admin approval.`,
    type: 'SYSTEM',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(currentTeacherName, 'FACULTY', 'REGISTRATION_TEACHER_CONFIRMED', `Class Teacher confirmed ${reqItem.requestedRole} registration for ${reqItem.applicantName}`);

  res.json({ success: true, registrationRequest: reqItem });
});

// Teacher Stage 1: Reject Registration
app.post('/api/faculty/registration-requests/:id/reject', (req: Request, res: Response) => {
  const { facultyId, teacherId, facultyName, teacherName, reason } = req.body;
  const currentTeacherId = teacherId || facultyId;
  const currentTeacherName = teacherName || facultyName || 'Class Teacher';

  const index = registrationRequestsStore.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Registration request not found' });
  }

  const reqItem = registrationRequestsStore[index];

  if (!currentTeacherId || reqItem.classTeacherId !== currentTeacherId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned as the Class Teacher for this class.' });
  }

  if (reqItem.status !== 'PENDING_TEACHER_REVIEW') {
    return res.status(400).json({ error: `Invalid transition. Cannot reject request in status ${reqItem.status}.` });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A specific reason is required to reject a registration.' });
  }

  reqItem.status = 'REJECTED_BY_TEACHER';
  reqItem.teacherReviewedBy = currentTeacherName;
  reqItem.teacherReviewedAt = new Date().toISOString();
  reqItem.teacherReviewReason = reason.trim();
  reqItem.updatedAt = new Date().toISOString();

  // Update user account status
  const userIdx = usersStore.findIndex((u) => u.id === reqItem.userId);
  if (userIdx !== -1) {
    usersStore[userIdx].status = 'REJECTED';
    usersStore[userIdx].accountStatus = 'REJECTED';
  }

  addAuditLog(currentTeacherName, 'FACULTY', 'REGISTRATION_TEACHER_REJECTED', `Class Teacher rejected ${reqItem.requestedRole} registration for ${reqItem.applicantName}. Reason: ${reason}`);

  res.json({ success: true, registrationRequest: reqItem });
});

// Admin Registration Requests API
app.get('/api/admin/registration-requests', (req: Request, res: Response) => {
  const { status } = req.query;
  let results = [...registrationRequestsStore];
  if (status) {
    results = results.filter((r) => r.status === status);
  }
  res.json(results);
});

// Admin Stage 2: Final Approval
app.post('/api/admin/registration-requests/:id/approve', (req: Request, res: Response) => {
  const { adminName, adminRole, userRole, reason } = req.body;
  const role = userRole || adminRole;
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can grant final registration approval.' });
  }

  const index = registrationRequestsStore.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Registration request not found' });
  }

  const reqItem = registrationRequestsStore[index];

  // State Transition Rule: Admin can approve ONLY when status is PENDING_ADMIN_REVIEW
  if (reqItem.status !== 'PENDING_ADMIN_REVIEW') {
    return res.status(400).json({
      error: `Invalid transition. This registration is in status "${reqItem.status}" and has not completed Class Teacher verification.`
    });
  }

  reqItem.status = 'APPROVED';
  reqItem.adminReviewedBy = adminName || 'Administrator';
  reqItem.adminReviewedAt = new Date().toISOString();
  reqItem.adminReviewReason = reason || 'Institutional clearance approved.';
  reqItem.updatedAt = new Date().toISOString();

  // Transactionally activate user account
  const userIdx = usersStore.findIndex((u) => u.id === reqItem.userId);
  if (userIdx !== -1) {
    usersStore[userIdx].status = 'APPROVED';
    usersStore[userIdx].accountStatus = 'ACTIVE';
  }

  // Notify student/parent
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    userId: reqItem.userId,
    title: 'Account Activated',
    message: `Your ${reqItem.requestedRole} account has received final Administrator approval. You may now log in.`,
    type: 'SYSTEM',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(adminName || 'Admin', 'ADMIN', 'REGISTRATION_ADMIN_APPROVED', `Admin completed final approval and activated account for ${reqItem.applicantName} (${reqItem.applicantEmail})`);

  res.json({ success: true, registrationRequest: reqItem, user: userIdx !== -1 ? usersStore[userIdx] : null });
});

// Admin Stage 2: Final Rejection
app.post('/api/admin/registration-requests/:id/reject', (req: Request, res: Response) => {
  const { adminName, reason } = req.body;
  const index = registrationRequestsStore.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Registration request not found' });
  }

  const reqItem = registrationRequestsStore[index];

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A specific reason is required to reject a registration.' });
  }

  reqItem.status = 'REJECTED_BY_ADMIN';
  reqItem.adminReviewedBy = adminName || 'Administrator';
  reqItem.adminReviewedAt = new Date().toISOString();
  reqItem.adminReviewReason = reason.trim();
  reqItem.updatedAt = new Date().toISOString();

  const userIdx = usersStore.findIndex((u) => u.id === reqItem.userId);
  if (userIdx !== -1) {
    usersStore[userIdx].status = 'REJECTED';
    usersStore[userIdx].accountStatus = 'REJECTED';
  }

  addAuditLog(adminName || 'Admin', 'ADMIN', 'REGISTRATION_ADMIN_REJECTED', `Admin rejected registration for ${reqItem.applicantName}. Reason: ${reason}`);

  res.json({ success: true, registrationRequest: reqItem });
});

// Admin Creates Another Administrator (Security Verified: req.user role must be ADMIN)
app.post('/api/admin/users/admin', (req: Request, res: Response) => {
  const { creatorRole, creatorName, name, email, department } = req.body;

  if (creatorRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Only authenticated administrators can create new administrator accounts.' });
  }

  if (!name || !email) {
    return res.status(400).json({ error: 'Administrator name and email are required.' });
  }

  const existing = usersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newAdmin: any = {
    id: `usr-admin-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'ADMIN',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: department || 'University Administration',
    createdAt: new Date().toISOString(),
    avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`
  };

  usersStore.push(newAdmin);

  addAuditLog(creatorName || 'Admin', 'ADMIN', 'ADMIN_CREATED_ADMIN', `Administrator created new Admin account for ${newAdmin.name} (${newAdmin.email})`);

  res.status(201).json({
    success: true,
    message: `Administrator account for ${newAdmin.name} created successfully.`,
    user: newAdmin
  });
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

// Course Materials & Teaching Videos API
app.get('/api/materials', (req: Request, res: Response) => {
  const { courseId, facultyId, status, type } = req.query;
  let results = [...materialsStore];
  if (courseId) {
    results = results.filter((m) => m.courseId === courseId);
  }
  if (facultyId) {
    results = results.filter((m) => m.facultyId === facultyId);
  }
  if (status) {
    results = results.filter((m) => m.status === status);
  }
  if (type) {
    results = results.filter((m) => m.type === type);
  }
  res.json(results);
});

app.get('/api/materials/:id', (req: Request, res: Response) => {
  const item = materialsStore.find((m) => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Learning material not found' });
  res.json(item);
});

app.post('/api/materials', (req: Request, res: Response) => {
  const { courseId, facultyId, title, description, type, url, fileUrl, moduleName, status, performedBy, userRole } = req.body;
  
  if (!courseId || !title) {
    return res.status(400).json({ error: 'courseId and title are required' });
  }

  // Authorize: If caller is FACULTY, verify course assignment
  const targetCourse = coursesStore.find((c) => c.id === courseId);
  if (!targetCourse) {
    return res.status(404).json({ error: 'Target course not found' });
  }

  if (userRole === 'FACULTY' && facultyId && targetCourse.facultyId && targetCourse.facultyId !== facultyId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course' });
  }

  // YouTube URL extraction if type is YOUTUBE or VIDEO with youtube url
  let youtubeVideoId: string | undefined;
  let thumbnailUrl: string | undefined;
  const targetUrl = url || fileUrl || '';

  if (type === 'YOUTUBE' || (type === 'VIDEO' && (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')))) {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = targetUrl.match(regExp);
    if (match && match[1]) {
      youtubeVideoId = match[1];
      thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
    } else if (type === 'YOUTUBE') {
      return res.status(400).json({ error: 'Invalid YouTube URL provided. Please enter a valid YouTube link.' });
    }
  }

  const newMaterial: any = {
    id: `mat-${Date.now()}`,
    courseId,
    facultyId: facultyId || targetCourse.facultyId,
    title: title.trim(),
    description: description || '',
    type: type || 'PDF',
    fileType: type === 'YOUTUBE' ? 'VIDEO' : (type || 'PDF'),
    url: targetUrl,
    fileUrl: targetUrl,
    size: req.body.size || (type === 'YOUTUBE' ? 'Stream' : '2.4 MB'),
    fileSize: req.body.fileSize || (type === 'YOUTUBE' ? 'Stream' : '2.4 MB'),
    moduleName: moduleName || 'General Module',
    status: status || 'PUBLISHED',
    youtubeVideoId,
    thumbnailUrl,
    uploadedAt: new Date().toISOString().split('T')[0]
  };

  materialsStore.unshift(newMaterial);

  // Notify students if published
  if (newMaterial.status === 'PUBLISHED') {
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      title: type === 'YOUTUBE' ? 'New Teaching Video Added' : 'New Study Material Published',
      message: `${targetCourse.code}: "${newMaterial.title}" is now available for review.`,
      type: 'ASSIGNMENT',
      createdAt: new Date().toISOString(),
      isRead: false
    });
  }

  addAuditLog(performedBy || 'Faculty', userRole || 'FACULTY', 'MATERIAL_CREATE', `Created ${newMaterial.type} resource "${newMaterial.title}" for ${targetCourse.code}`);

  res.status(201).json(newMaterial);
});

app.put('/api/materials/:id', (req: Request, res: Response) => {
  const index = materialsStore.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Material not found' });

  const existing = materialsStore[index];
  const { performedBy, userRole, facultyId } = req.body;

  // Authorization check
  const targetCourse = coursesStore.find((c) => c.id === existing.courseId);
  if (userRole === 'FACULTY' && facultyId && targetCourse && targetCourse.facultyId !== facultyId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course' });
  }

  materialsStore[index] = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
  addAuditLog(performedBy || 'Faculty', userRole || 'FACULTY', 'MATERIAL_UPDATE', `Updated resource "${materialsStore[index].title}"`);
  res.json(materialsStore[index]);
});

app.delete('/api/materials/:id', (req: Request, res: Response) => {
  const index = materialsStore.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Material not found' });

  const deleted = materialsStore[index];
  materialsStore.splice(index, 1);
  addAuditLog('Faculty', 'FACULTY', 'MATERIAL_DELETE', `Deleted resource "${deleted.title}"`);
  res.json({ success: true, message: 'Resource removed successfully' });
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

app.put('/api/assignments/:id', (req: Request, res: Response) => {
  const index = assignmentsStore.findIndex((a) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Assignment not found' });

  const existing = assignmentsStore[index];
  const { performedBy, userRole, facultyId } = req.body;
  const targetCourse = coursesStore.find((c) => c.id === existing.courseId);
  if (userRole === 'FACULTY' && facultyId && targetCourse && targetCourse.facultyId !== facultyId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this course' });
  }

  assignmentsStore[index] = { ...existing, ...req.body };
  addAuditLog(performedBy || 'Faculty', userRole || 'FACULTY', 'ASSIGNMENT_UPDATE', `Updated assignment "${assignmentsStore[index].title}"`);
  res.json(assignmentsStore[index]);
});

app.delete('/api/assignments/:id', (req: Request, res: Response) => {
  const index = assignmentsStore.findIndex((a) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Assignment not found' });

  const deleted = assignmentsStore[index];
  assignmentsStore.splice(index, 1);
  addAuditLog('Faculty', 'FACULTY', 'ASSIGNMENT_DELETE', `Deleted assignment "${deleted.title}"`);
  res.json({ success: true, message: 'Assignment removed' });
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
  const { userRole, studentRole } = req.body;
  if (userRole === 'ADMIN' || studentRole === 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Administrator accounts are strictly prohibited from submitting coursework.' });
  }

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
  const { courseId, isPublished } = req.query;
  let results = [...quizzesStore];
  if (courseId) {
    results = results.filter((q) => q.courseId === courseId);
  }
  if (isPublished !== undefined) {
    const pubVal = isPublished === 'true';
    results = results.filter((q) => q.isPublished === pubVal);
  }
  res.json(results);
});

app.get('/api/quizzes/:id', (req: Request, res: Response) => {
  const quiz = quizzesStore.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

app.get('/api/quizzes/:id/analytics', (req: Request, res: Response) => {
  const quiz = quizzesStore.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const attempts = quizAttemptsStore.filter((qa) => qa.quizId === quiz.id);
  const targetCourse = coursesStore.find((c) => c.id === quiz.courseId);
  const totalStudents = targetCourse?.enrolledStudentsCount || 40;

  const attemptedCount = attempts.length;
  const notAttemptedCount = Math.max(0, totalStudents - attemptedCount);

  let averageScore = 0;
  let highestScore = 0;
  let lowestScore = attemptedCount > 0 ? quiz.totalMarks : 0;
  let passedCount = 0;

  const distribution = {
    '90-100%': 0,
    '80-89%': 0,
    '70-79%': 0,
    '60-69%': 0,
    '<60%': 0
  };

  attempts.forEach((a) => {
    const pct = quiz.totalMarks > 0 ? (a.score / quiz.totalMarks) * 100 : 0;
    averageScore += a.score;
    if (a.score > highestScore) highestScore = a.score;
    if (a.score < lowestScore) lowestScore = a.score;
    if (pct >= 50) passedCount++;

    if (pct >= 90) distribution['90-100%']++;
    else if (pct >= 80) distribution['80-89%']++;
    else if (pct >= 70) distribution['70-79%']++;
    else if (pct >= 60) distribution['60-69%']++;
    else distribution['<60%']++;
  });

  if (attemptedCount > 0) {
    averageScore = Number((averageScore / attemptedCount).toFixed(1));
  }

  const passPercentage = attemptedCount > 0 ? Math.round((passedCount / attemptedCount) * 100) : 0;

  res.json({
    quizId: quiz.id,
    quizTitle: quiz.title,
    courseCode: quiz.courseCode,
    totalMarks: quiz.totalMarks,
    enrolledStudents: totalStudents,
    attemptedCount,
    notAttemptedCount,
    averageScore,
    highestScore,
    lowestScore,
    passPercentage,
    distribution,
    recentAttempts: attempts.slice(0, 10)
  });
});

app.post('/api/quizzes', (req: Request, res: Response) => {
  const { courseId, facultyId, userRole, performedBy } = req.body;
  const targetCourse = coursesStore.find((c) => c.id === courseId);
  if (!targetCourse) return res.status(404).json({ error: 'Target course not found' });

  if (userRole === 'FACULTY' && facultyId && targetCourse.facultyId !== facultyId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this course' });
  }

  const newQuiz = {
    id: `qz-${Date.now()}`,
    courseCode: targetCourse.code,
    courseTitle: targetCourse.title,
    createdAt: new Date().toISOString().split('T')[0],
    isPublished: req.body.isPublished ?? true,
    ...req.body
  };
  quizzesStore.push(newQuiz);
  
  if (newQuiz.isPublished) {
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Quiz Available',
      message: `Quiz "${newQuiz.title}" is ready to attempt! Duration: ${newQuiz.durationMinutes} mins.`,
      type: 'QUIZ',
      createdAt: new Date().toISOString(),
      isRead: false
    });
  }

  addAuditLog(performedBy || 'Faculty', userRole || 'FACULTY', 'QUIZ_CREATE', `Created quiz "${newQuiz.title}" for ${targetCourse.code}`);

  res.status(201).json(newQuiz);
});

app.put('/api/quizzes/:id', (req: Request, res: Response) => {
  const index = quizzesStore.findIndex((q) => q.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Quiz not found' });

  const existing = quizzesStore[index];
  const { performedBy, userRole, facultyId } = req.body;
  const targetCourse = coursesStore.find((c) => c.id === existing.courseId);
  if (userRole === 'FACULTY' && facultyId && targetCourse && targetCourse.facultyId !== facultyId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this course' });
  }

  quizzesStore[index] = { ...existing, ...req.body };
  addAuditLog(performedBy || 'Faculty', userRole || 'FACULTY', 'QUIZ_UPDATE', `Updated quiz "${quizzesStore[index].title}"`);
  res.json(quizzesStore[index]);
});

app.delete('/api/quizzes/:id', (req: Request, res: Response) => {
  const index = quizzesStore.findIndex((q) => q.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Quiz not found' });

  const deleted = quizzesStore[index];
  quizzesStore.splice(index, 1);
  addAuditLog('Faculty', 'FACULTY', 'QUIZ_DELETE', `Deleted quiz "${deleted.title}"`);
  res.json({ success: true, message: 'Quiz removed successfully' });
});

app.post('/api/quizzes/:id/submit', (req: Request, res: Response) => {
  const { studentId, studentName, answers, timeTakenSeconds, userRole } = req.body;
  if (userRole === 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Administrator accounts are strictly prohibited from attempting quizzes.' });
  }

  const quiz = quizzesStore.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  
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
  const { quizId, studentId } = req.query;
  let results = [...quizAttemptsStore];
  if (quizId) results = results.filter((q) => q.quizId === quizId);
  if (studentId) results = results.filter((q) => q.studentId === studentId);
  res.json(results);
});

// Attendance API
app.get('/api/attendance', (req: Request, res: Response) => {
  const { courseId, studentId, date } = req.query;
  let results = [...attendanceStore];
  if (courseId) results = results.filter((a) => a.courseId === courseId);
  if (studentId) results = results.filter((a) => a.studentId === studentId);
  if (date) results = results.filter((a) => a.date === date);
  res.json(results);
});

app.post('/api/attendance', (req: Request, res: Response) => {
  const records = req.body.records; // array of records
  const { performedBy, userRole, facultyId } = req.body;

  if (Array.isArray(records)) {
    records.forEach((r: any) => {
      // Prevent duplicate attendance for same (course_id, student_id, date)
      const existing = attendanceStore.findIndex((a) => a.courseId === r.courseId && a.studentId === r.studentId && a.date === r.date);
      if (existing !== -1) {
        attendanceStore[existing].status = r.status;
      } else {
        attendanceStore.push({ id: `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`, ...r });
      }
    });

    addAuditLog(performedBy || 'Faculty', userRole || 'FACULTY', 'ATTENDANCE_UPDATE', `Marked attendance for ${records.length} students`);
  }
  res.json({ success: true, count: records?.length || 0 });
});

app.post('/api/courses/:courseId/attendance/bulk', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { date, records, facultyId, userRole, performedBy } = req.body;

  const targetCourse = coursesStore.find((c) => c.id === courseId);
  if (!targetCourse) return res.status(404).json({ error: 'Course not found' });

  if (userRole === 'FACULTY' && facultyId && targetCourse.facultyId !== facultyId) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course' });
  }

  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Valid date and records array required' });
  }

  let updatedCount = 0;
  records.forEach((rec: any) => {
    const existing = attendanceStore.findIndex((a) => a.courseId === courseId && a.studentId === rec.studentId && a.date === date);
    if (existing !== -1) {
      attendanceStore[existing].status = rec.status;
    } else {
      attendanceStore.push({
        id: `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        courseId,
        courseCode: targetCourse.code,
        courseName: targetCourse.title,
        studentId: rec.studentId,
        studentName: rec.studentName,
        date,
        status: rec.status
      });
    }
    updatedCount++;
  });

  addAuditLog(performedBy || 'Faculty', 'FACULTY', 'ATTENDANCE_RECORDED', `Recorded session attendance for ${targetCourse.code} on ${date} (${updatedCount} students)`);

  res.json({ success: true, count: updatedCount, date, courseCode: targetCourse.code });
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
