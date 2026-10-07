import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  FileCode2,
  Target,
  Calendar,
  BarChart3,
  Trophy,
  Layers,
  GitBranch,
  Settings,
  LogOut,
  LogIn,
  Search,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { getAuthToken } from '../services/api';
import { Logo } from './Logo';

export type NavItem =
  | 'dashboard'
  | 'platforms'
  | 'problems'
  | 'analytics'
  | 'goals'
  | 'contests'
  | 'activity'
  | 'github'
  | 'settings';

interface NavSection {
  title: string;
  items: { id: NavItem; label: string; icon: React.ElementType }[];
}

interface SidebarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  user?: UserProfile | null;
  lastSyncedText: string;
  isSyncing?: boolean;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  user,
  lastSyncedText,
  isSyncing = false,
  onOpenAuth,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  onOpenCommandPalette
}) => {
  const hasToken = !!getAuthToken();

  const sections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'problems', label: 'Problems', icon: FileCode2 },
        { id: 'goals', label: 'Goals', icon: Target },
        { id: 'activity', label: 'Activity', icon: Calendar }
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'contests', label: 'Contests', icon: Trophy }
      ]
    },
    {
      title: 'CONNECTED',
      items: [
        { id: 'platforms', label: 'Platforms', icon: Layers },
        { id: 'github', label: 'GitHub', icon: GitBranch }
      ]
    }
  ];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleNavClick = (id: NavItem) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full bg-[var(--bg)] border-r border-[var(--border)] text-[var(--text)] select-none">
      {/* Top Brand & Search Header */}
      <div>
        <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
          <Logo size="md" showVersion={true} showSubtitle={true} />

          {/* Close button for mobile drawer */}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation drawer"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Search / Command Palette shortcut trigger */}
        <div className="p-3 pb-1">
          <button
            onClick={() => {
              if (onOpenCommandPalette) onOpenCommandPalette();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span>Search or jump to...</span>
            </div>
            <kbd className="text-[10px]">⌘K</kbd>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4">
          {sections.map(section => (
            <div key={section.title} className="space-y-1">
              <span className="px-2.5 text-[10px] font-mono font-semibold text-[var(--muted)] tracking-wider block">
                {section.title}
              </span>
              <nav className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                        isActive
                          ? 'bg-[var(--surface-active)] text-[var(--text)] font-semibold border border-[var(--border)]'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1 h-3 rounded-full bg-[var(--accent)]" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Settings Nav Item */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                currentTab === 'settings'
                  ? 'bg-[var(--surface-active)] text-[var(--text)] font-semibold border border-[var(--border)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              <Settings
                className={`w-4 h-4 shrink-0 ${
                  currentTab === 'settings' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                }`}
              />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[var(--border)] space-y-2 bg-[var(--bg)]">
        {/* User Session Row */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-medium text-[var(--text)] truncate leading-tight">
                {user?.name || (user?.email ? user.email.split('@')[0] : 'Developer')}
              </span>
              <span className="text-[10px] text-[var(--muted)] truncate font-mono">
                {user?.email || (hasToken ? 'Active Session' : 'Offline')}
              </span>
            </div>
          </div>

          {hasToken ? (
            <button
              onClick={() => {
                if (onLogout) onLogout();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1 rounded text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--bg)] transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--danger)]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Sign In"
              aria-label="Sign In"
              className="px-2 py-0.5 rounded bg-[var(--primary)] text-[var(--on-primary)] text-[10px] font-semibold transition flex items-center gap-1 hover:opacity-90"
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Truthful Sync Status */}
        <div className="px-1 flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSyncing ? 'bg-[var(--warm)] animate-ping' : 'bg-[var(--accent)]'
              }`}
            />
            <span className={isSyncing ? 'text-[var(--warm)]' : 'text-[var(--accent)]'}>
              {isSyncing ? 'Syncing...' : 'Synced'}
            </span>
          </div>
          <span>{lastSyncedText}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-[220px] min-w-[220px] xl:w-[240px] xl:min-w-[240px] shrink-0 h-screen sticky top-0">
        {renderContent(false)}
      </aside>

      {/* 2. Mobile Navigation Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Slide-in Drawer */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] z-50 flex flex-col justify-between shadow-2xl safe-bottom transform transition-transform duration-300 ease-out translate-x-0"
          >
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
