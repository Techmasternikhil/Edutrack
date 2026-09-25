export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';

export type RegistrationStatus =
  | 'PENDING_TEACHER_REVIEW'
  | 'TEACHER_CONFIRMED'
  | 'PENDING_ADMIN_REVIEW'
  | 'APPROVED'
  | 'REJECTED_BY_TEACHER'
  | 'REJECTED_BY_ADMIN';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface AcademicClass {
  id: string;
  name?: string;
  className: string;
  section: string;
  academicYear: string;
  department: string;
  semester: number;
  classTeacherId: string;
  classTeacherName: string;
  classTeacherEmail: string;
}

export interface RegistrationRequest {
  id: string;
  userId: string;
  applicantName?: string;
  applicantEmail?: string;
  userName?: string;
  userEmail?: string;
  requestedRole: 'STUDENT' | 'PARENT' | 'FACULTY';
  classId?: string;
  className?: string;
  classSection?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  phone?: string;
  // Student specific
  regNumber?: string;
  studentRegNumber?: string;
  department?: string;
  // Parent specific
  studentId?: string;
  childName?: string;
  studentName?: string;
  relationship?: 'Father' | 'Mother' | 'Guardian' | string;
  status: RegistrationStatus;
  // Two-stage review tracking
  teacherReviewedBy?: string;
  teacherReviewedAt?: string;
  teacherReviewReason?: string;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  adminReviewReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  accountStatus?: AccountStatus;
  department?: string;
  avatarUrl?: string;
  phone?: string;
  // Class Teacher association for faculty
  isClassTeacher?: boolean;
  assignedClassId?: string;
  assignedClassName?: string;
  // For parents: list of student IDs they monitor
  childStudentIds?: string[];
  // For students: student registration number & class
  regNumber?: string;
  classId?: string;
  className?: string;
  gpa?: number;
  semester?: number;
  createdAt?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  credits: number;
  semester: number;
  facultyId: string;
  facultyName: string;
  enrolledStudentsCount: number;
  maxCapacity: number;
  schedule?: string;
  room?: string;
}

export type ResourceType = 'VIDEO' | 'YOUTUBE' | 'PDF' | 'PRESENTATION' | 'DOCUMENT' | 'EXTERNAL_LINK' | 'SLIDES' | 'LINK';
export type ResourceStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CourseMaterial {
  id: string;
  courseId: string;
  facultyId?: string;
  title: string;
  description?: string;
  fileType?: string;
  fileSize?: string;
  type?: ResourceType;
  uploadedAt: string;
  url?: string;
  fileUrl?: string;
  size?: string;
  moduleName?: string;
  status?: ResourceStatus;
  youtubeVideoId?: string;
  thumbnailUrl?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode?: string;
  title: string;
  description: string;
  deadline: string;
  totalMarks?: number;
  maxMarks?: number;
  createdAt: string;
  status?: 'DRAFT' | 'PUBLISHED';
  attachments?: string[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseCode?: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileName?: string;
  fileUrl?: string;
  status: 'PENDING' | 'GRADED';
  marksObtained?: number;
  feedback?: string;
}

export interface QuizQuestion {
  id: string;
  question?: string;
  text?: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseCode?: string;
  courseTitle?: string;
  title: string;
  description?: string;
  instructions?: string;
  durationMinutes: number;
  totalMarks: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  maxAttempts?: number;
  isPublished: boolean;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  answers: Record<string, number>;
  submittedAt: string;
  timeTakenSeconds: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  id: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  studentId: string;
  studentName?: string;
  date: string;
  status: AttendanceStatus;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'QUIZ' | 'GRADE' | 'ATTENDANCE' | 'SYSTEM' | 'PARENT_REVIEW';
  createdAt: string;
  isRead: boolean;
}

export type Notification = NotificationItem;

export interface AuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  role: UserRole | string;
  action: string;
  details: string;
  ipAddress: string;
}

export type ParentReviewCategory = 'GENERAL' | 'ACADEMIC_CONCERN' | 'ATTENDANCE' | 'APPRECIATION';
export type ParentReviewStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface ParentReview {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail?: string;
  studentId: string;
  studentName: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  category: ParentReviewCategory;
  title: string;
  message: string;
  status: ParentReviewStatus;
  facultyReply?: string;
  createdAt: string;
}

export interface ChildStudentMetrics extends User {
  attendancePercentage: number;
  attendanceRecords: AttendanceRecord[];
  submissions: Submission[];
  quizAttempts: QuizAttempt[];
  averageAssignmentScore: number;
}
