# EduTrack LMS — Enterprise System Architecture & Project Report

**Document Version**: 2.4.0  
**Project**: EduTrack LMS (Enterprise University Learning Management System)  
**Target Environment**: Node.js v20+ / React 19 / TypeScript / Oracle Database 19c-23c  
**Repository**: `E:\Projects\Edutrack` / [GitHub Repository](https://github.com/Techmasternikhil/Edutrack.git)

---

## 1. Executive Summary

**EduTrack LMS** is an enterprise-grade academic intelligence and learning management system engineered for higher-education universities and research institutions. The platform unifies instructional management, student learning diagnostics, statutory attendance compliance, and parent/guardian oversight into an isolated, role-segregated single-page application (SPA) backed by an Express REST API engine and enterprise Oracle Database DDL persistence specifications.

### Core Value Propositions
1. **Multi-Role Role-Based Access Control (RBAC)**: Strict segregation between `ADMIN`, `FACULTY`, `STUDENT`, and `PARENT` personas.
2. **Parental Academic Transparency**: Non-intrusive monitoring granting guardians real-time visibility into attendance compliance (statutory <75% automated alerting), cumulative GPA, and assignment score distributions without granting access to internal staff records.
3. **Automated Assessment & Evaluation**: Real-time multiple-choice quiz evaluation engine and rubric-based coursework submission grading with instant feedback loops.
4. **Institutional Security Governance**: Self-service onboarding with multi-tier Administrator verification queues and tamper-evident audit logging.
5. **Generative Academic AI Assistant**: Google Gemini 2.5 Flash integrated directly for contextual syllabus explanations, PL/SQL query assistance, and study planning.

---

## 2. System Architecture & Component Topology

EduTrack LMS uses a full-stack architecture combining a client-side Single-Page Application (React 19, TypeScript, Tailwind CSS v4) with an embedded Express.js REST API middleware layer, orchestrated via Vite.

```mermaid
graph TB
    subgraph "Client Layer (React 19 + TypeScript)"
        UI[App.tsx State Engine]
        AuthGate[LoginScreen.tsx: Role-Based Gate & Registration]
        HeaderBar[Header.tsx: Session Status, Alerts & Sign Out]
        
        subgraph "Role Portals"
            AdminPortal[AdminDashboard.tsx]
            FacultyPortal[FacultyDashboard.tsx]
            StudentPortal[StudentDashboard.tsx]
            ParentPortal[ParentDashboard.tsx]
        end

        Modals[AIAssistantModal.tsx & UserProfileModal.tsx]
    end

    subgraph "API & Controller Middleware (server.ts)"
        Router[/api/* Express Router]
        AuthCtrl[Auth & Verification Service]
        AcademicCtrl[Course, Quiz & Materials Service]
        GradingCtrl[Submission & Evaluation Engine]
        ParentCtrl[Parent Inquiry & Monitoring Service]
        AuditCtrl[Security Audit Logging Engine]
        GeminiCtrl[Google GenAI: Gemini 2.5 Flash]
    end

    subgraph "Persistence & Schema Layer"
        MemStore[(In-Memory Seed Data Stores)]
        OracleDB[(Oracle Database 19c/21c/23c DDL)]
    end

    AuthGate -->|Authenticated Session| UI
    UI --> AdminPortal
    UI --> FacultyPortal
    UI --> StudentPortal
    UI --> ParentPortal
    UI -.-> Modals
    UI -.-> HeaderBar

    AdminPortal -->|HTTP REST| Router
    FacultyPortal -->|HTTP REST| Router
    StudentPortal -->|HTTP REST| Router
    ParentPortal -->|HTTP REST| Router
    Modals -->|POST /api/ai/assistant| Router

    Router --> AuthCtrl
    Router --> AcademicCtrl
    Router --> GradingCtrl
    Router --> ParentCtrl
    Router --> AuditCtrl
    Router --> GeminiCtrl

    AuthCtrl --> MemStore
    AcademicCtrl --> MemStore
    GradingCtrl --> MemStore
    ParentCtrl --> MemStore
    AuditCtrl --> MemStore
    
    MemStore -.->|DDL Specification| OracleDB
```

---

## 3. Role-Based Access Control (RBAC) & Permission Matrix

EduTrack LMS enforces strict privilege boundaries. No user can view, mutate, or intercept records outside their authorized role boundary.

| Feature / Resource | Administrator (`ADMIN`) | Faculty (`FACULTY`) | Student (`STUDENT`) | Parent (`PARENT`) |
| :--- | :---: | :---: | :---: | :---: |
| **Self-Service Public Registration** | ❌ (Denied) | ✅ (Pending Approval) | ✅ (Pending Approval) | ✅ (Pending Approval) |
| **Approve / Reject Registrations** | ✅ (Full) | ❌ (Denied) | ❌ (Denied) | ❌ (Denied) |
| **View Institutional Audit Logs** | ✅ (Full) | ❌ (Denied) | ❌ (Denied) | ❌ (Denied) |
| **Create & Allocate Courses** | ✅ (Full) | ❌ (Denied) | ❌ (Denied) | ❌ (Denied) |
| **Upload Lecture Materials & Videos** | ❌ (Denied) | ✅ (Assigned Courses) | ❌ (Denied) | ❌ (Denied) |
| **Publish Quizzes & Assignments** | ❌ (Denied) | ✅ (Assigned Courses) | ❌ (Denied) | ❌ (Denied) |
| **Evaluate & Grade Submissions** | ❌ (Denied) | ✅ (Assigned Courses) | ❌ (Denied) | ❌ (Denied) |
| **Attempt Quizzes & Upload Projects** | ❌ (Denied) | ❌ (Denied) | ✅ (Enrolled Only) | ❌ (Denied) |
| **View Personal Grades & Attendance** | ❌ (Denied) | ❌ (Denied) | ✅ (Self Only) | ❌ (Denied) |
| **Child Academic Progress Tracking** | ❌ (Denied) | ❌ (Denied) | ❌ (Denied) | ✅ (Linked Child Only) |
| **Submit Parent Inquiries / Remarks** | ❌ (Denied) | ❌ (Denied) | ❌ (Denied) | ✅ (Authorized Child) |
| **Reply to Parent Inquiries** | ❌ (Denied) | ✅ (Assigned Courses) | ❌ (Denied) | ❌ (Denied) |
| **Gemini AI Academic Assistant** | ✅ | ✅ | ✅ | ✅ |

---

## 4. End-to-End User Workflows

### 4.1 Onboarding & Admin Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Applicant (Student / Faculty / Parent)
    participant UI as LoginScreen.tsx
    participant API as /api/auth/signup (Express)
    participant Store as In-Memory Store / Oracle
    actor Admin as University Administrator
    participant AdminUI as AdminDashboard.tsx
    participant ApprAPI as /api/users/:id/approval

    User->>UI: Select Role & Fill Registration Form
    Note over User,UI: Faculty: Dept | Student: Reg# | Parent: Linked Student
    UI->>API: POST /api/auth/signup
    API->>Store: Persist user with status = 'PENDING'
    API->>Store: Generate SYSTEM notification for Admin
    API-->>UI: 201 Created (Pending Verification)
    UI-->>User: Display Approval Required Alert

    Admin->>UI: Login as Administrator
    UI->>AdminUI: Open Admin Console
    AdminUI->>API: GET /api/users?status=PENDING
    API-->>AdminUI: List pending applicants
    Admin->>AdminUI: Click "Approve" (or "Decline")
    AdminUI->>ApprAPI: PUT /api/users/:id/approval { status: 'APPROVED' }
    ApprAPI->>Store: Update user status & record Audit Log
    ApprAPI-->>AdminUI: Success
    Note over User,UI: User can now authenticate into authorized portal
```

---

### 4.2 Academic Coursework & Evaluation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Course Instructor
    participant FacUI as FacultyDashboard.tsx
    participant API as Express API (/api/*)
    actor Student as Enrolled Student
    participant StuUI as StudentDashboard.tsx
    actor Parent as Guardian (Raveendra)
    participant ParUI as ParentDashboard.tsx

    Faculty->>FacUI: Post Lab Assignment with instructions & deadline
    FacUI->>API: POST /api/assignments
    API-->>Student: Broadcast Notification: "New Assignment Posted"

    Student->>StuUI: Browse assignment & upload project file
    StuUI->>API: POST /api/submissions { status: 'PENDING' }
    API-->>Faculty: Notification: "Assignment Submitted"

    Faculty->>FacUI: Open Evaluation Queue & grade submission (Marks + Feedback)
    FacUI->>API: PUT /api/submissions/:id/grade
    API-->>Student: Notification: "Assignment Graded: 94/100"

    Parent->>ParUI: Login to Parent Portal
    ParUI->>API: GET /api/parent/children?parentId=usr-parent-1
    API-->>ParUI: Return Child-Only submissions, grades, & attendance
    Note over Parent,ParUI: Visual Histogram updates with new grade
```

---

### 4.3 Quiz Assessment Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Enrolled Student
    participant StuUI as StudentDashboard.tsx
    participant QuizEngine as /api/quizzes/:id/submit
    participant Store as Quiz Attempts Store

    Student->>StuUI: Click "Start Quiz" on Midterm Assessment
    StuUI->>StuUI: Launch interactive timer & MCQ questions
    Student->>StuUI: Select options and click "Submit Answers"
    StuUI->>QuizEngine: POST /api/quizzes/:id/submit { answers, timeTaken }
    QuizEngine->>QuizEngine: Evaluate correctOptionIndex & calculate total score
    QuizEngine->>Store: Record QuizAttempt record
    QuizEngine-->>StuUI: Return { score, totalMarks, attemptId }
    StuUI->>StuUI: Render instant score modal & fire celebratory confetti
```

---

### 4.4 Parent Inquiry & Instructor Feedback Flow

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Guardian (Raveendra)
    participant ParUI as ParentDashboard.tsx
    participant API as /api/parent/reviews
    actor Faculty as Course Instructor
    participant FacUI as FacultyDashboard.tsx

    Parent->>ParUI: Fill Inquiry Form (Subject, Category, Message)
    Note over Parent,ParUI: Category: Academic Concern / Attendance / Appreciation
    ParUI->>API: POST /api/parent/reviews { status: 'SUBMITTED' }
    API-->>Faculty: Notification: "New Parent Inquiry Received"

    Faculty->>FacUI: View Parent Remarks Queue
    Faculty->>FacUI: Enter official instructor reply
    FacUI->>API: PUT /api/parent/reviews/:id/reply
    API-->>Parent: Notification: "Faculty Replied to Inquiry"
    ParUI->>ParUI: Display instructor reply inside parent thread
```

---

## 5. Enterprise Relational Database Specification (Oracle 19c/21c/23c)

The database schema defined in `backend/oracle-schema.sql` establishes referential integrity, automated timestamps, cascading delete actions, and check constraints:

```mermaid
erDiagram
    USERS ||--o{ STUDENTS : "is a"
    USERS ||--o{ FACULTY : "is a"
    USERS ||--o{ PARENTS : "is a"
    USERS ||--o{ PARENT_REVIEWS : "authors"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    STUDENTS ||--o{ PARENTS : "monitored by"
    STUDENTS ||--o{ ENROLLMENTS : "registers"
    COURSES ||--o{ ENROLLMENTS : "has"
    FACULTY ||--o{ COURSES : "instructs"
    COURSES ||--o{ ASSIGNMENTS : "contains"
    ASSIGNMENTS ||--o{ ASSIGNMENT_SUBMISSIONS : "receives"
    STUDENTS ||--o{ ASSIGNMENT_SUBMISSIONS : "submits"
    COURSES ||--o{ QUIZZES : "holds"
    QUIZZES ||--o{ QUESTIONS : "contains"
    QUIZZES ||--o{ QUIZ_ATTEMPTS : "records"
    STUDENTS ||--o{ QUIZ_ATTEMPTS : "takes"
    COURSES ||--o{ ATTENDANCE : "tracks"
    STUDENTS ||--o{ ATTENDANCE : "attends"

    USERS {
        VARCHAR2 user_id PK
        VARCHAR2 name
        VARCHAR2 email UK
        VARCHAR2 password_hash
        VARCHAR2 role
        VARCHAR2 department
        VARCHAR2 avatar_url
        TIMESTAMP created_at
    }

    STUDENTS {
        VARCHAR2 student_id PK
        VARCHAR2 user_id FK
        VARCHAR2 student_reg_number UK
        NUMBER gpa
        NUMBER semester
    }

    FACULTY {
        VARCHAR2 faculty_id PK
        VARCHAR2 user_id FK
        VARCHAR2 faculty_employee_code UK
        VARCHAR2 designation
    }

    PARENTS {
        VARCHAR2 parent_id PK
        VARCHAR2 user_id FK
        VARCHAR2 student_id FK
        VARCHAR2 relationship_type
    }

    PARENT_REVIEWS {
        VARCHAR2 review_id PK
        VARCHAR2 parent_id FK
        VARCHAR2 student_id FK
        VARCHAR2 course_id
        VARCHAR2 category
        VARCHAR2 title
        CLOB message
        VARCHAR2 status
        CLOB faculty_reply
        TIMESTAMP created_at
    }

    COURSES {
        VARCHAR2 course_id PK
        VARCHAR2 code UK
        VARCHAR2 title
        CLOB description
        VARCHAR2 department
        NUMBER credits
        NUMBER semester
        VARCHAR2 faculty_id FK
    }

    ASSIGNMENTS {
        VARCHAR2 assignment_id PK
        VARCHAR2 course_id FK
        VARCHAR2 title
        CLOB description
        TIMESTAMP deadline
        NUMBER max_marks
    }

    ASSIGNMENT_SUBMISSIONS {
        VARCHAR2 submission_id PK
        VARCHAR2 assignment_id FK
        VARCHAR2 student_id FK
        TIMESTAMP submitted_at
        VARCHAR2 file_url
        VARCHAR2 status
        NUMBER marks_obtained
        CLOB feedback
    }

    QUIZZES {
        VARCHAR2 quiz_id PK
        VARCHAR2 course_id FK
        VARCHAR2 title
        NUMBER duration_minutes
        NUMBER total_marks
    }

    QUESTIONS {
        VARCHAR2 question_id PK
        VARCHAR2 quiz_id FK
        CLOB question_text
        CLOB options_json
        NUMBER correct_option_index
        NUMBER marks
    }

    QUIZ_ATTEMPTS {
        VARCHAR2 attempt_id PK
        VARCHAR2 quiz_id FK
        VARCHAR2 student_id FK
        NUMBER score
        TIMESTAMP submitted_at
        NUMBER time_taken_seconds
    }

    ATTENDANCE {
        VARCHAR2 attendance_id PK
        VARCHAR2 course_id FK
        VARCHAR2 student_id FK
        DATE attendance_date
        VARCHAR2 status
    }

    AUDIT_LOGS {
        VARCHAR2 log_id PK
        VARCHAR2 performed_by
        VARCHAR2 user_role
        VARCHAR2 action
        CLOB details
        VARCHAR2 ip_address
        TIMESTAMP created_at
    }
```

---

## 6. REST API Endpoint Catalog

All endpoints are hosted by Express (`server.ts`) and execute under the `/api` prefix:

### Authentication & User Management
- `POST /api/auth/login`: Authenticates credentials, verifies approval status, and issues simulated JWT token.
- `POST /api/auth/signup`: Public self-service registration for Faculty, Students, and Parents (`status = 'PENDING'`). Admin registration is blocked with HTTP 403.
- `PUT /api/users/:id/approval`: Administrator endpoint to approve (`APPROVED`) or decline (`REJECTED`) an applicant.
- `GET /api/users`: Returns registered user accounts with optional `role` and `status` query filtering.

### Course & Content Operations
- `GET /api/courses` & `POST /api/courses`: CRUD operations for curriculum modules, capacity limits, and schedules.
- `GET /api/materials` & `POST /api/materials`: Lecture notes, PDF guides, slide decks, and external media links.

### Coursework & Automated Grading
- `GET /api/assignments` & `POST /api/assignments`: Assignment creation and deadline publishing.
- `GET /api/submissions` & `POST /api/submissions`: Student project upload handler.
- `PUT /api/submissions/:id/grade`: Instructor scoring and written feedback recording.

### Quizzes & Assessment
- `GET /api/quizzes` & `POST /api/quizzes`: Multi-question assessment manager.
- `POST /api/quizzes/:id/submit`: Real-time quiz scoring engine comparing candidate answers against `correctOptionIndex`.
- `GET /api/quiz-attempts`: Returns candidate assessment histories.

### Attendance & Statutory Compliance
- `GET /api/attendance` & `POST /api/attendance`: Session-by-session presence tracking (`PRESENT`, `ABSENT`, `LATE`).

### Parent / Guardian Portal
- `GET /api/parent/children`: Aggregates academic metrics (attendance %, GPA, submissions, quiz scores) restricted to linked child IDs.
- `GET /api/parent/reviews` & `POST /api/parent/reviews`: Parent inquiries categorized by `ACADEMIC_CONCERN`, `ATTENDANCE`, `APPRECIATION`, or `GENERAL`.
- `PUT /api/parent/reviews/:id/reply`: Faculty response dispatcher.

### System Intelligence & Auditing
- `POST /api/ai/assistant`: Gemini 2.5 Flash academic assistant endpoint with intelligent fallback responses.
- `GET /api/audit-logs`: Institutional security activity log.
- `GET /api/backend-code`: Serves complete production Oracle SQL DDL script and Spring Boot microservice files.

---

## 7. Security, Privacy & Data Isolation Model

1. **Child-Only Boundary**:
   - Guardians cannot query or view any student other than their explicitly authorized `childStudentIds`.
   - Recharts visual metrics, submission logs, and attendance percentages are filtered before rendering.
2. **Staff Privilege Isolation**:
   - Parents cannot view internal faculty records, staff communications, or admin controls.
   - Students cannot view other candidates' submission archives or instructor grading queues.
3. **Admin Privilege Isolation**:
   - Administrator accounts cannot be self-registered publicly.
   - All approvals trigger tamper-evident audit log entries recording timestamp, actor, and IP address.
4. **Session Management**:
   - Client sessions are managed via structured local session tokens and can be terminated instantly via the **Sign Out** control.

---

## 8. Deployment & Execution Guide

### Local Development
```powershell
# Navigate to directory
cd E:\Projects\Edutrack

# Install dependencies
npm install

# Start full-stack development server (Express + Vite)
npm run dev
# Server listening on http://localhost:3000
```

### Production Compilation & Deployment
```powershell
# Type check TypeScript codebase
npx tsc --noEmit

# Compile client bundle and bundle server with esbuild
npm run build

# Start production server
npm start
```

### Environment Variables (`.env`)
```env
# Optional: Google Gemini API Key for live AI Academic Assistant
GEMINI_API_KEY="your-gemini-api-key"

# Port (Default: 3000)
PORT=3000
```
