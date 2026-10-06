import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, FileCode2, CheckCircle2, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { RecentProblem } from '../types';

interface ProblemsPageProps {
  problems: RecentProblem[];
  onConnectClick: () => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({ problems, onConnectClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  const filteredProblems = useMemo(() => {
    let result = problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
      const matchesDiff = selectedDiff === 'all' || p.difficulty.toLowerCase() === selectedDiff.toLowerCase();
      return matchesSearch && matchesPlatform && matchesDiff;
    });

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [problems, searchTerm, selectedPlatform, selectedDiff, sortBy]);

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
        return <span className="text-[var(--text)] font-semibold capitalize">{platform}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="pb-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">Solved Problems Library</h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Aggregated collection of verified problems solved across your connected competitive programming profiles.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <span className="text-xs text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-lg font-mono">
            Showing <strong className="text-[var(--text)]">{filteredProblems.length}</strong> of <strong className="text-[var(--accent)]">{problems.length}</strong>
          </span>

          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-lg">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'auto' : 'cards')}
              title="Cards View"
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'cards' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'auto' : 'table')}
              title="Table View"
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'table' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search problems by title..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)] transition-colors min-h-[40px]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="sr-only">Platform</label>
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[38px] font-medium"
            >
              <option value="all">All Platforms</option>
              <option value="leetcode">LeetCode</option>
              <option value="codeforces">Codeforces</option>
              <option value="codechef">CodeChef</option>
              <option value="geeksforgeeks">GFG</option>
            </select>
          </div>

          <div>
            <label className="sr-only">Difficulty</label>
            <select
              value={selectedDiff}
              onChange={e => setSelectedDiff(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[38px] font-medium"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="sr-only">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[38px] font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problem Display */}
      {filteredProblems.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'md:hidden'}`}>
            {filteredProblems.map((prob, idx) => (
              <div
                key={idx}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col justify-between hover:border-[var(--accent)]/50 transition-all space-y-3 shadow-sm"
              >
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] tracking-tight leading-snug line-clamp-2">
                    {prob.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="font-medium">{getPlatformLabel(prob.platform)}</span>
                    <span className="text-[var(--border)]">•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getDifficultyBadge(
                        prob.difficulty
                      )}`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--accent)] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Solved</span>
                  </div>
                  <span className="text-[var(--muted)] font-mono text-[11px]">
                    {formatDate(prob.date)}
                  </span>
                </div>

                {prob.url ? (
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--accent)] border border-[var(--border)] flex items-center justify-center gap-1.5 transition-colors min-h-[38px]"
                  >
                    <span>View Problem</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="w-full py-2 text-center text-xs text-[var(--muted)] font-mono">
                    Verified Telemetry
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm ${viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'}`}>
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50 text-[var(--muted)] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Problem</th>
                    <th className="py-3 px-4 font-semibold">Platform</th>
                    <th className="py-3 px-4 font-semibold">Difficulty</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredProblems.map((prob, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg)] transition-colors">
                      <td className="py-3 px-4 text-[var(--text)] font-semibold max-w-xs truncate">
                        {prob.title}
                      </td>
                      <td className="py-3 px-4 font-medium">{getPlatformLabel(prob.platform)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getDifficultyBadge(
                            prob.difficulty
                          )}`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[var(--accent)] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Solved</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--muted)]">
                        {formatDate(prob.date)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {prob.url ? (
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-medium transition-colors"
                            title="View Problem"
                          >
                            <span>View →</span>
                          </a>
                        ) : (
                          <span className="text-[var(--muted)]/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl">
          <FileCode2 className="w-10 h-10 text-[var(--muted)] mb-3" />
          <h4 className="text-sm font-semibold text-[var(--text)]">No problems found</h4>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">
            {problems.length === 0
              ? 'Connect a coding platform to sync your solved problems.'
              : 'No problems match your current search and filter criteria.'}
          </p>
          {problems.length === 0 && (
            <button
              onClick={onConnectClick}
              className="mt-4 px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] rounded-lg text-xs font-semibold transition-all min-h-[38px] flex items-center"
            >
              Connect a Platform →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

