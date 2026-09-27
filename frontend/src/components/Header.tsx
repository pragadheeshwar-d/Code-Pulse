import React from 'react';
import { RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user?: UserProfile | null;
  lastSyncedText: string;
  isSyncing: boolean;
  onSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  lastSyncedText,
  isSyncing,
  onSync
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1a2333]/60 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Coding Progress</h1>
        <p className="text-sm text-[#8b9cb4] mt-0.5">
          Track your coding journey across every platform.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Last synced status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#8b9cb4]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Last synced: <span className="text-[#cbd5e1] font-mono">{lastSyncedText}</span></span>
        </div>

        {/* Sync Now Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
            isSyncing
              ? 'bg-blue-600/70 text-blue-100 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#1e293b] text-white border border-[#334155] flex items-center justify-center font-semibold text-sm shadow-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
        </div>
      </div>
    </header>
  );
};
