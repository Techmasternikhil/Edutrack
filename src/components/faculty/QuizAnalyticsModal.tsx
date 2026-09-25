import React from 'react';
import { Quiz, QuizAttempt } from '../../types';
import { Award, Users, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';

interface QuizAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  attempts: QuizAttempt[];
  totalStudents: number;
}

export const QuizAnalyticsModal: React.FC<QuizAnalyticsModalProps> = ({
  isOpen,
  onClose,
  quiz,
  attempts,
  totalStudents
}) => {
  if (!isOpen || !quiz) return null;

  const attemptedCount = attempts.length;
  const notAttemptedCount = Math.max(0, totalStudents - attemptedCount);

  let averageScore = 0;
  let highestScore = 0;
  let lowestScore = attemptedCount > 0 ? quiz.totalMarks : 0;
  let passedCount = 0;

  const distribution = {
    '90-100%': 0,
    '80-89%': 0,
    '70-79%': 0,
    '60-69%': 0,
    '<60%': 0
  };

  attempts.forEach((a) => {
    const pct = quiz.totalMarks > 0 ? (a.score / quiz.totalMarks) * 100 : 0;
    averageScore += a.score;
    if (a.score > highestScore) highestScore = a.score;
    if (a.score < lowestScore) lowestScore = a.score;
    if (pct >= 50) passedCount++;

    if (pct >= 90) distribution['90-100%']++;
    else if (pct >= 80) distribution['80-89%']++;
    else if (pct >= 70) distribution['70-79%']++;
    else if (pct >= 60) distribution['60-69%']++;
    else distribution['<60%']++;
  });

  if (attemptedCount > 0) {
    averageScore = Number((averageScore / attemptedCount).toFixed(1));
  }

  const passPercentage = attemptedCount > 0 ? Math.round((passedCount / attemptedCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Quiz Performance Analytics</h2>
              <p className="text-[11px] text-slate-400">
                {quiz.courseCode}: {quiz.title}
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

        <div className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Participation</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {attemptedCount} / {totalStudents}
              </div>
              <div className="text-[10px] text-purple-400">
                {totalStudents > 0 ? Math.round((attemptedCount / totalStudents) * 100) : 0}% turn-out
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Average Score</div>
              <div className="text-lg font-bold text-indigo-400 mt-0.5">
                {averageScore} / {quiz.totalMarks}
              </div>
              <div className="text-[10px] text-slate-400">
                {quiz.totalMarks > 0 ? Math.round((averageScore / quiz.totalMarks) * 100) : 0}% class mean
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">High / Low Score</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {highestScore} <span className="text-xs text-slate-400 font-normal">/ {lowestScore}</span>
              </div>
              <div className="text-[10px] text-emerald-400">Peak performance</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Pass Rate</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{passPercentage}%</div>
              <div className="text-[10px] text-slate-400">{passedCount} students passed</div>
            </div>
          </div>

          {/* Score Distribution Bars */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-300">Score Range Distribution</h4>
            <div className="space-y-2">
              {Object.entries(distribution).map(([range, count]) => {
                const pct = attemptedCount > 0 ? Math.round((count / attemptedCount) * 100) : 0;
                return (
                  <div key={range} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{range}</span>
                      <span>
                        {count} candidate{count === 1 ? '' : 's'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Submissions Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Attempted Candidates</h4>
            {attempts.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">
                No student attempts recorded for this quiz yet.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {attempts.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">{a.studentName}</div>
                      <div className="text-[10px] text-slate-400">
                        Completed in {Math.round(a.timeTakenSeconds / 60)} mins •{' '}
                        {new Date(a.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-xs">
                        {a.score} / {a.totalMarks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-800/60 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
