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
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 flex flex-col justify-between hover:border-[#2a3754] transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#182338] border border-[#22314d] flex items-center justify-center">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <span className="text-sm font-medium text-[#94a3b8]">{title}</span>
        </div>
        {badge ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium font-mono">
            {badge}
          </span>
        ) : (
          <TrendingUp className="w-4 h-4 text-[#475569] group-hover:text-blue-400 transition-colors" />
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
          {hasData && value !== null ? value : '—'}
        </div>
        
        {hasData ? (
          <p className="text-xs text-[#64748b] mt-1.5 flex items-center gap-1">
            <span>{subtitle || 'Verified from connected platforms'}</span>
          </p>
        ) : (
          <button
            onClick={onConnectClick}
            className="text-xs text-[#64748b] hover:text-blue-400 mt-1.5 flex items-center gap-1 transition-colors"
          >
            <span>Connect a platform &rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
};
