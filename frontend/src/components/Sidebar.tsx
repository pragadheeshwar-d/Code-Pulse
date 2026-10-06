import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  FileCode2,
  BarChart3,
  Target,
  Trophy,
  Calendar,
  Settings,
  LogOut,
  LogIn,
  GitBranch,
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

interface SidebarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  user?: UserProfile | null;
  lastSyncedText: string;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  user,
  lastSyncedText,
  onOpenAuth,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const hasToken = !!getAuthToken();

  const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'platforms', label: 'Platforms', icon: Layers },
    { id: 'problems', label: 'Problems', icon: FileCode2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'activity', label: 'Activity', icon: Calendar },
    { id: 'github', label: 'GitHub', icon: GitBranch },
    { id: 'settings', label: 'Settings', icon: Settings }
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
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <Logo size="md" showVersion={true} showSubtitle={true} />

          {/* Close button for mobile drawer */}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation drawer"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <span className="px-3 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider block mb-2">
            Overview
          </span>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[38px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    isActive
                      ? 'bg-[var(--surface)] text-[var(--accent)] border-l-2 border-[var(--accent)] font-semibold shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3.5 border-t border-[var(--border)] space-y-2.5 bg-[var(--bg)]">
        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-[var(--on-primary)] border border-[var(--primary)] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-[var(--text)] truncate leading-tight">
                {user?.name || (user?.email ? user.email.split('@')[0] : 'Developer')}
              </span>
              <span className="text-[10px] text-[var(--muted)] truncate">
                {user?.email || (hasToken ? 'Active Session' : 'Local Workspace')}
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
              className="p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--bg)] transition min-w-[32px] min-h-[32px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
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
              className="px-2 py-1 rounded bg-[var(--primary)] text-[var(--on-primary)] text-[11px] font-semibold transition flex items-center gap-1 min-h-[32px] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Sync telemetry status indicator */}
        <div className="px-1 flex items-center justify-between text-[10px] text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[var(--accent)]">Synced</span>
          </div>
          <span className="font-mono text-[var(--muted)]">{lastSyncedText}</span>
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
