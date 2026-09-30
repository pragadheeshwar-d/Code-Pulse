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
        { name: 'Easy', value: data.easy.count, color: '#10b981' },
        { name: 'Medium', value: data.medium.count, color: '#f59e0b' },
        { name: 'Hard', value: data.hard.count, color: '#ef4444' }
      ]
    : [{ name: 'Empty', value: 1, color: '#1a2336' }];

  return (
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="font-semibold text-white text-sm">Difficulty Breakdown</h3>
        </div>
        {hasData && (
          <span className="text-[10px] text-[#64748b] bg-[#162035] px-2 py-0.5 rounded border border-[#22314d]">
            Unified Tiers
          </span>
        )}
      </div>

      <div className="flex flex-col min-[360px]:flex-row items-center justify-between gap-4 my-auto">
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
                      <div className="bg-[#0d131f] border border-[#24324f] px-2.5 py-1.5 rounded-lg shadow-xl text-xs">
                        <span className="font-semibold text-white">{item.name}: </span>
                        <span className="font-mono text-blue-400 font-bold">{item.value} ({pct}%)</span>
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
            <span className="text-base font-bold text-white font-mono">
              {hasData ? data.total.toLocaleString() : '—'}
            </span>
            <span className="text-[9px] text-[#64748b] uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs w-full 2xs:flex-1">
          {/* Easy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[#94a3b8]">Easy</span>
            </div>
            <span className="font-mono text-white text-right">
              {hasData ? `${data.easy.count.toLocaleString()} (${data.easy.percentage}%)` : '— (—%)'}
            </span>
          </div>

          {/* Medium */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-[#94a3b8]">Medium</span>
            </div>
            <span className="font-mono text-white text-right">
              {hasData ? `${data.medium.count.toLocaleString()} (${data.medium.percentage}%)` : '— (—%)'}
            </span>
          </div>

          {/* Hard */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="text-[#94a3b8]">Hard</span>
            </div>
            <span className="font-mono text-white text-right">
              {hasData ? `${data.hard.count.toLocaleString()} (${data.hard.percentage}%)` : '— (—%)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
