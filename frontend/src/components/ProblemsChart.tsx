import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ChartPoint } from '../types';

interface ProblemsChartProps {
  data: ChartPoint[];
  period: string;
  onPeriodChange: (period: string) => void;
  hasConnectedPlatforms: boolean;
  onConnectClick?: () => void;
}

export const ProblemsChart: React.FC<ProblemsChartProps> = ({
  data,
  period,
  onPeriodChange,
  hasConnectedPlatforms,
  onConnectClick
}) => {
  const periods = ['7D', '30D', '3M', '6M', '1Y', 'All'];
  const hasData = hasConnectedPlatforms && data.length > 0;

  const formatDateTick = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const periodTotalSolved = hasData ? data.reduce((acc, cur) => acc + (cur.daily || 0), 0) : 0;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
              </div>
              <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">Problems Solved Trajectory</h3>
            </div>
            {hasData && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/25 shrink-0 font-medium">
                +{periodTotalSolved} in window
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Verified cumulative trajectory across all connected competitive programming profiles
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)] self-start sm:self-auto overflow-x-auto no-scrollbar touch-scroll max-w-full">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p.toLowerCase())}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all shrink-0 min-h-[28px] ${
                period.toUpperCase() === p
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      <div className="h-60 sm:h-64 lg:h-72 w-full relative flex items-center justify-center pt-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyberEmeraldProblemsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--muted)"
                tick={{ fill: 'var(--muted)', fontSize: 10 }}
                tickFormatter={formatDateTick}
                minTickGap={36}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                stroke="var(--muted)"
                tick={{ fill: 'var(--muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as ChartPoint;
                    const dateFormatted = formatDateTick(point.date);
                    return (
                      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3 shadow-2xl text-xs space-y-1.5 min-w-[180px]">
                        <div className="font-semibold text-[var(--text)] border-b border-[var(--border)] pb-1 font-mono">{dateFormatted} ({point.date})</div>
                        <div className="flex items-center justify-between gap-3 text-[var(--muted)]">
                          <span>Daily Delta:</span>
                          <span className="font-mono text-[var(--accent)] font-bold">+{point.daily} solved</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[var(--muted)]">
                          <span>Cumulative:</span>
                          <span className="font-mono text-[var(--accent)] font-bold">{point.cumulative} total</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="var(--accent)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cyberEmeraldProblemsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 w-full h-full border border-dashed border-[var(--border)] rounded-lg bg-[var(--bg)]/50">
            <svg
              className="w-12 h-10 text-[var(--muted)]/40 mb-2 stroke-current fill-none"
              viewBox="0 0 100 50"
              strokeWidth="2"
            >
              <path d="M 0,35 Q 25,45 50,25 T 100,10" />
            </svg>
            <p className="text-xs text-[var(--muted)] max-w-xs">
              Link a platform to track your continuous problem-solving progression.
            </p>
            {onConnectClick && (
              <button
                onClick={onConnectClick}
                className="mt-2.5 text-xs text-[var(--accent)] hover:underline font-semibold transition-colors flex items-center gap-1"
              >
                <span>Connect platform account →</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
