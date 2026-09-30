import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Filter, FileCode2, CheckCircle2, LayoutGrid, Table as TableIcon, ArrowUpDown } from 'lucide-react';
import { RecentProblem, PlatformType } from '../types';

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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#1a2333]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Solved Problems</h2>
          <p className="text-xs sm:text-sm text-[#8b9cb4] mt-0.5">
            Real problems verified and aggregated across your connected coding accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-xs text-[#8b9cb4] bg-[#101726] border border-[#1d263b] px-3 py-1.5 rounded-lg font-mono">
            Showing <strong className="text-white">{filteredProblems.length}</strong> of <strong className="text-blue-400">{problems.length}</strong>
          </span>

          {/* View toggle (cards / table) */}
          <div className="hidden sm:flex items-center gap-1 bg-[#101726] border border-[#1d263b] p-1 rounded-lg">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'auto' : 'cards')}
              title="Cards View"
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-[#8b9cb4] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'auto' : 'table')}
              title="Table View"
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-[#8b9cb4] hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search - Fully Touch & Mobile Friendly */}
      <div className="space-y-3">
        {/* Search Input: text-[16px] on mobile to prevent iOS automatic zoom */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search problems by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#101726] border border-[#1d263b] rounded-xl text-base sm:text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-blue-500 transition-colors min-h-[44px]"
          />
        </div>

        {/* Filter & Sort Dropdowns: mobile-friendly touch targets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Platform filter */}
          <div>
            <label className="sr-only">Platform</label>
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-[#101726] border border-[#1d263b] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
            >
              <option value="all">All Platforms</option>
              <option value="leetcode">LeetCode</option>
              <option value="codeforces">Codeforces</option>
              <option value="codechef">CodeChef</option>
              <option value="geeksforgeeks">GFG</option>
            </select>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="sr-only">Difficulty</label>
            <select
              value={selectedDiff}
              onChange={e => setSelectedDiff(e.target.value)}
              className="w-full px-3 py-2 bg-[#101726] border border-[#1d263b] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="col-span-2 sm:col-span-1">
            <label className="sr-only">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#101726] border border-[#1d263b] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problem Display: Responsive Cards on Mobile / Table on Desktop */}
      {filteredProblems.length > 0 ? (
        <>
          {/* A. Mobile Cards View (Visible on mobile/tablet or if Cards mode selected) */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'md:hidden'}`}>
            {filteredProblems.map((prob, idx) => (
              <div
                key={idx}
                className="bg-[#101726] border border-[#1d263b] rounded-xl p-4 flex flex-col justify-between hover:border-[#2a3854] transition-all space-y-3"
              >
                <div>
                  {/* Title */}
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug line-clamp-2">
                    {prob.title}
                  </h3>

                  {/* Platform & Difficulty */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="font-medium">{getPlatformLabel(prob.platform)}</span>
                    <span className="text-[#64748b]">•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyBadge(
                        prob.difficulty
                      )}`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                </div>

                {/* Status & Date */}
                <div className="pt-2 border-t border-[#1c263c] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Solved</span>
                  </div>
                  <span className="text-[#8b9cb4] font-mono text-[11px]">
                    {formatDate(prob.date)}
                  </span>
                </div>

                {/* View Problem Action */}
                {prob.url ? (
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#162035] hover:bg-[#1f2d48] text-blue-400 hover:text-blue-300 border border-[#22314d] flex items-center justify-center gap-1.5 transition-colors min-h-[44px] active:scale-[0.98]"
                  >
                    <span>View Problem</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="w-full py-2 text-center text-xs text-[#64748b]">
                    Logged via sync
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* B. Desktop Table View (Visible on desktop or if Table mode forced) */}
          <div className={`bg-[#101726] border border-[#1d263b] rounded-xl overflow-hidden ${viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'}`}>
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1c263c] bg-[#141d2f]/50 text-[#64748b]">
                    <th className="py-3 px-4 font-medium">Problem</th>
                    <th className="py-3 px-4 font-medium">Platform</th>
                    <th className="py-3 px-4 font-medium">Difficulty</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172238]">
                  {filteredProblems.map((prob, idx) => (
                    <tr key={idx} className="hover:bg-[#141d2f] transition-colors">
                      <td className="py-3 px-4 text-white font-medium max-w-xs truncate">
                        {prob.title}
                      </td>
                      <td className="py-3 px-4 font-medium">{getPlatformLabel(prob.platform)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getDifficultyBadge(
                            prob.difficulty
                          )}`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Solved</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#8b9cb4]">
                        {formatDate(prob.date)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {prob.url ? (
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors p-1"
                            title="View Problem"
                          >
                            <span>View &rarr;</span>
                          </a>
                        ) : (
                          <span className="text-[#64748b]">—</span>
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
        <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-[#101726] border border-dashed border-[#1d263b] rounded-xl">
          <FileCode2 className="w-10 h-10 text-[#475569] mb-3" />
          <h4 className="text-sm font-semibold text-white">No problems found</h4>
          <p className="text-xs text-[#8b9cb4] mt-1 max-w-sm">
            {problems.length === 0
              ? 'Connect a coding platform to sync your solved problems.'
              : 'No problems match your current search and filter criteria.'}
          </p>
          {problems.length === 0 && (
            <button
              onClick={onConnectClick}
              className="mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors min-h-[44px] flex items-center"
            >
              Connect a Platform &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
};
