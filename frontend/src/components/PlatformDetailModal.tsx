import React, { useState } from 'react';
import { X, RefreshCw, Trash2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { PlatformCardData } from '../types';

interface PlatformDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformData: PlatformCardData | null;
  onSync: (platform: any) => Promise<void>;
  onDisconnect: (platform: any) => Promise<void>;
}

export const PlatformDetailModal: React.FC<PlatformDetailModalProps> = ({
  isOpen,
  onClose,
  platformData,
  onSync,
  onDisconnect
}) => {
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !platformData) return null;

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await onSync(platformData.platform);
    } catch (err: any) {
      setError(err?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(`Are you sure you want to disconnect ${platformData.platform}?`)) {
      return;
    }
    setDisconnecting(true);
    setError(null);
    try {
      await onDisconnect(platformData.platform);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  const stats = platformData.stats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101726] border border-[#212f4d] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#64748b] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#162035] border border-[#22314d] flex items-center justify-center font-bold text-white uppercase text-sm">
            {platformData.platform.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white capitalize">{platformData.platform}</h3>
            {platformData.profile_url ? (
              <a
                href={platformData.profile_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono transition-colors"
              >
                <span>@{platformData.username}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs text-[#8b9cb4]">@{platformData.username}</span>
            )}
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Snapshot Stats */}
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-[#141d2f] border border-[#1e2a42] rounded-lg">
              <span className="text-[11px] text-[#8b9cb4]">Total Solved</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{stats.total_solved}</p>
            </div>
            <div className="p-3 bg-[#141d2f] border border-[#1e2a42] rounded-lg">
              <span className="text-[11px] text-[#8b9cb4]">Platform Rating</span>
              <p className="text-xl font-bold text-white font-mono mt-1">
                {stats.rating !== null ? stats.rating : '—'}
              </p>
            </div>
            <div className="p-3 bg-[#141d2f] border border-[#1e2a42] rounded-lg">
              <span className="text-[11px] text-[#8b9cb4]">Global Rank</span>
              <p className="text-xl font-bold text-white font-mono mt-1">
                {stats.rank !== null ? stats.rank : '—'}
              </p>
            </div>
            <div className="p-3 bg-[#141d2f] border border-[#1e2a42] rounded-lg">
              <span className="text-[11px] text-[#8b9cb4]">Current Streak</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{stats.current_streak}d</p>
            </div>
            <div className="p-3 bg-[#141d2f] border border-[#1e2a42] rounded-lg">
              <span className="text-[11px] text-[#8b9cb4]">Active Days</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{stats.active_days}</p>
            </div>
            <div className="p-3 bg-[#141d2f] border border-[#1e2a42] rounded-lg">
              <span className="text-[11px] text-[#8b9cb4]">Submissions</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{stats.total_submissions}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#141d2f] rounded-lg text-xs text-[#8b9cb4] mb-6">
            No snapshot data collected yet. Click "Sync Now" to collect real data.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1a2333]/80">
          <button
            onClick={handleDisconnect}
            disabled={disconnecting || syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{disconnecting ? 'Disconnecting...' : 'Disconnect Platform'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8b9cb4] hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSync}
              disabled={syncing || disconnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Platform Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
