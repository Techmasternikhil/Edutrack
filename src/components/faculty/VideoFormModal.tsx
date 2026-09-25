import React, { useState } from 'react';
import { Course, CourseMaterial } from '../../types';
import { extractYouTubeVideoId, isValidYouTubeUrl } from '../../utils/youtube';
import { Video, Youtube, AlertCircle, Check } from 'lucide-react';

interface VideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialData?: CourseMaterial | null;
  onSave: (data: Partial<CourseMaterial>) => void;
}

export const VideoFormModal: React.FC<VideoFormModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialData,
  onSave
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [url, setUrl] = useState(initialData?.url || initialData?.fileUrl || '');
  const [courseId, setCourseId] = useState(initialData?.courseId || courses[0]?.id || '');
  const [moduleName, setModuleName] = useState(initialData?.moduleName || 'Unit 1');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>(
    initialData?.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a video title.');
      return;
    }

    if (!courseId) {
      setError('Please select an assigned subject.');
      return;
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube link. Supported formats: https://youtube.com/watch?v=... or https://youtu.be/...');
      return;
    }

    onSave({
      id: initialData?.id,
      courseId,
      title: title.trim(),
      description: description.trim(),
      type: 'YOUTUBE',
      fileType: 'VIDEO',
      url: url.trim(),
      fileUrl: url.trim(),
      youtubeVideoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      moduleName: moduleName.trim() || 'General Module',
      status,
      size: 'Stream'
    });

    onClose();
  };

  const detectedId = extractYouTubeVideoId(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {initialData ? 'Edit Teaching Video' : 'Add Teaching Video'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Embed YouTube lecture or tutorial for enrolled students
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

        {/* Modal Body */}
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
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Video Title *</label>
            <input
              type="text"
              placeholder="e.g. Introduction to Raft Consensus Algorithm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">YouTube URL *</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
            />
            {detectedId && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Detected YouTube ID: {detectedId}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Module / Unit</label>
              <input
                type="text"
                placeholder="e.g. Unit 1: Foundations"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="PUBLISHED">Published (Visible to Students)</option>
                <option value="DRAFT">Draft (Faculty Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description / Notes</label>
            <textarea
              rows={3}
              placeholder="Brief explanation of lecture takeaways, timestamps, or textbook references..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Action buttons */}
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
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>{initialData ? 'Update Video' : 'Save & Publish Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
