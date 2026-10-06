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
        return 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20';
      case 'medium':
        return 'text-[var(--warm)] bg-[var(--warm)]/10 border-[var(--warm)]/20';
      case 'hard':
        return 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20';
      default:
        return 'text-[var(--muted)] bg-[var(--surface)] border-[var(--border)]';
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'leetcode':
        return <span className="text-[var(--warm)] font-semibold">LeetCode</span>;
      case 'codechef':
        return <span className="text-[var(--warm)] font-semibold">CodeChef</span>;
      case 'geeksforgeeks':
        return <span className="text-[var(--accent)] font-semibold">GFG</span>;
      case 'codeforces':
        return <span className="text-[var(--accent)] font-semibold">Codeforces</span>;
      default:
        return <span className="text-[var(--text)] capitalize">{platform}</span>;
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">Recent Submissions</h3>
        </div>

        {onViewAllClick && (
          <button
            onClick={onViewAllClick}
            className="text-xs text-[var(--accent)] hover:underline font-medium transition-colors"
          >
            View all →
          </button>
        )}
      </div>

      {/* Table or Empty State */}
      {hasData ? (
        <>
          {/* Mobile List View (< sm) */}
          <div className="divide-y divide-[var(--border)] sm:hidden">
            {displayedProblems.map((prob, idx) => (
              <div key={idx} className="py-2.5 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-[var(--text)] truncate max-w-[220px]">
                    {prob.url ? (
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[var(--accent)] inline-flex items-center gap-1 transition-colors"
                      >
                        <span className="truncate">{prob.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-[var(--muted)] shrink-0" />
                      </a>
                    ) : (
                      prob.title
                    )}
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0 ${getDifficultyBadge(
                      prob.difficulty
                    )}`}
                  >
                    {prob.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span className="font-medium">{getPlatformLabel(prob.platform)}</span>
                  <span className="font-mono text-[var(--muted)]">{formatDate(prob.date)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= sm) */}
          <div className="overflow-x-auto touch-scroll hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)] font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">Platform</th>
                  <th className="pb-2.5 font-semibold">Problem</th>
                  <th className="pb-2.5 font-semibold">Difficulty</th>
                  <th className="pb-2.5 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {displayedProblems.map((prob, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg)] transition-colors">
                    <td className="py-2.5 font-medium">{getPlatformLabel(prob.platform)}</td>
                    <td className="py-2.5 pr-3 text-[var(--text)] max-w-[220px] truncate font-medium">
                      {prob.url ? (
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[var(--accent)] inline-flex items-center gap-1 transition-colors"
                        >
                          <span className="truncate">{prob.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[var(--muted)] shrink-0" />
                        </a>
                      ) : (
                        prob.title
                      )}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${getDifficultyBadge(
                          prob.difficulty
                        )}`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[var(--muted)] text-right">
                      {formatDate(prob.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4 border border-dashed border-[var(--border)] rounded-lg bg-[var(--bg)]/50">
          <div className="w-9 h-9 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-2">
            <FileText className="w-4 h-4 text-[var(--muted)]" />
          </div>
          <h4 className="text-xs font-semibold text-[var(--text)]">No activity recorded yet</h4>
          <p className="text-[11px] text-[var(--muted)] mt-1 max-w-[220px]">
            Your recently solved coding challenges will show up here automatically.
          </p>
        </div>
      )}
    </div>
  );
};
