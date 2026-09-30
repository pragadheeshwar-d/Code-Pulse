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
  Activity,
  LogOut,
  LogIn,
  GitBranch,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import { getAuthToken } from '../services/api';

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
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#1a2333]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-white">
                CODE<span className="text-blue-500">PULSE</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-blue-400/80 font-medium block">
                Track. Solve. Grow.
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation drawer"
              className="p-2 -mr-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2333] transition min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] text-left active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-[#182338] text-white shadow-sm font-semibold'
                    : 'text-[#8b9cb4] hover:text-white hover:bg-[#131b2c]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-[#64748b]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-[#1a2333]/80 space-y-3 bg-[#0d131f]">
        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111929] border border-[#1d293d]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-semibold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-white truncate">
                {user?.name || (user?.email ? user.email.split('@')[0] : 'User')}
              </span>
              <span className="text-[11px] text-[#64748b] truncate">
                {user?.email || (hasToken ? 'Active Session' : 'Local Profile')}
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
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-[#1a2438] transition min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Sign In"
              aria-label="Sign In"
              className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium transition flex items-center gap-1 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Sync indicator */}
        <div className="px-1 flex items-center justify-between text-[11px] text-[#64748b]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Last synced</span>
          </div>
          <span className="font-mono text-[#94a3b8]">{lastSyncedText}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-[274px] min-w-[274px] bg-[#0d131f] border-r border-[#1a2333] flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
        {renderContent(false)}
      </aside>

      {/* 2. Mobile Navigation Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            aria-hidden="true"
          />

          {/* Slide-in Drawer */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#0d131f] border-r border-[#1a2333] z-50 flex flex-col justify-between shadow-2xl safe-bottom transform transition-transform duration-300 ease-out translate-x-0"
          >
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
