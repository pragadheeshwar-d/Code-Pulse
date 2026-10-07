import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { RecentProblem } from '../types';

interface ProblemsPageProps {
  problems: RecentProblem[];
  onConnectClick: () => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({ problems, onConnectClick }) => {
  // Sync filters with URL query parameters where possible
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlatform = urlParams.get('platform') || 'all';
  const initialDiff = urlParams.get('difficulty') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(initialPlatform);
  const [selectedDiff, setSelectedDiff] = useState<string>(initialDiff);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'difficulty' | 'title' | 'platform'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Extract unique topics from problems
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    problems.forEach(p => {
      if (p.topic) {
        set.add(p.topic);
      }
    });
    return Array.from(set).sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    let result = problems.filter(p => {
      const matchesSearch = !debouncedSearch ||
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.topic && p.topic.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
      const matchesDiff = selectedDiff === 'all' || p.difficulty.toLowerCase() === selectedDiff.toLowerCase();
      const matchesTopic = selectedTopic === 'all' || p.topic === selectedTopic;
      return matchesSearch && matchesPlatform && matchesDiff && matchesTopic;
    });

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'platform') return a.platform.localeCompare(b.platform);
      if (sortBy === 'difficulty') {
        const order: Record<string, number> = { easy: 1, medium: 2, hard: 3, other: 4 };
        const diffA = order[a.difficulty.toLowerCase()] || 4;
        const diffB = order[b.difficulty.toLowerCase()] || 4;
        return diffA - diffB;
      }
      return 0;
    });

    return result;
  }, [problems, debouncedSearch, selectedPlatform, selectedDiff, selectedTopic, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProblems.slice(start, start + pageSize);
  }, [filteredProblems, currentPage, pageSize]);

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'text-[var(--accent)] bg-[var(--accent-muted)] border-[var(--accent)]/20';
      case 'medium':
        return 'text-[var(--warm)] bg-[var(--warm-muted)] border-[var(--warm)]/20';
      case 'hard':
        return 'text-[var(--danger)] bg-[var(--danger-muted)] border-[var(--danger)]/20';
      default:
        return 'text-[var(--muted)] bg-[var(--surface-active)] border-[var(--border)]';
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'leetcode':
        return <span className="text-[var(--warm)] font-medium">LeetCode</span>;
      case 'codechef':
        return <span className="text-[var(--warm)] font-medium">CodeChef</span>;
      case 'geeksforgeeks':
        return <span className="text-[var(--accent)] font-medium">GFG</span>;
      case 'codeforces':
        return <span className="text-[var(--accent)] font-medium">Codeforces</span>;
      default:
        return <span className="text-[var(--text)] font-medium capitalize">{platform}</span>;
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
    <div className="space-y-4">
      {/* 1. Header Bar with stats and instant search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
              Problems
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]">
              {problems.length} solved
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Unified library of verified solved problems across all connected coding platforms
          </p>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search problems, topics..."
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)] min-h-[34px] font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)] font-mono"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Platform filter */}
        <select
          value={selectedPlatform}
          onChange={e => {
            setSelectedPlatform(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[32px] font-medium"
        >
          <option value="all">All Platforms</option>
          <option value="leetcode">LeetCode</option>
          <option value="codechef">CodeChef</option>
          <option value="codeforces">Codeforces</option>
          <option value="geeksforgeeks">GeeksforGeeks</option>
        </select>

        {/* Difficulty filter */}
        <select
          value={selectedDiff}
          onChange={e => {
            setSelectedDiff(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[32px] font-medium"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Topic filter */}
        {availableTopics.length > 0 && (
          <select
            value={selectedTopic}
            onChange={e => {
              setSelectedTopic(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[32px] font-medium max-w-[150px] truncate"
          >
            <option value="all">All Topics</option>
            {availableTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        {/* Sort by */}
        <div className="ml-auto flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-[var(--muted)]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[32px] font-medium"
          >
            <option value="newest">Recently Solved</option>
            <option value="oldest">Oldest Solved</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Alphabetical</option>
            <option value="platform">Platform</option>
          </select>
        </div>
      </div>

      {/* 3. Problems Table List (Linear / GitHub style) */}
      {filteredProblems.length > 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]/60 text-[var(--muted)] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3.5 w-8 text-center font-normal">Status</th>
                  <th className="py-2.5 px-3.5 font-normal">Problem</th>
                  <th className="py-2.5 px-3.5 font-normal">Platform</th>
                  <th className="py-2.5 px-3.5 font-normal">Difficulty</th>
                  <th className="py-2.5 px-3.5 font-normal">Topic</th>
                  <th className="py-2.5 px-3.5 font-normal">Solved Date</th>
                  <th className="py-2.5 px-3.5 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-sans">
                {paginatedProblems.map((p, idx) => (
                  <tr
                    key={`${p.platform}-${p.id || p.title}-${idx}`}
                    className="hover:bg-[var(--surface-hover)] transition-colors group"
                  >
                    <td className="py-2.5 px-3.5 text-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] inline-block" />
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-[var(--text)] max-w-xs truncate">
                      {p.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          {p.title}
                        </a>
                      ) : (
                        p.title
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-xs font-mono">
                      {getPlatformLabel(p.platform)}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getDifficultyBadge(
                          p.difficulty
                        )}`}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-[var(--muted)] text-[11px]">
                      {p.topic ? (
                        <span className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border-subtle)] font-mono">
                          {p.topic}
                        </span>
                      ) : (
                        <span className="text-[var(--muted)]/40 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-[var(--muted)] font-mono text-[11px] whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg)]/50 border-t border-[var(--border)] text-xs text-[var(--muted)] font-mono">
            <div>
              Showing <strong className="text-[var(--text)]">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-[var(--text)]">
                {Math.min(currentPage * pageSize, filteredProblems.length)}
              </strong>{' '}
              of <strong className="text-[var(--text)]">{filteredProblems.length}</strong> problems
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-[var(--surface)] border border-[var(--border)] disabled:opacity-40 hover:text-[var(--text)] transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-[var(--surface)] border border-[var(--border)] disabled:opacity-40 hover:text-[var(--text)] transition"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <p className="text-sm font-medium text-[var(--text)]">No problems found</p>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {problems.length === 0
              ? 'Connect your LeetCode, Codeforces, or CodeChef account to import verified problem solves.'
              : 'Try clearing your search query or adjusting your difficulty and platform filters.'}
          </p>
          {problems.length === 0 && (
            <button
              onClick={onConnectClick}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:opacity-90 transition"
            >
              Connect platform
            </button>
          )}
        </div>
      )}
    </div>
  );
};
