import React from 'react';
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
  LogIn
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
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  user?: UserProfile | null;
  lastSyncedText: string;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  user,
  lastSyncedText,
  onOpenAuth,
  onLogout
}) => {
  const hasToken = !!getAuthToken();

  const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'platforms', label: 'Platforms', icon: Layers },
    { id: 'problems', label: 'Problems', icon: FileCode2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'activity', label: 'Activity', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-[#1a2333] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="px-6 py-5 border-b border-[#1a2333]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
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
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#182338] text-white shadow-sm font-semibold'
                    : 'text-[#8b9cb4] hover:text-white hover:bg-[#131b2c]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-[#64748b]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-[#1a2333]/80 space-y-3">
        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#111929] border border-[#1d293d]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-semibold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-white truncate">
                {user?.name || 'Developer'}
              </span>
              <span className="text-[11px] text-[#64748b] truncate">
                {user?.email || (hasToken ? 'Signed In' : 'Local Profile')}
              </span>
            </div>
          </div>

          {hasToken ? (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-[#1a2438] transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Sign In"
              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[11px] font-medium transition flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
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
    </aside>
  );
};
