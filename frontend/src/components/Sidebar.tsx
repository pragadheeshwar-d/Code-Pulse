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
  Code2,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  user,
  lastSyncedText
}) => {
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
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#1a2333]/60">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-sm">
            &lt;/&gt;
          </div>
          <span className="font-bold text-lg tracking-wider text-white">CODETRACK</span>
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
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#131b2c] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1e293b] text-white border border-[#334155] flex items-center justify-center font-semibold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                {user?.name || 'Developer'}
              </span>
              <span className="text-xs text-[#64748b]">
                {user?.headline || 'Coding Profile'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#64748b] group-hover:text-white transition-colors" />
        </div>

        {/* Sync indicator */}
        <div className="px-2 pt-1 flex items-center justify-between text-xs text-[#64748b]">
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
