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

  const latestCumulative = hasData ? data[data.length - 1]?.cumulative : 0;
  const periodTotalSolved = hasData ? data.reduce((acc, cur) => acc + (cur.daily || 0), 0) : 0;

  return (
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Problems Solved Trajectory</h3>
            {hasData && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                +{periodTotalSolved} in this period
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#64748b] mt-0.5">
            Continuous progression across all verified platforms
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#162035] p-1 rounded-lg border border-[#22314d] self-start sm:self-auto">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p.toLowerCase())}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                period.toUpperCase() === p
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-[#8b9cb4] hover:text-white hover:bg-[#1f2d48]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      <div className="h-64 w-full relative flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="problemsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b253b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={formatDateTick}
                minTickGap={28}
                tickLine={false}
                axisLine={{ stroke: '#1b253b' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
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
                      <div className="bg-[#0d131f] border border-[#24324f] rounded-lg p-2.5 shadow-xl text-xs space-y-1">
                        <div className="font-semibold text-white">{dateFormatted} ({point.date})</div>
                        <div className="flex items-center justify-between gap-4 text-[#94a3b8]">
                          <span>Daily Activity:</span>
                          <span className="font-mono text-emerald-400 font-medium">+{point.daily} solved</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[#94a3b8]">
                          <span>Cumulative Total:</span>
                          <span className="font-mono text-blue-400 font-bold">{point.cumulative} total</span>
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
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#problemsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 w-full h-full border border-dashed border-[#1b253b] rounded-lg">
            <svg
              className="w-16 h-12 text-[#22314d] mb-3 stroke-current fill-none"
              viewBox="0 0 100 50"
              strokeWidth="2"
            >
              <path d="M 0,35 Q 25,45 50,25 T 100,10" />
            </svg>
            <p className="text-xs text-[#64748b] max-w-xs">
              Connect a platform to start tracking your progress.
            </p>
            {onConnectClick && (
              <button
                onClick={onConnectClick}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Connect account &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
