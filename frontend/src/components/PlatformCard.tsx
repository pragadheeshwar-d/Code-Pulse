import React from 'react';
import { PlatformCardData, PlatformType } from '../types';
import { PlatformIcon } from './PlatformIcon';

interface PlatformCardProps {
  data: PlatformCardData;
  onConnect: (platform: PlatformType) => void;
  onManage: (platform: PlatformType) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  data,
  onConnect,
  onManage
}) => {
  const getPlatformConfig = (platform: PlatformType) => {
    switch (platform) {
      case 'leetcode':
        return {
          name: 'LeetCode',
          shortName: 'LeetCode',
          borderColor: 'border-[var(--border)] hover:border-[var(--warm)]/50',
          accentColor: 'text-[var(--warm)]',
          badgeBg: 'bg-[var(--warm)]/10 text-[var(--warm)] border-[var(--warm)]/30',
          iconSvg: <PlatformIcon platform="leetcode" />
        };
      case 'codechef':
        return {
          name: 'CodeChef',
          shortName: 'CodeChef',
          borderColor: 'border-[var(--border)] hover:border-[var(--warm)]/50',
          accentColor: 'text-[var(--warm)]',
          badgeBg: 'bg-[var(--warm)]/10 text-[var(--warm)] border-[var(--warm)]/30',
          iconSvg: <PlatformIcon platform="codechef" />
        };
      case 'geeksforgeeks':
        return {
          name: 'GeeksforGeeks',
          shortName: 'GFG',
          borderColor: 'border-[var(--border)] hover:border-[var(--accent)]/50',
          accentColor: 'text-[var(--accent)]',
          badgeBg: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30',
          iconSvg: <PlatformIcon platform="geeksforgeeks" />
        };
      case 'codeforces':
        return {
          name: 'Codeforces',
          shortName: 'Codeforces',
          borderColor: 'border-[var(--border)] hover:border-[var(--accent)]/50',
          accentColor: 'text-[var(--accent)]',
          badgeBg: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30',
          iconSvg: <PlatformIcon platform="codeforces" />
        };
    }
  };

  const config = getPlatformConfig(data.platform);
  const isConnected = data.connected;

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Never';
    try {
      const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Never';
    }
  };

  return (
    <div className={`bg-[var(--surface)] border ${config.borderColor} rounded-xl p-4 xl:p-5 flex flex-col justify-between transition-all group relative overflow-hidden h-full shadow-sm hover:shadow-md`}>
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] min-h-[48px]">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
              {config.iconSvg}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--text)] text-xs sm:text-sm tracking-tight truncate font-sans">
                {config.name}
              </h3>
              <span className="text-[10px] font-mono truncate block h-4 leading-4 text-[var(--muted)]">
                {isConnected && data.username ? `@${data.username}` : 'Not connected'}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-1.5 shrink-0"
            role="status"
            aria-label={`Status: ${isConnected ? 'Connected' : data.connection_status === 'error' ? 'Error' : 'Offline'}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isConnected
                  ? 'bg-[var(--accent)] animate-pulse'
                  : data.connection_status === 'error'
                  ? 'bg-[var(--danger)]'
                  : 'bg-[var(--muted)]/50'
              }`}
            />
            <span
              className={`text-[10px] font-medium ${
                isConnected
                  ? 'text-[var(--accent)]'
                  : data.connection_status === 'error'
                  ? 'text-[var(--danger)]'
                  : 'text-[var(--muted)]'
              }`}
            >
              {isConnected ? 'Live' : data.connection_status === 'error' ? 'Error' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">Problems Solved</span>
            <span className="font-mono font-bold text-[var(--text)] tabular-nums">
              {isConnected && data.stats ? data.stats.total_solved : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">Rating</span>
            <span className="font-mono font-semibold text-[var(--text)] tabular-nums">
              {isConnected && data.stats?.rating !== null && data.stats?.rating !== undefined ? data.stats.rating : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">Current Streak</span>
            <span className="font-mono font-medium text-[var(--warm)] tabular-nums">
              {isConnected && data.stats ? `${data.stats.current_streak}d` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">Max Streak</span>
            <span className="font-mono font-medium text-[var(--warm)] tabular-nums">
              {isConnected && data.stats ? `${data.stats.longest_streak ?? data.stats.current_streak}d` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
            <span className="text-[11px] text-[var(--muted)]">Last Synced</span>
            <span className="font-mono text-[11px] text-[var(--muted)]">
              {formatLastSync(data.last_synced_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        {isConnected ? (
          <button
            onClick={() => onManage(data.platform)}
            aria-label={`Manage ${config.name} account`}
            className="w-full h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)] transition-all flex items-center justify-center active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span>Manage Account →</span>
          </button>
        ) : (
          <button
            onClick={() => onConnect(data.platform)}
            aria-label={`Connect ${config.name} account`}
            className="w-full h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] transition-all flex items-center justify-center active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span>Connect Account →</span>
          </button>
        )}
      </div>
    </div>
  );
};
