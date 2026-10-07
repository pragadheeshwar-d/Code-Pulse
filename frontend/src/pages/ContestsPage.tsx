import React, { useState, useMemo } from 'react';
import { Trophy, ExternalLink, ArrowUpRight, ArrowDownRight, Minus, Filter } from 'lucide-react';
import { ContestRecord } from '../types';

interface ContestsPageProps {
  contests: ContestRecord[];
  onConnectClick: () => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({ contests, onConnectClick }) => {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [deltaFilter, setDeltaFilter] = useState<'all' | 'positive' | 'negative'>('all');

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    if (contests.length === 0) {
      return {
        bestRank: null,
        highestRating: null,
        avgDelta: null,
        total: 0
      };
    }

    let minRank: number | null = null;
    let maxRating: number | null = null;
    let totalDelta = 0;
    let ratedCount = 0;

    contests.forEach(c => {
      if (typeof c.rank === 'number' && c.rank > 0) {
        if (minRank === null || c.rank < minRank) minRank = c.rank;
      }
      if (typeof c.rating_after === 'number' && c.rating_after > 0) {
        if (maxRating === null || c.rating_after > maxRating) maxRating = c.rating_after;
      }
      if (typeof c.rating_change === 'number') {
        totalDelta += c.rating_change;
        ratedCount++;
      }
    });

    const avg = ratedCount > 0 ? Math.round(totalDelta / ratedCount) : null;

    return {
      bestRank: minRank,
      highestRating: maxRating,
      avgDelta: avg,
      total: contests.length
    };
  }, [contests]);

  const filteredContests = useMemo(() => {
    return contests.filter(c => {
      const matchPlatform = platformFilter === 'all' || c.platform.toLowerCase() === platformFilter.toLowerCase();
      let matchDelta = true;
      if (deltaFilter === 'positive') matchDelta = typeof c.rating_change === 'number' && c.rating_change > 0;
      if (deltaFilter === 'negative') matchDelta = typeof c.rating_change === 'number' && c.rating_change < 0;
      return matchPlatform && matchDelta;
    });
  }, [contests, platformFilter, deltaFilter]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
              Contest History
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]">
              {contests.length} participated
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Verified performance, rating adjustments, and leaderboard rankings across platforms
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium"
          >
            <option value="all">All Platforms</option>
            <option value="codeforces">Codeforces</option>
            <option value="leetcode">LeetCode</option>
            <option value="codechef">CodeChef</option>
          </select>

          <select
            value={deltaFilter}
            onChange={e => setDeltaFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium"
          >
            <option value="all">All Rating Deltas</option>
            <option value="positive">Rating Gain (+)</option>
            <option value="negative">Rating Loss (-)</option>
          </select>
        </div>
      </div>

      {/* 2. Contest Summary Metrics (Phase 9 requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <span className="text-[11px] font-mono uppercase text-[var(--muted)] block">Contests Participated</span>
          <p className="text-xl font-bold font-mono text-[var(--text)] mt-1">{metrics.total}</p>
        </div>
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <span className="text-[11px] font-mono uppercase text-[var(--muted)] block">Best Rank</span>
          <p className="text-xl font-bold font-mono text-[var(--text)] mt-1">
            {metrics.bestRank !== null ? `#${metrics.bestRank}` : '—'}
          </p>
        </div>
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <span className="text-[11px] font-mono uppercase text-[var(--muted)] block">Highest Rating</span>
          <p className="text-xl font-bold font-mono text-[var(--accent)] mt-1">
            {metrics.highestRating !== null ? metrics.highestRating : '—'}
          </p>
        </div>
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <span className="text-[11px] font-mono uppercase text-[var(--muted)] block">Average Delta</span>
          <p className={`text-xl font-bold font-mono mt-1 ${
            metrics.avgDelta && metrics.avgDelta > 0
              ? 'text-[var(--accent)]'
              : metrics.avgDelta && metrics.avgDelta < 0
              ? 'text-[var(--danger)]'
              : 'text-[var(--muted)]'
          }`}>
            {metrics.avgDelta !== null ? (metrics.avgDelta > 0 ? `+${metrics.avgDelta}` : metrics.avgDelta) : '—'}
          </p>
        </div>
      </div>

      {/* 3. Contest History Table */}
      {filteredContests.length > 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]/60 text-[var(--muted)] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3.5 font-normal">Platform</th>
                  <th className="py-2.5 px-3.5 font-normal">Contest Name</th>
                  <th className="py-2.5 px-3.5 font-normal">Date</th>
                  <th className="py-2.5 px-3.5 font-normal">Rank</th>
                  <th className="py-2.5 px-3.5 font-normal">Old Rating</th>
                  <th className="py-2.5 px-3.5 font-normal">New Rating</th>
                  <th className="py-2.5 px-3.5 font-normal">Delta</th>
                  <th className="py-2.5 px-3.5 text-right font-normal">Standings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-sans">
                {filteredContests.map((c, idx) => {
                  const change = c.rating_change;
                  const isPositive = typeof change === 'number' && change > 0;
                  const isNegative = typeof change === 'number' && change < 0;

                  return (
                    <tr
                      key={`${c.platform}-${c.external_contest_id || idx}`}
                      className="hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-mono capitalize font-medium text-[var(--text)]">
                        {c.platform}
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-[var(--text)] max-w-xs truncate">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-[var(--muted)] whitespace-nowrap">
                        {formatDate(c.contest_date)}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-medium text-[var(--text)]">
                        {c.rank !== null && c.rank !== undefined ? `#${c.rank}` : '—'}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[var(--muted)]">
                        {c.rating_before !== null && c.rating_before !== undefined ? c.rating_before : '—'}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-medium text-[var(--text)]">
                        {c.rating_after !== null && c.rating_after !== undefined ? c.rating_after : '—'}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-semibold whitespace-nowrap">
                        {change !== null && change !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive
                                ? 'text-[var(--accent)]'
                                : isNegative
                                ? 'text-[var(--danger)]'
                                : 'text-[var(--muted)]'
                            }`}
                          >
                            {isPositive && <ArrowUpRight className="w-3 h-3" />}
                            {isNegative && <ArrowDownRight className="w-3 h-3" />}
                            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                            <span>{isPositive ? `+${change}` : change}</span>
                          </span>
                        ) : (
                          <span className="text-[var(--muted)]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[var(--muted)]/40 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <Trophy className="w-8 h-8 text-[var(--muted)] mx-auto opacity-40 mb-2" />
          <p className="text-sm font-medium text-[var(--text)]">No contests found</p>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {contests.length === 0
              ? 'Connect your Codeforces, LeetCode, or CodeChef account to import verified contest rating history.'
              : 'No contests matched your platform or delta filters.'}
          </p>
          {contests.length === 0 && (
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
