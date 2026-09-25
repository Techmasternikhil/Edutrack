import React from 'react';
import { getYouTubeEmbedUrl } from '../../utils/youtube';
import { ExternalLink, Video } from 'lucide-react';

interface YouTubeVideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
  courseTitle?: string;
  moduleName?: string;
  instructorName?: string;
  onClose?: () => void;
}

export const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  videoId,
  title,
  description,
  courseTitle,
  moduleName,
  instructorName,
  onClose
}) => {
  if (!videoId) return null;

  const embedUrl = getYouTubeEmbedUrl(videoId);

  return (
    <div className="rounded-2xl glass-panel border border-slate-700/80 overflow-hidden shadow-2xl bg-slate-900/90 flex flex-col">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white line-clamp-1">{title}</div>
            <div className="text-[10px] text-slate-400">
              {courseTitle ? `${courseTitle} • ` : ''}
              {moduleName || 'Teaching Lecture Video'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700/60 hover:bg-slate-700"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open on YouTube</span>
          </a>

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* 16:9 Aspect Ratio Embed */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Details Box */}
      <div className="p-4 bg-slate-950/60 space-y-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white text-sm">{title}</span>
          {instructorName && (
            <span className="text-[11px] text-indigo-400 font-medium">Instructor: {instructorName}</span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
