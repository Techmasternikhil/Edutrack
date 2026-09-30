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
  mockRegistrationRequests,
  mockFeeRecords,
  mockTimetableSlots,
  mockAttendanceRequests,
  mockSmsNotifications,
  mockExamAssessments,
  mockExamResults,
  mockProfileChangeRequests
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
let feeStore = [...mockFeeRecords];
let timetableStore = [...mockTimetableSlots];
let attendanceRequestsStore = [...mockAttendanceRequests];
let smsNotificationsStore = [...mockSmsNotifications];
let examAssessmentsStore = [...mockExamAssessments];
let examResultsStore = [...mockExamResults];
let profileChangeRequestsStore: any[] = [...mockProfileChangeRequests];

// Attendance Adjustments in-memory ledger
let attendanceAdjustmentsStore: any[] = [];

// ==========================================
// SMS SERVICE & PROVIDER ABSTRACTION
// ==========================================
export interface SMSProvider {
  sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class MockUniversitySMSProvider implements SMSProvider {
  async sendMessage(phoneNumber: string, message: string) {
    // Simulated institutional SMS delivery
    console.log(`[SMS-GATEWAY] Dispatched to ${phoneNumber.replace(/(\+\d{2}\s?\d{2})\d{4}(\d{4})/, '$1XXXX$2')}: "${message}"`);
    return {
      success: true,
      messageId: `MSG-FAST2SMS-${Math.floor(100000 + Math.random() * 900000)}`
    };
  }
}

const smsProvider: SMSProvider = new MockUniversitySMSProvider();

// Helper to queue and dispatch Absence SMS to linked parent idempotently
async function triggerParentAbsenceSMS(
  attendanceRecord: any,
  course: any,
  periodNumber?: number,
  timeRange?: string
) {
  try {
    const student = usersStore.find((u) => u.id === attendanceRecord.studentId);
    if (!student) return;

    // Resolve linked parent(s)
    const parents = usersStore.filter((u) => u.role === 'PARENT' && u.childStudentIds?.includes(student.id));
    if (parents.length === 0) return;

    for (const parent of parents) {
      // Idempotency check: attendance_id + parent_id + notification_type
      const existing = smsNotificationsStore.find(
        (s) => s.attendanceId === attendanceRecord.id && s.parentId === parent.id && s.notificationType === 'ABSENCE'
      );
      if (existing) {
        continue; // Prevent duplicate SMS
      }

      const parentPhone = parent.phone || '+91 98401 00000';
      const maskedPhone = parentPhone.replace(/(\+\d{2}\s?\d{2})\d{4}(\d{4})/, '$1XXXX$2');

      const courseTitle = course?.title || attendanceRecord.courseName || 'Class';
      const dateFormatted = new Date(attendanceRecord.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      const periodText = periodNumber ? `\nPeriod: ${periodNumber}${timeRange ? ` (${timeRange})` : ''}` : '';
      const smsText = `EduTrack Attendance Alert\n\nYour ward, ${student.name}, was marked ABSENT for ${courseTitle} on ${dateFormatted}.${periodText}\n\nThis is an automated institutional attendance notification.`;

      // Create queued record
      const smsRecordId = `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const smsLogEntry: any = {
        id: smsRecordId,
        studentId: student.id,
        studentName: student.name,
        parentId: parent.id,
        parentName: parent.name,
        attendanceId: attendanceRecord.id,
        phoneNumberMasked: maskedPhone,
        phoneNumber: parentPhone,
        notificationType: 'ABSENCE',
        message: smsText,
        deliveryStatus: 'QUEUED',
        createdAt: new Date().toISOString()
      };
      smsNotificationsStore.unshift(smsLogEntry);

      // Async dispatch without blocking attendance commit
      smsProvider.sendMessage(parentPhone, smsText).then((res) => {
        if (res.success) {
          smsLogEntry.deliveryStatus = 'DELIVERED';
          smsLogEntry.providerMessageId = res.messageId;
          smsLogEntry.sentAt = new Date().toISOString();
        } else {
          smsLogEntry.deliveryStatus = 'FAILED';
          smsLogEntry.failureReason = res.error || 'Gateway Timeout';
        }
      }).catch((err) => {
        smsLogEntry.deliveryStatus = 'FAILED';
        smsLogEntry.failureReason = err.message || 'SMS Delivery Failure';
      });

      // Also create an in-app notification for the parent
      notificationsStore.unshift({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: parent.id,
        title: 'Ward Absence Alert',
        message: `Your ward ${student.name} was marked ABSENT for ${courseTitle} on ${dateFormatted}. An SMS notification has been dispatched.`,
        type: 'ATTENDANCE',
        createdAt: new Date().toISOString(),
        isRead: false
      });
    }
  } catch (err) {
    console.error('Error triggering parent absence SMS:', err);
    // Attendance remains saved even if SMS fails
  }
}

// Helper to verify if faculty teaches a course
function isFacultyAssignedToCourse(course: any, facultyId: string): boolean {
  if (!course || !facultyId) return false;
  if (course.facultyId === facultyId) return true;
  if (course.coFaculties && Array.isArray(course.coFaculties)) {
    return course.coFaculties.some((cf: any) => cf.facultyId === facultyId);
  }
  return false;
}

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

  if (userRole === 'FACULTY' && facultyId && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
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
  if (userRole === 'FACULTY' && facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
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
  const { courseId, facultyId, userRole, performedBy } = req.body;
  const targetCourse = coursesStore.find((c) => c.id === courseId);
  if (userRole === 'FACULTY' && facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course' });
  }

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
  if (userRole === 'FACULTY' && facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
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

  if (userRole === 'FACULTY' && facultyId && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
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

  addAuditLog(performedBy || 'Faculty', userRole || 'FACULTY', 'QUIZ_CREATE', `Created quiz "${newQuiz.title}" for ${targetCourse.code || targetCourse.mnemonic}`);

  res.status(201).json(newQuiz);
});

app.put('/api/quizzes/:id', (req: Request, res: Response) => {
  const index = quizzesStore.findIndex((q) => q.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Quiz not found' });

  const existing = quizzesStore[index];
  const { performedBy, userRole, facultyId } = req.body;
  const targetCourse = coursesStore.find((c) => c.id === existing.courseId);
  if (userRole === 'FACULTY' && facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
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
  const { courseId, studentId, date, requesterRole, requesterId } = req.query;
  
  // Security enforcement: If student requests, can only access own attendance
  if (requesterRole === 'STUDENT' && requesterId && studentId && requesterId !== studentId) {
    return res.status(403).json({ error: 'Forbidden: Students are strictly restricted to their own attendance records.' });
  }

  // Security enforcement: If parent requests, can only access authorized child
  if (requesterRole === 'PARENT' && requesterId && studentId) {
    const parent = usersStore.find((u) => u.id === requesterId);
    if (!parent || !parent.childStudentIds?.includes(studentId as string)) {
      return res.status(403).json({ error: 'Forbidden: Parents are strictly restricted to their authorized children.' });
    }
  }

  let results = [...attendanceStore];
  if (courseId) results = results.filter((a) => a.courseId === courseId);
  if (studentId) results = results.filter((a) => a.studentId === studentId);
  if (date) results = results.filter((a) => a.date === date);

  // Sort newest first
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(results);
});

// Student attendance summary & analytics endpoint (Single source of truth)
app.get('/api/attendance/summary/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { requesterId, requesterRole } = req.query;

  // Authorization validation
  if (requesterRole === 'STUDENT' && requesterId && requesterId !== studentId) {
    return res.status(403).json({ error: 'Forbidden: You cannot access another student\'s attendance summary.' });
  }

  if (requesterRole === 'PARENT' && requesterId) {
    const parent = usersStore.find((u) => u.id === requesterId);
    if (!parent || !parent.childStudentIds?.includes(studentId)) {
      return res.status(403).json({ error: 'Forbidden: Student is not an authorized ward of this parent account.' });
    }
  }

  const student = usersStore.find((u) => u.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student record not found' });

  // Get enrolled courses and records
  const studentRecords = attendanceStore.filter((a) => a.studentId === studentId);
  const enrolledCourses = coursesStore.filter((c) => student.classId ? true : true); // courses available in curriculum

  const totalSessions = studentRecords.length;
  const presentCount = studentRecords.filter((a) => a.status === 'PRESENT').length;
  const lateCount = studentRecords.filter((a) => a.status === 'LATE').length;
  const absentCount = studentRecords.filter((a) => a.status === 'ABSENT').length;
  const overallPercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;
  const isCompliant = overallPercentage >= 75;

  // Subject-wise breakdown
  const subjectMetrics = enrolledCourses.map((crs) => {
    const cRecords = studentRecords.filter((r) => r.courseId === crs.id);
    const cTotal = cRecords.length;
    const cPresent = cRecords.filter((r) => r.status === 'PRESENT').length;
    const cLate = cRecords.filter((r) => r.status === 'LATE').length;
    const cAbsent = cRecords.filter((r) => r.status === 'ABSENT').length;
    const cPct = cTotal > 0 ? Math.round((cPresent / cTotal) * 100) : 100;
    const cCompliant = cPct >= 75;
    const needed = (!cCompliant && cTotal > 0) ? Math.max(1, Math.ceil(3 * cTotal - 4 * cPresent)) : 0;

    return {
      courseId: crs.id,
      courseCode: crs.code,
      courseName: crs.title,
      facultyName: crs.facultyName,
      present: cPresent,
      late: cLate,
      absent: cAbsent,
      total: cTotal,
      percentage: cPct,
      status: cCompliant ? 'COMPLIANT' : 'WARNING',
      shortageCount: needed
    };
  });

  const recent = [...studentRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  res.json({
    studentId,
    studentName: student.name,
    regNumber: student.regNumber,
    overall: {
      percentage: overallPercentage,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      total: totalSessions,
      threshold: 75,
      status: isCompliant ? 'COMPLIANT' : 'WARNING',
      shortageCount: (!isCompliant && totalSessions > 0) ? Math.max(1, Math.ceil(3 * totalSessions - 4 * presentCount)) : 0
    },
    subjects: subjectMetrics,
    recent
  });
});

// Timetable Endpoints
app.get('/api/timetable', (req: Request, res: Response) => {
  res.json(timetableStore);
});

// Historical attendance correction (Faculty/Admin only with Course Authorization & Audit Log)
app.put('/api/attendance/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, performedBy, userRole, facultyId, reason } = req.body;

  if (userRole !== 'FACULTY' && userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Only faculty instructors and administrators may correct attendance.' });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Reason for attendance modification is mandatory.' });
  }

  const index = attendanceStore.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Attendance record not found' });

  const prev = attendanceStore[index];
  const targetCourse = coursesStore.find((c) => c.id === prev.courseId);

  // Faculty can only edit attendance for their assigned course
  if (userRole === 'FACULTY' && facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not authorized to edit attendance for unassigned courses.' });
  }

  const oldStatus = prev.status;
  const adjustment: any = {
    id: `adj-${Date.now()}`,
    attendanceId: prev.id,
    adjustmentType: 'MANUAL_CORRECTION',
    originalStatus: oldStatus,
    effectiveStatus: status,
    approvedBy: performedBy || 'Faculty',
    approvedAt: new Date().toISOString(),
    reason: reason.trim(),
    createdAt: new Date().toISOString()
  };

  attendanceAdjustmentsStore.push(adjustment);

  const updatedRecord = {
    ...prev,
    status,
    effectiveStatus: status,
    adjustments: [...(prev.adjustments || []), adjustment]
  };

  attendanceStore[index] = updatedRecord;

  addAuditLog(
    performedBy || 'Faculty',
    userRole || 'FACULTY',
    'ATTENDANCE_CORRECTED',
    `Manual correction for ${prev.studentName} in ${prev.courseCode || targetCourse?.code} on ${prev.date}: ${oldStatus} -> ${status} (Reason: ${reason})`
  );

  // If changed to ABSENT, dispatch absence SMS
  if (status === 'ABSENT' && oldStatus !== 'ABSENT') {
    triggerParentAbsenceSMS(updatedRecord, targetCourse);
  }

  res.json({ success: true, updated: updatedRecord, adjustment });
});

app.patch('/api/faculty/attendance/:id', (req: Request, res: Response) => {
  // Alias to PUT endpoint for REST compatibility
  const { id } = req.params;
  const { status, performedBy, userRole, facultyId, reason } = req.body;

  if (userRole !== 'FACULTY' && userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Only faculty instructors and administrators may correct attendance.' });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Reason for attendance modification is mandatory.' });
  }

  const index = attendanceStore.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Attendance record not found' });

  const prev = attendanceStore[index];
  const targetCourse = coursesStore.find((c) => c.id === prev.courseId);

  if (userRole === 'FACULTY' && facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not authorized to edit attendance for unassigned courses.' });
  }

  const oldStatus = prev.status;
  const adjustment: any = {
    id: `adj-${Date.now()}`,
    attendanceId: prev.id,
    adjustmentType: 'MANUAL_CORRECTION',
    originalStatus: oldStatus,
    effectiveStatus: status,
    approvedBy: performedBy || 'Faculty',
    approvedAt: new Date().toISOString(),
    reason: reason.trim(),
    createdAt: new Date().toISOString()
  };

  attendanceAdjustmentsStore.push(adjustment);

  const updatedRecord = {
    ...prev,
    status,
    effectiveStatus: status,
    adjustments: [...(prev.adjustments || []), adjustment]
  };

  attendanceStore[index] = updatedRecord;

  addAuditLog(
    performedBy || 'Faculty',
    userRole || 'FACULTY',
    'ATTENDANCE_CORRECTED',
    `Historical correction for ${prev.studentName} in ${prev.courseCode || targetCourse?.code} on ${prev.date}: ${oldStatus} -> ${status} (Reason: ${reason})`
  );

  if (status === 'ABSENT' && oldStatus !== 'ABSENT') {
    triggerParentAbsenceSMS(updatedRecord, targetCourse);
  }

  res.json({ success: true, updated: updatedRecord, adjustment });
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

  if (userRole === 'FACULTY' && facultyId && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course' });
  }

  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Valid date and records array required' });
  }

  let updatedCount = 0;
  records.forEach((rec: any) => {
    const existing = attendanceStore.findIndex((a) => a.courseId === courseId && a.studentId === rec.studentId && a.date === date);
    let recordObj: any;

    if (existing !== -1) {
      const oldStatus = attendanceStore[existing].status;
      attendanceStore[existing].status = rec.status;
      recordObj = attendanceStore[existing];

      if (oldStatus !== rec.status) {
        addAuditLog(performedBy || 'Faculty', 'FACULTY', 'ATTENDANCE_CORRECTED', `Updated attendance for ${rec.studentName} in ${targetCourse.code} on ${date}: ${oldStatus} -> ${rec.status}`);
        
        // If changed to ABSENT from another state, trigger absence SMS
        if (rec.status === 'ABSENT' && oldStatus !== 'ABSENT') {
          triggerParentAbsenceSMS(recordObj, targetCourse);
        }
      }
    } else {
      recordObj = {
        id: `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        courseId,
        courseCode: targetCourse.code,
        courseName: targetCourse.title,
        studentId: rec.studentId,
        studentName: rec.studentName,
        date,
        status: rec.status
      };
      attendanceStore.push(recordObj);

      // If newly marked ABSENT, dispatch parent SMS
      if (rec.status === 'ABSENT') {
        triggerParentAbsenceSMS(recordObj, targetCourse);
      }
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

// ==========================================
// SMS NOTIFICATIONS DELIVERY LOGS API
// ==========================================
app.get('/api/notifications/sms', (req: Request, res: Response) => {
  const { studentId, parentId, deliveryStatus } = req.query;
  let results = [...smsNotificationsStore];
  if (studentId) results = results.filter((s) => s.studentId === studentId);
  if (parentId) results = results.filter((s) => s.parentId === parentId);
  if (deliveryStatus) results = results.filter((s) => s.deliveryStatus === deliveryStatus);
  res.json(results);
});

// ==========================================
// ATTENDANCE REGULARIZATION (MEDICAL & OD) APIs
// ==========================================
// Helper to automatically identify affected timetable sessions within a date range
function detectAffectedSessionsForStudent(studentId: string, fromDateStr: string, toDateStr: string): any[] {
  const student = usersStore.find((u) => u.id === studentId);
  if (!student) return [];

  const start = new Date(fromDateStr);
  const end = new Date(toDateStr);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const affected: any[] = [];

  // Iterate each date in range
  const current = new Date(start);
  while (current <= end) {
    const dayName = daysOfWeek[current.getDay()];
    const dateStr = current.toISOString().split('T')[0];

    // Find timetable slots for this day
    const scheduledSlots = timetableStore.filter((t) => t.day === dayName);

    scheduledSlots.forEach((slot) => {
      // Find course matching mnemonic or code
      const course = coursesStore.find((c) => c.mnemonic === slot.courseMnemonic || c.code === slot.courseCode);
      if (course) {
        // Check existing attendance record
        const att = attendanceStore.find((a) => a.studentId === studentId && a.courseId === course.id && a.date === dateStr);
        const originalStatus = att?.status || 'ABSENT';

        // Find assigned faculty
        const faculty = usersStore.find((u) => u.role === 'FACULTY' && (u.id === course.facultyId || u.name === course.facultyName));

        affected.push({
          id: `sess-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          attendanceId: att?.id,
          courseId: course.id,
          courseCode: course.code || slot.courseCode || slot.courseMnemonic,
          courseName: course.title || slot.courseTitle,
          sessionDate: dateStr,
          periodNumber: slot.period,
          timeRange: slot.room ? `${slot.room}` : undefined,
          facultyId: faculty?.id || course.facultyId || 'usr-fac-1',
          facultyName: faculty?.name || course.facultyName || 'Course Faculty',
          originalStatus,
          classTeacherApproved: false,
          facultyStatus: 'PENDING'
        });
      }
    });

    current.setDate(current.getDate() + 1);
  }

  return affected;
}

// Student: Submit Medical or OD Attendance Request
app.post('/api/attendance-requests', (req: Request, res: Response) => {
  const {
    studentId,
    requestType,
    fromDate,
    toDate,
    reason,
    optionalNote,
    eventName,
    eventType,
    eventVenue,
    documentUrl,
    documentName
  } = req.body;

  const student = usersStore.find((u) => u.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student record not found.' });

  // Resolve assigned class teacher from student's academic class
  const academicClass = classesStore.find((c) => c.id === student.classId);
  const classTeacher = usersStore.find((u) => u.id === academicClass?.classTeacherId || (u.role === 'FACULTY' && u.isClassTeacher));

  const initialStatus = requestType === 'OD' && !documentUrl ? 'AWAITING_APPROVED_OD_DOCUMENT' : 'PENDING_CLASS_TEACHER_REVIEW';

  const documents: any[] = [];
  if (documentUrl && documentName) {
    documents.push({
      id: `doc-${Date.now()}`,
      documentType: requestType === 'MEDICAL' ? 'MEDICAL_CERTIFICATE' : 'APPROVED_OD',
      fileUrl: documentUrl,
      fileName: documentName,
      uploadedBy: student.id,
      uploadedAt: new Date().toISOString()
    });
  }

  // Automatically detect timetable sessions
  const detectedSessions = detectAffectedSessionsForStudent(student.id, fromDate, toDate);

  const newRequest: any = {
    id: `req-${requestType.toLowerCase()}-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    studentRegNumber: student.regNumber || 'N/A',
    classId: student.classId || 'cls-cse-4-vii-a',
    className: student.className || academicClass?.name || 'B.Tech CSE',
    classTeacherId: classTeacher?.id || 'usr-fac-elankavi',
    classTeacherName: classTeacher?.name || 'Class Teacher',
    requestType,
    fromDate,
    toDate,
    reason: reason || 'Medical leave request',
    optionalNote,
    eventName,
    eventType,
    eventVenue,
    status: initialStatus,
    documents,
    affectedSessions: detectedSessions,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  attendanceRequestsStore.unshift(newRequest);

  // Notify Class Teacher
  if (classTeacher) {
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      userId: classTeacher.id,
      title: `New ${requestType} Attendance Request`,
      message: `${student.name} (${student.regNumber}) submitted a ${requestType} request for ${fromDate} to ${toDate}. Please review affected sessions.`,
      type: 'ATTENDANCE',
      createdAt: new Date().toISOString(),
      isRead: false
    });
  }

  addAuditLog(student.name, 'STUDENT', `${requestType}_REQUEST_SUBMITTED`, `Submitted ${requestType} request from ${fromDate} to ${toDate} (${detectedSessions.length} affected sessions)`);

  res.status(201).json(newRequest);
});

// Student: Upload approved OD document later
app.post('/api/attendance-requests/:id/upload-approved-od', (req: Request, res: Response) => {
  const { id } = req.params;
  const { documentUrl, documentName, studentId } = req.body;

  const reqIndex = attendanceRequestsStore.findIndex((r) => r.id === id);
  if (reqIndex === -1) return res.status(404).json({ error: 'Attendance request not found.' });

  const targetReq = attendanceRequestsStore[reqIndex];
  if (studentId && targetReq.studentId !== studentId) {
    return res.status(403).json({ error: 'Forbidden: You cannot upload documents for another student\'s request.' });
  }

  const newDoc = {
    id: `doc-${Date.now()}`,
    requestId: targetReq.id,
    documentType: 'APPROVED_OD',
    fileUrl: documentUrl || 'https://documents.edutrack.edu/od/approved-od.pdf',
    fileName: documentName || 'Approved_OD_Certificate.pdf',
    uploadedBy: targetReq.studentId,
    uploadedAt: new Date().toISOString()
  };

  targetReq.documents.push(newDoc);
  targetReq.status = 'PENDING_CLASS_TEACHER_REVIEW';
  targetReq.updatedAt = new Date().toISOString();

  // Notify Class Teacher
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    userId: targetReq.classTeacherId,
    title: 'Approved OD Proof Uploaded',
    message: `${targetReq.studentName} uploaded the official approved OD proof for "${targetReq.eventName || 'Event'}". Ready for verification.`,
    type: 'ATTENDANCE',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(targetReq.studentName, 'STUDENT', 'OD_DOCUMENT_UPLOADED', `Uploaded approved OD certificate for request ${targetReq.id}`);

  res.json({ success: true, request: targetReq });
});

// Get Attendance Requests (Role-based filtering)
app.get('/api/attendance-requests', (req: Request, res: Response) => {
  const { studentId, classTeacherId, facultyId, status, requestType } = req.query;
  let results = [...attendanceRequestsStore];

  if (studentId) {
    results = results.filter((r) => r.studentId === studentId);
  }
  if (classTeacherId) {
    results = results.filter((r) => r.classTeacherId === classTeacherId);
  }
  if (facultyId) {
    // Return requests that have at least one session assigned to this faculty
    results = results.filter((r) =>
      r.affectedSessions?.some((s: any) => s.facultyId === facultyId && s.classTeacherApproved)
    );
  }
  if (status) {
    results = results.filter((r) => r.status === status);
  }
  if (requestType) {
    results = results.filter((r) => r.requestType === requestType);
  }

  res.json(results);
});

// Class Teacher: Review, Approve, and Forward Request to Subject Faculties
app.post('/api/class-teacher/attendance-requests/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision, reason, approvedSessionIds, teacherId, teacherName } = req.body;

  const reqIndex = attendanceRequestsStore.findIndex((r) => r.id === id);
  if (reqIndex === -1) return res.status(404).json({ error: 'Request not found.' });

  const targetReq = attendanceRequestsStore[reqIndex];

  if (decision === 'REJECT') {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is mandatory.' });
    }

    targetReq.status = 'REJECTED_BY_CLASS_TEACHER';
    targetReq.classTeacherDecision = 'REJECTED';
    targetReq.classTeacherReason = reason.trim();
    targetReq.classTeacherReviewedAt = new Date().toISOString();
    targetReq.updatedAt = new Date().toISOString();

    // Notify student
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      userId: targetReq.studentId,
      title: `${targetReq.requestType} Request Rejected`,
      message: `Your Class Teacher rejected your ${targetReq.requestType} request. Reason: ${reason}`,
      type: 'ATTENDANCE',
      createdAt: new Date().toISOString(),
      isRead: false
    });

    addAuditLog(teacherName || 'Class Teacher', 'FACULTY', `${targetReq.requestType}_CLASS_TEACHER_REJECTED`, `Rejected ${targetReq.requestType} request for ${targetReq.studentName}: ${reason}`);

    return res.json({ success: true, request: targetReq });
  }

  // Approved decision: mark eligible sessions and forward to subject faculties
  const approvedIds = Array.isArray(approvedSessionIds) ? approvedSessionIds : targetReq.affectedSessions.map((s: any) => s.id);

  targetReq.affectedSessions.forEach((s: any) => {
    s.classTeacherApproved = approvedIds.includes(s.id);
  });

  targetReq.status = 'FORWARDED_TO_SUBJECT_FACULTY';
  targetReq.classTeacherDecision = 'APPROVED';
  targetReq.classTeacherReason = reason || 'Verified credentials and certificate authenticity. Approved for subject-level adjustment.';
  targetReq.classTeacherReviewedAt = new Date().toISOString();
  targetReq.updatedAt = new Date().toISOString();

  // Notify unique subject faculty members involved
  const forwardedFacultyIds = Array.from(new Set(
    targetReq.affectedSessions.filter((s: any) => s.classTeacherApproved).map((s: any) => s.facultyId)
  ));

  forwardedFacultyIds.forEach((fId) => {
    notificationsStore.unshift({
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: fId as string,
      title: `Attendance Regularization Request Forwarded`,
      message: `Class Teacher ${teacherName || ''} forwarded a ${targetReq.requestType} request for student ${targetReq.studentName} (${targetReq.studentRegNumber}). Action required.`,
      type: 'ATTENDANCE',
      createdAt: new Date().toISOString(),
      isRead: false
    });
  });

  // Notify student
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    userId: targetReq.studentId,
    title: `${targetReq.requestType} Request Approved by Class Teacher`,
    message: `Your request was approved by Class Teacher and forwarded to course instructors for attendance adjustment.`,
    type: 'ATTENDANCE',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(teacherName || 'Class Teacher', 'FACULTY', `${targetReq.requestType}_CLASS_TEACHER_APPROVED`, `Approved ${targetReq.requestType} request for ${targetReq.studentName}. Forwarded to ${forwardedFacultyIds.length} course faculties.`);

  res.json({ success: true, request: targetReq });
});

// Subject Faculty: Verify and Apply/Reject Course Session Attendance Adjustment
app.post('/api/faculty/attendance-adjustments/:sessionId/decision', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { decision, facultyReason, facultyId, facultyName } = req.body;

  let foundRequest: any = null;
  let targetSession: any = null;

  for (const r of attendanceRequestsStore) {
    const s = r.affectedSessions?.find((sess: any) => sess.id === sessionId);
    if (s) {
      foundRequest = r;
      targetSession = s;
      break;
    }
  }

  if (!foundRequest || !targetSession) {
    return res.status(404).json({ error: 'Session request not found.' });
  }

  const course = coursesStore.find((c) => c.id === targetSession.courseId);
  if (facultyId && course && !isFacultyAssignedToCourse(course, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course.' });
  }

  targetSession.facultyStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  targetSession.facultyReviewedBy = facultyName || 'Course Faculty';
  targetSession.facultyReviewedAt = new Date().toISOString();
  targetSession.facultyReason = facultyReason || (decision === 'APPROVE' ? 'Regularization approved.' : 'Rejected by course instructor.');

  // If approved, create attendance adjustment without erasing original attendance record
  if (decision === 'APPROVE') {
    const existingAttIndex = attendanceStore.findIndex(
      (a) => a.studentId === foundRequest.studentId && a.courseId === targetSession.courseId && a.date === targetSession.sessionDate
    );

    let attRecord: any;
    if (existingAttIndex !== -1) {
      attRecord = attendanceStore[existingAttIndex];
    } else {
      attRecord = {
        id: `att-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        courseId: targetSession.courseId,
        courseCode: targetSession.courseCode,
        courseName: targetSession.courseName,
        studentId: foundRequest.studentId,
        studentName: foundRequest.studentName,
        date: targetSession.sessionDate,
        status: 'ABSENT'
      };
      attendanceStore.push(attRecord);
    }

    const adjustment: any = {
      id: `adj-${Date.now()}`,
      attendanceId: attRecord.id,
      requestId: foundRequest.id,
      adjustmentType: foundRequest.requestType, // 'MEDICAL' | 'OD'
      originalStatus: attRecord.status,
      effectiveStatus: 'PRESENT',
      approvedBy: facultyName || 'Faculty',
      approvedAt: new Date().toISOString(),
      reason: facultyReason || `${foundRequest.requestType} attendance regularization approved by ${targetSession.facultyName}`,
      createdAt: new Date().toISOString()
    };

    attendanceAdjustmentsStore.push(adjustment);
    attRecord.effectiveStatus = 'PRESENT';
    attRecord.adjustments = [...(attRecord.adjustments || []), adjustment];
  }

  // Evaluate overall request status (e.g. APPROVED, PARTIALLY_APPROVED, REJECTED)
  const approvedSessions = foundRequest.affectedSessions.filter((s: any) => s.classTeacherApproved);
  const reviewedSessions = approvedSessions.filter((s: any) => s.facultyStatus !== 'PENDING');
  const allReviewed = approvedSessions.length > 0 && reviewedSessions.length === approvedSessions.length;

  if (allReviewed) {
    const approvedCount = approvedSessions.filter((s: any) => s.facultyStatus === 'APPROVED').length;
    if (approvedCount === approvedSessions.length) {
      foundRequest.status = 'APPROVED';
    } else if (approvedCount > 0) {
      foundRequest.status = 'PARTIALLY_APPROVED';
    } else {
      foundRequest.status = 'REJECTED_BY_FACULTY';
    }
    foundRequest.completedAt = new Date().toISOString();
  }

  foundRequest.updatedAt = new Date().toISOString();

  // Notify student
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    userId: foundRequest.studentId,
    title: `Attendance Regularization: ${targetSession.courseCode}`,
    message: `${targetSession.facultyName} has ${decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'} the attendance adjustment for ${targetSession.courseName} on ${targetSession.sessionDate}.`,
    type: 'ATTENDANCE',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  addAuditLog(facultyName || 'Faculty', 'FACULTY', `${foundRequest.requestType}_FACULTY_${decision}`, `${decision} attendance adjustment for ${foundRequest.studentName} in ${targetSession.courseCode} on ${targetSession.sessionDate}`);

  res.json({ success: true, session: targetSession, request: foundRequest });
});

// ==========================================
// EXAM ASSESSMENTS & RESULTS APIs (IAT1, IAT2, MODEL)
// ==========================================
// Get Exam Assessments
app.get('/api/exam-assessments', (req: Request, res: Response) => {
  const { courseId, academicClassId, status } = req.query;
  let results = [...examAssessmentsStore];
  if (courseId) results = results.filter((e) => e.courseId === courseId);
  if (academicClassId) results = results.filter((e) => e.academicClassId === academicClassId);
  if (status) results = results.filter((e) => e.status === status);
  res.json(results);
});

// Faculty: Create Exam Assessment
app.post('/api/exam-assessments', (req: Request, res: Response) => {
  const { courseId, academicClassId, examType, title, maxMarks, examDate, facultyId, facultyName } = req.body;

  const targetCourse = coursesStore.find((c) => c.id === courseId);
  if (!targetCourse) return res.status(404).json({ error: 'Course not found.' });

  if (facultyId && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course.' });
  }

  const academicClass = classesStore.find((c) => c.id === academicClassId) || classesStore[0];

  const newAssessment: any = {
    id: `exam-${examType.toLowerCase()}-${Date.now()}`,
    courseId,
    courseCode: targetCourse.code,
    courseTitle: targetCourse.title,
    academicClassId: academicClass.id,
    className: academicClass.name,
    examType,
    title: title || `${examType} Examination`,
    maxMarks: Number(maxMarks) || 50,
    examDate: examDate || new Date().toISOString().split('T')[0],
    createdByFacultyId: facultyId || targetCourse.facultyId,
    createdByFacultyName: facultyName || targetCourse.facultyName,
    status: 'DRAFT',
    createdAt: new Date().toISOString()
  };

  examAssessmentsStore.unshift(newAssessment);
  addAuditLog(facultyName || 'Faculty', 'FACULTY', 'EXAM_ASSESSMENT_CREATED', `Created ${examType} assessment "${newAssessment.title}" for ${targetCourse.code}`);

  res.status(201).json(newAssessment);
});

// Faculty: Save / Bulk Save Results for an Assessment
app.post('/api/exam-assessments/:assessmentId/results', (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const { results, facultyId, facultyName } = req.body;

  const assessment = examAssessmentsStore.find((e) => e.id === assessmentId);
  if (!assessment) return res.status(404).json({ error: 'Exam assessment not found.' });

  const targetCourse = coursesStore.find((c) => c.id === assessment.courseId);
  if (facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to instruct this course.' });
  }

  if (!Array.isArray(results)) {
    return res.status(400).json({ error: 'Results must be an array of student marks.' });
  }

  let savedCount = 0;
  results.forEach((row: any) => {
    const student = usersStore.find((u) => u.id === row.studentId || u.regNumber === row.studentRegNumber);
    if (!student) return;

    const marks = Math.min(assessment.maxMarks, Math.max(0, Number(row.marksObtained) || 0));
    const percentage = Math.round((marks / assessment.maxMarks) * 100);
    const resultStatus = row.resultStatus || (percentage >= 50 ? 'PASS' : 'FAIL');

    const existingIndex = examResultsStore.findIndex(
      (r) => r.assessmentId === assessmentId && r.studentId === student.id
    );

    if (existingIndex !== -1) {
      examResultsStore[existingIndex] = {
        ...examResultsStore[existingIndex],
        marksObtained: marks,
        percentage,
        resultStatus,
        remarks: row.remarks || examResultsStore[existingIndex].remarks,
        updatedAt: new Date().toISOString()
      };
    } else {
      examResultsStore.push({
        id: `res-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        assessmentId,
        courseId: assessment.courseId,
        studentId: student.id,
        studentName: student.name,
        studentRegNumber: student.regNumber || 'N/A',
        marksObtained: marks,
        maxMarks: assessment.maxMarks,
        percentage,
        resultStatus,
        remarks: row.remarks || '',
        enteredByFacultyId: facultyId || assessment.createdByFacultyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    savedCount++;
  });

  addAuditLog(facultyName || 'Faculty', 'FACULTY', 'EXAM_RESULTS_SAVED', `Saved results for ${savedCount} students in ${assessment.title}`);

  res.json({ success: true, count: savedCount, assessmentId });
});

// Faculty: Publish Results (Makes them visible to Students & Parents)
app.post('/api/exam-assessments/:assessmentId/publish', (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const { facultyId, facultyName } = req.body;

  const assessment = examAssessmentsStore.find((e) => e.id === assessmentId);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });

  const targetCourse = coursesStore.find((c) => c.id === assessment.courseId);
  if (facultyId && targetCourse && !isFacultyAssignedToCourse(targetCourse, facultyId)) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this course.' });
  }

  assessment.status = 'PUBLISHED';
  assessment.publishedAt = new Date().toISOString();

  // Notify all students with results and their parents
  const studentResults = examResultsStore.filter((r) => r.assessmentId === assessmentId);
  studentResults.forEach((resRow) => {
    // Notify student
    notificationsStore.unshift({
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: resRow.studentId,
      title: `${assessment.title} Published`,
      message: `Your results for ${assessment.courseTitle} (${assessment.courseCode}) are now published: ${resRow.marksObtained} / ${resRow.maxMarks} (${resRow.percentage}%).`,
      type: 'GRADE',
      createdAt: new Date().toISOString(),
      isRead: false
    });

    // Notify linked parents
    const parents = usersStore.filter((u) => u.role === 'PARENT' && u.childStudentIds?.includes(resRow.studentId));
    parents.forEach((parent) => {
      notificationsStore.unshift({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: parent.id,
        title: `Ward Internal Exam Result: ${assessment.courseCode}`,
        message: `${resRow.studentName}'s result for ${assessment.title} has been published: ${resRow.marksObtained} / ${resRow.maxMarks} (${resRow.resultStatus}).`,
        type: 'GRADE',
        createdAt: new Date().toISOString(),
        isRead: false
      });
    });
  });

  addAuditLog(facultyName || 'Faculty', 'FACULTY', 'EXAM_RESULTS_PUBLISHED', `Published ${assessment.title} results for ${studentResults.length} students`);

  res.json({ success: true, assessment, studentCount: studentResults.length });
});

// Student: View own published exam results
app.get('/api/student/results', (req: Request, res: Response) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ error: 'studentId required.' });

  const publishedAssessments = examAssessmentsStore.filter((a) => a.status === 'PUBLISHED');
  const publishedIds = publishedAssessments.map((a) => a.id);

  const myResults = examResultsStore.filter(
    (r) => r.studentId === studentId && publishedIds.includes(r.assessmentId)
  );

  const formatted = myResults.map((resRow) => {
    const assessment = publishedAssessments.find((a) => a.id === resRow.assessmentId);
    return {
      ...resRow,
      examType: assessment?.examType,
      title: assessment?.title,
      courseCode: assessment?.courseCode,
      courseTitle: assessment?.courseTitle,
      examDate: assessment?.examDate
    };
  });

  res.json(formatted);
});

// Parent: View child's published exam results with strict parent-child authorization
app.get('/api/parent/children/:studentId/results', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { parentId } = req.query;

  if (!parentId) return res.status(401).json({ error: 'Parent authentication required.' });

  const parent = usersStore.find((u) => u.id === parentId);
  if (!parent || !parent.childStudentIds?.includes(studentId)) {
    return res.status(403).json({ error: 'Forbidden: You are strictly restricted to your authorized ward.' });
  }

  const publishedAssessments = examAssessmentsStore.filter((a) => a.status === 'PUBLISHED');
  const publishedIds = publishedAssessments.map((a) => a.id);

  const childResults = examResultsStore.filter(
    (r) => r.studentId === studentId && publishedIds.includes(r.assessmentId)
  );

  const formatted = childResults.map((resRow) => {
    const assessment = publishedAssessments.find((a) => a.id === resRow.assessmentId);
    return {
      ...resRow,
      examType: assessment?.examType,
      title: assessment?.title,
      courseCode: assessment?.courseCode,
      courseTitle: assessment?.courseTitle,
      examDate: assessment?.examDate
    };
  });

  res.json(formatted);
});

// Faculty/Admin: View all results for an assessment
app.get('/api/exam-assessments/:assessmentId/results', (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const results = examResultsStore.filter((r) => r.assessmentId === assessmentId);
  res.json(results);
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

// ==========================================
// INSTITUTIONAL BILLING & FEES REST APIS
// ==========================================

// Get Fees (with optional studentId or status filters)
app.get('/api/fees', (req: Request, res: Response) => {
  const { studentId, status } = req.query;
  let results = [...feeStore];
  if (studentId) {
    results = results.filter((f) => f.studentId === studentId);
  }
  if (status) {
    results = results.filter((f) => f.status === status);
  }
  res.json(results);
});

// Student or Parent Pays a Fee Record
app.post('/api/fees/:id/pay', (req: Request, res: Response) => {
  const { paymentMethod, transactionRef, paidBy, payerRole } = req.body;
  const index = feeStore.findIndex((f) => f.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Fee invoice record not found' });
  }

  const fee = feeStore[index];
  if (fee.status === 'PAID') {
    return res.status(400).json({ error: 'This invoice has already been cleared.' });
  }

  const now = new Date().toISOString();
  const generatedReceipt = `REC-${Date.now().toString().slice(-6)}-${fee.category.slice(0, 3)}`;

  fee.status = 'PAID';
  fee.paidAt = now;
  fee.paidAmount = fee.amount;
  fee.paymentMethod = paymentMethod || 'UPI';
  fee.transactionRef = transactionRef || `TXN-${Date.now().toString().slice(-8)}`;
  fee.receiptNumber = generatedReceipt;
  fee.remarks = `Cleared by ${paidBy || 'Payer'} (${payerRole || 'STUDENT'}) via ${paymentMethod || 'UPI'}`;

  // Log in institutional audit trail
  addAuditLog(
    paidBy || 'Student/Parent',
    payerRole || 'STUDENT',
    'FEE_PAYMENT',
    `Payment of ₹${fee.amount.toLocaleString('en-IN')} received for ${fee.title} (Student: ${fee.studentName}, Receipt: ${generatedReceipt})`
  );

  // Send Notification to Student
  notificationsStore.unshift({
    id: `notif-${Date.now()}-stu`,
    userId: fee.studentId,
    title: 'Fee Payment Received',
    message: `Receipt ${generatedReceipt}: ₹${fee.amount.toLocaleString('en-IN')} cleared for ${fee.title}.`,
    type: 'BILLING',
    createdAt: now,
    isRead: false
  });

  // Find linked parents for this student and notify them
  const linkedParents = usersStore.filter(
    (u) => u.role === 'PARENT' && u.childStudentIds?.includes(fee.studentId)
  );
  linkedParents.forEach((parent) => {
    notificationsStore.unshift({
      id: `notif-${Date.now()}-parent-${parent.id}`,
      userId: parent.id,
      title: 'Ward Fee Cleared',
      message: `Payment confirmation: ₹${fee.amount.toLocaleString('en-IN')} cleared for ${fee.studentName}'s ${fee.title} (Receipt: ${generatedReceipt}).`,
      type: 'BILLING',
      createdAt: now,
      isRead: false
    });
  });

  res.json({ success: true, fee, message: 'Fee payment successfully processed and receipt generated.' });
});

// Admin or Faculty Issues a Fee Dues Reminder Alert
app.post('/api/fees/:id/remind', (req: Request, res: Response) => {
  const { senderName, senderRole, customMessage } = req.body;
  const index = feeStore.findIndex((f) => f.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Fee record not found' });
  }

  const fee = feeStore[index];
  const now = new Date().toISOString();
  const alertTitle = fee.status === 'OVERDUE' ? '⚠️ OVERDUE Fee Reminder Alert' : '📢 Academic Fee Payment Reminder';
  const alertMsg = customMessage || 
    `${senderName} (${senderRole}): Reminder for ${fee.title} of ₹${fee.amount.toLocaleString('en-IN')} due on ${fee.dueDate}. Please clear pending dues immediately.`;

  // Notify the student
  notificationsStore.unshift({
    id: `notif-${Date.now()}-remind-stu`,
    userId: fee.studentId,
    title: alertTitle,
    message: alertMsg,
    type: 'BILLING',
    createdAt: now,
    isRead: false
  });

  // Notify linked parent(s)
  const linkedParents = usersStore.filter(
    (u) => u.role === 'PARENT' && u.childStudentIds?.includes(fee.studentId)
  );
  linkedParents.forEach((parent) => {
    notificationsStore.unshift({
      id: `notif-${Date.now()}-remind-par-${parent.id}`,
      userId: parent.id,
      title: alertTitle,
      message: `Parent Notice: ${fee.studentName} has a pending invoice for ${fee.title} (₹${fee.amount.toLocaleString('en-IN')}). Due date: ${fee.dueDate}.`,
      type: 'BILLING',
      createdAt: now,
      isRead: false
    });
  });

  // Add audit record
  addAuditLog(
    senderName || 'Instructor/Admin',
    senderRole || 'FACULTY',
    'FEE_REMINDER_SENT',
    `Sent billing alert for ${fee.title} to student ${fee.studentName} and associated guardian(s).`
  );

  res.json({ success: true, message: `Fee alert successfully dispatched to ${fee.studentName} and guardians.` });
});

// Admin Creates New Fee Invoice
app.post('/api/fees', (req: Request, res: Response) => {
  const { studentId, category, title, description, amount, dueDate, semester, academicYear, creatorName, creatorRole } = req.body;
  if (!studentId || !title || !amount || !dueDate) {
    return res.status(400).json({ error: 'studentId, title, amount, and dueDate are required.' });
  }

  const student = usersStore.find((u) => u.id === studentId);
  const newFee = {
    id: `fee-${Date.now()}`,
    studentId,
    studentName: student?.name || 'Enrolled Student',
    studentRegNumber: student?.regNumber,
    semester: Number(semester) || student?.semester || 4,
    academicYear: academicYear || '2026-2027',
    category: category || 'TUITION',
    title,
    description: description || 'Mandatory university fees invoice.',
    amount: Number(amount),
    dueDate,
    status: 'PENDING'
  };

  feeStore.unshift(newFee as any);

  // Notify student & parents
  const now = new Date().toISOString();
  notificationsStore.unshift({
    id: `notif-${Date.now()}-newfee`,
    userId: studentId,
    title: 'New Fee Invoice Generated',
    message: `A new invoice of ₹${Number(amount).toLocaleString('en-IN')} for ${title} has been assigned to your account. Due: ${dueDate}.`,
    type: 'BILLING',
    createdAt: now,
    isRead: false
  });

  const linkedParents = usersStore.filter((u) => u.role === 'PARENT' && u.childStudentIds?.includes(studentId));
  linkedParents.forEach((parent) => {
    notificationsStore.unshift({
      id: `notif-${Date.now()}-newfee-par-${parent.id}`,
      userId: parent.id,
      title: 'New Student Fee Invoice',
      message: `An invoice of ₹${Number(amount).toLocaleString('en-IN')} for ${title} was generated for your ward ${student?.name || 'Student'}. Due: ${dueDate}.`,
      type: 'BILLING',
      createdAt: now,
      isRead: false
    });
  });

  addAuditLog(
    creatorName || 'Admin',
    creatorRole || 'ADMIN',
    'FEE_INVOICE_CREATED',
    `Created fee invoice ${title} of ₹${Number(amount).toLocaleString('en-IN')} for student ${student?.name || studentId}`
  );

  res.status(201).json({ success: true, fee: newFee });
});

// =========================================================================
// CONTROLLED PROFILE MANAGEMENT & APPROVAL WORKFLOW API ENDPOINTS
// =========================================================================

// 1. GET Current User Profile + Pending Requests
app.get('/api/profile/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || req.query.userId as string;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required. Missing user identity header.' });
  }

  const user = usersStore.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const pendingRequest = profileChangeRequestsStore.find(
    (r) => r.userId === userId && r.status === 'PENDING'
  );

  const history = profileChangeRequestsStore.filter((r) => r.userId === userId);

  res.json({
    user,
    pendingRequest: pendingRequest || null,
    history
  });
});

// 2. Submit Profile Change Request (Controlled: Student/Parent -> Class Teacher; Faculty -> Admin)
app.post('/api/profile/me/request', (req: Request, res: Response) => {
  const {
    userId,
    userRole,
    changes,
    pendingAvatarUrl,
    requestType = 'PROFILE_INFORMATION'
  } = req.body;

  if (!userId || !userRole) {
    return res.status(400).json({ error: 'User ID and Role are required.' });
  }

  const user = usersStore.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Prevent conflicting simultaneous pending requests
  const existingPending = profileChangeRequestsStore.find(
    (r) => r.userId === userId && r.status === 'PENDING'
  );
  if (existingPending) {
    return res.status(409).json({
      error: 'You already have a pending profile change request awaiting approval. Please wait for review or cancel your current request before submitting another.'
    });
  }

  // Validate changes against protected fields
  const protectedFields: Record<string, string[]> = {
    STUDENT: ['id', 'role', 'regNumber', 'classId', 'className', 'department', 'semester', 'gpa', 'cgpa', 'status', 'accountStatus'],
    PARENT: ['id', 'role', 'childStudentIds', 'status', 'accountStatus'],
    FACULTY: ['id', 'role', 'department', 'isClassTeacher', 'assignedClassId', 'assignedClassName', 'status', 'accountStatus'],
    ADMIN: ['id', 'role', 'status', 'accountStatus']
  };

  const roleProtected = protectedFields[userRole] || [];
  const proposedDetails: any[] = [];

  if (changes && typeof changes === 'object') {
    for (const [key, value] of Object.entries(changes)) {
      if (roleProtected.includes(key)) {
        return res.status(403).json({
          error: `Modification of institutional identity field '${key}' is prohibited. Only university administrators may adjust this record.`
        });
      }

      const oldValue = (user as any)[key] ? String((user as any)[key]) : '';
      const newValue = value !== undefined && value !== null ? String(value).trim() : '';

      if (oldValue !== newValue) {
        let fieldType = 'TEXT';
        if (key === 'email') fieldType = 'EMAIL';
        if (key === 'phone') fieldType = 'PHONE';
        if (key === 'dateOfBirth') fieldType = 'DATE';

        let label = key;
        if (key === 'name') label = 'Full Name';
        if (key === 'email') label = 'Email Address';
        if (key === 'phone') label = 'Mobile Number';
        if (key === 'address') label = 'Residential Address';
        if (key === 'designation') label = 'Academic Designation';
        if (key === 'emergencyContact') label = 'Emergency Contact';

        proposedDetails.push({
          fieldName: key,
          fieldLabel: label,
          oldValue,
          newValue,
          fieldType
        });
      }
    }
  }

  const hasAvatarChange = Boolean(pendingAvatarUrl && pendingAvatarUrl !== user.avatarUrl);
  if (hasAvatarChange) {
    proposedDetails.push({
      fieldName: 'avatarUrl',
      fieldLabel: 'Profile Photo',
      oldValue: user.avatarUrl || '',
      newValue: pendingAvatarUrl,
      fieldType: 'IMAGE'
    });
  }

  if (proposedDetails.length === 0) {
    return res.status(400).json({ error: 'No changes were detected in the submission.' });
  }

  // Determine Approval Routing automatically
  let approvalLevel: 'CLASS_TEACHER' | 'ADMIN' = 'ADMIN';
  let targetClassId: string | undefined = undefined;
  let targetClassName: string | undefined = undefined;
  let targetTeacherId: string | undefined = undefined;
  let targetTeacherName: string | undefined = undefined;
  let linkedChildId: string | undefined = undefined;
  let linkedChildName: string | undefined = undefined;

  if (userRole === 'STUDENT') {
    approvalLevel = 'CLASS_TEACHER';
    targetClassId = user.classId;
    targetClassName = user.className;

    // Resolve Class Teacher from assigned class
    const academicClass = classesStore.find((c) => c.id === user.classId);
    if (academicClass) {
      targetTeacherId = academicClass.classTeacherId;
      targetTeacherName = academicClass.classTeacherName;
    } else {
      // Fallback to first class teacher in mock
      const defaultTeacher = usersStore.find((u) => u.isClassTeacher);
      targetTeacherId = defaultTeacher?.id || 'usr-fac-elankavi';
      targetTeacherName = defaultTeacher?.name || 'Dr. R. Elankavi';
    }
  } else if (userRole === 'PARENT') {
    approvalLevel = 'CLASS_TEACHER';
    if (user.childStudentIds && user.childStudentIds.length > 0) {
      linkedChildId = user.childStudentIds[0];
      const child = usersStore.find((u) => u.id === linkedChildId);
      if (child) {
        linkedChildName = child.name;
        targetClassId = child.classId;
        targetClassName = child.className;
        const academicClass = classesStore.find((c) => c.id === child.classId);
        if (academicClass) {
          targetTeacherId = academicClass.classTeacherId;
          targetTeacherName = academicClass.classTeacherName;
        }
      }
    }

    if (!targetTeacherId) {
      const defaultTeacher = usersStore.find((u) => u.isClassTeacher);
      targetTeacherId = defaultTeacher?.id || 'usr-fac-elankavi';
      targetTeacherName = defaultTeacher?.name || 'Dr. R. Elankavi';
    }
  } else if (userRole === 'FACULTY') {
    approvalLevel = 'ADMIN';
  } else if (userRole === 'ADMIN') {
    // Administrator direct edit bypass: apply immediately with audit
    proposedDetails.forEach((d) => {
      (user as any)[d.fieldName] = d.newValue;
    });
    if (hasAvatarChange) {
      user.avatarUrl = pendingAvatarUrl;
    }

    addAuditLog(
      user.name,
      'ADMIN',
      'ADMIN_PROFILE_UPDATE',
      `Admin ${user.name} directly updated profile fields: ${proposedDetails.map((d) => d.fieldName).join(', ')}`
    );

    return res.json({
      success: true,
      message: 'Profile updated immediately under institutional administrative authority.',
      user
    });
  }

  let finalRequestType: any = requestType;
  if (hasAvatarChange && proposedDetails.length > 1) {
    finalRequestType = 'PROFILE_INFORMATION_AND_IMAGE';
  } else if (hasAvatarChange) {
    finalRequestType = 'PROFILE_IMAGE';
  } else {
    finalRequestType = 'PROFILE_INFORMATION';
  }

  const requestId = `pcr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newRequest = {
    id: requestId,
    userId: user.id,
    userRole: user.role,
    userName: user.name,
    userEmail: user.email,
    requestType: finalRequestType,
    status: 'PENDING',
    approvalLevel,
    classId: targetClassId,
    className: targetClassName,
    classTeacherId: targetTeacherId,
    classTeacherName: targetTeacherName,
    childStudentId: linkedChildId,
    childStudentName: linkedChildName,
    proposedChanges: proposedDetails,
    currentAvatarUrl: user.avatarUrl,
    pendingAvatarUrl: hasAvatarChange ? pendingAvatarUrl : undefined,
    submittedAt: now,
    updatedAt: now
  };

  profileChangeRequestsStore.unshift(newRequest);

  // Notify Approver
  if (approvalLevel === 'CLASS_TEACHER' && targetTeacherId) {
    notificationsStore.unshift({
      id: `notif-${Date.now()}-ct-pcr`,
      userId: targetTeacherId,
      title: 'New Profile Change Request',
      message: `${user.name} (${user.role}) has submitted profile changes for your review and endorsement.`,
      type: 'SYSTEM',
      createdAt: now,
      isRead: false
    });
  } else if (approvalLevel === 'ADMIN') {
    const admins = usersStore.filter((u) => u.role === 'ADMIN');
    admins.forEach((admin) => {
      notificationsStore.unshift({
        id: `notif-${Date.now()}-adm-pcr-${admin.id}`,
        userId: admin.id,
        title: 'Faculty Profile Change Request',
        message: `Faculty member ${user.name} has submitted profile changes for administrative approval.`,
        type: 'SYSTEM',
        createdAt: now,
        isRead: false
      });
    });
  }

  // Audit event
  addAuditLog(
    user.name,
    user.role,
    hasAvatarChange ? 'PROFILE_IMAGE_CHANGE_SUBMITTED' : 'PROFILE_CHANGE_SUBMITTED',
    `Submitted profile change request (${requestId}) for approval by ${approvalLevel}`
  );

  res.status(201).json({
    success: true,
    message: `Your profile change request has been submitted to your ${approvalLevel === 'CLASS_TEACHER' ? 'Class Teacher' : 'Administrator'} for review. Current profile remains active until approved.`,
    request: newRequest
  });
});

// 3. Cancel Pending Request by Applicant
app.post('/api/profile/change-requests/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const targetReq = profileChangeRequestsStore.find((r) => r.id === id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Profile change request not found.' });
  }

  if (targetReq.userId !== userId) {
    return res.status(403).json({ error: 'You are not authorized to cancel this request.' });
  }

  if (targetReq.status !== 'PENDING') {
    return res.status(400).json({ error: `Cannot cancel request in ${targetReq.status} status.` });
  }

  targetReq.status = 'CANCELLED';
  targetReq.updatedAt = new Date().toISOString();

  addAuditLog(
    targetReq.userName,
    targetReq.userRole,
    'PROFILE_CHANGE_CANCELLED',
    `Applicant cancelled profile change request (${id})`
  );

  res.json({ success: true, message: 'Request cancelled successfully.', request: targetReq });
});

// 4. Class Teacher: Get assigned pending and historical profile requests
app.get('/api/class-teacher/profile-change-requests', (req: Request, res: Response) => {
  const teacherId = req.headers['x-user-id'] as string || req.query.teacherId as string;
  if (!teacherId) {
    return res.status(401).json({ error: 'Teacher authentication required.' });
  }

  const teacher = usersStore.find((u) => u.id === teacherId);
  if (!teacher || teacher.role !== 'FACULTY') {
    return res.status(403).json({ error: 'Access restricted to authorized faculty members.' });
  }

  // Requests assigned to this class teacher or belonging to students/parents of their class
  const assignedRequests = profileChangeRequestsStore.filter(
    (r) =>
      r.approvalLevel === 'CLASS_TEACHER' &&
      (r.classTeacherId === teacherId ||
       (teacher.assignedClassId && r.classId === teacher.assignedClassId) ||
       teacher.isClassTeacher)
  );

  res.json(assignedRequests);
});

// 5. Class Teacher: Approve Profile Change Request (Atomic Transaction)
app.post('/api/class-teacher/profile-change-requests/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { teacherId, teacherName } = req.body;

  const targetReq = profileChangeRequestsStore.find((r) => r.id === id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Profile change request not found.' });
  }

  if (targetReq.status !== 'PENDING') {
    return res.status(409).json({ error: `Conflict: This request is already ${targetReq.status}.` });
  }

  const teacher = usersStore.find((u) => u.id === teacherId);
  if (!teacher || teacher.role !== 'FACULTY') {
    return res.status(403).json({ error: 'Unauthorized: Only authorized faculty may approve class requests.' });
  }

  const targetUser = usersStore.find((u) => u.id === targetReq.userId);
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user record not found.' });
  }

  // ATOMIC COMMIT: Apply all approved proposed changes
  const now = new Date().toISOString();
  targetReq.proposedChanges.forEach((change: any) => {
    (targetUser as any)[change.fieldName] = change.newValue;
    // Log individual field update
    addAuditLog(
      teacherName || teacher.name,
      'CLASS_TEACHER',
      'PROFILE_UPDATED',
      `Field '${change.fieldName}' updated for ${targetUser.name} (${targetUser.role}): '${change.oldValue}' -> '${change.newValue}'`
    );
  });

  if (targetReq.pendingAvatarUrl) {
    targetUser.avatarUrl = targetReq.pendingAvatarUrl;
    addAuditLog(
      teacherName || teacher.name,
      'CLASS_TEACHER',
      'PROFILE_IMAGE_UPDATED',
      `Activated new profile photo for ${targetUser.name}`
    );
  }

  targetReq.status = 'APPROVED';
  targetReq.reviewedBy = teacherName || teacher.name;
  targetReq.reviewerId = teacherId;
  targetReq.reviewerRole = 'CLASS_TEACHER';
  targetReq.reviewedAt = now;
  targetReq.updatedAt = now;

  // In-app Notification to applicant
  notificationsStore.unshift({
    id: `notif-${Date.now()}-pcr-approved`,
    userId: targetUser.id,
    title: 'Profile Changes Approved',
    message: `Your profile change request has been reviewed and approved by Class Teacher ${teacherName || teacher.name}. Your active profile has been updated.`,
    type: 'SYSTEM',
    createdAt: now,
    isRead: false
  });

  res.json({
    success: true,
    message: 'Profile change request endorsed and activated successfully.',
    request: targetReq,
    updatedUser: targetUser
  });
});

// 6. Class Teacher: Reject Profile Change Request
app.post('/api/class-teacher/profile-change-requests/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { teacherId, teacherName, reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A mandatory rejection reason must be specified.' });
  }

  const targetReq = profileChangeRequestsStore.find((r) => r.id === id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Profile change request not found.' });
  }

  if (targetReq.status !== 'PENDING') {
    return res.status(409).json({ error: `Conflict: This request is already ${targetReq.status}.` });
  }

  const now = new Date().toISOString();
  targetReq.status = 'REJECTED';
  targetReq.reviewedBy = teacherName || 'Class Teacher';
  targetReq.reviewerId = teacherId;
  targetReq.reviewerRole = 'CLASS_TEACHER';
  targetReq.rejectionReason = reason.trim();
  targetReq.reviewedAt = now;
  targetReq.updatedAt = now;

  addAuditLog(
    teacherName || 'Class Teacher',
    'CLASS_TEACHER',
    'PROFILE_CHANGE_REJECTED',
    `Rejected profile change request (${id}) for ${targetReq.userName}. Reason: ${reason}`
  );

  notificationsStore.unshift({
    id: `notif-${Date.now()}-pcr-rejected`,
    userId: targetReq.userId,
    title: 'Profile Change Request Declined',
    message: `Your profile update was declined by the Class Teacher. Reason: ${reason}`,
    type: 'SYSTEM',
    createdAt: now,
    isRead: false
  });

  res.json({
    success: true,
    message: 'Profile change request declined.',
    request: targetReq
  });
});

// 7. Admin: Get all profile change requests (Faculty queue + institutional overview)
app.get('/api/admin/profile-change-requests', (req: Request, res: Response) => {
  res.json(profileChangeRequestsStore);
});

// 8. Admin: Approve Faculty Profile Request
app.post('/api/admin/profile-change-requests/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminId, adminName } = req.body;

  const targetReq = profileChangeRequestsStore.find((r) => r.id === id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Profile change request not found.' });
  }

  if (targetReq.status !== 'PENDING') {
    return res.status(409).json({ error: `Conflict: This request is already ${targetReq.status}.` });
  }

  const targetUser = usersStore.find((u) => u.id === targetReq.userId);
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user record not found.' });
  }

  const now = new Date().toISOString();
  targetReq.proposedChanges.forEach((change: any) => {
    (targetUser as any)[change.fieldName] = change.newValue;
    addAuditLog(
      adminName || 'Admin',
      'ADMIN',
      'PROFILE_UPDATED',
      `Field '${change.fieldName}' updated for ${targetUser.name} (${targetUser.role}): '${change.oldValue}' -> '${change.newValue}'`
    );
  });

  if (targetReq.pendingAvatarUrl) {
    targetUser.avatarUrl = targetReq.pendingAvatarUrl;
    addAuditLog(
      adminName || 'Admin',
      'ADMIN',
      'PROFILE_IMAGE_UPDATED',
      `Activated new profile photo for ${targetUser.name}`
    );
  }

  targetReq.status = 'APPROVED';
  targetReq.reviewedBy = adminName || 'Administrator';
  targetReq.reviewerId = adminId;
  targetReq.reviewerRole = 'ADMIN';
  targetReq.reviewedAt = now;
  targetReq.updatedAt = now;

  notificationsStore.unshift({
    id: `notif-${Date.now()}-adm-pcr-approved`,
    userId: targetUser.id,
    title: 'Profile Changes Approved',
    message: `Your profile change request has been reviewed and approved by Institutional Administration. Your active profile has been updated.`,
    type: 'SYSTEM',
    createdAt: now,
    isRead: false
  });

  res.json({
    success: true,
    message: 'Profile changes approved and applied successfully.',
    request: targetReq,
    updatedUser: targetUser
  });
});

// 9. Admin: Reject Faculty Profile Request
app.post('/api/admin/profile-change-requests/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminId, adminName, reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A mandatory rejection reason must be specified.' });
  }

  const targetReq = profileChangeRequestsStore.find((r) => r.id === id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Profile change request not found.' });
  }

  if (targetReq.status !== 'PENDING') {
    return res.status(409).json({ error: `Conflict: This request is already ${targetReq.status}.` });
  }

  const now = new Date().toISOString();
  targetReq.status = 'REJECTED';
  targetReq.reviewedBy = adminName || 'Administrator';
  targetReq.reviewerId = adminId;
  targetReq.reviewerRole = 'ADMIN';
  targetReq.rejectionReason = reason.trim();
  targetReq.reviewedAt = now;
  targetReq.updatedAt = now;

  addAuditLog(
    adminName || 'Administrator',
    'ADMIN',
    'PROFILE_CHANGE_REJECTED',
    `Rejected profile change request (${id}) for ${targetReq.userName}. Reason: ${reason}`
  );

  notificationsStore.unshift({
    id: `notif-${Date.now()}-pcr-adm-rejected`,
    userId: targetReq.userId,
    title: 'Profile Change Request Declined',
    message: `Your profile update was declined by Institutional Administration. Reason: ${reason}`,
    type: 'SYSTEM',
    createdAt: now,
    isRead: false
  });

  res.json({
    success: true,
    message: 'Profile change request declined.',
    request: targetReq
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
