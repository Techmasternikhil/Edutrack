import {
  User,
  Course,
  CourseMaterial,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  AttendanceRecord,
  Notification,
  AuditLog,
  ParentReview
} from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Arthur Mitchell',
    email: 'admin@edutrack.edu',
    role: 'ADMIN',
    department: 'University Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-1',
    name: 'Prof. Evelyn Reed',
    email: 'evelyn.reed@edutrack.edu',
    role: 'FACULTY',
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.edutrack.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    regNumber: 'CS-2024-041',
    semester: 4,
    gpa: 3.82,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-2',
    name: 'Sophia Chen',
    email: 'sophia.chen@student.edutrack.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    regNumber: 'CS-2024-042',
    semester: 4,
    gpa: 3.91,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-1',
    name: 'Raveendra',
    email: 'raveendra@edutrack.edu',
    role: 'PARENT',
    childStudentIds: ['usr-stu-1'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-2',
    name: 'David Chen',
    email: 'david.chen@outlook.com',
    role: 'PARENT',
    childStudentIds: ['usr-stu-2'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const mockCourses: Course[] = [
  {
    id: 'crs-1',
    code: 'CS-301',
    title: 'Distributed Cloud Architectures',
    description: 'Design, scalability, replication, consensus algorithms, and microservices.',
    department: 'Computer Science',
    credits: 4,
    semester: 4,
    facultyId: 'usr-fac-1',
    facultyName: 'Prof. Evelyn Reed',
    enrolledStudentsCount: 42,
    maxCapacity: 50,
    schedule: 'Mon / Wed 10:00 AM - 11:30 AM',
    room: 'Hall B-204'
  },
  {
    id: 'crs-2',
    code: 'CS-305',
    title: 'Advanced Database Systems',
    description: 'Query optimization, indexing, transaction isolation, and Oracle SQL internals.',
    department: 'Computer Science',
    credits: 4,
    semester: 4,
    facultyId: 'usr-fac-1',
    facultyName: 'Prof. Evelyn Reed',
    enrolledStudentsCount: 38,
    maxCapacity: 45,
    schedule: 'Tue / Thu 02:00 PM - 03:30 PM',
    room: 'Lab C-101'
  },
  {
    id: 'crs-3',
    code: 'MATH-202',
    title: 'Applied Discrete Mathematics & Graph Theory',
    description: 'Combinatorics, graphs, trees, boolean algebra, and algorithmic problem solving.',
    department: 'Mathematics',
    credits: 3,
    semester: 4,
    facultyId: 'usr-fac-1',
    facultyName: 'Prof. Evelyn Reed',
    enrolledStudentsCount: 46,
    maxCapacity: 60,
    schedule: 'Fri 09:00 AM - 12:00 PM',
    room: 'Auditorium 1'
  }
];

export const mockCourseMaterials: CourseMaterial[] = [
  {
    id: 'mat-1',
    courseId: 'crs-1',
    title: 'Lecture 01 - Cloud Native Systems & Raft Consensus.pdf',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    uploadedAt: '2026-08-20',
    url: '#'
  },
  {
    id: 'mat-2',
    courseId: 'crs-2',
    title: 'Oracle DDL & B-Tree Index Optimization Guide.pdf',
    fileType: 'PDF',
    fileSize: '6.1 MB',
    uploadedAt: '2026-08-25',
    url: '#'
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: 'asg-1',
    courseId: 'crs-1',
    courseCode: 'CS-301',
    title: 'Implement Distributed Leader Election with Heartbeats',
    description: 'Build a simplified Raft heartbeat mechanism with failover recovery in Node.js or Java.',
    deadline: '2026-10-05',
    totalMarks: 100,
    createdAt: '2026-09-01'
  },
  {
    id: 'asg-2',
    courseId: 'crs-2',
    courseCode: 'CS-305',
    title: 'Oracle SQL Execution Plan Analysis & Tuning',
    description: 'Optimize queries with EXPLAIN PLAN and create functional compound indexes on 1M rows.',
    deadline: '2026-10-12',
    totalMarks: 50,
    createdAt: '2026-09-05'
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-1',
    assignmentTitle: 'Implement Distributed Leader Election with Heartbeats',
    courseCode: 'CS-301',
    studentId: 'usr-stu-1',
    studentName: 'Alex Rivera',
    submittedAt: '2026-09-18T14:22:00Z',
    fileName: 'AlexRivera_CS301_RaftElection.zip',
    status: 'GRADED',
    marksObtained: 94,
    feedback: 'Outstanding consensus failure simulation and robust timeout logic.'
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-2',
    assignmentTitle: 'Oracle SQL Execution Plan Analysis & Tuning',
    courseCode: 'CS-305',
    studentId: 'usr-stu-1',
    studentName: 'Alex Rivera',
    submittedAt: '2026-09-22T09:15:00Z',
    fileName: 'AlexRivera_QueryOptimization_Report.pdf',
    status: 'PENDING'
  },
  {
    id: 'sub-3',
    assignmentId: 'asg-1',
    assignmentTitle: 'Implement Distributed Leader Election with Heartbeats',
    courseCode: 'CS-301',
    studentId: 'usr-stu-2',
    studentName: 'Sophia Chen',
    submittedAt: '2026-09-19T11:05:00Z',
    fileName: 'SophiaChen_Consensus_Lab.zip',
    status: 'GRADED',
    marksObtained: 98,
    feedback: 'Flawless edge case handling and documentation.'
  }
];

export const mockQuizzes: Quiz[] = [
  {
    id: 'qz-1',
    courseId: 'crs-1',
    courseCode: 'CS-301',
    title: 'Distributed Systems & CAP Theorem Checkpoint',
    description: 'Test your understanding of Consistency, Availability, Partition tolerance and Raft states.',
    durationMinutes: 20,
    totalMarks: 20,
    createdAt: '2026-09-10',
    isPublished: true,
    questions: [
      {
        id: 'q-1',
        question: 'According to the CAP theorem, what happens during a network partition in a CP system?',
        options: [
          'The system sacrifices partition tolerance to retain consistency',
          'The system maintains consistency but some nodes become unavailable',
          'The system remains 100% available without any read restrictions',
          'All nodes self-terminate'
        ],
        correctOptionIndex: 1,
        marks: 5
      },
      {
        id: 'q-2',
        question: 'In the Raft consensus algorithm, which component sends regular heartbeats?',
        options: ['Follower', 'Candidate', 'Leader', 'Auditor'],
        correctOptionIndex: 2,
        marks: 5
      },
      {
        id: 'q-3',
        question: 'Which isolation level prevents Dirty Reads and Non-repeatable Reads in relational databases?',
        options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'None of the above'],
        correctOptionIndex: 2,
        marks: 5
      },
      {
        id: 'q-4',
        question: 'What is the primary benefit of a B-Tree index in relational databases?',
        options: [
          'Ensures linear O(N) lookup time',
          'Provides logarithmic O(log N) search and balanced leaf traversal',
          'Removes need for disk writes',
          'Compresses tables automatically'
        ],
        correctOptionIndex: 1,
        marks: 5
      }
    ]
  }
];

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: 'qa-1',
    quizId: 'qz-1',
    quizTitle: 'Distributed Systems & CAP Theorem Checkpoint',
    studentId: 'usr-stu-1',
    studentName: 'Alex Rivera',
    score: 20,
    totalMarks: 20,
    answers: { 'q-1': 1, 'q-2': 2, 'q-3': 2, 'q-4': 1 },
    submittedAt: '2026-09-15T15:40:00Z',
    timeTakenSeconds: 740
  },
  {
    id: 'qa-2',
    quizId: 'qz-1',
    quizTitle: 'Distributed Systems & CAP Theorem Checkpoint',
    studentId: 'usr-stu-2',
    studentName: 'Sophia Chen',
    score: 20,
    totalMarks: 20,
    answers: { 'q-1': 1, 'q-2': 2, 'q-3': 2, 'q-4': 1 },
    submittedAt: '2026-09-15T16:10:00Z',
    timeTakenSeconds: 610
  }
];

export const mockAttendance: AttendanceRecord[] = [
  { id: 'att-1', courseId: 'crs-1', courseCode: 'CS-301', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-2', courseId: 'crs-1', courseCode: 'CS-301', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-10', status: 'PRESENT' },
  { id: 'att-3', courseId: 'crs-1', courseCode: 'CS-301', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-15', status: 'LATE' },
  { id: 'att-4', courseId: 'crs-1', courseCode: 'CS-301', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-17', status: 'PRESENT' },
  { id: 'att-5', courseId: 'crs-1', courseCode: 'CS-301', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-22', status: 'PRESENT' },
  { id: 'att-6', courseId: 'crs-2', courseCode: 'CS-305', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-09', status: 'PRESENT' },
  { id: 'att-7', courseId: 'crs-2', courseCode: 'CS-305', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-11', status: 'ABSENT' },
  { id: 'att-8', courseId: 'crs-2', courseCode: 'CS-305', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-16', status: 'PRESENT' },
  { id: 'att-9', courseId: 'crs-2', courseCode: 'CS-305', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-18', status: 'PRESENT' },
  { id: 'att-10', courseId: 'crs-2', courseCode: 'CS-305', studentId: 'usr-stu-1', studentName: 'Alex Rivera', date: '2026-09-23', status: 'PRESENT' }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Assignment Graded',
    message: 'Prof. Evelyn Reed graded Alex Rivera\'s submission for CS-301: 94/100.',
    type: 'GRADE',
    createdAt: '2026-09-19T10:00:00Z',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Upcoming Assignment Deadline',
    message: 'CS-305 Oracle SQL Execution Plan Analysis is due on Oct 12, 2026.',
    type: 'ASSIGNMENT',
    createdAt: '2026-09-21T08:30:00Z',
    isRead: false
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-23T08:15:00Z',
    performedBy: 'parent.rivera@gmail.com',
    role: 'PARENT',
    action: 'PARENT_PORTAL_ACCESS',
    details: 'Viewed academic activity summary for student Alex Rivera (CS-2024-041)',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-22T14:30:00Z',
    performedBy: 'evelyn.reed@edutrack.edu',
    role: 'FACULTY',
    action: 'ASSIGNMENT_GRADE',
    details: 'Graded submission for Alex Rivera (Marks: 94)',
    ipAddress: '10.0.4.12'
  }
];

export const mockParentReviews: ParentReview[] = [
  {
    id: 'prev-1',
    parentId: 'usr-parent-1',
    parentName: 'Raveendra',
    studentId: 'usr-stu-1',
    studentName: 'Alex Rivera',
    courseId: 'crs-1',
    courseCode: 'CS-301',
    category: 'APPRECIATION',
    title: 'Great progress in Distributed Systems',
    message: 'Alex really enjoyed the Raft consensus simulation assignment. Thank you Prof. Reed for the detailed feedback!',
    status: 'ACKNOWLEDGED',
    facultyReply: 'Thank you Raveendra! Alex demonstrated exceptional insight into leader election failover scenarios.',
    createdAt: '2026-09-20T16:00:00Z'
  },
  {
    id: 'prev-2',
    parentId: 'usr-parent-1',
    parentName: 'Raveendra',
    studentId: 'usr-stu-1',
    studentName: 'Alex Rivera',
    courseId: 'crs-2',
    courseCode: 'CS-305',
    category: 'ATTENDANCE',
    title: 'Inquiry regarding absence on Sept 11',
    message: 'Alex had a medical appointment on Sept 11. I submitted the doctor slip to administration and wanted to ensure the attendance record was excused.',
    status: 'SUBMITTED',
    createdAt: '2026-09-22T10:15:00Z'
  }
];
