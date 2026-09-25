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
- **👨‍🏫 Faculty Instruction Portal**: YouTube video lecture integration, syllabus course material distribution, interactive quiz authoring with auto-grading, assignment evaluation, and attendance tracking.
- **🎓 Student Learning Workspace**: Real-time course progress tracking, interactive quiz attempts with timer and instant grade calculation, assignment upload management, and attendance compliance gauges.
- **👨‍👩‍👧 Parent Academic Oversight Portal**: Multi-child switcher, continuous GPA and grade breakdown analytics (via Recharts), absence alerts, and direct teacher inquiry messaging.
- **⚙️ Institutional Admin Console**: Manage university batches & academic classes, provision administrators, audit logins, and update details for registered faculty, students, and parents.
- **🏛️ Production Ready Backend & Database**: Express.js REST API layer with in-memory persistence and enterprise Oracle Database SQL schema (`backend/oracle-schema.sql`).

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19**, **TypeScript** | High-performance reactive UI with modular component hierarchy |
| **Styling & Design System** | **TailwindCSS v4**, **Lucide React** | Modern dark-mode interface with glassmorphism, responsive grids, and micro-animations |
| **Data Visualizations** | **Recharts** | Interactive academic performance charts, grade distributions, and attendance radar gauges |
| **Server Runtime** | **Node.js**, **Express.js**, **tsx** | REST API providing authentication, registration queue routing, and gradebook processing |
| **Bundling & Build** | **Vite 6**, **esbuild** | Sub-second HMR dev server and optimized production build compilation |
| **Database Schema** | **Oracle SQL 19c/21c DDL** | 3NF normalized schema with B-Tree indexes, foreign keys, and audit logging tables |

---

## 👥 Role Matrix & Default Demo Credentials

You can test every role directly using the **1-Click Test** profile buttons on the login screen or by entering the credentials below:

| Role | Name | Email Address | Password | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Rajesh Verma | `admin@edutrack.edu` | `admin123` | System oversight, create classes, approve registrations, edit user records |
| **Faculty / Staff** | Prof. Ananya Sharma | `ananya.sharma@edutrack.edu` | `faculty123` | Class Teacher review queue, publish videos/materials, grade assignments, quizzes |
| **Faculty / Staff** | Dr. Vikram Sarabhai | `vikram.sarabhai@edutrack.edu` | `faculty123` | Department instructor, course content management |
| **Student** | Aarav Sharma | `aarav.sharma@student.edutrack.edu` | `student123` | Submit assignments, attempt quizzes, view attendance and GPA analytics |
| **Student** | Diya Patel | `diya.patel@student.edutrack.edu` | `student123` | Enrolled learner, video lectures, grades |
| **Parent** | Raveendra Sharma | `raveendra.sharma@edutrack.edu` | `parent123` | Monitor student Aarav Sharma, view attendance status, message faculty |
| **Parent** | Suresh Patel | `suresh.patel@gmail.com` | `parent123` | Monitor student Diya Patel, academic performance oversight |

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
│   │   ├── faculty/
│   │   │   ├── AssignmentFormModal.tsx
│   │   │   ├── AttendanceSessionManager.tsx
│   │   │   ├── MaterialFormModal.tsx
│   │   │   ├── QuizAnalyticsModal.tsx
│   │   │   ├── QuizFormModal.tsx
│   │   │   ├── VideoFormModal.tsx
│   │   │   └── YouTubeVideoPlayer.tsx
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
│   ├── App.tsx                    # Top-level state coordinator & route controller
│   ├── index.css                  # Global styles & Tailwind design tokens
│   └── main.tsx                   # React root entry point
├── .env.example                   # Environment configuration template
├── package.json                   # Project dependencies and npm scripts
├── README.md                      # Comprehensive project documentation
├── server.ts                      # Express.js REST API & Vite dev server runner
├── tsconfig.json                  # TypeScript compiler options
└── vite.config.ts                 # Vite bundler configuration
```

---

## 🧪 Testing Core User Workflows

To verify the platform end-to-end:

1. **Two-Stage Registration Test**:
   - On `http://localhost:3000`, switch to the **Register** tab.
   - Register a new **Student** account with an Indian name and select an Academic Class.
   - Log in as the assigned Class Teacher (**Prof. Ananya Sharma** / `ananya.sharma@edutrack.edu`). Go to the **Registration Queue** and click **Confirm Student Registration**.
   - Log in as Administrator (**Dr. Rajesh Verma** / `admin@edutrack.edu`). In the **Registrations** tab, click **Approve & Activate**. The new user is now live and can log in immediately.
2. **Admin User Profile Editing**:
   - Log in as Admin (`admin@edutrack.edu`).
   - Scroll down to the **Registered Accounts Directory**.
   - Click the **Edit** button next to any staff, student, or parent to modify department, roll number, class assignment, or linked children.
3. **Faculty & Student Academic Cycle**:
   - In Faculty Dashboard, create an interactive Quiz or publish a new YouTube lecture video.
   - Switch to Student portal (`aarav.sharma@student.edutrack.edu`), watch the video, and complete the quiz with instant score calculation.
4. **Parent Performance Oversight**:
   - Log in as Parent (`raveendra.sharma@edutrack.edu`) to review attendance compliance gauges, subject grade averages, and send parent-teacher feedback remarks.

---

## 🔒 Security & RBAC Specifications

- **Client & Server Role Validation**: Public registration for `ADMIN` role is strictly blocked; administrative accounts can only be provisioned by authenticated administrators.
- **Two-Stage Isolation**: Only the explicitly assigned Class Teacher for a given batch has authorization to confirm Stage 1 registration requests.
- **Data Privacy**: Parent portal views are scoped strictly to their verified child student IDs (`childStudentIds`).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
