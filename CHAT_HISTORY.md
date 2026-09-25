# EduTrack LMS — Conversation & Project Setup History

**Date**: 2026-09-04 to 2026-09-23  
**Project**: EduTrack LMS (Enterprise University Learning Management System)  
**Repository**: `d:\edutrack-lms`  
**Server URL**: [http://localhost:3000](http://localhost:3000)

---

## 1. Project Overview & Architecture
- **Type**: Full-Stack Single-Page Application (SPA) with integrated Express backend & Vite middleware.
- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React icons, Canvas Confetti, Framer Motion (`motion`).
- **Data & Reporting**: Recharts (interactive dashboards), jsPDF (PDF reports), SheetJS/XLSX (Excel sheets).
- **Backend**: Embedded Node.js Express server (`server.ts`) serving REST API endpoints (`/api/*`), with fallback Gemini AI Assistant (`/api/ai/assistant`).
- **Database & Data**: In-memory data store seeded from `src/data/mockData.ts`, plus production-ready Oracle schema in `backend/oracle-schema.sql`.

---

## 2. Issues Encountered & Steps Taken (Early History: 2026-09-04)

### Issue 1: Missing Node.js Environment
- **Symptom**: `'node'` and `'npm'` were not recognized in PowerShell / CMD.
- **Resolution**:
  - Installed Node.js LTS via `winget`:
    ```powershell
    winget install OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
    ```
  - Successfully installed Node.js `v24.19.0` and npm `11.17.0`.
  - Reloaded machine and user `PATH` environment variables.

### Issue 2: Package Installation
- **Action**: Ran `npm install` to install 287 packages (React 19, Vite, Tailwind v4, Recharts, Lucide, jsPDF, XLSX).

### Issue 3: Mock Data Import Error in `server.ts`
- **Symptom**: `Cannot find module .../src/data/mockData.js imported from server.ts`.
- **Resolution**: Changed the import statement in `server.ts` from `./src/data/mockData.js` to `./src/data/mockData` so TypeScript/Node resolved the `.ts` file properly.

### Issue 4: Blank Screen in Web Browser at `localhost:3000`
- **Root Cause**:
  1. `Header.tsx` and `UserProfileModal.tsx` were expecting `onOpenProfile`, `isOpen`, and `onClose` callback props, but `App.tsx` was rendering `<Header />` and `<UserProfileModal />` without them, causing a React component mounting runtime crash in the browser.
  2. A previous Node process was holding Vite's WebSocket HMR port (`24678`).
- **Resolution**:
  - Updated `src/App.tsx` with `isProfileOpen` state and wired the required callbacks to `<Header onOpenProfile={() => setIsProfileOpen(true)} />` and `<UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />`.
  - Cleared `node_modules/.vite` cache and terminated stale Node background tasks.
  - Restarted the server cleanly.

---

## 3. Latest Updates & Milestones (2026-09-23)

### Milestone 1: Workspace Analysis & Recovery of Frontend `src/` Directory
- **Observation**: During repository analysis on `d:\edutrack-lms`, the root configuration files (`package.json`, `server.ts`, `backend/oracle-schema.sql`) were intact, but the `src/` directory was missing from the filesystem.
- **Action Taken**: 
  - Restored the complete modern frontend architecture in `src/` using React 19, TypeScript, and Tailwind CSS v4.
  - Created type definitions (`src/types/index.ts`), mock data stores (`src/data/mockData.ts`), styling tokens (`src/index.css`), root application state (`src/App.tsx`), and entrypoint (`src/main.tsx`).

### Milestone 2: Implementation of Parent Role & Multi-Role RBAC
- **Requirement**: Add a new user role for **Parents/Guardians** with dedicated dashboards and tools to monitor and review student academic activities.
- **Backend & Data Architecture Updates**:
  - **`server.ts`**:
    - Added `mockParentReviews` and initialized `parentReviewsStore`.
    - Added `GET /api/parent/children` to calculate and return linked student metrics (attendance percentage, assignment score averages, submission histories, and quiz attempts).
    - Added `GET /api/parent/reviews` to retrieve inquiry and remark threads.
    - Added `POST /api/parent/reviews` to allow parents to submit remarks categorized into `GENERAL`, `ACADEMIC_CONCERN`, `ATTENDANCE`, or `APPRECIATION`.
    - Added `PUT /api/parent/reviews/:id/reply` for faculty to respond to parent remarks.
  - **`backend/oracle-schema.sql`**:
    - Updated `users` table check constraint: `CHECK (role IN ('ADMIN', 'FACULTY', 'STUDENT', 'PARENT'))`.
    - Created relational `parents` table (`parent_id`, `user_id`, `student_id`, `relationship_type`).
    - Created `parent_reviews` table (`review_id`, `parent_id`, `student_id`, `course_id`, `category`, `title`, `message`, `status`, `faculty_reply`, `created_at`).

### Milestone 3: Dedicated Parent Dashboard (`ParentDashboard.tsx`)
- **Key Features Built**:
  1. **Multi-Child Profile Switcher**: Toggle between registered children without re-logging in.
  2. **Academic KPI Metrics Strip**: Real-time Cumulative GPA, total submissions, and Attendance Compliance gauge with an automatic warning if attendance drops below the 75% statutory requirement.
  3. **Visual Analytics (Recharts)**:
     - **Attendance Distribution Pie Chart**: Visual breakdown of Present, Late, and Absent sessions.
     - **Assignment Performance Bar Chart**: Histogram of scores achieved across graded assignments.
  4. **Activity & Submission Review**: View child assignment submissions, submission timestamps, uploaded files, marks obtained, and faculty comments.
  5. **Assessment & Quiz Review**: Detailed list of quiz attempts with completion duration and scores.
  6. **Interactive Parent Review & Inquiry Submission Form**: Submit remarks directly to instructors and track reply history.

### Milestone 4: Multi-Role Dashboard Ecosystem
- **Faculty Dashboard (`FacultyDashboard.tsx`)**: Allows instructors to grade submissions with feedback and directly reply to parent inquiries.
- **Student Dashboard (`StudentDashboard.tsx`)**: Allows students to track GPA, view course materials, submit assignments, and view attendance.
- **Admin Dashboard (`AdminDashboard.tsx`)**: Provides institutional KPIs, active parent portal counts, user management, and parent inquiry monitoring.
- **Header & Navigation (`Header.tsx`)**: Quick portal switcher to test and navigate between Parent, Student, Faculty, and Admin views with real-time notifications.
- **User Profile Modal (`UserProfileModal.tsx`)**: Shows parent-child monitoring links and user authorization status.

### Milestone 5: Professional Project Documentation
- Generated a comprehensive enterprise project report: `EduTrack_LMS_Project_Report.md` detailing system architecture, entity relationships, security models, API specifications, and future roadmaps.

---

## 4. Useful Commands for Future Reference

- **Start Development Server**:
  ```powershell
  npm run dev
  ```
- **Type Check & Lint**:
  ```powershell
  npx tsc --noEmit
  ```
- **Build Production Bundle**:
  ```powershell
  npm run build
  ```
- **Start Production Server**:
  ```powershell
  npm start
  ```
