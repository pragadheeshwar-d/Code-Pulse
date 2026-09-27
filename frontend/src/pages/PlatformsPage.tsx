import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Plus } from 'lucide-react';
import { PlatformCardData, PlatformType } from '../types';

interface PlatformsPageProps {
  platforms: PlatformCardData[];
  onConnect: (platform: PlatformType) => void;
  onManage: (platform: PlatformType) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
}

export const PlatformsPage: React.FC<PlatformsPageProps> = ({
  platforms,
  onConnect,
  onManage,
  onSyncAll,
  isSyncing
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a2333]/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Connected Platforms</h2>
          <p className="text-xs text-[#8b9cb4] mt-0.5">
            Manage your profiles across LeetCode, Codeforces, CodeChef, and GeeksforGeeks.
          </p>
        </div>

        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing all...' : 'Sync All Platforms'}</span>
        </button>
      </div>

      {/* Grid of detailed platform cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map(p => {
          const stats = p.stats;
          const isConnected = p.connected;

          return (
            <div
              key={p.platform}
              className="bg-[#101726] border border-[#1d263b] rounded-xl p-6 flex flex-col justify-between hover:border-[#2a3854] transition-all"
            >
              <div>
                {/* Platform Header */}
                <div className="flex items-start justify-between pb-4 border-b border-[#1c263c]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#162035] border border-[#22314d] flex items-center justify-center font-bold text-white uppercase text-base">
                      {p.platform.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white capitalize">{p.platform}</h3>
                      {isConnected && p.username ? (
                        <a
                          href={p.profile_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono transition-colors mt-0.5"
                        >
                          <span>@{p.username}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-[#64748b]">Not linked yet</span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : p.connection_status === 'error'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-[#182338] text-[#8b9cb4] border-[#22314d]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-400' : p.connection_status === 'error' ? 'bg-rose-400' : 'bg-gray-500'
                      }`}
                    />
                    <span>{isConnected ? 'Connected' : p.connection_status === 'error' ? 'Error' : 'Not Connected'}</span>
                  </span>
                </div>

                {/* Metrics Breakdown */}
                {isConnected && stats ? (
                  <div className="grid grid-cols-3 gap-3 my-5">
                    <div className="p-3 bg-[#141d2f] border border-[#1e293f] rounded-lg text-center">
                      <span className="text-[11px] text-[#8b9cb4]">Problems</span>
                      <p className="text-lg font-bold text-white font-mono mt-0.5">{stats.total_solved}</p>
                    </div>
                    <div className="p-3 bg-[#141d2f] border border-[#1e293f] rounded-lg text-center">
                      <span className="text-[11px] text-[#8b9cb4]">Rating</span>
                      <p className="text-lg font-bold text-white font-mono mt-0.5">
                        {stats.rating !== null ? stats.rating : '—'}
                      </p>
                    </div>
                    <div className="p-3 bg-[#141d2f] border border-[#1e293f] rounded-lg text-center">
                      <span className="text-[11px] text-[#8b9cb4]">Streak</span>
                      <p className="text-lg font-bold text-white font-mono mt-0.5">{stats.current_streak}d</p>
                    </div>
                  </div>
                ) : (
                  <div className="my-6 p-4 rounded-lg bg-[#141d2f] border border-dashed border-[#1e293f] text-center">
                    <p className="text-xs text-[#8b9cb4]">
                      No account connected. Connect with your username to import statistics.
                    </p>
                  </div>
                )}

                {/* Sync notice */}
                <div className="text-[11px] text-[#64748b] flex items-center justify-between mb-2">
                  <span>Last synced:</span>
                  <span className="font-mono text-[#94a3b8]">{p.last_synced_at ? new Date(p.last_synced_at).toLocaleString() : 'Never'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#1a2333]/80 flex gap-2">
                {isConnected ? (
                  <button
                    onClick={() => onManage(p.platform)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#162035] hover:bg-[#1f2d48] text-white border border-[#22314d] transition-colors"
                  >
                    Manage &amp; Sync &rarr;
                  </button>
                ) : (
                  <button
                    onClick={() => onConnect(p.platform)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect Account</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
