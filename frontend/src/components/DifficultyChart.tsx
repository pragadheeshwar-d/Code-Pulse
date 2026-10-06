import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DifficultyData } from '../types';

interface DifficultyChartProps {
  data: DifficultyData;
}

export const DifficultyChart: React.FC<DifficultyChartProps> = ({ data }) => {
  const hasData = data.total > 0;

  const chartData = hasData
    ? [
        { name: 'Easy', value: data.easy.count, color: 'var(--accent)' },
        { name: 'Medium', value: data.medium.count, color: 'var(--warm)' },
        { name: 'Hard', value: data.hard.count, color: 'var(--danger)' }
      ]
    : [{ name: 'Empty', value: 1, color: 'var(--border)' }];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">Difficulty Distribution</h3>
        </div>
        {hasData && (
          <span className="text-[10px] text-[var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--border)] font-mono">
            Unified Tiers
          </span>
        )}
      </div>

      <div className="flex flex-col min-[360px]:flex-row items-center justify-between gap-4 my-auto pt-1">
        {/* Donut Chart */}
        <div className="w-28 h-28 relative flex items-center justify-center shrink-0 mx-auto min-[360px]:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const pct = data.total > 0 ? Math.round(((item.value as number) / data.total) * 100) : 0;
                    return (
                      <div className="bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1.5 rounded-lg shadow-2xl text-xs">
                        <span className="font-semibold text-[var(--text)]">{item.name}: </span>
                        <span className="font-mono text-[var(--accent)] font-bold">{item.value} ({pct}%)</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={50}
                paddingAngle={hasData ? 3 : 0}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base font-bold text-[var(--text)] font-mono">
              {hasData ? data.total.toLocaleString() : '—'}
            </span>
            <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider font-semibold">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs w-full 2xs:flex-1">
          {/* Easy */}
          <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg)] border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
              <span className="text-[var(--text)] font-medium">Easy</span>
            </div>
            <span className="font-mono text-[var(--accent)] font-semibold text-right">
              {hasData ? `${data.easy.count.toLocaleString()} (${data.easy.percentage}%)` : '— (—%)'}
            </span>
          </div>

          {/* Medium */}
          <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg)] border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--warm)] shrink-0" />
              <span className="text-[var(--text)] font-medium">Medium</span>
            </div>
            <span className="font-mono text-[var(--warm)] font-semibold text-right">
              {hasData ? `${data.medium.count.toLocaleString()} (${data.medium.percentage}%)` : '— (—%)'}
            </span>
          </div>

          {/* Hard */}
          <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg)] border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--danger)] shrink-0" />
              <span className="text-[var(--text)] font-medium">Hard</span>
            </div>
            <span className="font-mono text-[var(--danger)] font-semibold text-right">
              {hasData ? `${data.hard.count.toLocaleString()} (${data.hard.percentage}%)` : '— (—%)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
