import React from 'react';
import { RefreshCw, Menu } from 'lucide-react';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { NavItem } from './Sidebar';

interface HeaderProps {
  user?: UserProfile | null;
  lastSyncedText: string;
  isSyncing: boolean;
  onSync: () => void;
  onOpenMobileMenu?: () => void;
  onOpenProfile?: () => void;
  currentTab?: NavItem;
  variant?: 'all' | 'mobile' | 'desktop';
}

export const Header: React.FC<HeaderProps> = ({
  user,
  lastSyncedText,
  isSyncing,
  onSync,
  onOpenMobileMenu,
  onOpenProfile,
  currentTab = 'dashboard',
  variant = 'all'
}) => {
  const getTabHeaderInfo = (tab: NavItem) => {
    switch (tab) {
      case 'platforms':
        return {
          title: 'Platforms',
          subtitle: 'Manage your connected competitive programming handles'
        };
      case 'problems':
        return {
          title: 'Problems',
          subtitle: 'Browse and filter your solved problem history'
        };
      case 'goals':
        return {
          title: 'Goals',
          subtitle: 'Set targets and track your milestone progress'
        };
      case 'analytics':
        return {
          title: 'Analytics',
          subtitle: 'Performance analytics, rating trends, and topic coverage'
        };
      case 'contests':
        return {
          title: 'Contests',
          subtitle: 'Contest ratings, rank changes, and performance history'
        };
      case 'activity':
        return {
          title: 'Activity',
          subtitle: 'Chronological daily problem-solving heatmap and timeline'
        };
      case 'github':
        return {
          title: 'GitHub',
          subtitle: 'Repositories, commits, and contribution activity'
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Account preferences, security, and sync settings'
        };
      case 'dashboard':
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Real-time stats synced across LeetCode, Codeforces, CodeChef & GFG'
        };
    }
  };

  const info = getTabHeaderInfo(currentTab);

  return (
    <>
      {/* 1. Mobile Top Navigation Bar (< lg) */}
      {variant !== 'desktop' && (
        <header className="sticky top-0 z-30 lg:hidden bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-3 xs:px-4 py-2.5 safe-top flex items-center justify-between">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-2 xs:gap-2.5 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open Navigation Menu"
              className="p-1.5 -ml-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition min-w-[38px] min-h-[38px] flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <Menu className="w-5 h-5 text-[var(--text)]" />
            </button>

            <Logo size="sm" showVersion={false} showSubtitle={false} />
          </div>

          {/* Right: Sync Action & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSync}
              disabled={isSyncing}
              aria-label="Sync platform stats"
              className="p-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--accent)] transition min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
              title={isSyncing ? 'Syncing...' : `Last synced: ${lastSyncedText}`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onOpenProfile}
              aria-label="Profile and Settings"
              className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-xs shadow-sm hover:opacity-90 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </button>
          </div>
        </header>
      )}

      {/* 2. Desktop Page Header Banner */}
      {variant !== 'mobile' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-[var(--border)] mb-6 w-full">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">
                {info.title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/25 text-[10px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              {info.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] whitespace-nowrap bg-[var(--surface)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 animate-pulse" />
              <span>Synced <span className="text-[var(--accent)] font-mono font-medium">{lastSyncedText}</span></span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onSync}
                disabled={isSyncing}
                aria-label="Sync all platform data"
                className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all shadow-sm min-h-[36px] sm:min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  isSyncing
                    ? 'bg-[var(--primary)]/70 text-[var(--on-primary)] cursor-not-allowed'
                    : 'bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] active:scale-95'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                onClick={onOpenProfile}
                title="Profile & Settings"
                aria-label="Profile & Settings"
                className="hidden lg:flex w-9 h-9 rounded-full bg-[var(--primary)] text-[var(--on-primary)] items-center justify-center font-bold text-xs shadow-sm hover:opacity-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
