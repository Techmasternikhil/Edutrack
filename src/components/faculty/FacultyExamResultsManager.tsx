import React, { useState } from 'react';
import { Course, ExamAssessment, ExamResult, ExamType, User } from '../../types';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  FileSpreadsheet,
  Filter,
  Plus,
  Send,
  Upload,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

interface FacultyExamResultsManagerProps {
  currentFaculty: User;
  courses: Course[];
  students: User[];
  assessments: ExamAssessment[];
  results: ExamResult[];
  onCreateAssessment: (data: {
    courseId: string;
    courseCode: string;
    examType: ExamType;
    title: string;
    maxMarks: number;
    examDate: string;
  }) => void;
  onSaveResults: (assessmentId: string, results: { studentId: string; marksObtained: number; remarks?: string }[]) => void;
  onPublishAssessment: (assessmentId: string) => void;
}

export const FacultyExamResultsManager: React.FC<FacultyExamResultsManagerProps> = ({
  currentFaculty,
  courses,
  students,
  assessments,
  results,
  onCreateAssessment,
  onSaveResults,
  onPublishAssessment
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || ''
  );

  // New assessment modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newExamType, setNewExamType] = useState<ExamType>('IAT1');
  const [newTitle, setNewTitle] = useState('Internal Assessment Test 1');
  const [newMaxMarks, setNewMaxMarks] = useState<number>(50);
  const [newExamDate, setNewExamDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Marks Entry state
  const [managingAssessment, setManagingAssessment] = useState<ExamAssessment | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  // Bulk CSV Upload Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  // Filtered assessments for current faculty's selected course
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseAssessments = assessments.filter(
    (a) => a.courseId === selectedCourseId || a.courseCode === activeCourse?.code
  );

  const enrolledStudents = students.filter((s) => s.role === 'STUDENT');

  const openMarksEntry = (assessment: ExamAssessment) => {
    setManagingAssessment(assessment);
    const existingForAssessment = results.filter((r) => r.assessmentId === assessment.id);
    const initMarks: Record<string, number> = {};
    const initRemarks: Record<string, string> = {};

    enrolledStudents.forEach((s) => {
      const match = existingForAssessment.find((r) => r.studentId === s.id);
      if (match && match.marksObtained !== undefined) {
        initMarks[s.id] = match.marksObtained;
        initRemarks[s.id] = match.remarks || '';
      } else {
        initMarks[s.id] = 40; // Default sample
        initRemarks[s.id] = '';
      }
    });

    setMarksMap(initMarks);
    setRemarksMap(initRemarks);
  };

  const handleSaveMarks = (publishNow: boolean) => {
    if (!managingAssessment) return;
    const saveList = enrolledStudents.map((s) => ({
      studentId: s.id,
      marksObtained: Number(marksMap[s.id] ?? 0),
      remarks: remarksMap[s.id] || ''
    }));

    onSaveResults(managingAssessment.id, saveList);
    if (publishNow) {
      onPublishAssessment(managingAssessment.id);
    }
    setManagingAssessment(null);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    onCreateAssessment({
      courseId: activeCourse.id,
      courseCode: activeCourse.code,
      examType: newExamType,
      title: newTitle,
      maxMarks: newMaxMarks,
      examDate: newExamDate
    });

    setIsCreateModalOpen(false);
  };

  // CSV Bulk Import Handler
  const handleProcessCSV = () => {
    if (!managingAssessment) return;
    const lines = csvText.trim().split('\n');
    const errors: string[] = [];
    const newMarks: Record<string, number> = { ...marksMap };

    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('register')) return; // skip header
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const reg = parts[0];
        const val = Number(parts[1]);
        const match = enrolledStudents.find(
          (s) => s.regNumber?.toLowerCase() === reg.toLowerCase() || s.id === reg
        );

        if (!match) {
          errors.push(`Row ${idx + 1}: Student with Reg/ID "${reg}" not found in enrollment roster.`);
        } else if (isNaN(val) || val < 0 || val > managingAssessment.maxMarks) {
          errors.push(
            `Row ${idx + 1}: Marks ${val} invalid (must be between 0 and ${managingAssessment.maxMarks}).`
          );
        } else {
          newMarks[match.id] = val;
        }
      }
    });

    setBulkErrors(errors);
    if (errors.length === 0) {
      setMarksMap(newMarks);
      setIsBulkModalOpen(false);
      setCsvText('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl glass-panel bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Continuous Internal Assessment & Model Exam Manager</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            IAT 1, IAT 2 & Model Examination Results
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Create assessment modules, enter marks manually or via CSV bulk upload, and publish verified scores to student & parent portals.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTitle('Internal Assessment Test 1');
            setNewExamType('IAT1');
            setNewMaxMarks(50);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Exam Assessment</span>
        </button>
      </div>

      {/* Course Selector Strip */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="text-slate-400 pl-2">Subject Workspace:</span>
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCourseId(c.id)}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              selectedCourseId === c.id ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            {c.code} — {c.title}
          </button>
        ))}
      </div>

      {/* Assessments Grid */}
      {courseAssessments.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-2xl space-y-3">
          <Award className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Assessments Created Yet for {activeCourse?.code}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "+ Create Exam Assessment" to configure IAT 1, IAT 2, or Model Examination for this course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courseAssessments.map((assessment) => {
            const assessmentResults = results.filter((r) => r.assessmentId === assessment.id);
            const isPublished = assessment.status === 'PUBLISHED';

            return (
              <div
                key={assessment.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {assessment.examType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{assessment.title}</h3>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>
                      Max Marks: <strong className="text-white">{assessment.maxMarks}</strong>
                    </div>
                    <div>
                      Exam Date: <span className="font-mono text-slate-300">{assessment.examDate}</span>
                    </div>
                    <div>
                      Evaluated: <strong className="text-indigo-400">{assessmentResults.length}</strong> / {enrolledStudents.length} Students
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <button
                    onClick={() => openMarksEntry(assessment)}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Enter & Edit Marks</span>
                  </button>

                  {!isPublished && assessmentResults.length > 0 && (
                    <button
                      onClick={() => onPublishAssessment(assessment.id)}
                      className="w-full py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish to Students & Parents</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assessment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Plus className="w-4 h-4" />
                <span>Configure Internal Assessment</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Exam Type *</label>
                <select
                  value={newExamType}
                  onChange={(e) => {
                    const t = e.target.value as ExamType;
                    setNewExamType(t);
                    if (t === 'IAT1') {
                      setNewTitle('Internal Assessment Test 1');
                      setNewMaxMarks(50);
                    } else if (t === 'IAT2') {
                      setNewTitle('Internal Assessment Test 2');
                      setNewMaxMarks(50);
                    } else if (t === 'MODEL') {
                      setNewTitle('Model Examination');
                      setNewMaxMarks(100);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="IAT1">Internal Assessment Test 1 (IAT 1)</option>
                  <option value="IAT2">Internal Assessment Test 2 (IAT 2)</option>
                  <option value="MODEL">Model Examination</option>
                  <option value="IAT3">IAT 3 / Additional Internal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Maximum Marks *</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marks Entry & Bulk Import Modal */}
      {managingAssessment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Enter Marks — {managingAssessment.title} ({managingAssessment.courseCode})
                </h3>
                <p className="text-xs text-slate-400">
                  Maximum marks: <strong className="text-white">{managingAssessment.maxMarks}</strong> • Status: {managingAssessment.status}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBulkErrors([]);
                    setIsBulkModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV Bulk Import</span>
                </button>
                <button
                  onClick={() => setManagingAssessment(null)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Marks Entry Table */}
            <div className="overflow-x-auto max-h-96 pr-1">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-2.5">Roll / Reg Number</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5 text-center">Marks (Max {managingAssessment.maxMarks})</th>
                    <th className="p-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {enrolledStudents.map((student) => {
                    const currentVal = marksMap[student.id] ?? '';

                    return (
                      <tr key={student.id} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-mono text-indigo-400">{student.regNumber || 'N/A'}</td>
                        <td className="p-2.5 font-semibold text-white">{student.name}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={managingAssessment.maxMarks}
                            value={currentVal}
                            onChange={(e) => {
                              const v = Math.min(
                                managingAssessment.maxMarks,
                                Math.max(0, Number(e.target.value))
                              );
                              setMarksMap({ ...marksMap, [student.id]: v });
                            }}
                            className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center font-bold text-emerald-400 text-xs focus:outline-none focus:border-purple-500"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            placeholder="Optional note"
                            value={remarksMap[student.id] || ''}
                            onChange={(e) => setRemarksMap({ ...remarksMap, [student.id]: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-xs placeholder-slate-600 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                {enrolledStudents.length} Students on class roster
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManagingAssessment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMarks(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer text-xs"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMarks(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer text-xs"
                >
                  Save & Publish Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {isBulkModalOpen && managingAssessment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Bulk Import Marks via CSV</span>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste CSV data with format: <code className="text-amber-400 font-mono">RegisterNumber, Marks</code>.
              Max marks allowed: <strong className="text-white">{managingAssessment.maxMarks}</strong>.
            </p>

            <textarea
              rows={6}
              placeholder={`CS-2024-001, 45\nCS-2024-002, 38\nCS-2024-003, 42`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />

            {bulkErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1 max-h-32 overflow-y-auto">
                <strong className="block font-bold">Import Validation Errors ({bulkErrors.length}):</strong>
                {bulkErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessCSV}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer text-xs"
              >
                Parse & Apply Marks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
