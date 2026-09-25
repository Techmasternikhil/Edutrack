import React, { useState } from 'react';
import { Course, Assignment } from '../../types';
import { FileCheck2, Calendar, AlertCircle } from 'lucide-react';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialData?: Assignment | null;
  onSave: (asg: Partial<Assignment>) => void;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialData,
  onSave
}) => {
  const [courseId, setCourseId] = useState(initialData?.courseId || courses[0]?.id || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [deadline, setDeadline] = useState(
    initialData?.deadline ||
      new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [totalMarks, setTotalMarks] = useState(
    initialData?.totalMarks || initialData?.maxMarks || 100
  );
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>(
    initialData?.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide an assignment title.');
      return;
    }
    if (!courseId) {
      setError('Please select an assigned subject.');
      return;
    }
    if (!deadline) {
      setError('Please provide a submission deadline.');
      return;
    }

    const matchedCourse = courses.find((c) => c.id === courseId);

    onSave({
      id: initialData?.id,
      courseId,
      courseCode: matchedCourse?.code,
      title: title.trim(),
      description: description.trim(),
      deadline,
      totalMarks: Number(totalMarks) || 100,
      maxMarks: Number(totalMarks) || 100,
      status
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {initialData ? 'Edit Coursework Assignment' : 'Create Coursework Assignment'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Post coursework with rubrics, instructions, and deadline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Subject / Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Assignment Title *</label>
            <input
              type="text"
              placeholder="e.g. Implement Distributed Raft Consensus Leader Election"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Submission Deadline *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Maximum Marks *</label>
              <input
                type="number"
                min="10"
                max="500"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Publication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="PUBLISHED">Published (Visible to Enrolled Students)</option>
              <option value="DRAFT">Draft (Saved in Faculty Console)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Detailed Instructions & Rubric</label>
            <textarea
              rows={4}
              placeholder="State the problem scenario, submission file formats (e.g. .zip, .pdf), evaluation criteria, and edge cases..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-amber-600/20 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{initialData ? 'Update Assignment' : 'Publish Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
