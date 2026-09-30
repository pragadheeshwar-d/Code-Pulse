import React from 'react';
import { RefreshCw, Menu, Activity } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user?: UserProfile | null;
  lastSyncedText: string;
  isSyncing: boolean;
  onSync: () => void;
  onOpenMobileMenu?: () => void;
  onOpenProfile?: () => void;
  variant?: 'all' | 'mobile' | 'desktop';
}

export const Header: React.FC<HeaderProps> = ({
  user,
  lastSyncedText,
  isSyncing,
  onSync,
  onOpenMobileMenu,
  onOpenProfile,
  variant = 'all'
}) => {
  return (
    <>
      {/* 1. Mobile Compact Header (< lg) */}
      {variant !== 'desktop' && (
        <header className="sticky top-0 z-30 lg:hidden bg-[#090d16]/95 backdrop-blur-md border-b border-[#1a2333]/80 px-3 xs:px-4 py-2.5 safe-top flex items-center justify-between">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-2 xs:gap-2.5 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open Navigation Menu"
              className="p-2 -ml-1.5 xs:-ml-2 rounded-lg text-[#8b9cb4] hover:text-white hover:bg-[#162035] transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-2 select-none min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="font-bold text-sm xs:text-base tracking-wider text-white truncate">
                CODE<span className="text-blue-500">PULSE</span>
              </span>
            </div>
          </div>

          {/* Right: Sync Action & User Profile Avatar */}
          <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
            {/* Quick sync button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              aria-label="Sync all platform data"
              className="p-2 rounded-lg bg-[#141d2f] hover:bg-[#1c2942] border border-[#22314d] text-blue-400 hover:text-blue-300 transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              title={isSyncing ? 'Syncing...' : `Last synced: ${lastSyncedText}`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* User Avatar Button */}
            <button
              onClick={onOpenProfile}
              aria-label="View user profile and settings"
              className="w-9 h-9 rounded-full bg-[#1e293b] text-white border border-[#334155] flex items-center justify-center font-semibold text-xs shadow-sm hover:border-blue-400 transition active:scale-95 min-w-[36px] min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </button>
          </div>
        </header>
      )}

      {/* 2. Desktop Header (>= lg) */}
      {variant !== 'mobile' && (
        <div className="hidden lg:flex items-center justify-between gap-4 pb-6 border-b border-[#1a2333]/60 mb-6 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white tracking-tight">Coding Progress</h1>
            <p className="text-sm text-[#8b9cb4] mt-0.5">
              Track your coding journey across every platform.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Last synced status */}
            <div className="flex items-center gap-2 text-xs text-[#8b9cb4] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
              <span>Last synced: <span className="text-[#cbd5e1] font-mono">{lastSyncedText}</span></span>
            </div>

            {/* Sync Now Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              aria-label="Sync all platform data"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d16] ${
                isSyncing
                  ? 'bg-blue-600/70 text-blue-100 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {/* User Avatar */}
            <button
              onClick={onOpenProfile}
              title="Profile & Settings"
              aria-label="Profile & Settings"
              className="w-9 h-9 rounded-full bg-[#1e293b] text-white border border-[#334155] flex items-center justify-center font-semibold text-sm shadow-sm hover:border-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d16]"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
