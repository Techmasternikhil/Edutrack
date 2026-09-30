import { AttendanceRecord, AttendanceStatus, Course } from '../types';
import { APP_CONFIG } from '../config/constants';

export interface AttendanceSummary {
  presentCount: number;
  lateCount: number;
  absentCount: number;
  medicalAdjustedCount: number;
  odAdjustedCount: number;
  effectivePresentCount: number;
  totalRecords: number;
  attendanceRate: number;
  effectiveAttendanceRate: number;
  isCompliant: boolean;
  statusLabel: 'COMPLIANT' | 'WARNING';
  shortageCount: number; // Number of additional consecutive classes to attend to reach statutory threshold
}

export interface SubjectAttendanceMetric {
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyName?: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  medicalAdjustedCount: number;
  odAdjustedCount: number;
  effectivePresentCount: number;
  totalRecords: number;
  attendanceRate: number;
  effectiveAttendanceRate: number;
  isCompliant: boolean;
  statusLabel: 'COMPLIANT' | 'WARNING';
  shortageCount: number;
  records: AttendanceRecord[];
}

export interface CompleteAttendanceProfile {
  overall: AttendanceSummary;
  subjects: SubjectAttendanceMetric[];
  recentActivity: AttendanceRecord[];
  history: AttendanceRecord[];
}

/**
 * Calculates academic attendance metrics and compliance based on configured thresholds.
 * Preserves the original faculty-marked status while calculating the regularized effective status.
 */
export function calculateAttendanceMetrics(records: AttendanceRecord[]): AttendanceSummary {
  const totalRecords = records.length;
  if (totalRecords === 0) {
    return {
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      medicalAdjustedCount: 0,
      odAdjustedCount: 0,
      effectivePresentCount: 0,
      totalRecords: 0,
      attendanceRate: 100,
      effectiveAttendanceRate: 100,
      isCompliant: true,
      statusLabel: 'COMPLIANT',
      shortageCount: 0
    };
  }

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let medicalAdjustedCount = 0;
  let odAdjustedCount = 0;
  let effectivePresentCount = 0;

  records.forEach((r) => {
    const original = r.status;
    if (original === 'PRESENT') presentCount++;
    else if (original === 'LATE') lateCount++;
    else absentCount++;

    // Determine effective status based on approved adjustments
    let effective = r.effectiveStatus || original;
    const activeAdjustment = r.adjustments && r.adjustments.length > 0 ? r.adjustments[r.adjustments.length - 1] : null;

    if (activeAdjustment) {
      if (activeAdjustment.adjustmentType === 'MEDICAL') {
        medicalAdjustedCount++;
        if (APP_CONFIG.MEDICAL_COUNTS_AS_ATTENDANCE) effective = 'PRESENT';
      } else if (activeAdjustment.adjustmentType === 'OD') {
        odAdjustedCount++;
        if (APP_CONFIG.OD_COUNTS_AS_ATTENDANCE) effective = 'PRESENT';
      } else if (activeAdjustment.effectiveStatus) {
        effective = activeAdjustment.effectiveStatus;
      }
    }

    if (effective === 'PRESENT') {
      effectivePresentCount++;
    }
  });

  const attendanceRate = Math.round((presentCount / totalRecords) * 100);
  const effectiveAttendanceRate = Math.round((effectivePresentCount / totalRecords) * 100);
  const isCompliant = effectiveAttendanceRate >= APP_CONFIG.ATTENDANCE_STATUTORY_THRESHOLD;

  let shortageCount = 0;
  if (!isCompliant) {
    const needed = Math.ceil((3 * totalRecords - 4 * effectivePresentCount));
    shortageCount = needed > 0 ? needed : 1;
  }

  return {
    presentCount,
    lateCount,
    absentCount,
    medicalAdjustedCount,
    odAdjustedCount,
    effectivePresentCount,
    totalRecords,
    attendanceRate,
    effectiveAttendanceRate,
    isCompliant,
    statusLabel: isCompliant ? 'COMPLIANT' : 'WARNING',
    shortageCount
  };
}

/**
 * Calculates subject-wise attendance metrics across enrolled courses for a given student.
 */
export function calculateSubjectAttendanceMetrics(
  courses: Course[],
  records: AttendanceRecord[]
): SubjectAttendanceMetric[] {
  return courses.map((c) => {
    const courseRecords = records.filter((r) => r.courseId === c.id);
    const summary = calculateAttendanceMetrics(courseRecords);

    return {
      courseId: c.id,
      courseCode: c.code,
      courseName: c.title,
      facultyName: c.facultyName,
      presentCount: summary.presentCount,
      lateCount: summary.lateCount,
      absentCount: summary.absentCount,
      medicalAdjustedCount: summary.medicalAdjustedCount,
      odAdjustedCount: summary.odAdjustedCount,
      effectivePresentCount: summary.effectivePresentCount,
      totalRecords: summary.totalRecords,
      attendanceRate: summary.attendanceRate,
      effectiveAttendanceRate: summary.effectiveAttendanceRate,
      isCompliant: summary.isCompliant,
      statusLabel: summary.statusLabel,
      shortageCount: summary.shortageCount,
      records: [...courseRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  });
}

/**
 * Assembles a complete attendance profile for a student including subject-wise breakdown,
 * chronological history, and recent activity timeline.
 */
export function buildStudentAttendanceProfile(
  courses: Course[],
  records: AttendanceRecord[]
): CompleteAttendanceProfile {
  const overall = calculateAttendanceMetrics(records);
  const subjects = calculateSubjectAttendanceMetrics(courses, records);
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    overall,
    subjects,
    recentActivity: sortedRecords.slice(0, 10),
    history: sortedRecords
  };
}

/**
 * Standard Indian Rupee (INR) currency formatter
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Standard badge styling classes for fee invoice statuses
 */
export function getFeeStatusBadgeClass(status: 'PAID' | 'PENDING' | 'OVERDUE'): string {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'OVERDUE':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'PENDING':
    default:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
}

/**
 * Standard badge styling classes for attendance statuses
 */
export function getAttendanceStatusBadgeClass(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'LATE':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'ABSENT':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
