import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  FileCode2,
  Target,
  Calendar,
  BarChart3,
  Trophy,
  Layers,
  GitBranch,
  Settings,
  RefreshCw,
  Plus,
  ArrowRight
} from 'lucide-react';
import { NavItem } from './Sidebar';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavItem) => void;
  onSync: () => void;
  onCreateGoal: () => void;
  onConnectPlatform: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  section: 'Navigation' | 'Actions';
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSync,
  onCreateGoal,
  onConnectPlatform
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    // Navigation items
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'Overview of verified solves, streaks and daily targets',
      icon: LayoutDashboard,
      section: 'Navigation',
      action: () => {
        onNavigate('dashboard');
        onClose();
      }
    },
    {
      id: 'nav-problems',
      title: 'Problems Library',
      subtitle: 'Search and filter all solved problems',
      icon: FileCode2,
      section: 'Navigation',
      action: () => {
        onNavigate('problems');
        onClose();
      }
    },
    {
      id: 'nav-goals',
      title: 'Goals & Milestones',
      subtitle: 'Active problem solving and rating targets',
      icon: Target,
      section: 'Navigation',
      action: () => {
        onNavigate('goals');
        onClose();
      }
    },
    {
      id: 'nav-activity',
      title: 'Activity Heatmap',
      subtitle: 'Chronological timeline and daily breakdown',
      icon: Calendar,
      section: 'Navigation',
      action: () => {
        onNavigate('activity');
        onClose();
      }
    },
    {
      id: 'nav-analytics',
      title: 'Analytics & Insights',
      subtitle: 'Difficulty distribution and topic coverage',
      icon: BarChart3,
      section: 'Navigation',
      action: () => {
        onNavigate('analytics');
        onClose();
      }
    },
    {
      id: 'nav-contests',
      title: 'Contest History',
      subtitle: 'Rankings, rating changes, and contest performance',
      icon: Trophy,
      section: 'Navigation',
      action: () => {
        onNavigate('contests');
        onClose();
      }
    },
    {
      id: 'nav-platforms',
      title: 'Connected Platforms',
      subtitle: 'LeetCode, CodeChef, Codeforces, and GFG accounts',
      icon: Layers,
      section: 'Navigation',
      action: () => {
        onNavigate('platforms');
        onClose();
      }
    },
    {
      id: 'nav-github',
      title: 'GitHub Integration',
      subtitle: 'Public repositories, commits, and contributions',
      icon: GitBranch,
      section: 'Navigation',
      action: () => {
        onNavigate('github');
        onClose();
      }
    },
    {
      id: 'nav-settings',
      title: 'Settings & Telemetry',
      subtitle: 'Account details and automated sync preferences',
      icon: Settings,
      section: 'Navigation',
      action: () => {
        onNavigate('settings');
        onClose();
      }
    },

    // Actions
    {
      id: 'act-sync',
      title: 'Sync all platforms now',
      subtitle: 'Trigger instant sync across all connected accounts',
      icon: RefreshCw,
      section: 'Actions',
      badge: 'Sync',
      action: () => {
        onSync();
        onClose();
      }
    },
    {
      id: 'act-goal',
      title: 'Create new coding goal',
      subtitle: 'Set a target for solved problems, rating, or contests',
      icon: Plus,
      section: 'Actions',
      badge: 'Goal',
      action: () => {
        onCreateGoal();
        onClose();
      }
    },
    {
      id: 'act-connect',
      title: 'Connect a new platform handle',
      subtitle: 'Add LeetCode, CodeChef, Codeforces, or GFG',
      icon: Layers,
      section: 'Actions',
      badge: 'Account',
      action: () => {
        onConnectPlatform();
        onClose();
      }
    }
  ];

  const filtered = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    (cmd.subtitle && cmd.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle arrow key navigation & execution
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden text-[var(--text)]"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
          <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or jump to page... (Esc to close)"
            className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none font-sans"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="hidden sm:inline-flex">ESC</kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 space-y-1 touch-scroll"
        >
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border)]'
                      : 'text-[var(--text)]/80 hover:bg-[var(--surface-hover)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[var(--surface-active)] text-[var(--accent)] border-[var(--border)]'
                          : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border-subtle)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-xs text-[var(--text)] flex items-center gap-2">
                        <span>{cmd.title}</span>
                        {cmd.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20 font-mono font-semibold">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                      isSelected ? 'text-[var(--accent)] opacity-100' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[var(--muted)] font-mono">
              No matching commands or destinations found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)] font-mono">
          <div className="flex items-center gap-3">
            <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
          </div>
          <span>CodePulse Command Palette</span>
        </div>
      </div>
    </div>
  );
};
