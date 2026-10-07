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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-[var(--border)] transition-colors group h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--muted)] truncate">{title}</span>
        </div>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20 shrink-0 whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-mono truncate tabular-nums">
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
