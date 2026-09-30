import React from 'react';
import { TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number | null;
  icon: React.ElementType;
  iconColor?: string;
  hasData: boolean;
  onConnectClick?: () => void;
  badge?: string;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-400',
  hasData,
  onConnectClick,
  badge,
  subtitle
}) => {
  return (
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-3 sm:p-4 2xl:p-5 flex flex-col justify-between hover:border-[#2a3754] transition-all group active:scale-[0.99] h-full min-h-[125px] sm:min-h-[135px]">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
          <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-[#182338] border border-[#22314d] flex items-center justify-center shrink-0">
            <Icon className={`w-4 h-4 xl:w-5 xl:h-5 ${iconColor}`} />
          </div>
          <span className="text-xs 2xl:text-sm font-medium text-[#94a3b8] leading-tight truncate">{title}</span>
        </div>
        {badge ? (
          <span className="text-[10px] xl:text-[11px] px-1.5 xl:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium font-mono shrink-0 whitespace-nowrap">
            {badge}
          </span>
        ) : (
          <TrendingUp className="hidden min-[1380px]:block w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#475569] group-hover:text-blue-400 transition-colors shrink-0" />
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="text-2xl 2xl:text-3xl font-bold text-white tracking-tight font-mono truncate tabular-nums">
          {hasData && value !== null ? value : '—'}
        </div>

        <div className="min-h-[20px] sm:min-h-[24px] flex items-center mt-1 sm:mt-1.5">
          {hasData ? (
            <p className="text-[11px] sm:text-xs text-[#64748b] truncate leading-tight">
              <span>{subtitle || 'Verified platform data'}</span>
            </p>
          ) : (
            <button
              onClick={onConnectClick}
              aria-label={`Connect platform to sync ${title}`}
              className="text-[11px] sm:text-xs text-[#64748b] hover:text-blue-400 flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:text-blue-400 rounded"
            >
              <span>Connect &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
