import React from 'react';
import { Trophy, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { ContestRecord } from '../types';

interface ContestsPageProps {
  contests: ContestRecord[];
  onConnectClick: () => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({ contests, onConnectClick }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1a2333]/80">
        <h2 className="text-xl font-bold text-white tracking-tight">Contest History</h2>
        <p className="text-xs text-[#8b9cb4] mt-0.5">
          Real contest participation, leaderboard ranks, and rating changes across Codeforces, LeetCode, and CodeChef.
        </p>
      </div>

      {contests.length > 0 ? (
        <div className="bg-[#101726] border border-[#1d263b] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1c263c] bg-[#141d2f]/50 text-[#64748b]">
                  <th className="py-3 px-4 font-medium">Platform</th>
                  <th className="py-3 px-4 font-medium">Contest Name</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-center">Rank</th>
                  <th className="py-3 px-4 font-medium text-center">Old Rating</th>
                  <th className="py-3 px-4 font-medium text-center">New Rating</th>
                  <th className="py-3 px-4 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172238]">
                {contests.map((c, idx) => {
                  const change = c.rating_change;
                  const isPositive = typeof change === 'number' && change > 0;
                  const isNegative = typeof change === 'number' && change < 0;

                  return (
                    <tr key={idx} className="hover:bg-[#141d2f] transition-colors">
                      <td className="py-3 px-4 font-semibold capitalize text-white">
                        {c.platform}
                      </td>
                      <td className="py-3 px-4 text-white font-medium max-w-xs truncate">
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-400 inline-flex items-center gap-1.5 transition-colors"
                          >
                            <span className="truncate">{c.name}</span>
                            <ExternalLink className="w-3 h-3 text-[#64748b] shrink-0" />
                          </a>
                        ) : (
                          c.name
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#8b9cb4]">
                        {new Date(c.contest_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-white">
                        {c.rank !== null && c.rank !== undefined ? `#${c.rank}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[#8b9cb4]">
                        {c.rating_before !== null && c.rating_before !== undefined ? c.rating_before : '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-white font-semibold">
                        {c.rating_after !== null && c.rating_after !== undefined ? c.rating_after : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {change !== null && change !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive
                                ? 'text-emerald-400'
                                : isNegative
                                ? 'text-rose-400'
                                : 'text-[#8b9cb4]'
                            }`}
                          >
                            {isPositive ? `+${change}` : change}
                          </span>
                        ) : (
                          <span className="text-[#64748b]">—</span>
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
        <div className="bg-[#101726] border border-dashed border-[#1d263b] rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Trophy className="w-10 h-10 text-[#475569] mb-3" />
          <h4 className="text-sm font-semibold text-white">No contest history recorded</h4>
          <p className="text-xs text-[#8b9cb4] mt-1 max-w-sm">
            Participate in rated contests on Codeforces, LeetCode, or CodeChef and sync your account to track your rating changes.
          </p>
          <button
            onClick={onConnectClick}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Connect Platform &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
