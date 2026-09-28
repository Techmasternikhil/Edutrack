# EduTrack LMS — Enterprise University Academic & Learning Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38b2ac.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**EduTrack LMS** is an enterprise-grade university academic management and role-based learning platform. It implements strict **Role-Based Access Control (RBAC)** across four discrete user portals (**Admin**, **Faculty / Staff**, **Student**, and **Parent**), featuring an audited **Two-Stage Registration Pipeline**, continuous academic grading, live lecture management, quiz assessment engine, and comprehensive parent-teacher oversight.

---

## 📌 Key Architectural Highlights

- **🛡️ Strict Multi-Role RBAC**: 4 isolated portals with contextual dashboard views for Administrators, Faculty members, Students, and Parents.
- **🔄 Two-Stage Onboarding & Verification**:
  - **Stage 1 (Class Teacher Verification)**: When students or parents register, the application routes automatically to their designated Department Class Teacher for academic validation.
  - **Stage 2 (Administrator Clearance & Account Activation)**: Once confirmed by the Class Teacher, university administrators conduct institutional security clearance to activate login credentials.
- **📊 Statutory Attendance Monitoring Engine**:
  - Subject-wise and cumulative attendance analytics calculated via `academic.ts`.
  - Statutory 75% threshold enforcement with dynamic shortage calculation (classes required to reach 75%).
  - Real-time attendance logging by faculty and non-intrusive live monitoring for students and parents.
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
| **Academic Calculation Engine** | **TypeScript (`src/utils/academic.ts`)** | Real-time statutory attendance compliance, shortage forecasting, and GPA aggregations |
| **Server Runtime** | **Node.js**, **Express.js**, **tsx** | REST API providing authentication, registration queue routing, and gradebook processing |
| **Bundling & Build** | **Vite 6**, **esbuild** | Sub-second HMR dev server and optimized production build compilation |
| **Database Schema** | **Oracle SQL 19c/21c DDL** | 3NF normalized schema with B-Tree indexes, foreign keys, and audit logging tables |

---

## 👥 Role Matrix & Default Demo Credentials

You can test every role directly using the **1-Click Test** profile buttons on the login screen or by entering the credentials below:

| Role | Name | Email Address | Password | Context / Role Details |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Rajesh Verma | `admin@edutrack.edu` | `admin123` | Institutional oversight, user provisioning, billing audits |
| **Faculty Advisor** | Dr. R. Elankavi | `elankavi.cse@edutrack.edu` | `password123` | Faculty Advisor (Section VII-A), PSP(T+P), Seminar |
| **Faculty / Instructor** | Dr. N. Sarika | `sarika.cse@edutrack.edu` | `password123` | Course Faculty for SE & Mini Project |
| **Student** | Aarav Sharma | `aarav.sharma@student.edutrack.edu` | `password123` | Reg: `CS-2024-041`, GPA: 3.82, Fee: PAID |
| **Student** | Diya Patel | `diya.patel@student.edutrack.edu` | `password123` | Reg: `CS-2024-042`, GPA: 3.91, Fee: PENDING |
| **Student** | Rohan Iyer | `rohan.iyer@student.edutrack.edu` | `password123` | Reg: `CS-2024-043`, GPA: 3.78, Fee: OVERDUE |
| **Parent** | Raveendra Sharma | `raveendra.sharma@gmail.com` | `password123` | Guardian of Aarav Sharma (Isolated access) |
| **Parent** | Suresh Patel | `suresh.patel@gmail.com` | `password123` | Guardian of Diya Patel (Isolated access) |
| **Parent** | Subramanian Iyer | `subramanian.iyer@gmail.com` | `password123` | Guardian of Rohan Iyer (Isolated access) |

*Additional 7 students and parents are cataloged below in the Cohort Directory.*

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

### 4. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```
Default configuration values:
```env
PORT=3000
NODE_ENV=development
VITE_APP_TITLE="EduTrack LMS | University Academic Intelligence System"
```

### 5. Run Development Server
Start the unified Express API backend and Vite client server:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🛠️ Production Build & Deployment

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
│   └── oracle-schema.sql          # Production Oracle SQL DDL schema & seed records
├── dist/                          # Compiled production bundles
├── src/
│   ├── components/                # Modular React presentation components
│   │   ├── admin/
│   │   │   └── EditUserModal.tsx  # User modification modal for staff, students & parents
│   │   ├── billing/
│   │   │   └── BillingAlertManager.tsx # Arrears modal and fee overdue alerting
│   │   ├── faculty/
│   │   │   ├── AssignmentFormModal.tsx
│   │   │   ├── AttendanceSessionManager.tsx # Real-time session attendance marker
│   │   │   ├── MaterialFormModal.tsx
│   │   │   ├── QuizAnalyticsModal.tsx
│   │   │   ├── QuizFormModal.tsx
│   │   │   ├── VideoFormModal.tsx
│   │   │   └── YouTubeVideoPlayer.tsx
│   │   ├── student/
│   │   │   ├── StudentAttendanceSection.tsx # 75% statutory attendance & shortage monitor
│   │   │   └── StudentBillingSection.tsx    # Fee invoices, checkout & receipt viewer
│   │   ├── AdminDashboard.tsx     # Institutional administration console
│   │   ├── FacultyDashboard.tsx   # Faculty grading & curriculum management portal
│   │   ├── Header.tsx             # Universal responsive top navigation bar
│   │   ├── LoginScreen.tsx        # Multi-role authentication & registration screen
│   │   ├── ParentDashboard.tsx    # Parent oversight & ward performance analytics
│   │   ├── StudentDashboard.tsx   # Student coursework & quiz submission portal
│   │   └── UserProfileModal.tsx   # Account details & credentials modal
│   ├── config/
│   │   └── constants.ts           # Central platform configurations & constants
│   ├── data/
│   │   └── mockData.ts            # Seed users, courses, quizzes, assignments & logs
│   ├── types/
│   │   └── index.ts               # Core TypeScript interface and type definitions
│   ├── utils/
│   │   └── academic.ts            # Academic calculation engine (attendance & GPA)
│   ├── App.tsx                    # Top-level state coordinator & route controller
│   ├── index.css                  # Global styles & Tailwind design tokens
│   └── main.tsx                   # React root entry point
├── EduTrack_LMS_Project_Report.md # Full enterprise project report & architecture specification
├── .env.example                   # Environment configuration template
├── package.json                   # Project dependencies and npm scripts
├── README.md                      # Comprehensive project documentation
├── server.ts                      # Express.js REST API & Vite dev server runner
├── tsconfig.json                  # TypeScript compiler options
└── vite.config.ts                 # Vite bundler configuration
```

---

## 👨‍🎓 Enrolled Student & Parent Cohort (Section VII-A)

All 10 enrolled students and their corresponding legal parents/guardians are fully configured with authentic Indian naming, isolated parent-student relationship keys (`childStudentIds`), GPA scores, and academic fee ledger profiles.

| # | Student Name | Reg Number | Student Login Email | Parent / Guardian | Parent Login Email | GPA | Fee Status |
|---|---|---|---|---|---|:---:|:---:|
| 1 | **Aarav Sharma** | `CS-2024-041` | `aarav.sharma@student.edutrack.edu` | **Raveendra Sharma** | `raveendra.sharma@gmail.com` | 3.82 | PAID |
| 2 | **Diya Patel** | `CS-2024-042` | `diya.patel@student.edutrack.edu` | **Suresh Patel** | `suresh.patel@gmail.com` | 3.91 | PENDING |
| 3 | **Rohan Iyer** | `CS-2024-043` | `rohan.iyer@student.edutrack.edu` | **Subramanian Iyer** | `subramanian.iyer@gmail.com` | 3.78 | OVERDUE |
| 4 | **Ananya Deshmukh** | `CS-2024-044` | `ananya.deshmukh@student.edutrack.edu` | **Rajesh Deshmukh** | `rajesh.deshmukh@gmail.com` | 3.88 | PAID |
| 5 | **Aditya Verma** | `CS-2024-045` | `aditya.verma@student.edutrack.edu` | **Manoj Verma** | `manoj.verma@gmail.com` | 3.65 | PAID |
| 6 | **Pooja Sundaram** | `CS-2024-046` | `pooja.sundaram@student.edutrack.edu` | **Gopal Sundaram** | `gopal.sundaram@gmail.com` | 3.95 | PAID |
| 7 | **Karthik Raman** | `CS-2024-047` | `karthik.raman@student.edutrack.edu` | **Venkatesh Raman** | `venkatesh.raman@gmail.com` | 3.72 | PENDING |
| 8 | **Sneha Kulkarni** | `CS-2024-048` | `sneha.kulkarni@student.edutrack.edu` | **Anand Kulkarni** | `anand.kulkarni@gmail.com` | 3.84 | PAID |
| 9 | **Vikram Choudhury** | `CS-2024-049` | `vikram.choudhury@student.edutrack.edu` | **Debashis Choudhury** | `debashis.choudhury@gmail.com` | 3.59 | OVERDUE |
| 10 | **Meera Nair** | `CS-2024-050` | `meera.nair@student.edutrack.edu` | **Balachandran Nair** | `balachandran.nair@gmail.com` | 3.92 | PAID |

*All accounts use standard demo security credentials: password `password123`.*

---

## 🧪 Testing Core User Workflows

To verify the platform end-to-end:

1. **Two-Stage Registration Test**:
   - On `http://localhost:3000`, switch to the **Register** tab.
   - Register a new **Student** account with an Indian name and select an Academic Class.
   - Log in as the assigned Class Teacher (**Dr. R. Elankavi** / `elankavi.cse@edutrack.edu`). Go to the **Registration Queue** and click **Confirm Student Registration**.
   - Log in as Administrator (**Dr. Rajesh Verma** / `admin@edutrack.edu`). In the **Registrations** tab, click **Approve & Activate**. The new user is now live and can log in immediately.
2. **Attendance Tracking & 75% Statutory Compliance**:
   - Log in as Faculty (`elankavi.cse@edutrack.edu`) and record session attendance under **PSP(T+P)**.
   - Log in as Student (`aarav.sharma@student.edutrack.edu`) to verify real-time percentage updates, compliance badge (`GOOD STANDING` vs `SHORTAGE ALERT`), and classes needed calculator.
3. **Semester Fee Payment & Receipt Generation**:
   - Log in as Student (`diya.patel@student.edutrack.edu`) or Parent (`suresh.patel@gmail.com`).
   - Settle pending semester dues using UPI/NetBanking mock checkout and download the official payment receipt.
4. **Admin User Profile & Class Timetable Management**:
   - Log in as Admin (`admin@edutrack.edu`) to audit registered users, update fee alerts, or review the weekly 30-period timetable.

---

## 🔒 Security & RBAC Specifications

- **Client & Server Role Validation**: Public registration for `ADMIN` role is strictly blocked; administrative accounts can only be provisioned by authenticated administrators.
- **Two-Stage Isolation**: Only the explicitly assigned Class Teacher for a given batch has authorization to confirm Stage 1 registration requests.
- **Data Privacy**: Parent portal views are scoped strictly to their verified child student IDs (`childStudentIds`).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

