import React, { useState } from 'react';
import { Course, Quiz, QuizQuestion } from '../../types';
import { Award, Plus, Trash2, HelpCircle, Check, AlertCircle } from 'lucide-react';

interface QuizFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialData?: Quiz | null;
  onSave: (quiz: Partial<Quiz>) => void;
}

export const QuizFormModal: React.FC<QuizFormModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialData,
  onSave
}) => {
  const [courseId, setCourseId] = useState(initialData?.courseId || courses[0]?.id || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes || 20);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);

  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialData?.questions && initialData.questions.length > 0
      ? initialData.questions
      : [
          {
            id: 'q-new-1',
            question: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            marks: 5,
            explanation: ''
          }
        ]
  );

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-new-${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 5,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const opts = [...updated[qIdx].options];
    opts[optIdx] = val;
    updated[qIdx].options = opts;
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }

    if (!courseId) {
      setError('Please select an assigned subject.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qText = q.question || q.text || '';
      if (!qText.trim()) {
        setError(`Question #${i + 1} cannot have an empty question prompt.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question #${i + 1} option ${j + 1} is empty.`);
          return;
        }
      }
    }

    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 5), 0);
    const selectedCourse = courses.find((c) => c.id === courseId);

    onSave({
      id: initialData?.id,
      courseId,
      courseCode: selectedCourse?.code,
      courseTitle: selectedCourse?.title,
      title: title.trim(),
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 20,
      totalMarks,
      isPublished,
      questions
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {initialData ? 'Edit Quiz Assessment' : 'Create Subject Quiz'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Design multiple-choice questions with automated evaluation
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Subject / Course *</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Duration (Minutes) *</label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Quiz Title *</label>
            <input
              type="text"
              placeholder="e.g. Distributed Consensus & Raft Protocol Checkpoint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Instructions / Description</label>
              <input
                type="text"
                placeholder="e.g. Answer all questions. One attempt allowed."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Publication Status</label>
              <select
                value={isPublished ? 'true' : 'false'}
                onChange={(e) => setIsPublished(e.target.value === 'true')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="true">Published (Available for Students to Attempt)</option>
                <option value="false">Draft (Saved in Instructor Workspace)</option>
              </select>
            </div>
          </div>

          {/* Question Builder */}
          <div className="pt-3 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz Questions ({questions.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id || qIdx}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Question #{qIdx + 1}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-400">Marks:</label>
                        <input
                          type="number"
                          min="1"
                          max="25"
                          value={q.marks || 5}
                          onChange={(e) => handleQuestionChange(qIdx, 'marks', Number(e.target.value))}
                          className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                        />
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter multiple-choice question text..."
                    value={q.question || q.text || ''}
                    onChange={(e) => {
                      handleQuestionChange(qIdx, 'question', e.target.value);
                      handleQuestionChange(qIdx, 'text', e.target.value);
                    }}
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500"
                  />

                  {/* Options */}
                  <div className="space-y-1.5 pl-2">
                    <div className="text-[10px] text-slate-400 font-medium">
                      Select the radio button beside the correct answer:
                    </div>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-opt-${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', optIdx)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[10px] text-slate-400 font-mono w-4">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          required
                          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{initialData ? 'Update Quiz' : 'Publish Quiz Assessment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
