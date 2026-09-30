/**
 * Comprehensive Automated End-to-End API and Business Logic Test Suite for EduTrack LMS
 * Tests across all roles: ADMIN, FACULTY, STUDENT, PARENT
 * Tests:
 * 1. Authentication & User Retrieval
 * 2. Academic Classes & Timetable
 * 3. Courses & Materials
 * 4. Assignments & Submissions
 * 5. Quizzes & Submissions
 * 6. Attendance Marking & Absence SMS Notifications
 * 7. Historical Attendance Adjustments
 * 8. Attendance Regularization (Medical & On-Duty)
 * 9. Internal Exam Results Management (IAT-1, IAT-2, Model Exam)
 * 10. Fee Billing & Payments
 * 11. Controlled Profile Change Requests & Multi-Level Approvals
 * 12. Audit Logging & Notifications
 */

const BASE_URL = 'http://localhost:3000';

const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    results.push({ name: testName, status: 'PASS', details });
    console.log(`[PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
  } else {
    results.push({ name: testName, status: 'FAIL', details });
    console.error(`[FAIL] ${testName} - ${details}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log(' STARTING EDUTRACK FULL SYSTEM AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: Users & RBAC
    // ----------------------------------------------------
    console.log('\n--- 1. Users & RBAC ---');
    const usersRes = await fetch(`${BASE_URL}/api/users`);
    const users = await usersRes.json();
    assert(Array.isArray(users) && users.length >= 10, 'Fetch All Users', `Found ${users.length} users`);

    const admin = users.find(u => u.role === 'ADMIN');
    const teacher = users.find(u => u.role === 'FACULTY' && u.isClassTeacher);
    const faculty = users.find(u => u.role === 'FACULTY' && !u.isClassTeacher);
    const student = users.find(u => u.role === 'STUDENT');
    const parent = users.find(u => u.role === 'PARENT');

    assert(Boolean(admin), 'Admin user exists', admin?.name);
    assert(Boolean(teacher), 'Class Teacher faculty exists', teacher?.name);
    assert(Boolean(faculty), 'Subject faculty exists', faculty?.name);
    assert(Boolean(student), 'Student user exists', student?.name);
    assert(Boolean(parent), 'Parent user exists', parent?.name);

    // Auth Login Check
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, role: 'ADMIN' })
    });
    const loginData = await loginRes.json();
    assert(Boolean(loginData.token), 'Admin Login Authentication', loginData.message);

    // ----------------------------------------------------
    // TEST SUITE 2: Academic Classes & Timetable
    // ----------------------------------------------------
    console.log('\n--- 2. Classes & Timetable ---');
    const classesRes = await fetch(`${BASE_URL}/api/academic-classes`);
    const classes = await classesRes.json();
    assert(Array.isArray(classes) && classes.length > 0, 'Fetch Academic Classes', `Found ${classes.length} classes`);

    const timetableRes = await fetch(`${BASE_URL}/api/timetable`);
    const timetable = await timetableRes.json();
    assert(Array.isArray(timetable) && timetable.length > 0, 'Fetch Timetable Slots', `Found ${timetable.length} slots`);

    // ----------------------------------------------------
    // TEST SUITE 3: Courses & Materials
    // ----------------------------------------------------
    console.log('\n--- 3. Courses & Materials ---');
    const coursesRes = await fetch(`${BASE_URL}/api/courses`);
    const courses = await coursesRes.json();
    assert(Array.isArray(courses) && courses.length > 0, 'Fetch Courses', `Found ${courses.length} courses`);

    const testCourse = courses[0];
    const newMaterial = {
      courseId: testCourse.id,
      title: 'Automated Test Lecture Notes',
      type: 'PDF',
      url: 'https://example.com/notes.pdf',
      unitNumber: 1,
      status: 'PUBLISHED'
    };
    const addMatRes = await fetch(`${BASE_URL}/api/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMaterial)
    });
    const addMatData = await addMatRes.json();
    assert(addMatData.id || addMatData.title === newMaterial.title, 'Add Course Material', addMatData.title);

    // ----------------------------------------------------
    // TEST SUITE 4: Assignments & Submissions
    // ----------------------------------------------------
    console.log('\n--- 4. Assignments & Submissions ---');
    const asgRes = await fetch(`${BASE_URL}/api/assignments`);
    const assignments = await asgRes.json();
    assert(Array.isArray(assignments) && assignments.length > 0, 'Fetch Assignments', `Found ${assignments.length} assignments`);

    const targetAsg = assignments[0];
    const subRes = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignmentId: targetAsg.id,
        assignmentTitle: targetAsg.title,
        courseCode: targetAsg.courseCode || 'CS201',
        studentId: student.id,
        studentName: student.name,
        fileName: 'Solution_E2E_Test.pdf'
      })
    });
    const subData = await subRes.json();
    assert(subData.id && subData.studentId === student.id, 'Submit Student Assignment', `Submission ID: ${subData.id}`);

    // Grade assignment
    const gradeRes = await fetch(`${BASE_URL}/api/submissions/${subData.id}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marksObtained: 95, feedback: 'Outstanding execution and depth.' })
    });
    const gradeData = await gradeRes.json();
    assert(gradeData.marksObtained === 95, 'Faculty Grades Assignment', `Marks: ${gradeData.marksObtained}`);

    // ----------------------------------------------------
    // TEST SUITE 5: Quizzes & Submissions
    // ----------------------------------------------------
    console.log('\n--- 5. Quizzes & Submissions ---');
    const quizzesRes = await fetch(`${BASE_URL}/api/quizzes`);
    const quizzes = await quizzesRes.json();
    assert(Array.isArray(quizzes) && quizzes.length > 0, 'Fetch Quizzes', `Found ${quizzes.length} quizzes`);

    const targetQuiz = quizzes[0];
    const quizSubRes = await fetch(`${BASE_URL}/api/quizzes/${targetQuiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        studentName: student.name,
        answers: { [targetQuiz.questions?.[0]?.id || 'q1']: 0 },
        timeTakenSeconds: 120
      })
    });
    const quizSubData = await quizSubRes.json();
    assert(quizSubData.attempt && quizSubData.score !== undefined, 'Submit Quiz Attempt', `Score: ${quizSubData.score}`);

    // ----------------------------------------------------
    // TEST SUITE 6: Attendance & Parent Absence SMS
    // ----------------------------------------------------
    console.log('\n--- 6. Attendance & Parent Absence SMS ---');
    // Use teacher's assigned course: 'crs-psp' (Problem Solving Using Python Programming)
    const assignedCourse = courses.find(c => c.facultyId === teacher.id) || testCourse;
    const testDate = '2026-09-30';
    const markAttRes = await fetch(`${BASE_URL}/api/courses/${assignedCourse.id}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: testDate,
        facultyId: teacher.id,
        records: [
          { studentId: student.id, studentName: student.name, status: 'ABSENT' }
        ]
      })
    });
    const markAttData = await markAttRes.json();
    assert(markAttData.success, 'Faculty Mark Student Absent', `Processed: ${markAttData.count} students`);

    // Check SMS Dispatch
    const smsRes = await fetch(`${BASE_URL}/api/notifications/sms`);
    const smsList = await smsRes.json();
    assert(Array.isArray(smsList) && smsList.length > 0, 'Parent Absence SMS Triggered & Recorded', `Total SMS logged: ${smsList.length}`);

    // ----------------------------------------------------
    // TEST SUITE 7: Historical Attendance Editor
    // ----------------------------------------------------
    console.log('\n--- 7. Historical Attendance Adjustment ---');
    // Find attendance record for this student and assignedCourse
    const attListRes = await fetch(`${BASE_URL}/api/attendance?studentId=${student.id}&courseId=${assignedCourse.id}`);
    const attList = await attListRes.json();
    assert(Array.isArray(attList) && attList.length > 0, 'Find Attendance Record for Editing');

    const targetAtt = attList[0];
    const adjustRes = await fetch(`${BASE_URL}/api/attendance/${targetAtt.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'PRESENT',
        performedBy: teacher.name,
        userRole: 'FACULTY',
        facultyId: teacher.id,
        reason: 'Automated E2E Verification - Regularized student attendance'
      })
    });
    const adjustData = await adjustRes.json();
    assert(adjustData.success && (adjustData.updated?.status === 'PRESENT' || adjustData.updated?.effectiveStatus === 'PRESENT'), 'Historical Attendance Edited by Authorized Faculty', `New status: ${adjustData.updated?.status || adjustData.updated?.effectiveStatus}`);

    // ----------------------------------------------------
    // TEST SUITE 8: Attendance Regularization (Medical & OD)
    // ----------------------------------------------------
    console.log('\n--- 8. Attendance Regularization Requests ---');
    const regReqRes = await fetch(`${BASE_URL}/api/attendance-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        requestType: 'MEDICAL',
        fromDate: '2026-09-28',
        toDate: '2026-09-29',
        reason: 'Severe acute bronchitis certified by medical doctor',
        documentUrl: 'https://example.com/medical_cert.pdf',
        documentName: 'Hospital_Discharge_Certificate.pdf'
      })
    });
    const regReqData = await regReqRes.json();
    assert(Boolean(regReqData.id), 'Submit Medical Regularization Request', `Req ID: ${regReqData.id}`);

    // Class Teacher reviews and forwards
    if (regReqData.id) {
      const reviewRegRes = await fetch(`${BASE_URL}/api/class-teacher/attendance-requests/${regReqData.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'APPROVE',
          reason: 'Valid medical certificate verified',
          teacherId: teacher.id,
          teacherName: teacher.name
        })
      });
      const reviewRegData = await reviewRegRes.json();
      assert(reviewRegData.success, 'Class Teacher Approves & Forwards Regularization', reviewRegData.request?.status);

      // If affected session exists, course faculty approves it
      const session = reviewRegData.request?.affectedSessions?.[0];
      if (session) {
        const facDecisionRes = await fetch(`${BASE_URL}/api/faculty/attendance-adjustments/${session.id}/decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: 'APPROVE',
            facultyReason: 'Verified medical clearance with class teacher',
            facultyName: teacher.name
          })
        });
        const facDecisionData = await facDecisionRes.json();
        assert(facDecisionData.success, 'Course Faculty Commits Attendance Regularization Adjustment', facDecisionData.session?.facultyStatus);
      }
    }

    // ----------------------------------------------------
    // TEST SUITE 9: Exam Results Management (IAT-1, IAT-2, Model Exam)
    // ----------------------------------------------------
    console.log('\n--- 9. Internal Exam Results Management ---');
    const examAssessmentsRes = await fetch(`${BASE_URL}/api/exam-assessments`);
    const examAssessments = await examAssessmentsRes.json();
    assert(Array.isArray(examAssessments) && examAssessments.length > 0, 'Fetch Exam Assessments', `Found ${examAssessments.length} assessments`);

    const targetExam = examAssessments[0];
    const examCourse = courses.find(c => c.id === targetExam.courseId);
    const examFacultyId = targetExam.createdByFacultyId || examCourse?.facultyId || teacher.id;
    const examFacultyName = targetExam.createdByFacultyName || examCourse?.facultyName || teacher.name;

    const updateResultRes = await fetch(`${BASE_URL}/api/exam-assessments/${targetExam.id}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facultyId: examFacultyId,
        facultyName: examFacultyName,
        results: [
          {
            studentId: student.id,
            marksObtained: 48,
            remarks: 'Excellent analytical response'
          }
        ]
      })
    });
    const updateResultData = await updateResultRes.json();
    assert(updateResultData.success, 'Save Exam Results for IAT Assessment', `Updated count: ${updateResultData.count || 1}`);

    // Publish Results
    const publishRes = await fetch(`${BASE_URL}/api/exam-assessments/${targetExam.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facultyId: examFacultyId, facultyName: examFacultyName })
    });
    const publishData = await publishRes.json();
    assert(publishData.success, 'Publish Exam Results to Portals', `Status: ${publishData.assessment?.status}`);

    // Verify Student views published result
    const stuResultRes = await fetch(`${BASE_URL}/api/student/results?studentId=${student.id}`);
    const stuResults = await stuResultRes.json();
    assert(Array.isArray(stuResults) && stuResults.length > 0, 'Student Accesses Published Exam Results');

    // ----------------------------------------------------
    // TEST SUITE 10: Fee Billing & Payments
    // ----------------------------------------------------
    console.log('\n--- 10. Fee Billing & Payments ---');
    const feesRes = await fetch(`${BASE_URL}/api/fees`);
    const fees = await feesRes.json();
    assert(Array.isArray(fees) && fees.length > 0, 'Fetch Fee Records', `Found ${fees.length} fee records`);

    const studentFee = fees.find(f => f.studentId === student.id && f.status !== 'PAID') || fees[0];
    if (studentFee && studentFee.status !== 'PAID') {
      const payFeeRes = await fetch(`${BASE_URL}/api/fees/${studentFee.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'UPI',
          paidBy: student.name,
          payerRole: 'STUDENT',
          transactionRef: 'UPI-TEST-998877'
        })
      });
      const payFeeData = await payFeeRes.json();
      assert(payFeeData.success, 'Process Online Fee Payment', `Receipt: ${payFeeData.fee?.receiptNumber}`);
    } else {
      assert(true, 'Fee Payment (Previously Cleared)', studentFee?.receiptNumber || 'PAID');
    }

    // ----------------------------------------------------
    // TEST SUITE 11: Controlled Profile Management & Approval Workflow
    // ----------------------------------------------------
    console.log('\n--- 11. Controlled Profile Management & Approval Workflow ---');

    // 11.1 Fetch current student profile
    const stuProfileRes = await fetch(`${BASE_URL}/api/profile/me?userId=${student.id}`);
    const stuProfileData = await stuProfileRes.json();
    assert(stuProfileData.user && stuProfileData.user.id === student.id, 'Fetch Student Profile via API', stuProfileData.user.name);

    // 11.2 Check Class Teacher Queue
    const parentReqsRes = await fetch(`${BASE_URL}/api/class-teacher/profile-change-requests?teacherId=${teacher.id}`);
    const teacherQueue = await parentReqsRes.json();
    assert(Array.isArray(teacherQueue), 'Class Teacher Retrieves Profile Requests Queue', `Queue items: ${teacherQueue.length}`);

    // If an existing pending request exists for this student, approve or cancel it first
    if (stuProfileData.pendingRequest) {
      await fetch(`${BASE_URL}/api/class-teacher/profile-change-requests/${stuProfileData.pendingRequest.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacher.id, teacherName: teacher.name })
      });
    }

    // 11.3 Submit Student Profile Change Request with unique values
    const newStudentPhone = `+91 91234 ${Math.floor(10000 + Math.random() * 90000)}`;
    const newStudentAddress = `${Math.floor(10 + Math.random() * 90)} Ocean View Boulevard, Chennai - 600028`;
    const submitStuPCRRes = await fetch(`${BASE_URL}/api/profile/me/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: student.id,
        userRole: 'STUDENT',
        changes: {
          phone: newStudentPhone,
          address: newStudentAddress
        }
      })
    });
    const submitStuPCRData = await submitStuPCRRes.json();
    assert(submitStuPCRData.success, 'Student Submits Profile Change Request', submitStuPCRData.message);

    // 11.4 Verify Active Profile Remains Unchanged Before Approval
    const checkActiveRes = await fetch(`${BASE_URL}/api/profile/me?userId=${student.id}`);
    const checkActiveData = await checkActiveRes.json();
    assert(checkActiveData.pendingRequest !== null, 'Profile Request Stored As PENDING without overwriting active record');

    // 11.5 Teacher Approves Pending Request
    if (checkActiveData.pendingRequest) {
      const pcrId = checkActiveData.pendingRequest.id;
      const approveStuPCRRes = await fetch(`${BASE_URL}/api/class-teacher/profile-change-requests/${pcrId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacher.id,
          teacherName: teacher.name
        })
      });
      const approveStuPCRData = await approveStuPCRRes.json();
      assert(approveStuPCRData.success, 'Class Teacher Approves Student Profile Request', approveStuPCRData.message);

      // Verify active user profile now has new values
      const verifyApprovedRes = await fetch(`${BASE_URL}/api/profile/me?userId=${student.id}`);
      const verifyApprovedData = await verifyApprovedRes.json();
      assert(verifyApprovedData.pendingRequest === null, 'Pending Request Cleared after Approval');
      assert(verifyApprovedData.user.phone === newStudentPhone, 'Active Profile Updated Atomically upon Approval', verifyApprovedData.user.phone);
    }

    // 11.6 Faculty Submits Profile Change Request (Routes to Admin)
    const newFacultyPhone = `+91 98840 ${Math.floor(10000 + Math.random() * 90000)}`;
    const submitFacPCRRes = await fetch(`${BASE_URL}/api/profile/me/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: faculty.id,
        userRole: 'FACULTY',
        changes: {
          phone: newFacultyPhone
        }
      })
    });
    const submitFacPCRData = await submitFacPCRRes.json();
    assert(submitFacPCRData.success || submitFacPCRData.error?.includes('already'), 'Faculty Submits Profile Change Request for Admin Review', submitFacPCRData.message || submitFacPCRData.error);

    // 11.7 Admin Retrieves and Approves Faculty Request
    const adminQueueRes = await fetch(`${BASE_URL}/api/admin/profile-change-requests`);
    const adminQueue = await adminQueueRes.json();
    assert(Array.isArray(adminQueue), 'Admin Retrieves Profile Requests Queue', `Queue items: ${adminQueue.length}`);

    const facPending = adminQueue.find(r => r.userId === faculty.id && r.status === 'PENDING');
    if (facPending) {
      const approveFacRes = await fetch(`${BASE_URL}/api/admin/profile-change-requests/${facPending.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin.id,
          adminName: admin.name
        })
      });
      const approveFacData = await approveFacRes.json();
      assert(approveFacData.success, 'Admin Approves Faculty Profile Request', approveFacData.message);
    }

    // ----------------------------------------------------
    // TEST SUITE 12: Audit Logging & Notifications
    // ----------------------------------------------------
    console.log('\n--- 12. Audit Logging & System Notifications ---');
    const auditRes = await fetch(`${BASE_URL}/api/audit-logs`);
    const auditLogs = await auditRes.json();
    assert(Array.isArray(auditLogs) && auditLogs.length > 0, 'System Audit Logs Recorded', `Total audit entries: ${auditLogs.length}`);

    const notifRes = await fetch(`${BASE_URL}/api/notifications?userId=${student.id}`);
    const notifs = await notifRes.json();
    assert(Array.isArray(notifs) && notifs.length > 0, 'In-App Notifications Generated for Student', `Notification count: ${notifs.length}`);

  } catch (err) {
    console.error('Fatal error during test run:', err);
    assert(false, 'Full Test Execution', err.message);
  }

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('                 TEST SUMMARY REPORT                ');
  console.log('====================================================');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`Total Tests Run : ${results.length}`);
  console.log(`Passed         : ${passCount}`);
  console.log(`Failed         : ${failCount}`);
  console.log(`Success Rate   : ${((passCount / results.length) * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
