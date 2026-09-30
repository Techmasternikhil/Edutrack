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
  ParentReview,
  AcademicClass,
  RegistrationRequest,
  FeeRecord,
  ProfileChangeRequest
} from '../types';

export const mockAcademicClasses: AcademicClass[] = [
  {
    id: 'cls-cse-4-vii-a',
    className: 'B.Tech Computer Science and Engineering — Semester IV',
    section: 'Section VII / VII-A',
    academicYear: '2026-2027',
    department: 'CSE',
    program: 'CSE',
    semester: 4,
    semesterType: 'ODD',
    facultyAdvisorId: 'usr-fac-elankavi',
    facultyAdvisorName: 'Dr. R. Elankavi',
    classTeacherId: 'usr-fac-elankavi',
    classTeacherName: 'Dr. R. Elankavi',
    classTeacherEmail: 'elankavi@edutrack.edu',
    effectiveFrom: '2026-07-01'
  },
  {
    id: 'cls-cse-4a',
    className: 'B.Tech Computer Science — Semester 4',
    section: 'Section A',
    academicYear: '2026-2027',
    department: 'Computer Science',
    semester: 4,
    classTeacherId: 'usr-fac-sarika',
    classTeacherName: 'Dr. N. Sarika',
    classTeacherEmail: 'sarika@edutrack.edu'
  },
  {
    id: 'cls-cse-4b',
    className: 'B.Tech Computer Science — Semester 4',
    section: 'Section B',
    academicYear: '2026-2027',
    department: 'Computer Science',
    semester: 4,
    classTeacherId: 'usr-fac-1',
    classTeacherName: 'Prof. Ananya Sharma',
    classTeacherEmail: 'ananya.sharma@edutrack.edu'
  },
  {
    id: 'cls-it-6a',
    className: 'B.Tech Information Technology — Semester 6',
    section: 'Section A',
    academicYear: '2026-2027',
    department: 'Information Technology',
    semester: 6,
    classTeacherId: 'usr-fac-2',
    classTeacherName: 'Dr. Vikram Sarabhai',
    classTeacherEmail: 'vikram.sarabhai@edutrack.edu'
  }
];

export const mockRegistrationRequests: RegistrationRequest[] = [
  {
    id: 'reg-req-1',
    userId: 'usr-stu-pending-1',
    applicantName: 'Arun Kumar',
    applicantEmail: 'arun.kumar@student.edutrack.edu',
    userName: 'Arun Kumar',
    userEmail: 'arun.kumar@student.edutrack.edu',
    requestedRole: 'STUDENT',
    classId: 'cls-cse-4a',
    className: 'B.Tech Computer Science — Semester 4 (Sec A)',
    classSection: 'Section A',
    classTeacherId: 'usr-fac-1',
    classTeacherName: 'Prof. Ananya Sharma',
    regNumber: 'CS-2026-089',
    studentRegNumber: 'CS-2026-089',
    department: 'Computer Science',
    status: 'PENDING_TEACHER_REVIEW',
    createdAt: '2026-09-24T09:30:00Z'
  },
  {
    id: 'reg-req-2',
    userId: 'usr-parent-pending-1',
    applicantName: 'Raj Kumar',
    applicantEmail: 'raj.kumar@gmail.com',
    userName: 'Raj Kumar',
    userEmail: 'raj.kumar@gmail.com',
    requestedRole: 'PARENT',
    classId: 'cls-cse-4a',
    className: 'B.Tech Computer Science — Semester 4 (Sec A)',
    classSection: 'Section A',
    classTeacherId: 'usr-fac-1',
    classTeacherName: 'Prof. Ananya Sharma',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    childName: 'Aarav Sharma',
    relationship: 'Father',
    status: 'TEACHER_CONFIRMED',
    teacherReviewedBy: 'Prof. Ananya Sharma',
    teacherReviewedAt: '2026-09-24T14:15:00Z',
    teacherReviewReason: 'Verified parent relationship documents and student record matching.',
    createdAt: '2026-09-23T11:00:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Rajesh Verma',
    email: 'admin@edutrack.edu',
    role: 'ADMIN',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'University Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-elankavi',
    name: 'Dr. R. Elankavi',
    email: 'elankavi@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Associate Professor & Faculty Advisor',
    academicYear: '2026-2027',
    isFacultyAdvisor: true,
    isClassTeacher: true,
    assignedClassId: 'cls-cse-4-vii-a',
    assignedClassName: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-shobana',
    name: 'Dr. R. Shobana',
    email: 'shobana@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Assistant Professor',
    academicYear: '2026-2027',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-sarika',
    name: 'Dr. N. Sarika',
    email: 'sarika@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Associate Professor',
    academicYear: '2026-2027',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-gayathri',
    name: 'Mrs. Gayathri',
    email: 'gayathri@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Assistant Professor',
    academicYear: '2026-2027',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-rajesh',
    name: 'Dr. M. Rajesh',
    email: 'rajesh.faculty@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Associate Professor',
    academicYear: '2026-2027',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-saravanan',
    name: 'Mr. Saravanan',
    email: 'saravanan@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Assistant Professor',
    academicYear: '2026-2027',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-hcl',
    name: 'HCL Trainer',
    email: 'hcl.trainer@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Corporate Technical Trainer',
    academicYear: '2026-2027',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-fac-mentor',
    name: 'Respective Mentor',
    email: 'mentor@edutrack.edu',
    role: 'FACULTY',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    designation: 'Faculty Mentor',
    academicYear: '2026-2027',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  // 10 Official Students (All Indian Names)
  {
    id: 'usr-stu-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-041',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 8.12,
    cgpa: 8.12,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-2',
    name: 'Diya Patel',
    email: 'diya.patel@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-042',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 8.35,
    cgpa: 8.35,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-3',
    name: 'Rohan Iyer',
    email: 'rohan.iyer@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-043',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 7.78,
    cgpa: 7.78,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-4',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-044',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 8.24,
    cgpa: 8.24,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-5',
    name: 'Aditya Verma',
    email: 'aditya.verma@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-045',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 7.45,
    cgpa: 7.45,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-6',
    name: 'Pooja Sundaram',
    email: 'pooja.sundaram@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-046',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 8.42,
    cgpa: 8.42,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-7',
    name: 'Karthik Raman',
    email: 'karthik.raman@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-047',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 7.68,
    cgpa: 7.68,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-8',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-048',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 8.16,
    cgpa: 8.16,
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-9',
    name: 'Vikram Choudhury',
    email: 'vikram.choudhury@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-049',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 7.32,
    cgpa: 7.32,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-stu-10',
    name: 'Meera Nair',
    email: 'meera.nair@student.edutrack.edu',
    role: 'STUDENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    department: 'CSE',
    regNumber: 'CS-2024-050',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    semester: 4,
    gpa: 8.38,
    cgpa: 8.38,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },

  // 10 Corresponding Parents (All Indian Names)
  {
    id: 'usr-parent-1',
    name: 'Raveendra Sharma',
    email: 'raveendra.sharma@edutrack.edu',
    phone: '+91 98401 23451',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-1'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-2',
    name: 'Suresh Patel',
    email: 'suresh.patel@gmail.com',
    phone: '+91 98401 23452',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-2'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-3',
    name: 'Subramanian Iyer',
    email: 'subramanian.iyer@gmail.com',
    phone: '+91 98401 23453',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-3'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-4',
    name: 'Rajesh Deshmukh',
    email: 'rajesh.deshmukh@gmail.com',
    phone: '+91 98401 23454',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-4'],
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-5',
    name: 'Manoj Verma',
    email: 'manoj.verma@gmail.com',
    phone: '+91 98401 23455',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-5'],
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-6',
    name: 'Gopal Sundaram',
    email: 'gopal.sundaram@gmail.com',
    phone: '+91 98401 23456',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-6'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-7',
    name: 'Venkatesh Raman',
    email: 'venkatesh.raman@gmail.com',
    phone: '+91 98401 23457',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-7'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-8',
    name: 'Anand Kulkarni',
    email: 'anand.kulkarni@gmail.com',
    phone: '+91 98401 23458',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-8'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-9',
    name: 'Debashis Choudhury',
    email: 'debashis.choudhury@gmail.com',
    phone: '+91 98401 23459',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-9'],
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-parent-10',
    name: 'Balachandran Nair',
    email: 'balachandran.nair@gmail.com',
    phone: '+91 98401 23460',
    role: 'PARENT',
    status: 'APPROVED',
    accountStatus: 'ACTIVE',
    childStudentIds: ['usr-stu-10'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const mockCourses: Course[] = [
  {
    id: 'crs-cns',
    code: '34421109',
    mnemonic: 'CNS',
    title: 'Cryptography and Network Security',
    description: 'Classical ciphers, public-key cryptosystems, cryptographic hash functions, digital signatures, authentication protocols, and network attack defense.',
    department: 'CSE',
    credits: 3,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Theory',
    facultyId: 'usr-fac-hcl',
    facultyName: 'HCL Trainer',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Mon P6, Tue P4, Thu P1',
    room: 'TBC101'
  },
  {
    id: 'crs-se',
    code: '35021C13',
    mnemonic: 'SE',
    title: 'Software Engineering',
    description: 'Software development lifecycle models, agile methodologies, requirements engineering, architectural design patterns, software testing, and quality assurance.',
    department: 'CSE',
    credits: 3,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Theory',
    facultyId: 'usr-fac-sarika',
    facultyName: 'Dr. N. Sarika',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Wed P6, Thu P2, Fri P5',
    room: 'TBC101'
  },
  {
    id: 'crs-psp',
    code: '35021C12',
    mnemonic: 'PSP(T+P)',
    title: 'Problem Solving Using Python Programming',
    description: 'Algorithmic problem solving, Python programming constructs, data structures, OOP principles, and hands-on laboratory implementation.',
    department: 'CSE',
    credits: 4,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Theory + Practical',
    facultyId: 'usr-fac-elankavi',
    facultyName: 'Dr. R. Elankavi',
    coFaculties: [
      {
        facultyId: 'usr-fac-shobana',
        facultyName: 'Dr. R. Shobana',
        role: 'CO_FACULTY'
      }
    ],
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Mon P4(T), Tue P2(T), Wed P4(P), Thu P4(T), Fri P1-P2(P)',
    room: 'NEC LAB'
  },
  {
    id: 'crs-dl',
    code: '35021P13',
    mnemonic: 'DL',
    title: 'Deep Learning',
    description: 'Neural network architectures, backpropagation algorithms, convolutional neural networks, recurrent sequence models, optimization, and generative models.',
    department: 'CSE',
    credits: 3,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Theory',
    facultyId: 'usr-fac-hcl',
    facultyName: 'HCL Trainer',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Mon P1, Tue P1, Wed P5',
    room: 'TBC101'
  },
  {
    id: 'crs-os',
    code: '35021C19',
    mnemonic: 'OS(T+P)',
    title: 'Operating System Theory and Practical',
    description: 'Process management, thread concurrency, CPU scheduling algorithms, memory virtualization, paging, storage systems, and kernel programming laboratory.',
    department: 'CSE',
    credits: 4,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Theory + Practical',
    facultyId: 'usr-fac-gayathri',
    facultyName: 'Mrs. Gayathri',
    coFaculties: [
      {
        facultyId: 'usr-fac-rajesh',
        facultyName: 'Dr. M. Rajesh',
        role: 'CO_FACULTY'
      }
    ],
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Mon P5(T), Tue P3(T), Wed P2(T)-P3(P)',
    room: 'IOT LAB'
  },
  {
    id: 'crs-ir',
    code: '34421002',
    mnemonic: 'IR',
    title: 'Industrial Robotics',
    description: 'Kinematics, dynamics, robotic manipulators, sensors, end-effectors, actuator control systems, and industrial automated manufacturing.',
    department: 'CSE',
    credits: 3,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Theory',
    facultyId: 'usr-fac-saravanan',
    facultyName: 'Mr. Saravanan',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Wed P1, Thu P3, Thu P5',
    room: 'TBC101'
  },
  {
    id: 'crs-mini-pro',
    code: '35021M81',
    mnemonic: 'MINI PRO',
    title: 'Mini Project',
    description: 'Industry-oriented software engineering capstone design, requirements analysis, system architecture, prototyping, deployment, and viva evaluation.',
    department: 'CSE',
    credits: 3,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Project',
    facultyId: 'usr-fac-sarika',
    facultyName: 'Dr. N. Sarika',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Tue P5-P6, Fri P3-P4',
    room: 'INTEL LAB'
  },
  {
    id: 'crs-sem',
    mnemonic: 'SEM',
    title: 'Seminar',
    description: 'Technical literature review, state-of-the-art research presentation, oral communication, and technical report drafting.',
    department: 'CSE',
    credits: 0,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Seminar',
    facultyId: 'usr-fac-elankavi',
    facultyName: 'Dr. R. Elankavi',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Thu P6',
    room: 'TBC101'
  },
  {
    id: 'crs-mentor',
    mnemonic: 'MENTOR',
    title: 'Mentor',
    description: 'One-on-one student academic mentoring, career counseling, professional ethics, personal development, and grievance guidance.',
    department: 'CSE',
    credits: 0,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Mentoring',
    facultyId: 'usr-fac-mentor',
    facultyName: 'Respective Mentor',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Fri P6',
    room: 'TBC101'
  },
  {
    id: 'crs-cc-ecc',
    code: '21SEMNR',
    mnemonic: 'CC/ECC',
    title: 'Curricular/Extra-Curricular',
    description: 'Co-curricular participation, university clubs, professional societies, cultural events, sports activities, and community outreach programs.',
    department: 'CSE',
    credits: 0,
    semester: 4,
    academicYear: '2026-2027',
    section: 'Section VII / VII-A',
    subjectType: 'Extra-Curricular',
    facultyId: '',
    facultyName: 'Unassigned',
    enrolledStudentsCount: 65,
    maxCapacity: 70,
    schedule: 'Mon P2, Mon P3',
    room: 'TBC101'
  }
];

export const mockTimetableSlots = [
  // Monday
  { id: 'tt-mon-1', day: 'Monday', period: 1, courseMnemonic: 'DL', courseCode: '35021P13', courseTitle: 'Deep Learning', room: 'TBC101', facultyNames: ['HCL Trainer'] },
  { id: 'tt-mon-2', day: 'Monday', period: 2, courseMnemonic: 'CC/ECC', courseCode: '21SEMNR', courseTitle: 'Curricular/Extra-Curricular', room: 'TBC101', facultyNames: [] },
  { id: 'tt-mon-3', day: 'Monday', period: 3, courseMnemonic: 'CC/ECC', courseCode: '21SEMNR', courseTitle: 'Curricular/Extra-Curricular', room: 'TBC101', facultyNames: [] },
  { id: 'tt-mon-4', day: 'Monday', period: 4, courseMnemonic: 'PSP(T)', courseCode: '35021C12', courseTitle: 'Problem Solving Using Python Programming', room: 'NEC LAB', facultyNames: ['Dr. R. Elankavi', 'Dr. R. Shobana'] },
  { id: 'tt-mon-5', day: 'Monday', period: 5, courseMnemonic: 'OS(T)', courseCode: '35021C19', courseTitle: 'Operating System Theory and Practical', room: 'IOT LAB', facultyNames: ['Mrs. Gayathri', 'Dr. M. Rajesh'] },
  { id: 'tt-mon-6', day: 'Monday', period: 6, courseMnemonic: 'CNS', courseCode: '34421109', courseTitle: 'Cryptography and Network Security', room: 'TBC101', facultyNames: ['HCL Trainer'] },

  // Tuesday
  { id: 'tt-tue-1', day: 'Tuesday', period: 1, courseMnemonic: 'DL', courseCode: '35021P13', courseTitle: 'Deep Learning', room: 'TBC101', facultyNames: ['HCL Trainer'] },
  { id: 'tt-tue-2', day: 'Tuesday', period: 2, courseMnemonic: 'PSP(T)', courseCode: '35021C12', courseTitle: 'Problem Solving Using Python Programming', room: 'NEC LAB', facultyNames: ['Dr. R. Elankavi', 'Dr. R. Shobana'] },
  { id: 'tt-tue-3', day: 'Tuesday', period: 3, courseMnemonic: 'OS(T)', courseCode: '35021C19', courseTitle: 'Operating System Theory and Practical', room: 'IOT LAB', facultyNames: ['Mrs. Gayathri', 'Dr. M. Rajesh'] },
  { id: 'tt-tue-4', day: 'Tuesday', period: 4, courseMnemonic: 'CNS', courseCode: '34421109', courseTitle: 'Cryptography and Network Security', room: 'TBC101', facultyNames: ['HCL Trainer'] },
  { id: 'tt-tue-5', day: 'Tuesday', period: 5, courseMnemonic: 'MINI PRO', courseCode: '35021M81', courseTitle: 'Mini Project', room: 'INTEL LAB', facultyNames: ['Dr. N. Sarika'] },
  { id: 'tt-tue-6', day: 'Tuesday', period: 6, courseMnemonic: 'MINI PRO', courseCode: '35021M81', courseTitle: 'Mini Project', room: 'INTEL LAB', facultyNames: ['Dr. N. Sarika'] },

  // Wednesday
  { id: 'tt-wed-1', day: 'Wednesday', period: 1, courseMnemonic: 'IR', courseCode: '34421002', courseTitle: 'Industrial Robotics', room: 'TBC101', facultyNames: ['Mr. Saravanan'] },
  { id: 'tt-wed-2', day: 'Wednesday', period: 2, courseMnemonic: 'OS(T)', courseCode: '35021C19', courseTitle: 'Operating System Theory and Practical', room: 'IOT LAB', facultyNames: ['Mrs. Gayathri', 'Dr. M. Rajesh'] },
  { id: 'tt-wed-3', day: 'Wednesday', period: 3, courseMnemonic: 'OS(P)', courseCode: '35021C19', courseTitle: 'Operating System Theory and Practical', room: 'IOT LAB', facultyNames: ['Mrs. Gayathri', 'Dr. M. Rajesh'] },
  { id: 'tt-wed-4', day: 'Wednesday', period: 4, courseMnemonic: 'PSP(P)', courseCode: '35021C12', courseTitle: 'Problem Solving Using Python Programming', room: 'NEC LAB', facultyNames: ['Dr. R. Elankavi', 'Dr. R. Shobana'] },
  { id: 'tt-wed-5', day: 'Wednesday', period: 5, courseMnemonic: 'DL', courseCode: '35021P13', courseTitle: 'Deep Learning', room: 'TBC101', facultyNames: ['HCL Trainer'] },
  { id: 'tt-wed-6', day: 'Wednesday', period: 6, courseMnemonic: 'SE', courseCode: '35021C13', courseTitle: 'Software Engineering', room: 'TBC101', facultyNames: ['Dr. N. Sarika'] },

  // Thursday
  { id: 'tt-thu-1', day: 'Thursday', period: 1, courseMnemonic: 'CNS', courseCode: '34421109', courseTitle: 'Cryptography and Network Security', room: 'TBC101', facultyNames: ['HCL Trainer'] },
  { id: 'tt-thu-2', day: 'Thursday', period: 2, courseMnemonic: 'SE', courseCode: '35021C13', courseTitle: 'Software Engineering', room: 'TBC101', facultyNames: ['Dr. N. Sarika'] },
  { id: 'tt-thu-3', day: 'Thursday', period: 3, courseMnemonic: 'IR', courseCode: '34421002', courseTitle: 'Industrial Robotics', room: 'TBC101', facultyNames: ['Mr. Saravanan'] },
  { id: 'tt-thu-4', day: 'Thursday', period: 4, courseMnemonic: 'PSP(T)', courseCode: '35021C12', courseTitle: 'Problem Solving Using Python Programming', room: 'NEC LAB', facultyNames: ['Dr. R. Elankavi', 'Dr. R. Shobana'] },
  { id: 'tt-thu-5', day: 'Thursday', period: 5, courseMnemonic: 'IR', courseCode: '34421002', courseTitle: 'Industrial Robotics', room: 'TBC101', facultyNames: ['Mr. Saravanan'] },
  { id: 'tt-thu-6', day: 'Thursday', period: 6, courseMnemonic: 'SEM', courseTitle: 'Seminar', room: 'TBC101', facultyNames: ['Dr. R. Elankavi'] },

  // Friday
  { id: 'tt-fri-1', day: 'Friday', period: 1, courseMnemonic: 'PSP(P)', courseCode: '35021C12', courseTitle: 'Problem Solving Using Python Programming', room: 'NEC LAB', facultyNames: ['Dr. R. Elankavi', 'Dr. R. Shobana'] },
  { id: 'tt-fri-2', day: 'Friday', period: 2, courseMnemonic: 'PSP(P)', courseCode: '35021C12', courseTitle: 'Problem Solving Using Python Programming', room: 'NEC LAB', facultyNames: ['Dr. R. Elankavi', 'Dr. R. Shobana'] },
  { id: 'tt-fri-3', day: 'Friday', period: 3, courseMnemonic: 'MINI PRO', courseCode: '35021M81', courseTitle: 'Mini Project', room: 'INTEL LAB', facultyNames: ['Dr. N. Sarika'] },
  { id: 'tt-fri-4', day: 'Friday', period: 4, courseMnemonic: 'MINI PRO', courseCode: '35021M81', courseTitle: 'Mini Project', room: 'INTEL LAB', facultyNames: ['Dr. N. Sarika'] },
  { id: 'tt-fri-5', day: 'Friday', period: 5, courseMnemonic: 'SE', courseCode: '35021C13', courseTitle: 'Software Engineering', room: 'TBC101', facultyNames: ['Dr. N. Sarika'] },
  { id: 'tt-fri-6', day: 'Friday', period: 6, courseMnemonic: 'MENTOR', courseTitle: 'Mentor', room: 'TBC101', facultyNames: ['Respective Mentor'] }
];

export const mockCourseMaterials: CourseMaterial[] = [
  {
    id: 'mat-1',
    courseId: 'crs-cns',
    facultyId: 'usr-fac-hcl',
    title: 'Network Security & Public Key Cryptography Fundamentals',
    description: 'Comprehensive video lecture introducing RSA algorithm, Diffie-Hellman key exchange, and elliptic curve ciphers.',
    type: 'YOUTUBE',
    fileType: 'VIDEO',
    url: 'https://www.youtube.com/watch?v=77Xm3i3wQ-w',
    youtubeVideoId: '77Xm3i3wQ-w',
    thumbnailUrl: 'https://img.youtube.com/vi/77Xm3i3wQ-w/hqdefault.jpg',
    moduleName: 'Unit 1: Fundamentals of Cryptography',
    status: 'PUBLISHED',
    uploadedAt: '2026-08-20'
  },
  {
    id: 'mat-2',
    courseId: 'crs-cns',
    facultyId: 'usr-fac-hcl',
    title: 'Lecture 01 - Cryptographic Protocols & Network Vulnerabilities.pdf',
    description: 'Instructor slide deck detailing modern symmetric/asymmetric encryption standards and hash functions.',
    fileType: 'PDF',
    type: 'PDF',
    fileSize: '4.2 MB',
    size: '4.2 MB',
    moduleName: 'Unit 1: Fundamentals of Cryptography',
    status: 'PUBLISHED',
    uploadedAt: '2026-08-22',
    url: 'https://example.com/materials/cns-protocols.pdf'
  },
  {
    id: 'mat-3',
    courseId: 'crs-se',
    facultyId: 'usr-fac-sarika',
    title: 'Software Engineering Architecture & Agile Sprint Methodologies',
    description: 'Detailed video walkthrough of microservices architectural patterns, agile sprints, and CI/CD pipelines.',
    type: 'YOUTUBE',
    fileType: 'VIDEO',
    url: 'https://www.youtube.com/watch?v=aivb_e1L_00',
    youtubeVideoId: 'aivb_e1L_00',
    thumbnailUrl: 'https://img.youtube.com/vi/aivb_e1L_00/hqdefault.jpg',
    moduleName: 'Unit 2: Agile Architecture & Quality Metrics',
    status: 'PUBLISHED',
    uploadedAt: '2026-08-25'
  },
  {
    id: 'mat-4',
    courseId: 'crs-se',
    facultyId: 'usr-fac-sarika',
    title: 'Software Requirement Specification (SRS) & Design Patterns.pdf',
    description: 'Practical lab template with UML class diagrams, sequence flows, and IEEE SRS guidelines.',
    fileType: 'PDF',
    type: 'PDF',
    fileSize: '6.1 MB',
    size: '6.1 MB',
    moduleName: 'Unit 2: Agile Architecture & Quality Metrics',
    status: 'PUBLISHED',
    uploadedAt: '2026-08-26',
    url: 'https://example.com/materials/se-srs-patterns.pdf'
  },
  {
    id: 'mat-5',
    courseId: 'crs-dl',
    facultyId: 'usr-fac-hcl',
    title: 'Deep Learning Convolutional Neural Networks & Optimization',
    description: 'Lecture video explaining backpropagation, Adam optimizer, and convolutional kernel filters.',
    type: 'YOUTUBE',
    fileType: 'VIDEO',
    url: 'https://www.youtube.com/watch?v=77Xm3i3wQ-w',
    youtubeVideoId: '77Xm3i3wQ-w',
    thumbnailUrl: 'https://img.youtube.com/vi/77Xm3i3wQ-w/hqdefault.jpg',
    moduleName: 'Unit 1: CNN & Neural Architectures',
    status: 'PUBLISHED',
    uploadedAt: '2026-08-28'
  },
  {
    id: 'mat-6',
    courseId: 'crs-psp',
    facultyId: 'usr-fac-elankavi',
    title: 'Problem Solving Using Python - Advanced Data Structures.pdf',
    description: 'Lab notebook on Python OOP, algorithm complexity, tree traversal, and dynamic programming.',
    fileType: 'PDF',
    type: 'PDF',
    fileSize: '3.8 MB',
    size: '3.8 MB',
    moduleName: 'Unit 3: Data Structures in Python',
    status: 'PUBLISHED',
    uploadedAt: '2026-08-30',
    url: 'https://example.com/materials/python-dsa.pdf'
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: 'asg-1',
    courseId: 'crs-cns',
    courseCode: '34421109',
    title: 'Implement RSA Encryption and Digital Signature Verification',
    description: 'Build an RSA public-key cryptosystem with key generation, encryption, and SHA-256 digital signature verification.',
    deadline: '2026-10-05',
    totalMarks: 100,
    createdAt: '2026-09-01'
  },
  {
    id: 'asg-2',
    courseId: 'crs-se',
    courseCode: '35021C13',
    title: 'Software Requirement Specification (SRS) for Microservices Platform',
    description: 'Design a complete IEEE-830 compliant SRS document and UML architectural sequence diagrams for a cloud platform.',
    deadline: '2026-10-12',
    totalMarks: 50,
    createdAt: '2026-09-05'
  },
  {
    id: 'asg-3',
    courseId: 'crs-dl',
    courseCode: '35021P13',
    title: 'CNN Model Training & Hyperparameter Tuning on CIFAR-10',
    description: 'Train a residual convolutional neural network and optimize learning rate schedulers for image classification.',
    deadline: '2026-10-18',
    totalMarks: 50,
    createdAt: '2026-09-10'
  },
  {
    id: 'asg-4',
    courseId: 'crs-psp',
    courseCode: '35021C12',
    title: 'Python Algorithmic Optimization & Concurrency Lab',
    description: 'Implement multi-threaded algorithmic search with graph traversal and benchmark execution speed.',
    deadline: '2026-10-20',
    totalMarks: 50,
    createdAt: '2026-09-12'
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-1',
    assignmentTitle: 'Implement RSA Encryption and Digital Signature Verification',
    courseCode: '34421109',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    submittedAt: '2026-09-18T14:22:00Z',
    fileName: 'AaravSharma_CNS_RSA_Signature.zip',
    status: 'GRADED',
    marksObtained: 94,
    feedback: 'Outstanding cryptographic implementation with robust padding and edge case handling.'
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-2',
    assignmentTitle: 'Software Requirement Specification (SRS) for Microservices Platform',
    courseCode: '35021C13',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    submittedAt: '2026-09-22T09:15:00Z',
    fileName: 'AaravSharma_SE_SRS_Specification.pdf',
    status: 'PENDING'
  },
  {
    id: 'sub-3',
    assignmentId: 'asg-1',
    assignmentTitle: 'Implement RSA Encryption and Digital Signature Verification',
    courseCode: '34421109',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    submittedAt: '2026-09-19T11:05:00Z',
    fileName: 'DiyaPatel_CNS_Lab.zip',
    status: 'GRADED',
    marksObtained: 98,
    feedback: 'Flawless mathematical verification and comprehensive unit tests.'
  }
];

export const mockQuizzes: Quiz[] = [
  {
    id: 'qz-1',
    courseId: 'crs-cns',
    courseCode: '34421109',
    title: 'Cryptography & Public Key Infrastructure Checkpoint',
    description: 'Test your understanding of symmetric ciphers, RSA, hash collisions, and digital certificates.',
    durationMinutes: 20,
    totalMarks: 20,
    createdAt: '2026-09-10',
    isPublished: true,
    questions: [
      {
        id: 'q-1',
        question: 'Which cryptographic property ensures that a sender cannot deny having sent a specific message?',
        options: [
          'Confidentiality',
          'Non-repudiation',
          'Availability',
          'Data Redundancy'
        ],
        correctOptionIndex: 1,
        marks: 5
      },
      {
        id: 'q-2',
        question: 'What mathematical hardness problem underpins standard RSA public-key cryptosystems?',
        options: ['Discrete Logarithm', 'Prime Factorization', 'Elliptic Curve Point Doubling', 'Knapsack Problem'],
        correctOptionIndex: 1,
        marks: 5
      },
      {
        id: 'q-3',
        question: 'Which cryptographic hash function standard provides a 256-bit message digest?',
        options: ['MD5', 'SHA-1', 'SHA-256', 'DES'],
        correctOptionIndex: 2,
        marks: 5
      },
      {
        id: 'q-4',
        question: 'What is the primary objective of the Diffie-Hellman protocol?',
        options: [
          'Data compression',
          'Secure symmetric key exchange over an insecure channel',
          'Database indexing',
          'Token generation'
        ],
        correctOptionIndex: 1,
        marks: 5
      }
    ]
  },
  {
    id: 'qz-2',
    courseId: 'crs-se',
    courseCode: '35021C13',
    title: 'Software Engineering Design Patterns & Scrum Checkpoint',
    description: 'Assess knowledge in behavioral design patterns, agile sprints, and architectural coupling.',
    durationMinutes: 15,
    totalMarks: 10,
    createdAt: '2026-09-14',
    isPublished: true,
    questions: [
      {
        id: 'q-se-1',
        question: 'Which design pattern restricts instantiation of a class to one single object instance?',
        options: ['Factory Method', 'Singleton', 'Observer', 'Adapter'],
        correctOptionIndex: 1,
        marks: 5
      },
      {
        id: 'q-se-2',
        question: 'In Scrum agile methodology, what is the recommended duration of a standard sprint cycle?',
        options: ['1 to 4 weeks', '6 to 12 months', '24 hours', 'Indefinite'],
        correctOptionIndex: 0,
        marks: 5
      }
    ]
  }
];

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: 'qa-1',
    quizId: 'qz-1',
    quizTitle: 'Cryptography & Public Key Infrastructure Checkpoint',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    score: 20,
    totalMarks: 20,
    answers: { 'q-1': 1, 'q-2': 1, 'q-3': 2, 'q-4': 1 },
    submittedAt: '2026-09-15T15:40:00Z',
    timeTakenSeconds: 740
  },
  {
    id: 'qa-2',
    quizId: 'qz-1',
    quizTitle: 'Cryptography & Public Key Infrastructure Checkpoint',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    score: 20,
    totalMarks: 20,
    answers: { 'q-1': 1, 'q-2': 1, 'q-3': 2, 'q-4': 1 },
    submittedAt: '2026-09-15T16:10:00Z',
    timeTakenSeconds: 610
  }
];

export const mockAttendance: AttendanceRecord[] = [
  // Aarav Sharma (usr-stu-1) - CNS (34421109)
  { id: 'att-1', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-2', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-10', status: 'PRESENT' },
  { id: 'att-3', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-15', status: 'LATE' },
  { id: 'att-4', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-17', status: 'PRESENT' },
  { id: 'att-5', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-22', status: 'PRESENT' },
  { id: 'att-5b', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-24', status: 'PRESENT' },
  { id: 'att-5c', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-28', status: 'PRESENT' },

  // Aarav Sharma (usr-stu-1) - SE (35021C13)
  { id: 'att-6', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-09', status: 'PRESENT' },
  { id: 'att-7', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-11', status: 'ABSENT' },
  { id: 'att-8', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-16', status: 'PRESENT' },
  { id: 'att-9', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-18', status: 'PRESENT' },
  { id: 'att-10', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-23', status: 'PRESENT' },
  { id: 'att-10b', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-25', status: 'LATE' },

  // Aarav Sharma (usr-stu-1) - PSP(T+P) (35021C12) (60% attendance - Warning)
  { id: 'att-11', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-04', status: 'PRESENT' },
  { id: 'att-12', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-11', status: 'ABSENT' },
  { id: 'att-13', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-18', status: 'ABSENT' },
  { id: 'att-14', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-25', status: 'PRESENT' },
  { id: 'att-15', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-1', studentName: 'Aarav Sharma', date: '2026-09-28', status: 'PRESENT' },

  // Diya Patel (usr-stu-2) - Exemplary 90%+ attendance
  { id: 'att-16', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-17', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-10', status: 'PRESENT' },
  { id: 'att-18', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-15', status: 'PRESENT' },
  { id: 'att-19', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-17', status: 'PRESENT' },
  { id: 'att-20', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-22', status: 'PRESENT' },
  { id: 'att-21', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-09', status: 'PRESENT' },
  { id: 'att-22', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-11', status: 'PRESENT' },
  { id: 'att-23', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-16', status: 'PRESENT' },
  { id: 'att-24', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-18', status: 'LATE' },
  { id: 'att-25', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-2', studentName: 'Diya Patel', date: '2026-09-23', status: 'PRESENT' },

  // Rohan Iyer (usr-stu-3)
  { id: 'att-26', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-3', studentName: 'Rohan Iyer', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-27', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-3', studentName: 'Rohan Iyer', date: '2026-09-10', status: 'PRESENT' },
  { id: 'att-28', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-3', studentName: 'Rohan Iyer', date: '2026-09-09', status: 'PRESENT' },
  { id: 'att-29', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-3', studentName: 'Rohan Iyer', date: '2026-09-11', status: 'PRESENT' },

  // Ananya Deshmukh (usr-stu-4)
  { id: 'att-30', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-4', studentName: 'Ananya Deshmukh', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-31', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-4', studentName: 'Ananya Deshmukh', date: '2026-09-09', status: 'PRESENT' },
  { id: 'att-32', courseId: 'crs-dl', courseCode: '35021P13', courseName: 'Deep Learning', studentId: 'usr-stu-4', studentName: 'Ananya Deshmukh', date: '2026-09-14', status: 'PRESENT' },

  // Aditya Verma (usr-stu-5)
  { id: 'att-33', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-5', studentName: 'Aditya Verma', date: '2026-09-08', status: 'LATE' },
  { id: 'att-34', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-5', studentName: 'Aditya Verma', date: '2026-09-09', status: 'ABSENT' },
  { id: 'att-35', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-5', studentName: 'Aditya Verma', date: '2026-09-11', status: 'PRESENT' },

  // Pooja Sundaram (usr-stu-6)
  { id: 'att-36', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-6', studentName: 'Pooja Sundaram', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-37', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-6', studentName: 'Pooja Sundaram', date: '2026-09-09', status: 'PRESENT' },
  { id: 'att-38', courseId: 'crs-dl', courseCode: '35021P13', courseName: 'Deep Learning', studentId: 'usr-stu-6', studentName: 'Pooja Sundaram', date: '2026-09-14', status: 'PRESENT' },

  // Karthik Raman (usr-stu-7)
  { id: 'att-39', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-7', studentName: 'Karthik Raman', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-40', courseId: 'crs-os', courseCode: '35021C19', courseName: 'Operating System Theory and Practical', studentId: 'usr-stu-7', studentName: 'Karthik Raman', date: '2026-09-10', status: 'PRESENT' },

  // Sneha Kulkarni (usr-stu-8)
  { id: 'att-41', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-8', studentName: 'Sneha Kulkarni', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-42', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-8', studentName: 'Sneha Kulkarni', date: '2026-09-09', status: 'PRESENT' },

  // Vikram Choudhury (usr-stu-9)
  { id: 'att-43', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-9', studentName: 'Vikram Choudhury', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-44', courseId: 'crs-ir', courseCode: '34421002', courseName: 'Industrial Robotics', studentId: 'usr-stu-9', studentName: 'Vikram Choudhury', date: '2026-09-10', status: 'PRESENT' },

  // Meera Nair (usr-stu-10)
  { id: 'att-45', courseId: 'crs-cns', courseCode: '34421109', courseName: 'Cryptography and Network Security', studentId: 'usr-stu-10', studentName: 'Meera Nair', date: '2026-09-08', status: 'PRESENT' },
  { id: 'att-46', courseId: 'crs-se', courseCode: '35021C13', courseName: 'Software Engineering', studentId: 'usr-stu-10', studentName: 'Meera Nair', date: '2026-09-09', status: 'PRESENT' },
  { id: 'att-47', courseId: 'crs-psp', courseCode: '35021C12', courseName: 'Problem Solving Using Python Programming', studentId: 'usr-stu-10', studentName: 'Meera Nair', date: '2026-09-11', status: 'PRESENT' }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Assignment Graded',
    message: 'HCL Trainer graded Aarav Sharma\'s submission for CNS (34421109): 94/100.',
    type: 'GRADE',
    createdAt: '2026-09-19T10:00:00Z',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Upcoming Assignment Deadline',
    message: 'Software Engineering (35021C13) SRS Specification is due on Oct 12, 2026.',
    type: 'ASSIGNMENT',
    createdAt: '2026-09-21T08:30:00Z',
    isRead: false
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-23T08:15:00Z',
    performedBy: 'raveendra.sharma@edutrack.edu',
    role: 'PARENT',
    action: 'PARENT_PORTAL_ACCESS',
    details: 'Viewed academic activity summary for student Aarav Sharma (CS-2024-041)',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-22T14:30:00Z',
    performedBy: 'hcl.trainer@edutrack.edu',
    role: 'FACULTY',
    action: 'ASSIGNMENT_GRADE',
    details: 'Graded submission for Aarav Sharma in CNS (Marks: 94)',
    ipAddress: '10.0.4.12'
  }
];

export const mockParentReviews: ParentReview[] = [
  {
    id: 'prev-1',
    parentId: 'usr-parent-1',
    parentName: 'Raveendra Sharma',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    courseId: 'crs-cns',
    courseCode: '34421109',
    category: 'APPRECIATION',
    title: 'Great progress in Cryptography and Network Security',
    message: 'Aarav really enjoyed the RSA encryption and digital signature assignment. Thank you HCL Trainer for the detailed feedback!',
    status: 'ACKNOWLEDGED',
    facultyReply: 'Thank you Raveendra Sharma! Aarav demonstrated exceptional insight into cryptographic security protocols.',
    createdAt: '2026-09-20T16:00:00Z'
  },
  {
    id: 'prev-2',
    parentId: 'usr-parent-1',
    parentName: 'Raveendra Sharma',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    courseId: 'crs-se',
    courseCode: '35021C13',
    category: 'ATTENDANCE',
    title: 'Inquiry regarding absence on Sept 11',
    message: 'Aarav had a medical appointment on Sept 11. I submitted the doctor slip to administration and wanted to ensure the attendance record was excused.',
    status: 'SUBMITTED',
    createdAt: '2026-09-22T10:15:00Z'
  }
];

export const mockFeeRecords: FeeRecord[] = [
  {
    id: 'fee-1',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition & Academic Instruction Fee',
    description: 'B.Tech CSE Core curriculum tuition, faculty guidance, and lecture halls access.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PENDING',
    remarks: 'Installment 1 of 2. Early-bird discount applied.'
  },
  {
    id: 'fee-2',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    semester: 4,
    academicYear: '2026-2027',
    category: 'LAB_EXAM',
    title: 'Distributed Systems & Database Computing Lab Fee',
    description: 'Hardware cluster access, cloud VM allocations, and Oracle database server licenses.',
    amount: 12500,
    dueDate: '2026-10-05',
    status: 'PAID',
    paidAt: '2026-09-18T11:20:00Z',
    paidAmount: 12500,
    paymentMethod: 'UPI',
    transactionRef: 'UPI/2026/0918/9837192',
    receiptNumber: 'REC-2026-CS-041-01',
    remarks: 'Payment verified and receipt issued.'
  },
  {
    id: 'fee-3',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    semester: 4,
    academicYear: '2026-2027',
    category: 'LIBRARY',
    title: 'Digital Library & IEEE Xplore Journals Subscription',
    description: 'Annual digital library subscription, research portal, and book lending services.',
    amount: 3500,
    dueDate: '2026-09-20',
    status: 'OVERDUE',
    remarks: 'Statutory late fee of ₹250 applicable if unpaid past Oct 01.'
  },
  {
    id: 'fee-4',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    studentRegNumber: 'CS-2024-042',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition & Academic Instruction Fee',
    description: 'B.Tech CSE Core curriculum tuition and instructional facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PAID',
    paidAt: '2026-09-12T14:45:00Z',
    paidAmount: 65000,
    paymentMethod: 'NET_BANKING',
    transactionRef: 'HDFC/NETB/882710384',
    receiptNumber: 'REC-2026-CS-042-01',
    remarks: 'Semester tuition cleared in full.'
  },
  {
    id: 'fee-5',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    studentRegNumber: 'CS-2024-042',
    semester: 4,
    academicYear: '2026-2027',
    category: 'LAB_EXAM',
    title: 'Distributed Systems & Database Computing Lab Fee',
    description: 'High performance lab computing cluster and test infrastructure.',
    amount: 12500,
    dueDate: '2026-10-05',
    status: 'PENDING',
    remarks: 'Awaiting student or parent clearance.'
  },
  {
    id: 'fee-6',
    studentId: 'usr-stu-3',
    studentName: 'Rohan Iyer',
    studentRegNumber: 'CS-2024-043',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PAID',
    paidAt: '2026-09-14T10:30:00Z',
    paidAmount: 65000,
    paymentMethod: 'UPI',
    transactionRef: 'UPI/2026/0914/8762341',
    receiptNumber: 'REC-2026-CS-043-01',
    remarks: 'Tuition cleared in full.'
  },
  {
    id: 'fee-7',
    studentId: 'usr-stu-4',
    studentName: 'Ananya Deshmukh',
    studentRegNumber: 'CS-2024-044',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PENDING',
    remarks: 'Awaiting clearance.'
  },
  {
    id: 'fee-8',
    studentId: 'usr-stu-5',
    studentName: 'Aditya Verma',
    studentRegNumber: 'CS-2024-045',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-09-25',
    status: 'OVERDUE',
    remarks: 'Immediate payment requested.'
  },
  {
    id: 'fee-9',
    studentId: 'usr-stu-6',
    studentName: 'Pooja Sundaram',
    studentRegNumber: 'CS-2024-046',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PAID',
    paidAt: '2026-09-10T12:00:00Z',
    paidAmount: 65000,
    paymentMethod: 'NET_BANKING',
    transactionRef: 'SBIN/NETB/9928371',
    receiptNumber: 'REC-2026-CS-046-01',
    remarks: 'Full payment received.'
  },
  {
    id: 'fee-10',
    studentId: 'usr-stu-7',
    studentName: 'Karthik Raman',
    studentRegNumber: 'CS-2024-047',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PENDING',
    remarks: 'Installment pending.'
  },
  {
    id: 'fee-11',
    studentId: 'usr-stu-8',
    studentName: 'Sneha Kulkarni',
    studentRegNumber: 'CS-2024-048',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PAID',
    paidAt: '2026-09-16T15:20:00Z',
    paidAmount: 65000,
    paymentMethod: 'DEBIT_CREDIT_CARD',
    transactionRef: 'CARD/2026/0916/44312',
    receiptNumber: 'REC-2026-CS-048-01',
    remarks: 'Cleared via debit card.'
  },
  {
    id: 'fee-12',
    studentId: 'usr-stu-9',
    studentName: 'Vikram Choudhury',
    studentRegNumber: 'CS-2024-049',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PENDING',
    remarks: 'Awaiting fee clearance.'
  },
  {
    id: 'fee-13',
    studentId: 'usr-stu-10',
    studentName: 'Meera Nair',
    studentRegNumber: 'CS-2024-050',
    semester: 4,
    academicYear: '2026-2027',
    category: 'TUITION',
    title: 'Semester 4 Tuition Fee',
    description: 'Semester IV core curriculum instruction and facilities.',
    amount: 65000,
    dueDate: '2026-10-15',
    status: 'PAID',
    paidAt: '2026-09-17T11:45:00Z',
    paidAmount: 65000,
    paymentMethod: 'UPI',
    transactionRef: 'UPI/2026/0917/5549102',
    receiptNumber: 'REC-2026-CS-050-01',
    remarks: 'Cleared via UPI.'
  }
];

export const mockAttendanceRequests: any[] = [
  {
    id: 'req-med-01',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    classTeacherId: 'usr-fac-elankavi',
    classTeacherName: 'Dr. R. Elankavi',
    requestType: 'MEDICAL',
    fromDate: '2026-09-21',
    toDate: '2026-09-23',
    reason: 'Severe viral fever and typhoid diagnosed with physician-mandated bed rest.',
    optionalNote: 'Prescription and medical certificate from Apollo Hospitals attached.',
    status: 'FORWARDED_TO_SUBJECT_FACULTY',
    documents: [
      {
        id: 'doc-med-01',
        requestId: 'req-med-01',
        documentType: 'MEDICAL_CERTIFICATE',
        fileName: 'Medical_Certificate_AaravSharma_Apollo.pdf',
        fileUrl: 'https://documents.edutrack.edu/medical/2026/med-01-aarav.pdf',
        mimeType: 'application/pdf',
        fileSize: '1.4 MB',
        uploadedBy: 'usr-stu-1',
        uploadedAt: '2026-09-24T10:00:00Z'
      }
    ],
    affectedSessions: [
      {
        id: 'sess-01',
        requestId: 'req-med-01',
        attendanceId: 'att-101',
        courseId: 'crs-os-tp',
        courseCode: '35021C19',
        courseName: 'Operating System Theory and Practical',
        sessionDate: '2026-09-21',
        periodNumber: 5,
        timeRange: '01:35 PM – 02:25 PM',
        facultyId: 'usr-fac-gayathri',
        facultyName: 'Mrs. Gayathri',
        originalStatus: 'ABSENT',
        classTeacherApproved: true,
        facultyStatus: 'PENDING'
      },
      {
        id: 'sess-02',
        requestId: 'req-med-01',
        attendanceId: 'att-102',
        courseId: 'crs-se',
        courseCode: '35021C13',
        courseName: 'Software Engineering',
        sessionDate: '2026-09-22',
        periodNumber: 4,
        timeRange: '10:50 AM – 11:50 AM',
        facultyId: 'usr-fac-sarika',
        facultyName: 'Dr. N. Sarika',
        originalStatus: 'ABSENT',
        classTeacherApproved: true,
        facultyStatus: 'PENDING'
      }
    ],
    classTeacherReviewedAt: '2026-09-24T14:30:00Z',
    classTeacherDecision: 'APPROVED',
    classTeacherReason: 'Authentic hospital discharge and medical certificate verified. Forwarded to respective course faculties for regularization.',
    submittedAt: '2026-09-24T10:05:00Z',
    createdAt: '2026-09-24T10:05:00Z',
    updatedAt: '2026-09-24T14:30:00Z'
  },
  {
    id: 'req-od-01',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    studentRegNumber: 'CS-2024-042',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    classTeacherId: 'usr-fac-elankavi',
    classTeacherName: 'Dr. R. Elankavi',
    requestType: 'OD',
    fromDate: '2026-09-16',
    toDate: '2026-09-17',
    reason: 'Representing university in National Cyber Security Hackathon finals.',
    eventName: 'Smart India Hackathon Finals 2026',
    eventType: 'Competition',
    eventVenue: 'IIT Madras Research Park, Chennai',
    status: 'AWAITING_APPROVED_OD_DOCUMENT',
    documents: [],
    affectedSessions: [
      {
        id: 'sess-03',
        requestId: 'req-od-01',
        attendanceId: 'att-201',
        courseId: 'crs-cns',
        courseCode: '34421109',
        courseName: 'Cryptography and Network Security',
        sessionDate: '2026-09-16',
        periodNumber: 1,
        timeRange: '09:00 AM – 09:50 AM',
        facultyId: 'usr-fac-hcl',
        facultyName: 'HCL Trainer',
        originalStatus: 'ABSENT',
        classTeacherApproved: false,
        facultyStatus: 'PENDING'
      }
    ],
    submittedAt: '2026-09-15T09:00:00Z',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-09-15T09:00:00Z'
  }
];

export const mockSmsNotifications: any[] = [
  {
    id: 'sms-notif-01',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    parentId: 'usr-parent-1',
    parentName: 'Raveendra Sharma',
    attendanceId: 'att-101',
    phoneNumberMasked: '+91 98401 XXX51',
    phoneNumber: '+91 98401 23451',
    notificationType: 'ABSENCE',
    message: 'EduTrack Attendance Alert: Your ward, Aarav Sharma, was marked ABSENT for Operating System Theory and Practical on 21 Sep 2026 (Period 5). Automated institutional notification.',
    providerMessageId: 'MSG-FAST2SMS-992810',
    deliveryStatus: 'DELIVERED',
    createdAt: '2026-09-21T13:45:00Z',
    sentAt: '2026-09-21T13:45:05Z'
  },
  {
    id: 'sms-notif-02',
    studentId: 'usr-stu-3',
    studentName: 'Rohan Iyer',
    parentId: 'usr-parent-3',
    parentName: 'Subramanian Iyer',
    attendanceId: 'att-301',
    phoneNumberMasked: '+91 98401 XXX53',
    phoneNumber: '+91 98401 23453',
    notificationType: 'ABSENCE',
    message: 'EduTrack Attendance Alert: Your ward, Rohan Iyer, was marked ABSENT for Software Engineering on 22 Sep 2026 (Period 4). Automated institutional notification.',
    providerMessageId: 'MSG-FAST2SMS-992812',
    deliveryStatus: 'DELIVERED',
    createdAt: '2026-09-22T11:00:00Z',
    sentAt: '2026-09-22T11:00:04Z'
  }
];

export const mockExamAssessments: any[] = [
  {
    id: 'exam-cns-iat1',
    courseId: 'crs-cns',
    courseCode: '34421109',
    courseTitle: 'Cryptography and Network Security',
    academicClassId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    examType: 'IAT1',
    title: 'Internal Assessment Test 1 (Units 1 & 2)',
    maxMarks: 50,
    examDate: '2026-08-28',
    createdByFacultyId: 'usr-fac-hcl',
    createdByFacultyName: 'HCL Trainer',
    status: 'PUBLISHED',
    createdAt: '2026-08-25T10:00:00Z',
    publishedAt: '2026-08-30T16:00:00Z'
  },
  {
    id: 'exam-se-iat1',
    courseId: 'crs-se',
    courseCode: '35021C13',
    courseTitle: 'Software Engineering',
    academicClassId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    examType: 'IAT1',
    title: 'Internal Assessment Test 1 (Software Lifecycles & Agile)',
    maxMarks: 50,
    examDate: '2026-08-29',
    createdByFacultyId: 'usr-fac-sarika',
    createdByFacultyName: 'Dr. N. Sarika',
    status: 'PUBLISHED',
    createdAt: '2026-08-25T11:00:00Z',
    publishedAt: '2026-08-30T17:00:00Z'
  },
  {
    id: 'exam-se-iat2',
    courseId: 'crs-se',
    courseCode: '35021C13',
    courseTitle: 'Software Engineering',
    academicClassId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    examType: 'IAT2',
    title: 'Internal Assessment Test 2 (Design Patterns & Testing)',
    maxMarks: 50,
    examDate: '2026-09-25',
    createdByFacultyId: 'usr-fac-sarika',
    createdByFacultyName: 'Dr. N. Sarika',
    status: 'PUBLISHED',
    createdAt: '2026-09-22T09:00:00Z',
    publishedAt: '2026-09-28T12:00:00Z'
  },
  {
    id: 'exam-os-iat1',
    courseId: 'crs-os-tp',
    courseCode: '35021C19',
    courseTitle: 'Operating System Theory and Practical',
    academicClassId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    examType: 'IAT1',
    title: 'Internal Assessment Test 1 (Processes & Concurrency)',
    maxMarks: 50,
    examDate: '2026-08-30',
    createdByFacultyId: 'usr-fac-gayathri',
    createdByFacultyName: 'Mrs. Gayathri',
    status: 'PUBLISHED',
    createdAt: '2026-08-26T10:00:00Z',
    publishedAt: '2026-09-02T15:00:00Z'
  },
  {
    id: 'exam-os-model',
    courseId: 'crs-os-tp',
    courseCode: '35021C19',
    courseTitle: 'Operating System Theory and Practical',
    academicClassId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    examType: 'MODEL',
    title: 'Model Examination (Comprehensive Syllabus)',
    maxMarks: 100,
    examDate: '2026-10-20',
    createdByFacultyId: 'usr-fac-gayathri',
    createdByFacultyName: 'Mrs. Gayathri',
    status: 'DRAFT',
    createdAt: '2026-09-29T11:00:00Z'
  }
];

export const mockExamResults: any[] = [
  // CNS IAT 1
  {
    id: 'res-cns-01',
    assessmentId: 'exam-cns-iat1',
    courseId: 'crs-cns',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    marksObtained: 44,
    maxMarks: 50,
    percentage: 88,
    resultStatus: 'PASS',
    remarks: 'Outstanding conceptual clarity in symmetric key ciphers.',
    enteredByFacultyId: 'usr-fac-hcl',
    createdAt: '2026-08-30T15:30:00Z',
    updatedAt: '2026-08-30T15:30:00Z'
  },
  {
    id: 'res-cns-02',
    assessmentId: 'exam-cns-iat1',
    courseId: 'crs-cns',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    studentRegNumber: 'CS-2024-042',
    marksObtained: 46,
    maxMarks: 50,
    percentage: 92,
    resultStatus: 'PASS',
    remarks: 'Exemplary work in RSA cryptanalysis.',
    enteredByFacultyId: 'usr-fac-hcl',
    createdAt: '2026-08-30T15:30:00Z',
    updatedAt: '2026-08-30T15:30:00Z'
  },
  {
    id: 'res-cns-03',
    assessmentId: 'exam-cns-iat1',
    courseId: 'crs-cns',
    studentId: 'usr-stu-3',
    studentName: 'Rohan Iyer',
    studentRegNumber: 'CS-2024-043',
    marksObtained: 39,
    maxMarks: 50,
    percentage: 78,
    resultStatus: 'PASS',
    remarks: 'Good effort; needs more practice in block cipher modes.',
    enteredByFacultyId: 'usr-fac-hcl',
    createdAt: '2026-08-30T15:30:00Z',
    updatedAt: '2026-08-30T15:30:00Z'
  },
  // SE IAT 1
  {
    id: 'res-se-01',
    assessmentId: 'exam-se-iat1',
    courseId: 'crs-se',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    marksObtained: 42,
    maxMarks: 50,
    percentage: 84,
    resultStatus: 'PASS',
    remarks: 'Clear understanding of Scrum and sprint backlog estimation.',
    enteredByFacultyId: 'usr-fac-sarika',
    createdAt: '2026-08-30T16:30:00Z',
    updatedAt: '2026-08-30T16:30:00Z'
  },
  {
    id: 'res-se-02',
    assessmentId: 'exam-se-iat1',
    courseId: 'crs-se',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    studentRegNumber: 'CS-2024-042',
    marksObtained: 45,
    maxMarks: 50,
    percentage: 90,
    resultStatus: 'PASS',
    remarks: 'Well-structured software requirement specification (SRS).',
    enteredByFacultyId: 'usr-fac-sarika',
    createdAt: '2026-08-30T16:30:00Z',
    updatedAt: '2026-08-30T16:30:00Z'
  },
  // SE IAT 2
  {
    id: 'res-se2-01',
    assessmentId: 'exam-se-iat2',
    courseId: 'crs-se',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    marksObtained: 45,
    maxMarks: 50,
    percentage: 90,
    resultStatus: 'PASS',
    remarks: 'Consistent excellence in architectural design patterns.',
    enteredByFacultyId: 'usr-fac-sarika',
    createdAt: '2026-09-28T11:45:00Z',
    updatedAt: '2026-09-28T11:45:00Z'
  },
  {
    id: 'res-se2-02',
    assessmentId: 'exam-se-iat2',
    courseId: 'crs-se',
    studentId: 'usr-stu-2',
    studentName: 'Diya Patel',
    studentRegNumber: 'CS-2024-042',
    marksObtained: 47,
    maxMarks: 50,
    percentage: 94,
    resultStatus: 'PASS',
    remarks: 'Top score in unit test automation diagrams.',
    enteredByFacultyId: 'usr-fac-sarika',
    createdAt: '2026-09-28T11:45:00Z',
    updatedAt: '2026-09-28T11:45:00Z'
  },
  // OS IAT 1
  {
    id: 'res-os-01',
    assessmentId: 'exam-os-iat1',
    courseId: 'crs-os-tp',
    studentId: 'usr-stu-1',
    studentName: 'Aarav Sharma',
    studentRegNumber: 'CS-2024-041',
    marksObtained: 41,
    maxMarks: 50,
    percentage: 82,
    resultStatus: 'PASS',
    remarks: 'Strong grasp of semaphore synchronization.',
    enteredByFacultyId: 'usr-fac-gayathri',
    createdAt: '2026-09-02T14:30:00Z',
    updatedAt: '2026-09-02T14:30:00Z'
  }
];

export const mockProfileChangeRequests: ProfileChangeRequest[] = [
  {
    id: 'pcr-stu-01',
    userId: 'usr-stu-1',
    userRole: 'STUDENT',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@student.edutrack.edu',
    requestType: 'PROFILE_INFORMATION_AND_IMAGE',
    status: 'PENDING',
    approvalLevel: 'CLASS_TEACHER',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    classTeacherId: 'usr-fac-elankavi',
    classTeacherName: 'Dr. R. Elankavi',
    proposedChanges: [
      {
        fieldName: 'phone',
        fieldLabel: 'Mobile Number',
        oldValue: '+91 98401 11001',
        newValue: '+91 98765 43210',
        fieldType: 'PHONE'
      },
      {
        fieldName: 'address',
        fieldLabel: 'Residential Address',
        oldValue: '42 Kasturba Nagar, Adyar, Chennai',
        newValue: '18 Gandhi Road, T. Nagar, Chennai - 600017',
        fieldType: 'TEXT'
      }
    ],
    currentAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    pendingAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-29T10:15:00Z'
  },
  {
    id: 'pcr-parent-01',
    userId: 'usr-parent-1',
    userRole: 'PARENT',
    userName: 'Raveendra Sharma',
    userEmail: 'raveendra.sharma@edutrack.edu',
    requestType: 'PROFILE_INFORMATION',
    status: 'PENDING',
    approvalLevel: 'CLASS_TEACHER',
    childStudentId: 'usr-stu-1',
    childStudentName: 'Aarav Sharma',
    classId: 'cls-cse-4-vii-a',
    className: 'B.Tech CSE — Semester IV (Section VII / VII-A)',
    classTeacherId: 'usr-fac-elankavi',
    classTeacherName: 'Dr. R. Elankavi',
    proposedChanges: [
      {
        fieldName: 'phone',
        fieldLabel: 'Primary Emergency Contact',
        oldValue: '+91 98401 23451',
        newValue: '+91 99401 98765',
        fieldType: 'PHONE'
      },
      {
        fieldName: 'address',
        fieldLabel: 'Permanent Family Address',
        oldValue: '12 Emerald Court, Chennai',
        newValue: '88 Heritage Enclave, Anna Nagar West, Chennai - 600040',
        fieldType: 'TEXT'
      }
    ],
    submittedAt: '2026-09-29T11:30:00Z'
  },
  {
    id: 'pcr-fac-01',
    userId: 'usr-fac-sarika',
    userRole: 'FACULTY',
    userName: 'Dr. N. Sarika',
    userEmail: 'sarika@edutrack.edu',
    requestType: 'PROFILE_INFORMATION_AND_IMAGE',
    status: 'PENDING',
    approvalLevel: 'ADMIN',
    proposedChanges: [
      {
        fieldName: 'phone',
        fieldLabel: 'Faculty Contact Number',
        oldValue: '+91 94440 12345',
        newValue: '+91 98840 54321',
        fieldType: 'PHONE'
      },
      {
        fieldName: 'designation',
        fieldLabel: 'Academic Designation',
        oldValue: 'Associate Professor',
        newValue: 'Professor & Head of Department',
        fieldType: 'TEXT'
      }
    ],
    currentAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    pendingAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-30T09:00:00Z'
  }
];


