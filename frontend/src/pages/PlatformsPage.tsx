import React from 'react';
import { PlatformCard } from '../components/PlatformCard';
import { PlatformCardData, PlatformType } from '../types';

interface PlatformsPageProps {
  platforms: PlatformCardData[];
  onConnect: (platform: PlatformType) => void;
  onManage: (platform: PlatformType) => void;
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

export const PlatformsPage: React.FC<PlatformsPageProps> = ({
  platforms,
  onConnect,
  onManage
}) => {
  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Sub-header / Status Bar */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider font-mono">
            CONNECTED PLATFORMS
          </h2>
          <span className="text-xs text-[var(--accent)] font-mono font-semibold">
            ({connectedCount} / {platforms.length} Linked)
          </span>
        </div>
      </div>

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 xl:gap-4">
        {platforms.map(p => (
          <PlatformCard
            key={p.platform}
            data={p}
            onConnect={onConnect}
            onManage={onManage}
          />
        ))}
      </div>
    </div>
  );
};
