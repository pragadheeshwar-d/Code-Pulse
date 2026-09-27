import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Filter, FileCode2 } from 'lucide-react';
import { RecentProblem, PlatformType } from '../types';

interface ProblemsPageProps {
  problems: RecentProblem[];
  onConnectClick: () => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({ problems, onConnectClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
      const matchesDiff = selectedDiff === 'all' || p.difficulty.toLowerCase() === selectedDiff.toLowerCase();
      return matchesSearch && matchesPlatform && matchesDiff;
    });
  }, [problems, searchTerm, selectedPlatform, selectedDiff]);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#1a2333]/80">
        <h2 className="text-xl font-bold text-white tracking-tight">Solved Problems</h2>
        <p className="text-xs text-[#8b9cb4] mt-0.5">
          Real problems verified and aggregated across your connected coding accounts.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search problems by name..."
            className="w-full pl-10 pr-4 py-2 bg-[#101726] border border-[#1d263b] rounded-lg text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform filter */}
          <select
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 bg-[#101726] border border-[#1d263b] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
            <option value="codechef">CodeChef</option>
            <option value="geeksforgeeks">GeeksforGeeks</option>
          </select>

          {/* Difficulty filter */}
          <select
            value={selectedDiff}
            onChange={e => setSelectedDiff(e.target.value)}
            className="px-3 py-2 bg-[#101726] border border-[#1d263b] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#101726] border border-[#1d263b] rounded-xl overflow-hidden">
        {filteredProblems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1c263c] bg-[#141d2f]/50 text-[#64748b]">
                  <th className="py-3 px-4 font-medium">Platform</th>
                  <th className="py-3 px-4 font-medium">Problem Title</th>
                  <th className="py-3 px-4 font-medium">Difficulty</th>
                  <th className="py-3 px-4 font-medium text-right">Solved Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172238]">
                {filteredProblems.map((prob, idx) => (
                  <tr key={idx} className="hover:bg-[#141d2f] transition-colors">
                    <td className="py-3 px-4 font-medium">{getPlatformLabel(prob.platform)}</td>
                    <td className="py-3 px-4 text-white font-medium">
                      {prob.url ? (
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-400 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>{prob.title}</span>
                          <ExternalLink className="w-3 h-3 text-[#64748b]" />
                        </a>
                      ) : (
                        prob.title
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getDifficultyBadge(
                          prob.difficulty
                        )}`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#8b9cb4] text-right">
                      {new Date(prob.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
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
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Connect a Platform &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
