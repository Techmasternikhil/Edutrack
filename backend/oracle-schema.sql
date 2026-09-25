-- =========================================================
-- EduTrack LMS - Oracle Database DDL Schema Script
-- Project: EduTrack LMS
-- Target DB: Oracle Database 19c / 21c / 23c
-- =========================================================

-- Drop Tables if existing
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE audit_logs CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE attendance CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE quiz_attempts CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE questions CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE quizzes CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE assignment_submissions CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE assignments CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE enrollments CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE courses CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE faculty CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE students CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

-- 1. USERS TABLE
CREATE TABLE users (
    user_id VARCHAR2(50) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    role VARCHAR2(20) CHECK (role IN ('ADMIN', 'FACULTY', 'STUDENT', 'PARENT')),
    department VARCHAR2(100),
    avatar_url VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS TABLE
CREATE TABLE students (
    student_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    student_reg_number VARCHAR2(30) UNIQUE NOT NULL,
    gpa NUMBER(3,2) DEFAULT 0.00,
    semester NUMBER(2) DEFAULT 1
);

-- 3. PARENTS TABLE
CREATE TABLE parents (
    parent_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES students(student_id) ON DELETE CASCADE,
    relationship_type VARCHAR2(30) DEFAULT 'GUARDIAN'
);

-- 4. PARENT REVIEWS TABLE
CREATE TABLE parent_reviews (
    review_id VARCHAR2(50) PRIMARY KEY,
    parent_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    course_id VARCHAR2(50),
    category VARCHAR2(30) DEFAULT 'GENERAL',
    title VARCHAR2(200) NOT NULL,
    message CLOB NOT NULL,
    status VARCHAR2(30) DEFAULT 'SUBMITTED',
    faculty_reply CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. FACULTY TABLE
CREATE TABLE faculty (
    faculty_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    faculty_employee_code VARCHAR2(30) UNIQUE NOT NULL,
    designation VARCHAR2(100)
);

-- 6. COURSES TABLE
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

-- 5. ENROLLMENTS TABLE
CREATE TABLE enrollments (
    enrollment_id VARCHAR2(50) PRIMARY KEY,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    course_id VARCHAR2(50) REFERENCES courses(course_id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR2(20) DEFAULT 'ACTIVE'
);

-- 6. ASSIGNMENTS TABLE
CREATE TABLE assignments (
    assignment_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR2(200) NOT NULL,
    description CLOB,
    deadline TIMESTAMP NOT NULL,
    max_marks NUMBER(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ASSIGNMENT SUBMISSIONS TABLE
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

-- 8. QUIZZES TABLE
CREATE TABLE quizzes (
    quiz_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR2(200) NOT NULL,
    instructions CLOB,
    duration_minutes NUMBER(3) NOT NULL,
    total_marks NUMBER(5,2) NOT NULL,
    is_published NUMBER(1) DEFAULT 1
);

-- 9. QUESTIONS TABLE
CREATE TABLE questions (
    question_id VARCHAR2(50) PRIMARY KEY,
    quiz_id VARCHAR2(50) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text CLOB NOT NULL,
    options_json CLOB NOT NULL,
    correct_option_index NUMBER(2) NOT NULL,
    marks NUMBER(5,2) NOT NULL
);

-- 10. QUIZ ATTEMPTS TABLE
CREATE TABLE quiz_attempts (
    attempt_id VARCHAR2(50) PRIMARY KEY,
    quiz_id VARCHAR2(50) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    score NUMBER(5,2) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds NUMBER(6)
);

-- 11. ATTENDANCE TABLE
CREATE TABLE attendance (
    attendance_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id),
    student_id VARCHAR2(50) REFERENCES students(student_id),
    attendance_date DATE NOT NULL,
    status VARCHAR2(10) CHECK (status IN ('PRESENT', 'ABSENT', 'LATE'))
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    log_id VARCHAR2(50) PRIMARY KEY,
    performed_by VARCHAR2(100) NOT NULL,
    user_role VARCHAR2(20) NOT NULL,
    action VARCHAR2(50) NOT NULL,
    details CLOB,
    ip_address VARCHAR2(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SAMPLE SEED DATA INSERTIONS
INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-admin-1', 'Dr. Eleanor Vance', 'admin@edutrack.edu', '$2a$10$e8K71jL1...', 'ADMIN', 'Academic Affairs');

INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-fac-1', 'Prof. Alan Turing', 'faculty@edutrack.edu', '$2a$10$f9M82kM2...', 'FACULTY', 'Computer Science');

INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-stu-1', 'Alex Rivera', 'student@edutrack.edu', '$2a$10$g0N93lN3...', 'STUDENT', 'Computer Science');

INSERT INTO students (student_id, user_id, student_reg_number, gpa, semester)
VALUES ('stu-101', 'usr-stu-1', 'STU-2023-042', 3.82, 4);

INSERT INTO faculty (faculty_id, user_id, faculty_employee_code, designation)
VALUES ('fac-101', 'usr-fac-1', 'FAC-2022-012', 'Associate Professor');

INSERT INTO courses (course_id, code, title, description, department, credits, semester, faculty_id)
VALUES ('crs-101', 'CS-301', 'Data Structures & Algorithms', 'Core computer science algorithms and memory structures.', 'Computer Science', 4, 4, 'fac-101');

COMMIT;
