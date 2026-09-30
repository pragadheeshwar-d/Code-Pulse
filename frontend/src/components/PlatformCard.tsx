import React from 'react';
import { PlatformCardData, PlatformType } from '../types';

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
          iconText: 'LC',
          borderColor: 'border-amber-500/20 hover:border-amber-500/40',
          accentColor: 'text-[#ffa116]',
          badgeBg: 'bg-[#ffa116]/10 text-[#ffa116] border-[#ffa116]/30',
          iconSvg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#ffa116]">
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.136-.011-.001-.023-.001-.035-.001-.001 0-.002 0-.003 0z"/>
            </svg>
          )
        };
      case 'codechef':
        return {
          name: 'CodeChef',
          iconText: 'CC',
          borderColor: 'border-amber-700/20 hover:border-amber-700/40',
          accentColor: 'text-[#d97706]',
          badgeBg: 'bg-[#b45309]/10 text-[#d97706] border-[#b45309]/30',
          iconSvg: (
            <span className="font-bold text-base text-[#d97706]">👨‍🍳</span>
          )
        };
      case 'geeksforgeeks':
        return {
          name: 'GeeksforGeeks',
          shortName: 'GFG',
          iconText: 'GFG',
          borderColor: 'border-emerald-600/20 hover:border-emerald-600/40',
          accentColor: 'text-[#10b981]',
          badgeBg: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30',
          iconSvg: (
            <span className="font-mono font-bold text-sm text-[#10b981]">{'{ }'}</span>
          )
        };
      case 'codeforces':
        return {
          name: 'Codeforces',
          shortName: 'Codeforces',
          iconText: 'CF',
          borderColor: 'border-blue-600/20 hover:border-blue-600/40',
          accentColor: 'text-[#3b82f6]',
          badgeBg: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30',
          iconSvg: (
            <span className="font-mono font-bold text-xs text-[#3b82f6]">CF</span>
          )
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
    <div className={`bg-[#101726] border ${config.borderColor} rounded-xl p-3 sm:p-5 flex flex-col justify-between transition-all group relative overflow-hidden active:scale-[0.99]`}>
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1c263c]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#162035] border border-[#212f4d] flex items-center justify-center shrink-0">
              {config.iconSvg}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-xs sm:text-sm tracking-tight truncate">
                <span className="min-[480px]:hidden">{config.shortName || config.name}</span>
                <span className="hidden min-[480px]:inline">{config.name}</span>
              </h3>
              {isConnected && data.username && (
                <span className="text-[11px] text-[#8b9cb4] font-mono truncate block">@{data.username}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" title={isConnected ? 'Connected' : data.connection_status === 'error' ? 'Error' : 'Not linked'}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                  : data.connection_status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-[#64748b]'
              }`}
            />
            <span className="text-[11px] text-[#8b9cb4] hidden min-[440px]:inline">
              {isConnected ? 'Connected' : data.connection_status === 'error' ? 'Error' : 'Not linked'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="py-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#8b9cb4]">Solved</span>
            <span className="font-mono font-medium text-white">
              {isConnected && data.stats ? data.stats.total_solved : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8b9cb4]">Rating</span>
            <span className="font-mono font-medium text-white">
              {isConnected && data.stats?.rating !== null && data.stats?.rating !== undefined ? data.stats.rating : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8b9cb4]">Current Streak</span>
            <span className="font-mono font-medium text-white">
              {isConnected && data.stats ? `${data.stats.current_streak}d` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8b9cb4]">Max Streak</span>
            <span className="font-mono font-medium text-amber-400">
              {isConnected && data.stats ? `${data.stats.longest_streak ?? data.stats.current_streak}d` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8b9cb4]">Last synced</span>
            <span className="font-mono text-[#8b9cb4]">
              {formatLastSync(data.last_synced_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button: Touch-friendly min 44px */}
      <div className="pt-2">
        {isConnected ? (
          <button
            onClick={() => onManage(data.platform)}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#172238] hover:bg-[#1f2d4a] text-[#cbd5e1] hover:text-white border border-[#22314e] transition-colors min-h-[44px] flex items-center justify-center active:scale-[0.98]"
          >
            Manage account &rarr;
          </button>
        ) : (
          <button
            onClick={() => onConnect(data.platform)}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#162035] hover:bg-blue-600/20 text-[#8b9cb4] hover:text-blue-400 border border-[#22314e] hover:border-blue-500/30 transition-colors min-h-[44px] flex items-center justify-center active:scale-[0.98]"
          >
            Connect account &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
