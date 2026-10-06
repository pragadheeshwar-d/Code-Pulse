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
  iconColor = 'text-[var(--accent)]',
  hasData,
  onConnectClick,
  badge,
  subtitle
}) => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 xl:p-5 flex flex-col justify-between hover:border-[var(--border)] transition-all group h-full min-h-[130px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] truncate">{title}</span>
        </div>
        {badge ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/25 font-mono font-medium shrink-0 whitespace-nowrap">
            {badge}
          </span>
        ) : (
          <TrendingUp className="hidden min-[1380px]:block w-3.5 h-3.5 text-[var(--accent)]/40 group-hover:text-[var(--accent)] transition-colors shrink-0" />
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl xl:text-3xl font-bold text-[var(--text)] tracking-tight font-mono truncate tabular-nums">
          {hasData && value !== null ? value : '—'}
        </div>

        <div className="min-h-[20px] flex items-center mt-1">
          {hasData ? (
            <p className="text-xs text-[var(--muted)] truncate leading-tight">
              <span>{subtitle || 'Verified stats'}</span>
            </p>
          ) : (
            <button
              onClick={onConnectClick}
              aria-label={`Connect platform to sync ${title}`}
              className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 transition-colors font-medium rounded"
            >
              <span>Link Account →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
