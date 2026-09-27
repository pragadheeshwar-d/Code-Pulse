import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <h3 className="font-semibold text-white text-sm">Difficulty</h3>
      </div>

      <div className="flex items-center justify-between gap-4 my-auto">
        {/* Donut Chart */}
        <div className="w-28 h-28 relative flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
              {hasData ? data.total : '—'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs flex-1">
          {/* Easy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[#94a3b8]">Easy</span>
            </div>
            <span className="font-mono text-white">
              {hasData ? `${data.easy.count} (${data.easy.percentage}%)` : '— (—%)'}
            </span>
          </div>

          {/* Medium */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[#94a3b8]">Medium</span>
            </div>
            <span className="font-mono text-white">
              {hasData ? `${data.medium.count} (${data.medium.percentage}%)` : '— (—%)'}
            </span>
          </div>

          {/* Hard */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[#94a3b8]">Hard</span>
            </div>
            <span className="font-mono text-white">
              {hasData ? `${data.hard.count} (${data.hard.percentage}%)` : '— (—%)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
