import React, { useState } from 'react';
import { Course, CourseMaterial, ResourceType } from '../../types';
import { FileText, Link, UploadCloud, AlertCircle } from 'lucide-react';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialData?: CourseMaterial | null;
  onSave: (data: Partial<CourseMaterial>) => void;
}

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialData,
  onSave
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [courseId, setCourseId] = useState(initialData?.courseId || courses[0]?.id || '');
  const [type, setType] = useState<ResourceType>(initialData?.type || 'PDF');
  const [url, setUrl] = useState(initialData?.url || initialData?.fileUrl || '');
  const [moduleName, setModuleName] = useState(initialData?.moduleName || 'Unit 1');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>(
    initialData?.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
  );
  const [fileSize, setFileSize] = useState(initialData?.size || initialData?.fileSize || '3.5 MB');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a resource title.');
      return;
    }
    if (!courseId) {
      setError('Please select an assigned subject.');
      return;
    }
    if (!url.trim()) {
      setError('Please provide a resource URL or file link.');
      return;
    }

    onSave({
      id: initialData?.id,
      courseId,
      title: title.trim(),
      description: description.trim(),
      type,
      fileType: type,
      url: url.trim(),
      fileUrl: url.trim(),
      moduleName: moduleName.trim() || 'General Module',
      status,
      size: fileSize.trim() || '2.0 MB',
      fileSize: fileSize.trim() || '2.0 MB'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {initialData ? 'Edit Learning Material' : 'Add Learning Material'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Upload or link slides, PDFs, notes, or reference documents
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
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Material Title *</label>
            <input
              type="text"
              placeholder="e.g. Chapter 03 - Query Execution & Indexes.pdf"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Resource Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="PDF">PDF Document</option>
                <option value="PRESENTATION">Presentation / Slides</option>
                <option value="DOCUMENT">Word Document</option>
                <option value="EXTERNAL_LINK">External Resource Link</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Module / Unit</label>
              <input
                type="text"
                placeholder="e.g. Unit 2: Storage & B-Trees"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Resource File URL / Link *</label>
            <input
              type="text"
              placeholder="https://... or /materials/guide.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Estimated Size</label>
              <input
                type="text"
                placeholder="e.g. 4.8 MB"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="PUBLISHED">Published (Visible to Students)</option>
                <option value="DRAFT">Draft (Faculty Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Key topics covered or instructions for reading..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{initialData ? 'Update Material' : 'Save Material'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
