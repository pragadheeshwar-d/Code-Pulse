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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c121e]/95 backdrop-blur-lg border-t border-[#1a2333] lg:hidden safe-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-2">
        {primaryTabs.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all rounded-lg relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive ? 'text-blue-400 font-semibold' : 'text-[#8b9cb4] hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-6 h-0.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-400' : 'text-[#64748b]'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open full navigation drawer"
          className="flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 text-[#8b9cb4] hover:text-white transition-all rounded-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Menu className="w-5 h-5 text-[#64748b]" />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
