import React from 'react';
import { Trophy, ExternalLink } from 'lucide-react';
import { ContestRecord } from '../types';

interface ContestsPageProps {
  contests: ContestRecord[];
  onConnectClick: () => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({ contests, onConnectClick }) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">Contest History</h2>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          Verified contest participation, leaderboard ranks, and rating deltas across Codeforces, LeetCode, and CodeChef.
        </p>
      </div>

      {contests.length > 0 ? (
        <>
          {/* Mobile Cards View (< md) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
            {contests.map((c, idx) => {
              const change = c.rating_change;
              const isPositive = typeof change === 'number' && change > 0;
              const isNegative = typeof change === 'number' && change < 0;

              return (
                <div
                  key={idx}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col justify-between hover:border-[var(--accent)]/50 transition-all space-y-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider font-mono">
                        {c.platform}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--muted)]">
                        {new Date(c.contest_date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text)] leading-snug line-clamp-2 font-sans">
                      {c.name}
                    </h3>
                  </div>

                  {/* Contest Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-center">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block uppercase font-mono">Rank</span>
                      <span className="text-xs font-mono font-bold text-[var(--text)]">
                        {c.rank !== null && c.rank !== undefined ? `#${c.rank}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block uppercase font-mono">Rating</span>
                      <span className="text-xs font-mono font-bold text-[var(--text)]">
                        {c.rating_after !== null && c.rating_after !== undefined ? c.rating_after : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block uppercase font-mono">Delta</span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isPositive ? 'text-[var(--accent)]' : isNegative ? 'text-[var(--danger)]' : 'text-[var(--muted)]'
                        }`}
                      >
                        {change !== null && change !== undefined ? (isPositive ? `+${change}` : change) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Contest Link */}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--accent)] border border-[var(--border)] flex items-center justify-center gap-1.5 transition-colors min-h-[38px]"
                    >
                      <span>Standings →</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hidden md:block shadow-sm">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50 text-[var(--muted)] font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Platform</th>
                    <th className="py-3 px-4 font-semibold">Contest Name</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-center">Rank</th>
                    <th className="py-3 px-4 font-semibold text-center">Old Rating</th>
                    <th className="py-3 px-4 font-semibold text-center">New Rating</th>
                    <th className="py-3 px-4 font-semibold text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {contests.map((c, idx) => {
                    const change = c.rating_change;
                    const isPositive = typeof change === 'number' && change > 0;
                    const isNegative = typeof change === 'number' && change < 0;

                    return (
                      <tr key={idx} className="hover:bg-[var(--bg)] transition-colors">
                        <td className="py-3 px-4 font-semibold capitalize text-[var(--text)]">
                          {c.platform}
                        </td>
                        <td className="py-3 px-4 text-[var(--text)] font-semibold max-w-xs truncate">
                          {c.url ? (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[var(--accent)] inline-flex items-center gap-1.5 transition-colors"
                            >
                              <span className="truncate">{c.name}</span>
                              <ExternalLink className="w-3 h-3 text-[var(--muted)] shrink-0" />
                            </a>
                          ) : (
                            c.name
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[var(--muted)]">
                          {new Date(c.contest_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[var(--text)]">
                          {c.rank !== null && c.rank !== undefined ? `#${c.rank}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[var(--muted)]">
                          {c.rating_before !== null && c.rating_before !== undefined ? c.rating_before : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[var(--text)] font-semibold">
                          {c.rating_after !== null && c.rating_after !== undefined ? c.rating_after : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
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
                              {isPositive ? `+${change}` : change}
                            </span>
                          ) : (
                            <span className="text-[var(--muted)]/50">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <Trophy className="w-10 h-10 text-[var(--muted)] mb-3" />
          <h4 className="text-sm font-semibold text-[var(--text)]">No contest history recorded</h4>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">
            Participate in rated contests on Codeforces, LeetCode, or CodeChef and sync your account to track rating changes.
          </p>
          <button
            onClick={onConnectClick}
            className="mt-4 px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] rounded-lg text-xs font-semibold transition-all min-h-[38px] flex items-center"
          >
            Connect Platform →
          </button>
        </div>
      )}
    </div>
  );
};

