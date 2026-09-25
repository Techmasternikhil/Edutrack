export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  department?: string;
  avatarUrl?: string;
  // For parents: list of student IDs they monitor
  childStudentIds?: string[];
  // For students: student registration number
  regNumber?: string;
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

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  fileType?: string;
  fileSize?: string;
  type?: 'PDF' | 'VIDEO' | 'SLIDES' | 'LINK';
  uploadedAt: string;
  url?: string;
  fileUrl?: string;
  size?: string;
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

export interface AttendanceRecord {
  id: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  studentId: string;
  studentName?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
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
