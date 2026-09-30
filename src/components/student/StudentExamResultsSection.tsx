import React, { useState } from 'react';
import { Course, ExamAssessment, ExamResult, User } from '../../types';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface StudentExamResultsSectionProps {
  student: User;
  courses: Course[];
  assessments: ExamAssessment[];
  results: ExamResult[];
  isParentView?: boolean;
}

export const StudentExamResultsSection: React.FC<StudentExamResultsSectionProps> = ({
  student,
  courses,
  assessments,
  results,
  isParentView = false
}) => {
  const [selectedExamTypeFilter, setSelectedExamTypeFilter] = useState<string>('ALL');

  // Filter only published assessments and results belonging to this student
  const publishedAssessments = assessments.filter((a) => a.status === 'PUBLISHED');
  const myResults = results.filter((r) => r.studentId === student.id);

  // Group assessments by course
  const subjectExamMatrix = courses.map((course) => {
    const courseAssessments = publishedAssessments.filter(
      (a) => a.courseId === course.id || a.courseCode === course.code
    );

    const getExamData = (examType: 'IAT1' | 'IAT2' | 'MODEL') => {
      const assessment = courseAssessments.find((a) => a.examType === examType);
      if (!assessment) return null;
      const res = myResults.find((r) => r.assessmentId === assessment.id);
      return {
        assessment,
        result: res,
        marksObtained: res?.marksObtained,
        maxMarks: assessment.maxMarks,
        percentage: res?.marksObtained !== undefined ? Math.round((res.marksObtained / assessment.maxMarks) * 100) : undefined,
        status: res?.resultStatus || (res ? 'PASS' : 'AWAITING')
      };
    };

    const iat1 = getExamData('IAT1');
    const iat2 = getExamData('IAT2');
    const model = getExamData('MODEL');

    return {
      course,
      iat1,
      iat2,
      model
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Internal Assessment & Model Examination Scorecard</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            {isParentView ? `Continuous Academic Evaluation for ${student.name}` : 'My Continuous Assessment Performance'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Published results for IAT 1, IAT 2, and Model Examination verified by department faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Semester IV • AY 2026–2027
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 text-xs">
        {['ALL', 'IAT1', 'IAT2', 'MODEL'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedExamTypeFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              selectedExamTypeFilter === tab ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'ALL' && 'Consolidated Matrix'}
            {tab === 'IAT1' && 'IAT 1 Results'}
            {tab === 'IAT2' && 'IAT 2 Results'}
            {tab === 'MODEL' && 'Model Examination'}
          </button>
        ))}
      </div>

      {/* Consolidated Results Table */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Subject / Course</th>
                <th className="py-3 px-3">Course Code</th>
                <th className="py-3 px-3 text-center">
                  IAT 1 <span className="text-[10px] text-slate-500 block">(Max 50)</span>
                </th>
                <th className="py-3 px-3 text-center">
                  IAT 2 <span className="text-[10px] text-slate-500 block">(Max 50)</span>
                </th>
                <th className="py-3 px-3 text-center">
                  Model Exam <span className="text-[10px] text-slate-500 block">(Max 100)</span>
                </th>
                <th className="py-3 px-3 text-center">Internal Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {subjectExamMatrix.map(({ course, iat1, iat2, model }) => {
                // Calculate internal average
                const validScores = [iat1?.percentage, iat2?.percentage, model?.percentage].filter(
                  (p): p is number => p !== undefined
                );
                const averagePct = validScores.length > 0
                  ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                  : null;

                return (
                  <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{course.title}</div>
                      <div className="text-[10px] text-slate-400">{course.facultyName || 'Respective Faculty'}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-indigo-400 font-semibold">
                      {course.code}
                    </td>

                    {/* IAT 1 */}
                    <td className="py-3 px-3 text-center">
                      {iat1 && iat1.marksObtained !== undefined ? (
                        <div className="inline-block p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 min-w-16">
                          <div className="font-bold text-white text-xs">
                            {iat1.marksObtained} <span className="text-slate-500 font-normal">/ {iat1.maxMarks}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold">{iat1.percentage}%</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Not Published</span>
                      )}
                    </td>

                    {/* IAT 2 */}
                    <td className="py-3 px-3 text-center">
                      {iat2 && iat2.marksObtained !== undefined ? (
                        <div className="inline-block p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 min-w-16">
                          <div className="font-bold text-white text-xs">
                            {iat2.marksObtained} <span className="text-slate-500 font-normal">/ {iat2.maxMarks}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold">{iat2.percentage}%</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Not Published</span>
                      )}
                    </td>

                    {/* Model Exam */}
                    <td className="py-3 px-3 text-center">
                      {model && model.marksObtained !== undefined ? (
                        <div className="inline-block p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 min-w-16">
                          <div className="font-bold text-white text-xs">
                            {model.marksObtained} <span className="text-slate-500 font-normal">/ {model.maxMarks}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold">{model.percentage}%</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Not Published</span>
                      )}
                    </td>

                    {/* Standing */}
                    <td className="py-3 px-3 text-center">
                      {averagePct !== null ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          averagePct >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : averagePct >= 50
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {averagePct >= 80 ? 'Distinction' : averagePct >= 50 ? 'Satisfactory' : 'Needs Support'} ({averagePct}%)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
