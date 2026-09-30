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
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-[#2a3754] transition-all group active:scale-[0.99]">
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#182338] border border-[#22314d] flex items-center justify-center shrink-0">
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
          </div>
          <span className="text-xs sm:text-sm font-medium text-[#94a3b8] leading-tight line-clamp-2">{title}</span>
        </div>
        {badge ? (
          <span className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium font-mono shrink-0">
            {badge}
          </span>
        ) : (
          <TrendingUp className="hidden sm:block w-4 h-4 text-[#475569] group-hover:text-blue-400 transition-colors shrink-0" />
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight font-mono truncate">
          {hasData && value !== null ? value : '—'}
        </div>

        {hasData ? (
          <p className="text-[11px] sm:text-xs text-[#64748b] mt-1 sm:mt-1.5 truncate">
            <span>{subtitle || 'Verified platform data'}</span>
          </p>
        ) : (
          <button
            onClick={onConnectClick}
            className="text-[11px] sm:text-xs text-[#64748b] hover:text-blue-400 mt-1 sm:mt-1.5 flex items-center gap-1 transition-colors min-h-[36px]"
          >
            <span>Connect &rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
};
