import React from 'react';
import { LayoutDashboard, FileCode2, Target, BarChart3, Menu } from 'lucide-react';
import { NavItem } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenMobileMenu
}) => {
  const primaryTabs: { id: NavItem; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'problems', label: 'Problems', icon: FileCode2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'analytics', label: 'Stats', icon: BarChart3 }
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-t border-[var(--border)] lg:hidden safe-bottom"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto px-2">
        {primaryTabs.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-1 transition-all rounded-lg relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                isActive ? 'text-[var(--accent)] font-semibold' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0.5 w-6 h-0.5 rounded-full bg-[var(--accent)]" />
              )}
              <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open full navigation drawer"
          className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-1 text-[var(--muted)] hover:text-[var(--text)] transition-all rounded-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Menu className="w-4 h-4 text-[var(--muted)]" />
          <span className="text-[10px] font-medium tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
