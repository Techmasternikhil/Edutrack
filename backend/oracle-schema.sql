-- =========================================================
-- EduTrack LMS - Oracle Database DDL Schema Script
-- Project: EduTrack LMS Enterprise Architecture
-- Target DB: Oracle Database 19c / 21c / 23c
-- Version: 3.0.0 (Faculty Academic Management & Learning Resources)
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
   EXECUTE IMMEDIATE 'DROP TABLE learning_resources CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE enrollments CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE courses CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE parent_reviews CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE parents CASCADE CONSTRAINTS';
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
    status VARCHAR2(20) DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
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

-- 7. ACADEMIC CLASSES & CLASS TEACHERS TABLE
CREATE TABLE academic_classes (
    class_id VARCHAR2(50) PRIMARY KEY,
    class_name VARCHAR2(150) NOT NULL,
    section VARCHAR2(20) NOT NULL,
    academic_year VARCHAR2(20) NOT NULL,
    department VARCHAR2(100),
    semester NUMBER(2) NOT NULL,
    class_teacher_id VARCHAR2(50) REFERENCES faculty(faculty_id)
);

-- 8. TWO-STAGE REGISTRATION REQUESTS TABLE
CREATE TABLE registration_requests (
    registration_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    applicant_name VARCHAR2(100) NOT NULL,
    applicant_email VARCHAR2(100) NOT NULL,
    requested_role VARCHAR2(20) CHECK (requested_role IN ('STUDENT', 'PARENT')),
    class_id VARCHAR2(50) REFERENCES academic_classes(class_id),
    class_teacher_id VARCHAR2(50) REFERENCES faculty(faculty_id),
    student_id VARCHAR2(50) REFERENCES students(student_id),
    relationship VARCHAR2(30),
    status VARCHAR2(30) DEFAULT 'PENDING_TEACHER_REVIEW' CHECK (status IN (
        'PENDING_TEACHER_REVIEW',
        'TEACHER_CONFIRMED',
        'PENDING_ADMIN_REVIEW',
        'APPROVED',
        'REJECTED_BY_TEACHER',
        'REJECTED_BY_ADMIN'
    )),
    teacher_reviewed_by VARCHAR2(100),
    teacher_reviewed_at TIMESTAMP,
    teacher_review_reason CLOB,
    admin_reviewed_by VARCHAR2(100),
    admin_reviewed_at TIMESTAMP,
    admin_review_reason CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reg_class_teacher ON registration_requests(class_teacher_id);
CREATE INDEX idx_reg_status ON registration_requests(status);

-- 9. ENROLLMENTS TABLE
CREATE TABLE enrollments (
    enrollment_id VARCHAR2(50) PRIMARY KEY,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    course_id VARCHAR2(50) REFERENCES courses(course_id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR2(20) DEFAULT 'ACTIVE'
);

-- 8. LEARNING RESOURCES & TEACHING VIDEOS TABLE
CREATE TABLE learning_resources (
    resource_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    faculty_id VARCHAR2(50) REFERENCES faculty(faculty_id),
    title VARCHAR2(250) NOT NULL,
    description CLOB,
    resource_type VARCHAR2(30) CHECK (resource_type IN ('VIDEO', 'YOUTUBE', 'PDF', 'PRESENTATION', 'DOCUMENT', 'EXTERNAL_LINK', 'SLIDES', 'LINK')),
    resource_url VARCHAR2(1000) NOT NULL,
    thumbnail_url VARCHAR2(500),
    youtube_video_id VARCHAR2(50),
    module_name VARCHAR2(100),
    file_size VARCHAR2(50),
    status VARCHAR2(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_course ON learning_resources(course_id);
CREATE INDEX idx_resources_faculty ON learning_resources(faculty_id);
CREATE INDEX idx_resources_status ON learning_resources(status);
CREATE INDEX idx_resources_type ON learning_resources(resource_type);

-- 9. ASSIGNMENTS TABLE
CREATE TABLE assignments (
    assignment_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR2(200) NOT NULL,
    description CLOB,
    deadline TIMESTAMP NOT NULL,
    max_marks NUMBER(5,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE assignment_submissions (
    submission_id VARCHAR2(50) PRIMARY KEY,
    assignment_id VARCHAR2(50) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url VARCHAR2(500) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'GRADED')),
    marks_obtained NUMBER(5,2),
    feedback CLOB
);

-- 11. QUIZZES TABLE
CREATE TABLE quizzes (
    quiz_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR2(200) NOT NULL,
    instructions CLOB,
    duration_minutes NUMBER(3) NOT NULL,
    total_marks NUMBER(5,2) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    max_attempts NUMBER(2) DEFAULT 1,
    is_published NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. QUESTIONS TABLE
CREATE TABLE questions (
    question_id VARCHAR2(50) PRIMARY KEY,
    quiz_id VARCHAR2(50) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text CLOB NOT NULL,
    options_json CLOB NOT NULL,
    correct_option_index NUMBER(2) NOT NULL,
    marks NUMBER(5,2) NOT NULL,
    explanation CLOB
);

-- 13. QUIZ ATTEMPTS TABLE
CREATE TABLE quiz_attempts (
    attempt_id VARCHAR2(50) PRIMARY KEY,
    quiz_id VARCHAR2(50) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES students(student_id),
    score NUMBER(5,2) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds NUMBER(6)
);

-- 14. ATTENDANCE TABLE (With uniqueness constraint to prevent duplicate attendance records)
CREATE TABLE attendance (
    attendance_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id VARCHAR2(50) REFERENCES students(student_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR2(10) CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    CONSTRAINT uq_att_course_student_date UNIQUE (course_id, student_id, attendance_date)
);

CREATE INDEX idx_att_course_date ON attendance(course_id, attendance_date);
CREATE INDEX idx_att_student_date ON attendance(student_id, attendance_date);
CREATE INDEX idx_att_student_course ON attendance(student_id, course_id, attendance_date);

-- 15. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    log_id VARCHAR2(50) PRIMARY KEY,
    performed_by VARCHAR2(100) NOT NULL,
    user_role VARCHAR2(20) NOT NULL,
    action VARCHAR2(50) NOT NULL,
    details CLOB,
    ip_address VARCHAR2(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. SMS NOTIFICATIONS TABLE (Parent Absence SMS delivery tracking with idempotency)
CREATE TABLE sms_notifications (
    sms_notification_id VARCHAR2(50) PRIMARY KEY,
    student_id VARCHAR2(50) REFERENCES students(student_id) ON DELETE CASCADE,
    parent_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    attendance_id VARCHAR2(50) REFERENCES attendance(attendance_id) ON DELETE CASCADE,
    phone_number_masked VARCHAR2(30) NOT NULL,
    notification_type VARCHAR2(30) DEFAULT 'ABSENCE' CHECK (notification_type IN ('ABSENCE', 'REGULARIZATION', 'EXAM_RESULT', 'GENERAL')),
    message CLOB NOT NULL,
    provider_message_id VARCHAR2(100),
    delivery_status VARCHAR2(20) DEFAULT 'SENT' CHECK (delivery_status IN ('QUEUED', 'SENT', 'DELIVERED', 'FAILED')),
    failure_reason VARCHAR2(500),
    retry_count NUMBER(2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sms_att_parent_type UNIQUE (attendance_id, parent_id, notification_type)
);

CREATE INDEX idx_sms_student ON sms_notifications(student_id);
CREATE INDEX idx_sms_parent ON sms_notifications(parent_id);
CREATE INDEX idx_sms_status ON sms_notifications(delivery_status);

-- 17. ATTENDANCE REGULARIZATION REQUESTS (Medical & OD Workflows)
CREATE TABLE attendance_regularization_requests (
    request_id VARCHAR2(50) PRIMARY KEY,
    student_id VARCHAR2(50) REFERENCES students(student_id) ON DELETE CASCADE,
    class_id VARCHAR2(50) REFERENCES academic_classes(class_id),
    class_teacher_id VARCHAR2(50) REFERENCES faculty(faculty_id),
    request_type VARCHAR2(20) CHECK (request_type IN ('MEDICAL', 'OD')),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason CLOB NOT NULL,
    optional_note CLOB,
    event_name VARCHAR2(200),
    event_type VARCHAR2(50),
    event_venue VARCHAR2(200),
    status VARCHAR2(40) DEFAULT 'SUBMITTED' CHECK (status IN (
        'DRAFT', 'SUBMITTED', 'AWAITING_APPROVED_OD_DOCUMENT', 'DOCUMENT_UPLOADED',
        'PENDING_CLASS_TEACHER_REVIEW', 'REJECTED_BY_CLASS_TEACHER', 'CLASS_TEACHER_APPROVED',
        'FORWARDED_TO_SUBJECT_FACULTY', 'PARTIALLY_APPROVED', 'APPROVED', 'REJECTED_BY_FACULTY', 'ATTENDANCE_ADJUSTED'
    )),
    class_teacher_decision VARCHAR2(20) CHECK (class_teacher_decision IN ('APPROVED', 'REJECTED')),
    class_teacher_reason CLOB,
    class_teacher_reviewed_at TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reg_req_student ON attendance_regularization_requests(student_id);
CREATE INDEX idx_reg_req_teacher ON attendance_regularization_requests(class_teacher_id);
CREATE INDEX idx_reg_req_status ON attendance_regularization_requests(status);

-- 18. ATTENDANCE REQUEST DOCUMENTS (Medical certificates & OD proofs)
CREATE TABLE attendance_request_documents (
    document_id VARCHAR2(50) PRIMARY KEY,
    request_id VARCHAR2(50) REFERENCES attendance_regularization_requests(request_id) ON DELETE CASCADE,
    document_type VARCHAR2(40) CHECK (document_type IN ('MEDICAL_CERTIFICATE', 'OD_SUPPORTING_DOCUMENT', 'APPROVED_OD', 'OTHER')),
    file_url VARCHAR2(1000) NOT NULL,
    file_name VARCHAR2(255) NOT NULL,
    mime_type VARCHAR2(100),
    file_size VARCHAR2(50),
    uploaded_by VARCHAR2(50) REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. ATTENDANCE REQUEST SESSIONS (Timetable detected affected sessions routed to subject faculty)
CREATE TABLE attendance_request_sessions (
    request_session_id VARCHAR2(50) PRIMARY KEY,
    request_id VARCHAR2(50) REFERENCES attendance_regularization_requests(request_id) ON DELETE CASCADE,
    attendance_id VARCHAR2(50) REFERENCES attendance(attendance_id),
    course_id VARCHAR2(50) REFERENCES courses(course_id),
    session_date DATE NOT NULL,
    period_number NUMBER(2),
    faculty_id VARCHAR2(50) REFERENCES faculty(faculty_id),
    class_teacher_approved NUMBER(1) DEFAULT 1,
    faculty_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (faculty_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    faculty_reviewed_by VARCHAR2(100),
    faculty_reviewed_at TIMESTAMP,
    faculty_reason CLOB
);

-- 20. ATTENDANCE ADJUSTMENTS TABLE (Audit preserved regularized status without erasing original)
CREATE TABLE attendance_adjustments (
    adjustment_id VARCHAR2(50) PRIMARY KEY,
    attendance_id VARCHAR2(50) REFERENCES attendance(attendance_id) ON DELETE CASCADE,
    request_id VARCHAR2(50) REFERENCES attendance_regularization_requests(request_id),
    adjustment_type VARCHAR2(30) CHECK (adjustment_type IN ('MEDICAL', 'OD', 'MANUAL_CORRECTION', 'ADMIN_CORRECTION')),
    original_status VARCHAR2(10) CHECK (original_status IN ('PRESENT', 'ABSENT', 'LATE')),
    effective_status VARCHAR2(10) CHECK (effective_status IN ('PRESENT', 'ABSENT', 'LATE')),
    approved_by VARCHAR2(100) NOT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_adj_att_req_type UNIQUE (attendance_id, request_id, adjustment_type)
);

CREATE INDEX idx_adj_attendance ON attendance_adjustments(attendance_id);

-- 21. EXAM ASSESSMENTS TABLE (IAT 1, IAT 2, Model Exam assessments)
CREATE TABLE exam_assessments (
    assessment_id VARCHAR2(50) PRIMARY KEY,
    course_id VARCHAR2(50) REFERENCES courses(course_id) ON DELETE CASCADE,
    academic_class_id VARCHAR2(50) REFERENCES academic_classes(class_id),
    exam_type VARCHAR2(20) CHECK (exam_type IN ('IAT1', 'IAT2', 'MODEL')),
    title VARCHAR2(200) NOT NULL,
    max_marks NUMBER(5,2) NOT NULL,
    exam_date DATE NOT NULL,
    created_by VARCHAR2(50) REFERENCES faculty(faculty_id),
    status VARCHAR2(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'LOCKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX idx_exam_course_type ON exam_assessments(course_id, exam_type);

-- 22. EXAM RESULTS TABLE (Subject-specific marks for enrolled students)
CREATE TABLE exam_results (
    result_id VARCHAR2(50) PRIMARY KEY,
    assessment_id VARCHAR2(50) REFERENCES exam_assessments(assessment_id) ON DELETE CASCADE,
    course_id VARCHAR2(50) REFERENCES courses(course_id),
    student_id VARCHAR2(50) REFERENCES students(student_id) ON DELETE CASCADE,
    marks_obtained NUMBER(5,2) NOT NULL,
    max_marks NUMBER(5,2) NOT NULL,
    percentage NUMBER(5,2) NOT NULL,
    result_status VARCHAR2(20) DEFAULT 'PASS' CHECK (result_status IN ('PASS', 'FAIL', 'ABSENT', 'WITHHELD')),
    remarks VARCHAR2(300),
    entered_by VARCHAR2(50) REFERENCES faculty(faculty_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_exam_result_student UNIQUE (assessment_id, student_id)
);

CREATE INDEX idx_res_assessment ON exam_results(assessment_id);
CREATE INDEX idx_res_student ON exam_results(student_id);

-- 23. PROFILE CHANGE REQUESTS TABLE
CREATE TABLE profile_change_requests (
    request_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    user_role VARCHAR2(20) CHECK (user_role IN ('STUDENT', 'PARENT', 'FACULTY')),
    request_type VARCHAR2(35) CHECK (request_type IN ('PROFILE_INFORMATION', 'PROFILE_IMAGE', 'PROFILE_INFORMATION_AND_IMAGE')),
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    approval_level VARCHAR2(20) CHECK (approval_level IN ('CLASS_TEACHER', 'ADMIN')),
    class_id VARCHAR2(50) REFERENCES academic_classes(class_id),
    class_teacher_id VARCHAR2(50) REFERENCES faculty(faculty_id),
    child_student_id VARCHAR2(50) REFERENCES students(student_id),
    current_avatar_url VARCHAR2(500),
    pending_avatar_url VARCHAR2(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR2(100),
    reviewer_id VARCHAR2(50) REFERENCES users(user_id),
    reviewer_role VARCHAR2(20),
    reviewed_at TIMESTAMP,
    rejection_reason CLOB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pcr_user_status ON profile_change_requests(user_id, status);
CREATE INDEX idx_pcr_teacher_status ON profile_change_requests(class_teacher_id, status);

-- 24. PROFILE CHANGE DETAILS TABLE
CREATE TABLE profile_change_details (
    change_id VARCHAR2(50) PRIMARY KEY,
    request_id VARCHAR2(50) REFERENCES profile_change_requests(request_id) ON DELETE CASCADE,
    field_name VARCHAR2(50) NOT NULL,
    field_label VARCHAR2(100) NOT NULL,
    old_value CLOB,
    new_value CLOB,
    field_type VARCHAR2(20) CHECK (field_type IN ('TEXT', 'PHONE', 'EMAIL', 'IMAGE', 'DATE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pcd_request ON profile_change_details(request_id);

-- 25. PROFILE IMAGE CHANGES AUDIT TABLE
CREATE TABLE profile_image_changes (
    image_change_id VARCHAR2(50) PRIMARY KEY,
    request_id VARCHAR2(50) REFERENCES profile_change_requests(request_id) ON DELETE CASCADE,
    user_id VARCHAR2(50) REFERENCES users(user_id) ON DELETE CASCADE,
    current_image_ref VARCHAR2(500),
    pending_image_ref VARCHAR2(500) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP
);

CREATE INDEX idx_pic_user ON profile_image_changes(user_id, status);

-- SEED DATA
INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-admin-1', 'Dr. Rajesh Verma', 'admin@edutrack.edu', '$2a$10$e8K71jL1...', 'ADMIN', 'University Administration');

INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-fac-1', 'Prof. Ananya Sharma', 'ananya.sharma@edutrack.edu', '$2a$10$f9M82kM2...', 'FACULTY', 'Computer Science');

INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-stu-1', 'Aarav Sharma', 'aarav.sharma@student.edutrack.edu', '$2a$10$g0N93lN3...', 'STUDENT', 'Computer Science');

INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-stu-2', 'Diya Patel', 'diya.patel@student.edutrack.edu', '$2a$10$h1P94mO4...', 'STUDENT', 'Computer Science');

INSERT INTO users (user_id, name, email, password_hash, role, department) 
VALUES ('usr-parent-1', 'Raveendra Sharma', 'raveendra.sharma@edutrack.edu', '$2a$10$i2Q95nP5...', 'PARENT', 'Guardian Relations');

COMMIT;
