import React from 'react';
import { RefreshCw, Menu, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { NavItem } from './Sidebar';

interface HeaderProps {
  user?: UserProfile | null;
  lastSyncedText: string;
  isSyncing: boolean;
  syncError?: string | null;
  onSync: () => void;
  onOpenMobileMenu?: () => void;
  onOpenProfile?: () => void;
  onOpenCommandPalette?: () => void;
  currentTab?: NavItem;
  variant?: 'all' | 'mobile' | 'desktop';
}

export const Header: React.FC<HeaderProps> = ({
  user,
  lastSyncedText,
  isSyncing,
  syncError,
  onSync,
  onOpenMobileMenu,
  onOpenProfile,
  onOpenCommandPalette,
  currentTab = 'dashboard',
  variant = 'all'
}) => {
  const getTabHeaderInfo = (tab: NavItem) => {
    switch (tab) {
      case 'platforms':
        return {
          title: 'Platforms',
          subtitle: 'Manage connected competitive programming profiles and accounts'
        };
      case 'problems':
        return {
          title: 'Problems Library',
          subtitle: 'Search, filter, and inspect verified problem solves'
        };
      case 'goals':
        return {
          title: 'Goals & Targets',
          subtitle: 'Milestones, daily solving targets, and rating progression'
        };
      case 'analytics':
        return {
          title: 'Analytics & Trends',
          subtitle: 'Skill distribution, topic depth, and rating trajectory'
        };
      case 'contests':
        return {
          title: 'Contest History',
          subtitle: 'Verified participation, ranks, and rating delta logs'
        };
      case 'activity':
        return {
          title: 'Activity Timeline',
          subtitle: 'Chronological submission heatmap and daily solve logs'
        };
      case 'github':
        return {
          title: 'GitHub Activity',
          subtitle: 'Public repository telemetry and commit history'
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Preferences, automated sync intervals, and telemetry logs'
        };
      case 'dashboard':
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Unified competitive programming intelligence across all platforms'
        };
    }
  };

  const info = getTabHeaderInfo(currentTab);

  const renderSyncBadge = () => {
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--warm-muted)] text-[var(--warm)] border border-[var(--warm)]/20 text-[11px] font-mono">
          <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
          <span>Syncing platforms...</span>
        </span>
      );
    }

    if (syncError) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--danger-muted)] text-[var(--danger)] border border-[var(--danger)]/20 text-[11px] font-mono">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Sync needs attention</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] text-[11px] font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
        <span>Synced {lastSyncedText}</span>
      </span>
    );
  };

  return (
    <>
      {/* 1. Mobile Top Bar (< lg) */}
      {variant !== 'desktop' && (
        <header className="sticky top-0 z-30 lg:hidden bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-3 xs:px-4 py-2.5 safe-top flex items-center justify-between">
          <div className="flex items-center gap-2 xs:gap-2.5 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open Navigation Menu"
              className="p-1.5 -ml-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition min-w-[38px] min-h-[38px] flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <Menu className="w-5 h-5 text-[var(--text)]" />
            </button>
            <Logo size="sm" showVersion={false} showSubtitle={false} />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenCommandPalette}
              aria-label="Open Command Palette"
              className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--muted)] transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={onSync}
              disabled={isSyncing}
              aria-label="Sync all platform accounts"
              className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--accent)] transition min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-60"
              title={isSyncing ? 'Syncing...' : `Last synced: ${lastSyncedText}`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onOpenProfile}
              aria-label="Profile and Settings"
              className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-xs shadow-sm font-mono"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </button>
          </div>
        </header>
      )}

      {/* 2. Desktop Page Header Banner */}
      {variant !== 'mobile' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 border-b border-[var(--border)] mb-5 w-full">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">
                {info.title}
              </h1>
              {renderSyncBadge()}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              {info.subtitle}
            </p>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors min-h-[34px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="text-[10px]">⌘K</kbd>
            </button>

            {/* Sync Now button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--text)] transition-colors min-h-[34px] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--accent)] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {/* User Avatar */}
            <button
              onClick={onOpenProfile}
              aria-label="Profile and Settings"
              className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-xs shadow-sm hover:opacity-90 transition font-mono"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
