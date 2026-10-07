import React from 'react';
import { Sparkles, BarChart2, PieChart, Layers } from 'lucide-react';
import { ProblemsChart } from '../components/ProblemsChart';
import { DifficultyChart } from '../components/DifficultyChart';
import { TopicList } from '../components/TopicList';
import { ChartPoint, DifficultyData, TopicData } from '../types';

interface AnalyticsPageProps {
  chartData: ChartPoint[];
  period: string;
  onPeriodChange: (p: string) => void;
  difficultyData: DifficultyData;
  topicsData: TopicData[];
  insights: string[];
  anyConnected: boolean;
  onConnectClick: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  chartData,
  period,
  onPeriodChange,
  difficultyData,
  topicsData,
  insights,
  anyConnected,
  onConnectClick
}) => {
  return (
    <div className="space-y-5">
      {/* 1. Header with Time Ranges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
              Analytics & Insights
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]">
              {difficultyData.total} problems evaluated
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Comprehensive solving volume trajectory, difficulty distributions, and topic depth
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-[var(--surface)] p-0.5 rounded-lg border border-[var(--border)] text-xs font-mono">
          {(['7d', '30d', '3m', '6m', '1y', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 rounded text-xs uppercase font-medium transition-colors ${
                period === p
                  ? 'bg-[var(--surface-active)] text-[var(--text)] font-semibold border border-[var(--border)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Solved Trajectory Chart */}
      <ProblemsChart
        data={chartData}
        period={period}
        onPeriodChange={onPeriodChange}
        hasConnectedPlatforms={anyConnected}
        onConnectClick={onConnectClick}
      />

      {/* 3. Difficulty Distribution & Topic Depth Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DifficultyChart data={difficultyData} />
        <TopicList topics={topicsData} />
      </div>

      {/* 4. Verified Analytical Insights */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[var(--text)]">
            Performance Insights
          </h3>
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text)]/90 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                <span className="leading-relaxed">{ins}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)] py-2 font-mono">
            Insufficient historical telemetry collected yet. Link platforms and sync solves to generate comparative insights.
          </p>
        )}
      </div>
    </div>
  );
};
