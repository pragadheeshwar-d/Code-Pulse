import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { RecentProblem } from '../types';

interface RecentActivityTableProps {
  problems: RecentProblem[];
  onViewAllClick?: () => void;
  limit?: number;
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  problems,
  onViewAllClick,
  limit = 5
}) => {
  const displayedProblems = problems.slice(0, limit);
  const hasData = displayedProblems.length > 0;

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-[#94a3b8] bg-[#1e293b] border-[#334155]';
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'leetcode':
        return <span className="text-[#ffa116]">LeetCode</span>;
      case 'codechef':
        return <span className="text-[#d97706]">CodeChef</span>;
      case 'geeksforgeeks':
        return <span className="text-[#10b981]">GFG</span>;
      case 'codeforces':
        return <span className="text-[#3b82f6]">Codeforces</span>;
      default:
        return <span>{platform}</span>;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
        </div>

        {onViewAllClick && (
          <button
            onClick={onViewAllClick}
            className="text-xs text-[#8b9cb4] hover:text-white transition-colors p-1"
          >
            View all &rarr;
          </button>
        )}
      </div>

      {/* Table or Empty State */}
      {hasData ? (
        <>
          {/* Mobile List View (< sm) */}
          <div className="divide-y divide-[#172238] sm:hidden">
            {displayedProblems.map((prob, idx) => (
              <div key={idx} className="py-2.5 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-white truncate max-w-[220px]">
                    {prob.url ? (
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <span className="truncate">{prob.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[#64748b] shrink-0" />
                      </a>
                    ) : (
                      prob.title
                    )}
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${getDifficultyBadge(
                      prob.difficulty
                    )}`}
                  >
                    {prob.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                  <span className="font-medium">{getPlatformLabel(prob.platform)}</span>
                  <span className="font-mono">{formatDate(prob.date)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= sm) */}
          <div className="overflow-x-auto touch-scroll hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1c263c] text-[#64748b]">
                  <th className="pb-2.5 font-medium">Platform</th>
                  <th className="pb-2.5 font-medium">Problem</th>
                  <th className="pb-2.5 font-medium">Difficulty</th>
                  <th className="pb-2.5 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172238]">
                {displayedProblems.map((prob, idx) => (
                  <tr key={idx} className="hover:bg-[#141d2f] transition-colors">
                    <td className="py-2.5 font-medium">{getPlatformLabel(prob.platform)}</td>
                    <td className="py-2.5 pr-3 text-white max-w-[220px] truncate">
                      {prob.url ? (
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-400 inline-flex items-center gap-1 transition-colors"
                        >
                          <span className="truncate">{prob.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[#64748b] shrink-0" />
                        </a>
                      ) : (
                        prob.title
                      )}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getDifficultyBadge(
                          prob.difficulty
                        )}`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[#8b9cb4] text-right">
                      {formatDate(prob.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4 border border-dashed border-[#1d263b] rounded-lg">
          <div className="w-10 h-10 rounded-full bg-[#162035] border border-[#212f4d] flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-[#64748b]" />
          </div>
          <h4 className="text-xs font-semibold text-white">No coding activity yet.</h4>
          <p className="text-[11px] text-[#64748b] mt-1 max-w-[240px]">
            Your recent solved problems will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
