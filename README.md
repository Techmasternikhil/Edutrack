# EduTrack LMS — Enterprise University Academic & Learning Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38b2ac.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**EduTrack LMS** is an enterprise-grade university academic management and role-based learning platform. It implements strict **Role-Based Access Control (RBAC)** across four discrete user portals (**Admin**, **Faculty / Staff**, **Student**, and **Parent**), featuring a controlled **Profile Management & Multi-Level Approval System**, audited **Two-Stage Registration Pipeline**, continuous academic grading, live lecture management, quiz assessment engine, and comprehensive parent-teacher oversight.

---

## 📌 Key Architectural Highlights

- **🛡️ Strict Multi-Role RBAC**: 4 isolated portals with contextual dashboard views for Administrators, Faculty members, Students, and Parents.
- **🔒 Controlled Profile Management & Multi-Level Approval System**:
  - Implements the architectural principle: **`Submit → Pending → Approver Review → Atomic Apply`**.
  - Current active profile values (name, contact, address, avatar) remain in effect until the authorized approver endorses changes.
  - **Approval Routing**:
    - **Student Profiles**: Routed automatically to the student's assigned **Class Teacher**.
    - **Parent Profiles**: Routed automatically to the linked child's assigned **Class Teacher**.
    - **Faculty / Staff Profiles**: Routed to the institutional **Administrator**.
    - **Administrator Profiles**: Direct edits with immutable audit logging (`ADMIN_PROFILE_UPDATE`), protecting core role boundaries.
  - **Protected Institutional Fields**: Student IDs, Registration Numbers, Class/Section, Department, Semester, GPA, and Roles cannot be altered via self-service.
  - **Side-by-Side Review Modals**: Approvers review side-by-side comparisons of current vs. proposed values with mandatory rejection reason logging.
- **🔄 Two-Stage Onboarding & Verification**:
  - **Stage 1 (Class Teacher Verification)**: When students or parents register, the application routes automatically to their designated Department Class Teacher for academic validation.
  - **Stage 2 (Administrator Clearance & Account Activation)**: Once confirmed by the Class Teacher, university administrators conduct institutional security clearance to activate login credentials.
- **📊 Statutory Attendance & Two-Tier Regularization**:
  - Subject-wise and cumulative attendance analytics calculated via `academic.ts`.
  - Statutory 75% threshold enforcement with dynamic shortage calculation (classes required to reach 75%).
  - **Automated Absence SMS**: Instant parent notifications triggered idempotently whenever a student is marked absent.
  - **Medical Leave & On-Duty (OD) Regularization**: Student submissions with certificates, schedule detection, Class Teacher verification, and course faculty approval.
  - **Historical Attendance Editor**: Authorized course faculty can correct historical records with mandatory audit reasons.
- **📝 Continuous Internal Assessment & Model Exam Manager**:
  - Full management of **IAT-1**, **IAT-2**, and **Model Examination** results.
  - Bulk student mark entry, automatic percentage scoring, and single-click publication to Student & Parent portals.
- **💳 Financial Clearance & Fee Billing Portal**:
  - Semester tuition, lab, and examination invoice generation with overdue penalties.
  - Seamless simulated UPI, NetBanking, and Card checkout with downloadable payment receipts.
  - Integrated billing alerts with auto-populated arrears for administrators and faculty advisors.
- **👨‍🏫 Official AY 2026–2027 Academic Structure**:
  - Pre-configured for Department of CSE, Semester IV (ODD), Section VII / VII-A.
  - 10 prescribed subjects (`CNS`, `SE`, `PSP(T+P)`, `DL`, `OS(T+P)`, `IR`, `MINI PRO`, `SEM`, `MENTOR`, `CC/ECC`) mapped to designated faculty instructors and laboratories.
  - Weekly 30-period master timetable matrix preserving institutional break slots.
- **🎓 Complete Indian Student & Parent Cohort**:
  - 10 fully seeded Indian students with registration numbers, academic GPAs, and class assignments.
  - 10 corresponding parents with strictly isolated 1-to-1 data bindings (`childStudentIds`).

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19**, **TypeScript** | High-performance reactive UI with modular component hierarchy |
| **Styling & Design System** | **TailwindCSS v4**, **Lucide React** | Modern dark-mode interface with glassmorphism, responsive grids, and micro-animations |
| **Data Visualizations** | **Recharts** | Interactive academic performance charts, grade distributions, and attendance radar gauges |
| **Policy & Validation Service** | **TypeScript (`src/services/ProfilePolicyService.ts`)** | Centralized profile policy rules, field permissions, MIME/size file validation |
| **Academic Calculation Engine** | **TypeScript (`src/utils/academic.ts`)** | Real-time statutory attendance compliance, shortage forecasting, and GPA aggregations |
| **Server Runtime** | **Node.js**, **Express.js**, **tsx** | REST API providing authentication, profile workflows, registration routing, and gradebook processing |
| **Bundling & Build** | **Vite 6**, **esbuild** | Sub-second HMR dev server and optimized production build compilation |
| **Database Schema** | **Oracle SQL 19c/21c DDL** | 3NF normalized schema with B-Tree indexes, foreign keys, and audit logging tables (25 tables) |

---

## 👥 Role Matrix & Default Demo Credentials

You can test every role directly using the **1-Click Test** profile buttons on the login screen or by entering the credentials below:

| Role | Name | Email Address | Password | Context / Role Details |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Rajesh Verma | `admin@edutrack.edu` | `admin123` | Institutional oversight, faculty profile approvals, billing audits |
| **Faculty Advisor** | Dr. R. Elankavi | `elankavi@edutrack.edu` | `password123` | Class Teacher (Section VII-A), Student/Parent Profile Queue, PSP(T+P) |
| **Faculty / Instructor** | Dr. N. Sarika | `sarika@edutrack.edu` | `password123` | Course Faculty for SE & Mini Project |
| **Student** | Aarav Sharma | `aarav.sharma@student.edutrack.edu` | `password123` | Reg: `CS-2024-041`, CGPA: 8.12, Fee: PAID |
| **Student** | Diya Patel | `diya.patel@student.edutrack.edu` | `password123` | Reg: `CS-2024-042`, CGPA: 8.35, Fee: PENDING |
| **Student** | Rohan Iyer | `rohan.iyer@student.edutrack.edu` | `password123` | Reg: `CS-2024-043`, CGPA: 7.78, Fee: OVERDUE |
| **Parent** | Raveendra Sharma | `raveendra.sharma@edutrack.edu` | `password123` | Guardian of Aarav Sharma (Isolated access) |
| **Parent** | Suresh Patel | `suresh.patel@gmail.com` | `password123` | Guardian of Diya Patel (Isolated access) |
| **Parent** | Subramanian Iyer | `subramanian.iyer@gmail.com` | `password123` | Guardian of Rohan Iyer (Isolated access) |

*Additional 7 students and parents are cataloged in the mock data cohort.*

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher

### 2. Clone the Repository
```bash
git clone https://github.com/Techmasternikhil/Edutrack.git
cd Edutrack
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
Start the unified Express API backend and Vite client server:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 5. Run Automated E2E Test Suite
Execute the full 41-point regression and business logic test suite:
```bash
node test-all-features.js
```

---

## 🛠️ Production Build & Verification

To generate an optimized, minified production build:

```bash
# 1. Typecheck the entire codebase
npm run lint

# 2. Compile client bundle (Vite) and server bundle (esbuild)
npm run build

# 3. Launch the production server
npm run start
```
The compiled output will be generated into the `dist/` directory:
- `dist/index.html` & `dist/assets/`: Minified React frontend assets.
- `dist/server.cjs`: Standalone bundled Node.js backend.

---

## 📂 Repository Structure

```
Edutrack/
├── backend/
│   └── oracle-schema.sql          # Production Oracle SQL DDL schema (25 normalized tables)
├── dist/                          # Compiled production bundles
├── src/
│   ├── components/                # Modular React presentation components
│   │   ├── admin/
│   │   │   ├── AdminFacultyProfileApprovalQueue.tsx # Admin queue for faculty profile requests
│   │   │   └── EditUserModal.tsx
│   │   ├── billing/
│   │   │   └── BillingAlertManager.tsx              # Arrears modal and fee overdue alerting
│   │   ├── faculty/
│   │   │   ├── AssignmentFormModal.tsx
│   │   │   ├── AttendanceSessionManager.tsx         # Real-time session attendance marker
│   │   │   ├── ClassTeacherProfileApprovalQueue.tsx # Class Teacher approval queue (Students & Parents)
│   │   │   ├── ClassTeacherRegularizationReview.tsx # Medical & OD regularization reviewer
│   │   │   ├── FacultyAdjustmentQueue.tsx           # Subject faculty regularization adjustment queue
│   │   │   ├── FacultyExamResultsManager.tsx        # IAT-1, IAT-2 & Model Exam result publisher
│   │   │   ├── HistoricalAttendanceEditor.tsx       # Historical attendance correction with audit log
│   │   │   ├── MaterialFormModal.tsx
│   │   │   ├── QuizAnalyticsModal.tsx
│   │   │   ├── QuizFormModal.tsx
│   │   │   ├── VideoFormModal.tsx
│   │   │   └── YouTubeVideoPlayer.tsx
│   │   ├── profile/
│   │   │   └── ProfileManagementView.tsx            # Universal profile management, edit & history view
│   │   ├── student/
│   │   │   ├── AttendanceRegularizationModal.tsx    # Medical & OD document upload modal
│   │   │   ├── StudentAttendanceSection.tsx         # 75% statutory attendance & shortage monitor
│   │   │   ├── StudentBillingSection.tsx            # Fee invoices, checkout & receipt viewer
│   │   │   ├── StudentExamResultsSection.tsx        # Internal exam result report cards
│   │   │   └── StudentRegularizationSection.tsx     # Student leave application tracking
│   │   ├── AdminDashboard.tsx                       # Institutional administration console
│   │   ├── FacultyDashboard.tsx                     # Faculty grading & curriculum management portal
│   │   ├── Header.tsx                               # Universal responsive top navigation bar
│   │   ├── LoginScreen.tsx                          # Multi-role authentication & registration screen
│   │   ├── ParentDashboard.tsx                      # Parent oversight & ward performance analytics
│   │   ├── StudentDashboard.tsx                     # Student coursework & quiz submission portal
│   │   └── UserProfileModal.tsx                     # Account details & contact info modal
│   ├── config/
│   │   └── constants.ts                             # Central platform configurations & constants
│   ├── data/
│   │   └── mockData.ts                              # Seed users, courses, quizzes, assignments & logs
│   ├── services/
│   │   └── ProfilePolicyService.ts                  # Centralized profile policy rules & validators
│   ├── types/
│   │   └── index.ts                                 # Core TypeScript interface and type definitions
│   ├── utils/
│   │   └── academic.ts                              # Academic calculation engine (attendance & GPA)
│   ├── App.tsx                                      # Top-level state coordinator & route controller
│   ├── index.css                                    # Global styles & Tailwind design tokens
│   └── main.tsx                                     # React root entry point
├── test-all-features.js                             # Comprehensive 41-point automated E2E test suite
├── EduTrack_LMS_Project_Report.md                   # Full enterprise project report & architecture specification
├── package.json                                     # Project dependencies and npm scripts
├── README.md                                        # Comprehensive project documentation
├── server.ts                                        # Express.js REST API & Vite dev server runner
├── tsconfig.json                                    # TypeScript compiler options
└── vite.config.ts                                   # Vite bundler configuration
```

---

## 🧪 Testing Core User Workflows

To verify the platform end-to-end:

1. **Controlled Profile Approval Workflow**:
   - Log in as Student (**Aarav Sharma** / `aarav.sharma@student.edutrack.edu`).
   - Go to **My Profile & Settings** $\rightarrow$ Click **Edit Profile** $\rightarrow$ Update mobile number and upload a new profile image $\rightarrow$ Click **Submit for Approval**.
   - Notice the **"Profile Update Pending"** banner. The active profile card continues displaying previous information.
   - Switch account to Class Teacher (**Dr. R. Elankavi** / `elankavi@edutrack.edu`).
   - In the **Student & Parent Profile Requests** tab, click **Review** on the pending request.
   - Compare current vs. requested images and field values side-by-side, then click **Approve Changes**.
   - Log back into the Student portal to verify that the new profile image and phone number are now atomically active.
2. **Two-Stage Registration Test**:
   - On `http://localhost:3000`, switch to the **Register** tab and submit a new student registration.
   - Log in as the assigned Class Teacher (**Dr. R. Elankavi**). Go to the **Registration Queue** and click **Confirm Student Registration**.
   - Log in as Administrator (**Dr. Rajesh Verma**). In the **Registrations** tab, click **Approve & Activate**.
3. **Attendance Regularization & Absence Alerts**:
   - Log in as Faculty and mark a student absent. Verify that an instant Absence SMS record is created.
   - Log in as Student, submit a **Medical Certificate** under Attendance Regularization.
   - Class Teacher reviews and endorses the certificate; course faculty regularizes the session to `PRESENT`.
4. **Internal Exam Results (IAT-1, IAT-2, Model)**:
   - Log in as Faculty, open **Exam Results Manager**, enter student marks, and click **Publish Results**.
   - Check Student and Parent dashboards to view the updated report card.
5. **Semester Fee Payment & Receipt Generation**:
   - Log in as Student or Parent $\rightarrow$ Go to **Fees & Billing** $\rightarrow$ Settle pending dues via UPI/Card $\rightarrow$ Download receipt.

---

## 🔒 Security & RBAC Specifications

- **Client & Server Role Validation**: Public registration for `ADMIN` role is strictly blocked; administrative accounts can only be provisioned by authenticated administrators.
- **Two-Stage Isolation**: Only the explicitly assigned Class Teacher for a given batch has authorization to confirm Stage 1 registration requests.
- **Profile Change Isolation**: Proposed profile and photo changes are staged in isolated request tables (`profile_change_requests`) and never overwrite active records prematurely.
- **Data Privacy**: Parent portal views are scoped strictly to their verified child student IDs (`childStudentIds`).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
